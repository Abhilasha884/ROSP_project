import pandas as pd
from flask import Flask, jsonify

app = Flask(__name__)

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

if __name__ == "__main__":
    app.run(debug=True)
