// src/components/Prediction.js
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";
import { Link } from "react-router-dom";
import "./dashboard.css";

export default function Prediction() {
  const [collapsed, setCollapsed] = useState(false);
  const [predictions, setPredictions] = useState([]);

  // Fetch predictions
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/predict-next-month")
      .then((res) => res.json())
      .then((data) => setPredictions(data));
  }, []);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? "☰" : "✖"}
        </button>
        <h2>⚡ CurrentTrack</h2>
        <ul>
          <li>
            <Link to="/dashboard">📊 <span className="label">Dashboard</span></Link>
          </li>
          <li>
            <Link to="/appliances">⚙️ <span className="label">Appliances</span></Link>
          </li>
          <li>
            <Link to="/cost">💰 <span className="label">Cost</span></Link>
          </li>
          <li>
            <Link to="/prediction">🔮 <span className="label">Prediction</span></Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className={`main-content ${collapsed ? "collapsed" : ""}`}>
        <h1>🔮 Appliance Consumption Prediction</h1>

        {/* Prediction Bar Chart */}
        <h2>Next Month Forecast (kWh)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={predictions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="appliance" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="predicted_consumption" fill="#10b981" />
          </BarChart>
        </ResponsiveContainer>

        {/* Suggestions Section */}
        <h2>⚠️ Suggestions to Control Usage</h2>
        <div className="prediction-grid">
          {predictions.map((p, index) => (
            <div key={index} className="prediction-card">
              <h3>{p.appliance}</h3>
              <p><strong>Predicted:</strong> {p.predicted_consumption} kWh</p>
              <p><em>{p.suggestion}</em></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
