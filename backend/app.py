import pandas as pd
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load CSV
df = pd.read_csv("smart_home_energy_consumption_large.csv")

# Convert Date column to datetime
df['Date'] = pd.to_datetime(df['Date'])

# Set Date as index
df.set_index('Date', inplace=True)

@app.route("/api/consumption")
def get_consumption():
    # Resample by month and sum consumption
    monthly_data = df.resample('ME').sum(numeric_only=True)

    # Convert to JSON
    data = [
        {"month": idx.strftime("%Y-%m"), "consumption": val}
        for idx, val in monthly_data['Energy Consumption (kWh)'].items()
    ]
    return jsonify(data)
@app.route("/api/appliance-consumption")
def get_appliance_consumption():
    # Group by appliance type and sum consumption
    appliance_data = (
        df.groupby("Appliance Type")["Energy Consumption (kWh)"]
        .sum()
        .reset_index()
    )

    # Convert to JSON
    data = [
        {"appliance": row["Appliance Type"], "consumption": row["Energy Consumption (kWh)"]}
        for _, row in appliance_data.iterrows()
    ]
    return jsonify(data)
@app.route("/api/appliance-consumption/<int:year>")
def get_appliance_consumption_by_year(year):
    # Filter by year
    year_data = df[df.index.year == year]

    # Group by appliance type and sum
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


if __name__ == "__main__":
    app.run(debug=True)
