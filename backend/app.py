from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from datetime import datetime, timedelta
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate
import json
import pickle
import numpy as np
import traceback
from tensorflow.keras.models import load_model
from PIL import Image
from tensorflow.keras.applications.mobilenet import preprocess_input
from prophet import Prophet
import pandas as pd
from typing import TypedDict, Annotated, List, Optional
from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from langchain_core.tools import tool
from langchain_core.messages import AIMessage, HumanMessage
import operator

app = Flask(__name__)

# =========================
# STRONG CORS CONFIGURATION
# =========================
CORS(app, 
     origins=["http://localhost:5173", "http://127.0.0.1:5173"],
     methods=["GET", "POST", "OPTIONS"],
     allow_headers=["Content-Type", "Accept"],
     supports_credentials=True)

# =========================
# DEBUG LOGGING
# =========================
DEBUG = True

def log(msg, level="INFO"):
    if DEBUG:
        print(f"[{level}] {msg}")

# =========================
# LOAD MODELS
# =========================
try:
    crop_model = pickle.load(open("crop_recommendation_svm.pkl", "rb"))
    crop_scaler = pickle.load(open("crop_recommendation_scaler.pkl", "rb"))
    log("✅ Crop recommendation models loaded")
except Exception as e:
    log(f"⚠️ Crop model load failed: {e}", "ERROR")

try:
    model = load_model('./plant_disease_model.keras')
    log("✅ Disease detection model loaded")
except Exception as e:
    log(f"⚠️ Disease model load failed: {e}", "ERROR")

# Load Commodities
try:
    with open("commodities.json", "r") as f:
        commodities = json.load(f)
    log(f"✅ Loaded {len(commodities.get('data', []))} commodities")
except Exception as e:
    log(f"⚠️ commodities.json load failed: {e}", "ERROR")
    commodities = {"data": []}

# =========================
# OLLAMA CONFIG
# =========================
OLLAMA_MODEL = "mistral:latest"

llm = ChatOllama(
    model=OLLAMA_MODEL,
    temperature=0.3,
    num_ctx=8192,
    num_predict=2048,
)
log(f"✅ Ollama initialized with {OLLAMA_MODEL}")

# =========================
# GLOBAL SETTINGS
# =========================
LATITUDE = 16.3067
LONGITUDE = 80.4365
BASE_LOCATION = "Andhra Pradesh"

# =========================
# HELPER FUNCTIONS
# =========================
from datetime import datetime, timedelta
import statistics

def get_weather_forecast():
    url = "https://api.open-meteo.com/v1/forecast"
    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "daily": "temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max",
        "forecast_days": 7,
        "timezone": "Asia/Kolkata"
    }
    
    try:
        r = requests.get(url, params=params, timeout=15)
        r.raise_for_status()
        return r.json()
    except Exception as e:
        log(f"Weather fetch failed: {e}", "ERROR")
        return None


def analyze_forecast(forecast):
    if not forecast:
        return {"summary": "Weather data unavailable", "risk": "medium"}

    daily = forecast["daily"]
    precip = daily.get("precipitation_sum", [])
    prob = daily.get("precipitation_probability_max", [])
    temp_max = daily.get("temperature_2m_max", [])

    total_rain = sum(precip)
    avg_prob = sum(prob) / len(prob) if prob else 0
    max_temp = max(temp_max) if temp_max else 0

    analysis = {
        "total_rain": round(total_rain, 1),
        "avg_rain_prob": round(avg_prob, 1),
        "max_temp": round(max_temp, 1),
        "risk": "low"
    }

    if total_rain > 60 or avg_prob > 70:
        analysis["summary"] = "Heavy rainfall expected → High risk of supply disruption and price spike."
        analysis["risk"] = "high"
    elif total_rain > 25:
        analysis["summary"] = "Moderate rainfall expected → Mild upward pressure on prices likely."
        analysis["risk"] = "medium"
    elif max_temp > 38:
        analysis["summary"] = "Heatwave conditions → Possible crop stress and supply reduction."
        analysis["risk"] = "medium"
    else:
        analysis["summary"] = "Stable weather expected → Good supply conditions."
        analysis["risk"] = "low"

    return analysis
# =========================
# MARKET DATA FETCH (FIXED)
def fetch_market_data(commodity_id, state_name):
    log(f"Fetching market data for commodity_id={commodity_id}, state={state_name}")

    url = "https://api.agmarknet.gov.in/v1/prices-and-arrivals/commodity-market/daily-report-weighted"

    headers = {
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0"
    }

    all_records = []
    today = datetime.today()

    # Last 30 days
    for i in range(1, 31):

        date_str = (today - timedelta(days=i)).strftime("%Y-%m-%d")

        payload = {
            "commodityIds": [commodity_id],
            "date": date_str
        }

        try:
            res = requests.post(
                url,
                json=payload,
                headers=headers,
                timeout=18
            )

            if res.status_code != 200:
                continue

            data = res.json()

            commodities_list = data.get("commodities", [])

            for group in commodities_list:

                for item in group.get("items", []):

                    for state in item.get("states", []):

                        if state.get("state", "").strip().lower() != state_name.strip().lower():
                            continue

                        for market in state.get("markets", []):

                            for record in market.get("data", []):

                                try:
                                    price = float(record.get("modalPrice", 0))
                                    arrival = float(record.get("arrivals", 0))

                                    if price > 0:

                                        all_records.append({
                                            "date": date_str,
                                            "price": price,
                                            "arrival": arrival,
                                            "market": market.get("market", "Unknown")
                                        })

                                except Exception:
                                    continue

        except Exception as e:
            log(f"Error fetching data for {date_str}: {e}", "WARN")

    if not all_records:
        log("No market records found", "ERROR")
        return None

    # Sort newest first
    all_records.sort(
        key=lambda x: x["date"],
        reverse=True
    )

    prices = [r["price"] for r in all_records]
    arrivals = [r["arrival"] for r in all_records if r["arrival"] > 0]

    current_price = prices[0]
    latest_date = all_records[0]["date"]

    # =========================
    # PRICE TREND
    # =========================

    avg_price_7d = (
        statistics.mean(prices[:7])
        if len(prices) >= 7
        else statistics.mean(prices)
    )

    trend_pct = 0

    if len(prices) >= 14:

        recent_avg = statistics.mean(prices[:7])

        older_avg = statistics.mean(prices[7:14])

        if older_avg > 0:
            trend_pct = (
                (recent_avg - older_avg)
                / older_avg
            ) * 100

    if trend_pct > 3:
        trend = "upward"
    elif trend_pct < -3:
        trend = "downward"
    else:
        trend = "stable"

    # =========================
    # ARRIVAL TREND
    # =========================

    arrival_trend = "stable"

    if len(arrivals) >= 14:

        recent_arrival_avg = statistics.mean(arrivals[:7])

        older_arrival_avg = statistics.mean(arrivals[7:14])

        if older_arrival_avg > 0:

            arrival_change = (
                (recent_arrival_avg - older_arrival_avg)
                / older_arrival_avg
            ) * 100

            if arrival_change > 10:
                arrival_trend = "increasing"

            elif arrival_change < -10:
                arrival_trend = "decreasing"

    # =========================
    # VOLATILITY
    # =========================

    volatility = (
        round(
            statistics.stdev(prices)
            / avg_price_7d
            * 100,
            2
        )
        if len(prices) > 1 and avg_price_7d > 0
        else 0
    )

    return {
        "crop": "Unknown",
        "current_price": round(current_price, 2),
        "current_date": latest_date,

        "avg_price_7d": round(avg_price_7d, 2),

        "price_change_7d_pct": round(trend_pct, 2),

        "avg_arrival": round(
            statistics.mean(arrivals),
            0
        ) if arrivals else 0,

        "arrival_trend": arrival_trend,

        "trend": trend,

        "volatility": volatility,

        "history": all_records[:30],

        "data_freshness": f"Latest data from {latest_date}"
    }
def forecast_price_prophet(history):

    try:

        if len(history) < 15:
            return None

        df = pd.DataFrame([
            {
                "ds": r["date"],
                "y": r["price"]
            }
            for r in history
        ])

        df["ds"] = pd.to_datetime(df["ds"])

        model = Prophet(
            daily_seasonality=False,
            weekly_seasonality=True,
            yearly_seasonality=False
        )

        model.fit(df)

        future = model.make_future_dataframe(
            periods=5
        )

        forecast = model.predict(future)

        future_prices = forecast.tail(5)

        predicted_price = round(
            future_prices["yhat"].mean(),
            2
        )

        latest_price = history[0]["price"]

        change_pct = (
            (predicted_price - latest_price)
            / latest_price
        ) * 100

        if change_pct > 3:
            forecast_signal = "UP"

        elif change_pct < -3:
            forecast_signal = "DOWN"

        else:
            forecast_signal = "FLAT"

        return {
            "predicted_price": predicted_price,
            "forecast_change_pct": round(change_pct, 2),
            "forecast_signal": forecast_signal
        }

    except Exception as e:

        log(f"Prophet Forecast Error: {e}", "ERROR")

        return None
# =========================
# AI PROMPT
# =========================
decision_prompt = ChatPromptTemplate.from_template("""
You are a senior agricultural market advisor for Indian farmers.

Farmer Profile:
- Location: {location}
- Crop: {crop}
- Quantity Available: {quantity} quintals
- Storage Available: {storage_days} days

Market Analysis:
- Current Price: ₹{current_price}/quintal
- Current Data Date: {current_date}
- 7-Day Average Price: ₹{avg_price_7d}/quintal
- Price Change vs Previous Week: {price_change_7d_pct}%
- Price Trend: {trend}
- Average Daily Arrival: {avg_arrival} quintals
- Arrival Trend: {arrival_trend}
- Market Volatility: {volatility}%

Price Forecast (Next 5 Days):
- Predicted Average Price: ₹{predicted_price}
- Forecast Change: {forecast_change_pct}%
- Forecast Direction: {forecast_signal}

Weather Forecast (Next 7 Days):
{weather_summary}

Weather Risk Level:
{weather_risk}

Rule-Based Market Signal:
{market_signal}

Data Freshness:
{data_freshness}

Volatility Note:
{confidence_warning}

Decision Guidelines:

1. Rising prices + decreasing arrivals → HOLD is usually preferred.
2. Falling prices + increasing arrivals → SELL NOW is usually preferred.
3. High weather risk may reduce supply and support prices.
4. Forecast Direction UP strongly supports HOLD.
5. Forecast Direction DOWN strongly supports SELL NOW.
6. High volatility means lower confidence.
7. Limited storage reduces ability to hold.
8. Never recommend HOLD beyond available storage capacity.
9. Use forecast direction more heavily than weather risk.
10. If forecast is FLAT, rely more on arrivals and trend.

Task:

Recommend EXACTLY ONE:

- SELL NOW
- HOLD
- SELL PARTIALLY

Response Format:

Final Recommendation: <SELL NOW / HOLD / SELL PARTIALLY>

Confidence: <0-100%>

Reasoning:
- Point 1
- Point 2
- Point 3

Risks:
- Risk 1
- Risk 2

Action Plan:
- Step 1
- Step 2
- Step 3

Keep the advice practical, realistic, and farmer-focused.
""")

# =========================
# LANGGRAPH AGENT FRAMEWORK FOR CROP ADVICE
# =========================
class AgentState(TypedDict):
    messages: Annotated[List, operator.add]
    farmer_profile: dict
    commodity_id: int
    crop_name: str
    location: str
    quantity: int
    storage: str
    market_data: Optional[dict]
    weather_data: Optional[dict]
    forecast_data: Optional[dict]
    risk_score: Optional[int]
    market_signal: Optional[str]
    final_advice: Optional[str]
    confidence: Optional[int]

@tool
def fetch_market_data_tool(commodity_id: int, state_name: str):
    """Fetch latest market data from Agmarknet"""
    return fetch_market_data(commodity_id, state_name)

@tool
def get_weather_forecast_tool():
    """Get 7-day weather forecast and analysis"""
    forecast = get_weather_forecast()
    return analyze_forecast(forecast)

@tool
def forecast_price_tool(history: List[dict]):
    """Forecast price using Prophet"""
    return forecast_price_prophet(history)

tools = [fetch_market_data_tool, get_weather_forecast_tool, forecast_price_tool]
llm_with_tools = llm.bind_tools(tools)
def market_researcher(state):
    market = fetch_market_data(
        state["commodity_id"],
        state["location"]
    )

    return {
        "market_data": market
    }
def weather_analyst(state):
    weather = analyze_forecast(
        get_weather_forecast()
    )

    return {
        "weather_data": weather
    }
def price_forecaster(state):

    market = state["market_data"]

    forecast = forecast_price_prophet(
        market["history"]
    )

    return {
        "forecast_data": forecast
    }

def risk_assessor(state: AgentState):
    score = 0
    if state.get("market_data"):
        if state["market_data"].get("trend") == "upward":
            score += 2
        if state["market_data"].get("arrival_trend") == "decreasing":
            score += 2
    if state.get("weather_data") and state["weather_data"].get("risk") == "high":
        score += 1
    if state.get("forecast_data") and state["forecast_data"].get("forecast_signal") == "UP":
        score += 3
    if state.get("market_data") and state["market_data"].get("volatility", 0) > 15:
        score -= 1
    signal = "HOLD" if score >= 3 else "SELL NOW" if score <= -3 else "SELL PARTIALLY"
    return {
        "risk_score": score,
        "market_signal": signal,
        "messages": [AIMessage(content=f"Risk Score: {score} | Signal: {signal}")]
    }
def final_advisor(state: AgentState):

    market = state.get("market_data", {})
    weather = state.get("weather_data", {})
    forecast = state.get("forecast_data", {})

    score = state.get("risk_score", 0)

    if score >= 5:
        confidence = 90
    elif score >= 3:
        confidence = 80
    elif score >= 1:
        confidence = 70
    else:
        confidence = 60

    prompt = f"""
You are a senior agricultural market advisor for Indian farmers.

Farmer Profile:
Location: {state.get('location')}
Crop: {state.get('crop_name')}
Quantity: {state.get('quantity')} quintals
Storage: {state.get('storage')}

Market Analysis:
Current Price: {market.get('current_price')}
Price Trend: {market.get('trend')}
Arrival Trend: {market.get('arrival_trend')}
Volatility: {market.get('volatility')}%

Weather:
{weather.get('summary')}
Risk Level: {weather.get('risk')}

Forecast:
Predicted Price: {forecast.get('predicted_price')}
Forecast Change: {forecast.get('forecast_change_pct')}
Forecast Signal: {forecast.get('forecast_signal')}

Rule-Based Signal:
{state.get('market_signal')}

Risk Score:
{score}

Give response in exactly this format:

Final Recommendation: <SELL NOW / HOLD / SELL PARTIALLY>

Reasoning:
- Point 1
- Point 2
- Point 3

Risks:
- Risk 1
- Risk 2

Action Plan:
- Step 1
- Step 2
- Step 3
"""

    response = llm.invoke(prompt)

    return {
        "final_advice": response.content,
        "confidence": confidence
    }
def router(state: AgentState):
    last_message = state["messages"][-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    return "risk_assessor"
def build_crop_advice_agent():

    workflow = StateGraph(AgentState)

    workflow.add_node("market_researcher", market_researcher)

    workflow.add_node("weather_analyst", weather_analyst)

    workflow.add_node("price_forecaster", price_forecaster)

    workflow.add_node("risk_assessor", risk_assessor)

    workflow.add_node("final_advisor", final_advisor)

    workflow.add_edge(START, "market_researcher")

    workflow.add_edge(
        "market_researcher",
        "weather_analyst"
    )

    workflow.add_edge(
        "weather_analyst",
        "price_forecaster"
    )

    workflow.add_edge(
        "price_forecaster",
        "risk_assessor"
    )

    workflow.add_edge(
        "risk_assessor",
        "final_advisor"
    )

    workflow.add_edge(
        "final_advisor",
        END
    )

    return workflow.compile()
agent = build_crop_advice_agent()

# =========================
# UPDATED GENERATE CROP ADVICE WITH AGENT
# =========================
def generate_crop_advice(
    commodity_id,
    crop_name,
    state_name,
    quantity,
    storage
):

    initial_state = {
        "farmer_profile": {
            "location": state_name,
            "risk_appetite": "medium"
        },
        "commodity_id": commodity_id,
        "crop_name": crop_name,
        "location": state_name,
        "quantity": quantity,
        "storage": storage,
        "market_data": None,
        "weather_data": None,
        "forecast_data": None,
        "risk_score": None,
        "market_signal": None,
        "final_advice": None,
        "confidence": None
    }

    try:

        result = agent.invoke(initial_state)

        return {
            "success": True,
            "crop_name": crop_name,

            "market": result.get("market_data"),

            "weather": result.get("weather_data"),

            "forecast": result.get("forecast_data"),

            "market_signal": result.get("market_signal"),

            "market_score": result.get("risk_score"),

            "confidence": result.get("confidence"),

            "advice": result.get("final_advice")
        }

    except Exception as e:

        log(f"Agent Error: {e}", "ERROR")

        return {
            "success": False,
            "message": str(e)
        }

# =========================
# ROUTES
# =========================
@app.route('/')
def home():
    return jsonify({"message": "AgriGuard Backend Running Successfully ✅"})

@app.route("/commodities")
def get_commodities():
    return jsonify(commodities)

@app.route("/crop-advice", methods=["POST", "OPTIONS"])
def crop_advice():
    if request.method == "OPTIONS":
        return jsonify({}), 200

    log("=== /crop-advice endpoint called ===")
    try:
        data = request.get_json()
        log(f"Received data: {data}")

        commodity_id = int(data.get("crop"))
        location = data.get("location", BASE_LOCATION)
        quantity = int(data.get("quantity", 50))
        storage = data.get("storage", "yes")

        crop_name = next(
            (item["cmdt_name"] for item in commodities.get("data", []) 
             if item.get("id") == commodity_id),
            "Unknown Crop"
        )

        result = generate_crop_advice(
            commodity_id=commodity_id,
            crop_name=crop_name,
            state_name=location,
            quantity=quantity,
            storage=storage
        )

        return jsonify(result)

    except Exception as e:
        log(f"Error in /crop-advice: {e}", "ERROR")
        log(traceback.format_exc(), "ERROR")
        return jsonify({
            "success": False,
            "message": f"Server error: {str(e)}"
        }), 500

@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({"success": False, "error": "No image file uploaded"}), 400

        file = request.files['file']
        if file.filename == '':
            return jsonify({"success": False, "error": "Empty file selected"}), 400

        img = Image.open(file).convert("RGB")
        img = img.resize((224, 224))
        img_array = np.array(img, dtype=np.float32)
        img_array = preprocess_input(img_array)
        img_array = np.expand_dims(img_array, axis=0)

        predictions = model.predict(img_array, verbose=0)[0]
        top3_indices = np.argsort(predictions)[-3:][::-1]

        results = []
        for idx in top3_indices:
            label = class_labels[idx]
            confidence = float(predictions[idx]) * 100
            label = label.replace("___", " - ").replace("_", " ")
            results.append({"disease": label, "confidence": round(confidence, 2)})

        best_prediction = results[0]

        print("\n========== PREDICTION ==========")
        for r in results:
            print(f"{r['disease']} : {r['confidence']}%")
        print("================================\n")

        if best_prediction["confidence"] < 70:
            return jsonify({
                "success": False,
                "message": "Low confidence prediction. Upload a clearer leaf image.",
                "top_predictions": results
            })

        return jsonify({
            "success": True,
            "prediction": best_prediction,
            "top_predictions": results
        })

    except Exception as e:
        print("\n========== ERROR ==========")
        print(str(e))
        print("===========================\n")
        return jsonify({"success": False, "error": str(e)}), 500

@app.route('/rag-chat', methods=['POST'])
def rag_chat():
    try:
        data = request.get_json()
        question = data.get("question")
        if not question:
            return jsonify({"error": "Question is required"}), 400

        docs = retrieve_documents(question)   # Make sure this function exists

        if not docs:
            return jsonify({"answer": "No relevant agricultural information found."})

        context = "\n\n".join([doc.page_content[:700] for doc in docs])
        prompt = build_prompt(context, question)
        final_answer = generate_answer(prompt)

        return jsonify({"answer": final_answer})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Keep your /recommend route if you have it
@app.route('/recommend', methods=['POST'])
def recommend_crop():
    # Your existing crop recommendation logic here
    try:
        data = request.get_json()
        # ... (your original recommend_crop code)
        pass
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500

if __name__ == '__main__':
    print("🌾 AgriGuard Backend Started with Debug Mode...")
    app.run(debug=True, port=5000)