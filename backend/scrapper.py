import requests
from datetime import datetime, timedelta
from langchain_ollama import ChatOllama
from langchain_core.prompts import ChatPromptTemplate

# =====================================================
# CONFIG
# =====================================================

OLLAMA_MODEL = "mistral:latest"

llm = ChatOllama(
    model=OLLAMA_MODEL,
    temperature=0.3,
    num_ctx=8192
)

LOCATION = "Andhra Pradesh"

LATITUDE = 16.3067
LONGITUDE = 80.4365

COMMODITY_ID = 4  # Maize

# =====================================================
# AGMARKNET API
# =====================================================

MARKET_URL = (
    "https://api.agmarknet.gov.in/v1/"
    "prices-and-arrivals/"
    "commodity-market/"
    "daily-report-weighted"
)

HEADERS = {
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0"
}

# =====================================================
# WEATHER API
# =====================================================

WEATHER_URL = "https://archive-api.open-meteo.com/v1/archive"

# =====================================================
# WEATHER
# =====================================================

def get_weather(start_date, end_date):

    params = {
        "latitude": LATITUDE,
        "longitude": LONGITUDE,
        "start_date": start_date,
        "end_date": end_date,
        "daily": "precipitation_sum",
        "timezone": "Asia/Kolkata"
    }

    try:
        r = requests.get(
            WEATHER_URL,
            params=params,
            timeout=20
        )

        if r.status_code != 200:
            return None

        return r.json()

    except:
        return None


def analyze_weather(weather):

    if not weather:
        return "Weather unavailable"

    rain = sum(
        weather["daily"].get(
            "precipitation_sum",
            []
        )
    )

    if rain > 20:
        return "Heavy rainfall may reduce arrivals and support prices."

    elif rain > 5:
        return "Moderate rainfall may slightly affect supply."

    return "Dry weather. Supply remains stable."


# =====================================================
# AGMARKNET FETCH
# =====================================================

def fetch_day(date_str, commodity_id):

    payload = {
        "commodityIds": [commodity_id],
        "date": date_str
    }

    try:

        r = requests.post(
            MARKET_URL,
            json=payload,
            headers=HEADERS,
            timeout=20
        )

        if r.status_code != 200:
            return None

        return r.json()

    except:
        return None


# =====================================================
# LAST 7 DAYS DATA
# =====================================================
def get_last_7_days(
    commodity_id,
    state_name
):

    history = []

    today = datetime.today()

    for i in range(7):

        date_str = (
            today - timedelta(days=i)
        ).strftime("%Y-%m-%d")

        data = fetch_day(
            date_str,
            commodity_id
        )

        if not data:
            continue

        commodities = data.get(
            "commodities",
            []
        )

        if not commodities:
            continue

        items = commodities[0].get(
            "items",
            []
        )

        for item in items:

            if item.get("id") != commodity_id:
                continue

            for state in item.get(
                "states",
                []
            ):

                if (
                    state.get("state", "")
                    .lower()
                    != state_name.lower()
                ):
                    continue

                total = state.get(
                    "total",
                    {}
                )

                history.append({
                    "date": date_str,
                    "arrival": total.get(
                        "arrivals",
                        0
                    ),
                    "price": total.get(
                        "modalPrice",
                        0
                    )
                })

    return history
# =====================================================
# TREND ANALYSIS
# =====================================================
def analyze_market(
    history,
    crop_name
):

    if len(history) < 2:

        return {
            "crop": crop_name,
            "price": 0,
            "arrival": 0,
            "trend": "unknown"
        }

    latest = history[0]
    oldest = history[-1]

    trend = "flat"

    if latest["price"] > oldest["price"]:
        trend = "up"

    elif latest["price"] < oldest["price"]:
        trend = "down"

    return {
        "crop": crop_name,
        "price": latest["price"],
        "arrival": latest["arrival"],
        "trend": trend
    }

# =====================================================
# FARMER PROFILE
# =====================================================

def get_farmer_context():

    return {
        "quantity_kg": 5000,
        "storage_days": 25,
        "cash_need_urgent": False,
        "distance_to_mandi_km": 12
    }


# =====================================================
# PLACEHOLDERS
# =====================================================

def fetch_futures_data():

    return {
        "futures_price": 2500,
        "change": 1.2
    }


def get_news_sentiment():

    return (
        "Neutral market sentiment. "
        "No major supply shock reported."
    )


# =====================================================
# AI PROMPT
# =====================================================

decision_prompt = ChatPromptTemplate.from_template("""
You are an agricultural market expert.

Farmer Location:
{location}

Crop:
{crop}

Farmer Data:
- Quantity: {quantity} quintals
- Storage: {storage_days} days
- Cash Need: {cash_need}

Market:
- Spot Price: ₹{price}
- Arrivals: {arrival}
- Trend: {trend}
- Futures Price: ₹{futures_price}
- Futures Change: {futures_change}%

Weather:
{weather}

News:
{news}

Give:

1. Recommendation
2. Confidence %
3. Reasons
4. Risks
5. Action Plan

Choose:
SELL NOW
HOLD
SELL PARTIALLY
""")


# =====================================================
# AI DECISION
# =====================================================

def ai_decide(
    market,
    weather_reason,
    farmer
):

    futures = fetch_futures_data()

    news = get_news_sentiment()

    chain = decision_prompt | llm

    response = chain.invoke({

        "location": LOCATION,

        "crop": market["crop"],

        "quantity":
            farmer["quantity_kg"] // 100,

        "storage_days":
            farmer["storage_days"],

        "cash_need":
            farmer["cash_need_urgent"],

        "price":
            market["price"],

        "arrival":
            market["arrival"],

        "trend":
            market["trend"],

        "futures_price":
            futures["futures_price"],

        "futures_change":
            futures["change"],

        "weather":
            weather_reason,

        "news":
            news
    })

    return response.content


# =====================================================
# MAIN
# =====================================================

def main():

    print("\n🌾 AGRIGUARD STARTED\n")

    history = get_last_7_days()

    if not history:

        print("No market data found")
        return

    market = analyze_market(history)

    end_date = datetime.today().date()
    start_date = end_date - timedelta(days=7)

    weather = get_weather(
        str(start_date),
        str(end_date)
    )

    weather_reason = analyze_weather(
        weather
    )

    farmer = get_farmer_context()

    print("Crop:", market["crop"])
    print("Price:", market["price"])
    print("Arrival:", market["arrival"])
    print("Trend:", market["trend"])
    print("Weather:", weather_reason)

    print("\nGenerating AI Advice...\n")

    result = ai_decide(
        market,
        weather_reason,
        farmer
    )

    print(result)

# =====================================================
# API FUNCTION
# =====================================================

def generate_crop_advice(
    commodity_id,
    crop_name,
    state_name,
    quantity,
    storage
):

    history = get_last_7_days(
        commodity_id,
        state_name
    )

    if not history:

        return {
            "success": False,
            "message": "No market data found"
        }

    market = analyze_market(
        history,
        crop_name
    )

    end_date = datetime.today().date()

    start_date = (
        end_date - timedelta(days=7)
    )

    weather = get_weather(
        str(start_date),
        str(end_date)
    )

    weather_reason = analyze_weather(
        weather
    )

    farmer = {
        "quantity_kg": int(quantity) * 100,
        "storage_days": 30 if storage == "yes" else 0,
        "cash_need_urgent": False,
        "distance_to_mandi_km": 10
    }

    futures = fetch_futures_data()

    news = get_news_sentiment()

    chain = decision_prompt | llm

    response = chain.invoke({

        "location": state_name,

        "crop": crop_name,

        "quantity": quantity,

        "storage_days": farmer["storage_days"],

        "cash_need": farmer["cash_need_urgent"],

        "price": market["price"],

        "arrival": market["arrival"],

        "trend": market["trend"],

        "futures_price": futures["futures_price"],

        "futures_change": futures["change"],

        "weather": weather_reason,

        "news": news
    })

    return {
        "success": True,
        "market": market,
        "weather": weather_reason,
        "advice": response.content
    }



