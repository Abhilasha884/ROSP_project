from flask import Flask, jsonify
from flask_cors import CORS
import pandas as pd

app = Flask(__name__)
CORS(app)

from preprocess import preprocess_data

df=preprocess_data("smart_home_energy_consumption_large.csv")
daily = df["daily"]

@app.route("/api/daily")
def daily():
    df['Date'] = pd.to_datetime(df['Date'])
    daily = df.groupby('Date')['Energy Consumption (kWh)'].sum().reset_index()
    daily.columns = ['Date', 'Consumption']
    return jsonify(daily.to_dict(orient="records"))

@app.route("/api/monthly")
def monthly():
    df['Date'] = pd.to_datetime(df['Date'])
    monthly = df.groupby(df['Date'].dt.to_period("M"))['Energy Consumption (kWh)'].sum().reset_index()
    monthly['Date'] = monthly['Date'].astype(str)
    monthly.columns = ['Month', 'Consumption']
    return jsonify(monthly.to_dict(orient="records"))

@app.route("/api/appliance")
def appliance():
    appliance = df.groupby('Appliance Type')['Energy Consumption (kWh)'].mean().reset_index()
    appliance.columns = ['Appliance', 'Consumption']
    return jsonify(appliance.to_dict(orient="records"))

@app.route("/api/household")
def household():
    household = df.groupby('Household Size')['Energy Consumption (kWh)'].mean().reset_index()
    household.columns = ['HouseholdSize', 'Consumption']
    return jsonify(household.to_dict(orient="records"))

@app.route("/api/temp-vs-energy")
def temp_vs_energy():
    temp = df.groupby('Outdoor Temperature (°C)')['Energy Consumption (kWh)'].mean().reset_index()
    temp.columns = ['Temperature', 'Consumption']
    return jsonify(temp.to_dict(orient="records"))

