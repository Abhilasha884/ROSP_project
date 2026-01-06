import pandas as pd
from flask import Flask, jsonify, request, make_response
from flask_cors import CORS
from statsmodels.tsa.arima.model import ARIMA
import time
import io

app = Flask(__name__)
CORS(app)

# Load CSV
df = pd.read_csv("smart_home_energy_consumption_large.csv")

# Convert Date column to datetime
df['Date'] = pd.to_datetime(df['Date'])
df.set_index('Date', inplace=True)

# Master list of appliances to ensure consistent response shape
APPLIANCES = sorted(df["Appliance Type"].dropna().unique().tolist())
# Master list of Home IDs for filtering
HOME_IDS = sorted(pd.to_numeric(df["Home ID"], errors='coerce').dropna().astype(int).unique().tolist())

# Simple in-memory cache with TTL (seconds)
_CACHE = {}
_TTL_SECONDS = 300

def _cache_get(key):
    now = time.time()
    entry = _CACHE.get(key)
    if not entry:
        return None
    expires_at, value = entry
    if now >= expires_at:
        _CACHE.pop(key, None)
        return None
    return value

def _cache_set(key, value, ttl=_TTL_SECONDS):
    _CACHE[key] = (time.time() + ttl, value)
    return value

@app.route("/api/homes")
def list_homes():
    """Return the list of available Home IDs."""
    cache_key = "homes_list"
    cached = _cache_get(cache_key)
    if cached is not None:
        resp = jsonify(cached)
        resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
        return resp

    data = {"homes": HOME_IDS}
    _cache_set(cache_key, data)
    resp = jsonify(data)
    resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
    return resp

@app.route("/api/consumption")
def get_consumption():
    # Check cache
    cache_key = "consumption_monthly_all"
    cached = _cache_get(cache_key)
    if cached is not None:
        resp = jsonify(cached)
        resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
        return resp

    # Resample to month-end totals
    monthly_data = df.resample('M').sum(numeric_only=True)

    if not monthly_data.empty:
        start = monthly_data.index.min().to_period('M').to_timestamp('M')
        end = monthly_data.index.max().to_period('M').to_timestamp('M')
        full_index = pd.date_range(start=start, end=end, freq='M')
        monthly_filled = monthly_data.reindex(full_index, fill_value=0)
    else:
        monthly_filled = monthly_data

    data = [
        {"month": idx.strftime("%Y-%m"), "consumption": val}
        for idx, val in monthly_filled['Energy Consumption (kWh)'].items()
    ]
    _cache_set(cache_key, data)
    resp = jsonify(data)
    resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
    return resp

@app.route("/api/consumption.csv")
def get_consumption_csv():
    start = request.args.get('start')
    end = request.args.get('end')
    cache_key = f"consumption_csv_{start}_{end}"
    cached = _cache_get(cache_key)
    if cached is not None:
        resp = make_response(cached)
        resp.headers['Content-Type'] = 'text/csv'
        resp.headers['Content-Disposition'] = 'attachment; filename=consumption.csv'
        resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
        return resp

    monthly = df.resample('M').sum(numeric_only=True)
    if not monthly.empty:
        s = monthly.index.min().to_period('M').to_timestamp('M')
        e = monthly.index.max().to_period('M').to_timestamp('M')
        full_index = pd.date_range(start=s, end=e, freq='M')
        monthly = monthly.reindex(full_index, fill_value=0)

    out = pd.DataFrame({
        'month': monthly.index.strftime('%Y-%m'),
        'consumption': monthly['Energy Consumption (kWh)']
    })

    if start:
        out = out[out['month'] >= start]
    if end:
        out = out[out['month'] <= end]

    csv_buf = io.StringIO()
    out.to_csv(csv_buf, index=False)
    csv_text = csv_buf.getvalue()
    _cache_set(cache_key, csv_text)
    resp = make_response(csv_text)
    resp.headers['Content-Type'] = 'text/csv'
    resp.headers['Content-Disposition'] = 'attachment; filename=consumption.csv'
    resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
    return resp

@app.route("/api/appliance-consumption")
def get_appliance_consumption():
    cache_key = "appliance_consumption_all"
    cached = _cache_get(cache_key)
    if cached is not None:
        resp = jsonify(cached)
        resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
        return resp

    appliance_series = (
        df.groupby("Appliance Type")["Energy Consumption (kWh)"]
        .sum()
    )
    data = [
        {
            "appliance": app,
            "consumption": float(appliance_series.get(app, 0))
        }
        for app in APPLIANCES
    ]
    _cache_set(cache_key, data)
    resp = jsonify(data)
    resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
    return resp

@app.route('/api/appliance-consumption.csv')
def get_appliance_consumption_csv():
    year = request.args.get('year', type=int)
    month = request.args.get('month', type=int)
    cache_key = f"appliance_csv_{year}_{month}"
    cached = _cache_get(cache_key)
    if cached is not None:
        resp = make_response(cached)
        resp.headers['Content-Type'] = 'text/csv'
        resp.headers['Content-Disposition'] = 'attachment; filename=appliance_consumption.csv'
        resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
        return resp

    scope = df
    if year is not None:
        scope = scope[scope.index.year == year]
    if month is not None:
        scope = scope[scope.index.month == month]

    series = scope.groupby("Appliance Type")["Energy Consumption (kWh)"].sum()
    out = pd.DataFrame({
        'appliance': APPLIANCES,
        'consumption': [float(series.get(a, 0)) for a in APPLIANCES]
    })
    csv_buf = io.StringIO()
    out.to_csv(csv_buf, index=False)
    csv_text = csv_buf.getvalue()
    _cache_set(cache_key, csv_text)
    resp = make_response(csv_text)
    resp.headers['Content-Type'] = 'text/csv'
    resp.headers['Content-Disposition'] = 'attachment; filename=appliance_consumption.csv'
    resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
    return resp

@app.route("/api/appliance-consumption/<int:year>")
def get_appliance_consumption_by_year(year):
    year_data = df[df.index.year == year]
    appliance_series = (
        year_data.groupby("Appliance Type")["Energy Consumption (kWh)"]
        .sum()
    )
    data = [
        {
            "appliance": app,
            "consumption": float(appliance_series.get(app, 0))
        }
        for app in APPLIANCES
    ]
    resp = jsonify(data)
    resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
    return resp

@app.route("/api/appliance-consumption/<int:year>/<int:month>")
def get_appliance_consumption_by_year_month(year, month):
    ym_data = df[(df.index.year == year) & (df.index.month == month)]
    appliance_series = (
        ym_data.groupby("Appliance Type")["Energy Consumption (kWh)"]
        .sum()
    )
    data = [
        {
            "appliance": app,
            "consumption": float(appliance_series.get(app, 0))
        }
        for app in APPLIANCES
    ]
    resp = jsonify(data)
    resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
    return resp

@app.route('/api/cost/consumption')
def get_cost_consumption():
    year = request.args.get('year', type=int)
    rate = request.args.get('rate', default=6.0, type=float)
    home_id = request.args.get('home_id', type=int)

    scope = df
    if home_id is not None:
        scope = scope[scope['Home ID'] == home_id]

    # Monthly aggregate and fill gaps
    monthly = scope.resample('M').sum(numeric_only=True)
    if not monthly.empty:
        s = monthly.index.min().to_period('M').to_timestamp('M')
        e = monthly.index.max().to_period('M').to_timestamp('M')
        full_index = pd.date_range(start=s, end=e, freq='M')
        monthly = monthly.reindex(full_index, fill_value=0)

    out = pd.DataFrame({
        'month': monthly.index.strftime('%Y-%m'),
        'consumption': monthly['Energy Consumption (kWh)']
    })

    if year is not None:
        out = out[out['month'].str.startswith(str(year))]
        # Ensure exactly 12 months for selected year
        months = [f"{year}-{str(i).zfill(2)}" for i in range(1, 13)]
        existing = dict(zip(out['month'], out['consumption']))
        out = pd.DataFrame({
            'month': months,
            'consumption': [float(existing.get(m, 0.0)) for m in months]
        })

    out['cost'] = (out['consumption'] * rate).round(2)

    payload = {
        'rate': rate,
        'items': out.to_dict(orient='records'),
        'total_consumption': float(out['consumption'].sum()),
        'total_cost': float(out['cost'].sum())
    }
    resp = jsonify(payload)
    resp.headers['Cache-Control'] = f'public, max-age={_TTL_SECONDS}'
    return resp

@app.route("/api/predict-next-month")
def predict_next_month():
    # Group by appliance & month
    monthly = (
        df.groupby([pd.Grouper(freq="M"), "Appliance Type"])["Energy Consumption (kWh)"]
        .sum()
        .reset_index()
    )

    results = []

    # Appliance-specific energy-saving tips
    TIPS = {
        "Air Conditioning": [
            "Set thermostat to 24–26°C",
            "Clean/replace filters monthly",
            "Seal windows and doors"
        ],
        "Heater": [
            "Lower setpoint to 20–22°C",
            "Seal drafts; add insulation",
            "Use programmable schedules"
        ],
        "Fridge": [
            "Set 3–5°C (fridge), -18°C (freezer)",
            "Check door seals",
            "Keep coils clean and ventilated"
        ],
        "Washing Machine": [
            "Use cold water cycles",
            "Run full loads",
            "High spin to reduce drying"
        ],
        "Dishwasher": [
            "Use eco mode",
            "Air-dry instead of heat-dry",
            "Run full loads"
        ],
        "Oven": [
            "Batch cook; avoid preheating when possible",
            "Use microwave/air fryer for small meals"
        ],
        "Microwave": [
            "Prefer for reheating vs oven",
            "Use appropriate containers"
        ],
        "Lights": [
            "Switch to LEDs",
            "Use occupancy/daylight sensors",
            "Turn off in unoccupied rooms"
        ],
        "TV": [
            "Enable power‑saving mode",
            "Reduce brightness",
            "Turn off when not in use"
        ],
        "Computer": [
            "Enable sleep after 5–10 min",
            "Lower display brightness",
            "Shut down peripherals"
        ],
    }

    for appliance in monthly["Appliance Type"].unique():
        app_data = monthly[monthly["Appliance Type"] == appliance]
        app_data = app_data.sort_values("Date")

        if len(app_data) > 6:  # need enough data points for ARIMA
            try:
                # Fit ARIMA model
                model = ARIMA(app_data["Energy Consumption (kWh)"], order=(1, 1, 1))
                model_fit = model.fit()

                # Forecast 1 step ahead (next month)
                forecast = model_fit.forecast(steps=1)
                prediction = round(float(forecast.iloc[0]), 2)

                # ✅ Ensure no negative predictions
                prediction = max(0, prediction)

                # Practical suggestion logic: compare to recent baseline (last 3 months avg, else previous month)
                series = app_data["Energy Consumption (kWh)"].astype(float)
                if len(series) >= 3:
                    recent_baseline = float(series.tail(3).mean())
                elif len(series) >= 1:
                    recent_baseline = float(series.iloc[-1])
                else:
                    recent_baseline = None

                if recent_baseline and recent_baseline > 0:
                    pct_change = round(((prediction - recent_baseline) / recent_baseline) * 100, 1)
                else:
                    pct_change = None

                tips = TIPS.get(appliance, [
                    "Eliminate standby power",
                    "Use device only when needed"
                ])
                tip = tips[0]

                if pct_change is None:
                    suggestion = f"Not enough recent data. Do: {tip}."
                elif pct_change >= 15:
                    suggestion = f"Up ~{pct_change}% vs recent. Do: {tip}."
                elif pct_change <= -15:
                    suggestion = f"Down ~{abs(pct_change)}% vs recent. Keep it up. Tip: {tip}."
                else:
                    suggestion = f"Stable vs recent. Tip: {tip}."

                results.append({
                    "appliance": appliance,
                    "predicted_consumption": prediction,
                    "percent_change": pct_change,
                    "suggestion": suggestion
                })

            except Exception as e:
                results.append({
                    "appliance": appliance,
                    "error": str(e)
                })

    return jsonify(results)



if __name__ == "__main__":
    app.run(debug=True)
