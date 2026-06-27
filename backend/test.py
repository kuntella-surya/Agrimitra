import requests
import json
from datetime import datetime, timedelta

# =====================================================
# AGMARKNET DAILY REPORT API
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

COMMODITY_ID = 4  # Maize

# =====================================================
# FETCH DAY
# =====================================================

def fetch_day(date_str):

    payload = {
        "commodityIds": [COMMODITY_ID],
        "date": date_str
    }

    print("\nPAYLOAD:")
    print(json.dumps(payload, indent=2))

    try:

        response = requests.post(
            MARKET_URL,
            json=payload,
            headers=HEADERS,
            timeout=20
        )

        print("\nSTATUS:", response.status_code)

        if response.status_code != 200:
            return None

        data = response.json()

        print("\nTOP LEVEL KEYS:")
        print(list(data.keys()))

        return data

    except Exception as e:

        print("API ERROR:", e)
        return None


# =====================================================
# DEBUG RESPONSE STRUCTURE
# =====================================================

def debug_response(data):

    commodities = data.get("commodities", [])

    print("\n" + "=" * 80)
    print("COMMODITIES FOUND:", len(commodities))
    print("=" * 80)

    if not commodities:
        return

    for commodity_group in commodities:

        print("\nCOMMODITY GROUP:")
        print("Keys:", list(commodity_group.keys()))

        items = commodity_group.get("items", [])

        print("ITEMS FOUND:", len(items))

        for item in items:

            print("\n" + "-" * 60)

            print(
                "Commodity:",
                item.get("Commodity")
            )

            print(
                "Commodity ID:",
                item.get("id")
            )

            states = item.get(
                "states",
                []
            )

            print(
                "States Found:",
                len(states)
            )

            # Show Andhra Pradesh only
            ap_states = [
                s for s in states
                if s.get("state") == "Andhra Pradesh"
            ]

            print(
                "Andhra Pradesh Entries:",
                len(ap_states)
            )

            for state in ap_states:

                print("\nSTATE:")
                print(state["state"])

                markets = state.get(
                    "markets",
                    []
                )

                print(
                    "Markets Found:",
                    len(markets)
                )

                total = state.get(
                    "total",
                    {}
                )

                print(
                    "Total Arrivals:",
                    total.get("arrivals")
                )

                print(
                    "State Modal Price:",
                    total.get("modalPrice")
                )

                print("\nMARKETS")

                for market in markets:

                    print("\n" + "." * 40)

                    print(
                        "Market:",
                        market.get(
                            "market_name"
                        )
                    )

                    print(
                        "Total Arrivals:",
                        market.get(
                            "total_arrivals"
                        )
                    )

                    records = market.get(
                        "data",
                        []
                    )

                    for record in records:

                        print(
                            f"Variety      : {record.get('variety')}"
                        )

                        print(
                            f"Arrival      : {record.get('arrivals')}"
                        )

                        print(
                            f"Min Price    : ₹{record.get('minPrice')}"
                        )

                        print(
                            f"Max Price    : ₹{record.get('maxPrice')}"
                        )

                        print(
                            f"Modal Price  : ₹{record.get('modalPrice')}"
                        )

                        print(
                            f"Below MSP    : {record.get('belowMSP')}"
                        )


# =====================================================
# MAIN
# =====================================================

def main():

    print("\n🌾 AGMARKNET DEBUG TOOL\n")

    today = datetime.today()

    for i in range(7):

        date_str = (
            today - timedelta(days=i)
        ).strftime("%Y-%m-%d")

        print("\n")
        print("=" * 80)
        print("CHECKING:", date_str)
        print("=" * 80)

        data = fetch_day(date_str)

        if not data:
            continue

        print("\nFULL RESPONSE SAMPLE:")
        print(
            json.dumps(
                data,
                indent=2
            )[:3000]
        )

        debug_response(data)

        print("\n" + "#" * 80)


if __name__ == "__main__":
    main()