import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import "./dashboard.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

export default function Appliances() {
  const [year, setYear] = useState("2023");
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/appliance-consumption/${year}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error fetching appliance data:", err));
  }, [year]);

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        <button className="collapse-btn">☰</button>
        <h2>⚡ CurrentTrack</h2>
        <ul>
          <li><Link to="/dashboard">📊 Dashboard</Link></li>
          <li><Link to="/appliances">⚙️ Appliances</Link></li>
          <li><Link to="/cost">💰 Cost</Link></li>
        </ul>
      </div>

      {/* Main */}
      <div className="main-content">
        <h1>⚙️ Appliance-wise Consumption</h1>

        {/* Year filter */}
        <div className="year-filter">
          <label>Select Year: </label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        <div className="charts-grid">
          {/* Bar Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="appliance" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="consumption" fill="#4f46e5" />
            </BarChart>
          </ResponsiveContainer>

          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                dataKey="consumption"
                nameKey="appliance"
                outerRadius={120}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
