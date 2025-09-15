import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS
from statsmodels.tsa.arima.model import ARIMA

app = Flask(__name__)
CORS(app)

# Load CSV
df = pd.read_csv("smart_home_energy_consumption_large.csv")

# Convert Date column to datetime
df['Date'] = pd.to_datetime(df['Date'])
df.set_index('Date', inplace=True)

@app.route("/api/consumption")
def get_consumption():
    monthly_data = df.resample('ME').sum(numeric_only=True)
    data = [
        {"month": idx.strftime("%Y-%m"), "consumption": val}
        for idx, val in monthly_data['Energy Consumption (kWh)'].items()
    ]
    return jsonify(data)

@app.route("/api/appliance-consumption")
def get_appliance_consumption():
    appliance_data = (
        df.groupby("Appliance Type")["Energy Consumption (kWh)"]
        .sum()
        .reset_index()
    )
    data = [
        {"appliance": row["Appliance Type"], "consumption": row["Energy Consumption (kWh)"]}
        for _, row in appliance_data.iterrows()
    ]
    return jsonify(data)

@app.route("/api/appliance-consumption/<int:year>")
def get_appliance_consumption_by_year(year):
    year_data = df[df.index.year == year]
    appliance_data = (
        year_data.groupby("Appliance Type")["Energy Consumption (kWh)"]
        .sum()
        .reset_index()
    )
    data = [
        {"appliance": row["Appliance Type"], "consumption": row["Energy Consumption (kWh)"]}
        for _, row in appliance_data.iterrows()
    ]
    return jsonify(data)

# ✅ New endpoint: Year + Month filter
@app.route("/api/appliance-consumption/<int:year>/<int:month>")
def get_appliance_consumption_by_year_month(year, month):
    ym_data = df[(df.index.year == year) & (df.index.month == month)]
    appliance_data = (
        ym_data.groupby("Appliance Type")["Energy Consumption (kWh)"]
        .sum()
        .reset_index()
    )
    data = [
        {"appliance": row["Appliance Type"], "consumption": row["Energy Consumption (kWh)"]}
        for _, row in appliance_data.iterrows()
    ]
    return jsonify(data)

@app.route("/api/predict-next-month")
def predict_next_month():
    # Group by appliance & month
    monthly = (
        df.groupby([pd.Grouper(freq="M"), "Appliance Type"])["Energy Consumption (kWh)"]
        .sum()
        .reset_index()
    )

    results = []

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

                # Suggestion logic
                avg_usage = app_data["Energy Consumption (kWh)"].mean()
                if prediction > avg_usage * 1.2:
                    suggestion = "⚠️ High predicted usage — consider reducing usage for efficiency."
                elif prediction < avg_usage * 0.8:
                    suggestion = "✅ Lower predicted usage — good efficiency trend!"
                else:
                    suggestion = "ℹ️ Stable usage — keep monitoring."

                results.append({
                    "appliance": appliance,
                    "predicted_consumption": prediction,
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
