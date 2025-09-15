// src/components/Prediction.js
import React, { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { Link } from "react-router-dom";
import "./dashboard.css";

const COLORS = ["#4f46e5", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6"];

export default function Prediction() {
  const [collapsed, setCollapsed] = useState(false);
  const [predictions, setPredictions] = useState([]);
  const [stats, setStats] = useState({ total: 0, maxAppliance: "", maxValue: 0 });

  // Fetch predictions
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/predict-next-month")
      .then((res) => res.json())
      .then((data) => {
        setPredictions(data);

        // Summary stats
        let total = 0;
        let maxAppliance = "";
        let maxValue = 0;

        data.forEach((p) => {
          total += p.predicted_consumption;
          if (p.predicted_consumption > maxValue) {
            maxValue = p.predicted_consumption;
            maxAppliance = p.appliance;
          }
        });

        setStats({
          total: total.toFixed(2),
          maxAppliance,
          maxValue: maxValue.toFixed(2),
        });
      });
  }, []);

  // Get card color based on suggestion
  const getCardClass = (suggestion) => {
    if (suggestion.includes("High")) return "prediction-card high";
    if (suggestion.includes("Lower")) return "prediction-card low";
    return "prediction-card stable";
  };

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

        {/* Summary Stats */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Predicted</h3>
            <p>{stats.total} kWh</p>
          </div>
          <div className="stat-card">
            <h3>Highest Predicted</h3>
            <p>{stats.maxAppliance} ({stats.maxValue} kWh)</p>
          </div>
        </div>

        {/* Bar Chart */}
        <h2>Next Month Forecast (kWh)</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={predictions}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="appliance" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="predicted_consumption" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>

        {/* Pie Chart */}
        <h2>Consumption Share</h2>
        <ResponsiveContainer width="100%" height={350}>
          <PieChart>
            <Pie
              data={predictions}
              dataKey="predicted_consumption"
              nameKey="appliance"
              outerRadius={120}
              label
            >
              {predictions.map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>

        {/* Suggestions Section */}
        <h2>⚠️ Suggestions to Control Usage</h2>
        <div className="prediction-grid">
          {predictions.map((p, index) => (
            <div key={index} className={getCardClass(p.suggestion)}>
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
