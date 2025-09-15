import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import "./dashboard.css";

const UNIT_COST = 9; // ₹ per kWh
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

export default function Cost() {
  const [collapsed, setCollapsed] = useState(false);
  const [year, setYear] = useState("2023");
  const [allData, setAllData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);

  // Fetch all years once
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/consumption")
      .then((res) => res.json())
      .then((json) => setAllData(json))
      .catch((err) => console.error("Error fetching cost data:", err));
  }, []);

  // Filter by selected year & normalize keys
  useEffect(() => {
    const filtered = allData.filter(
      (d) => d.month && d.month.startsWith(year)
    );

    const normalized = filtered.map((item) => {
      const consumption =
        item.consumption ??
        item.Consumption ??
        item["Energy Consumption (kWh)"] ??
        0;

      return {
        ...item,
        consumption,
        cost: Number((consumption * UNIT_COST).toFixed(2)),
      };
    });

    setFilteredData(normalized);
  }, [year, allData]);

  // Totals
  const totalConsumption = filteredData.reduce(
    (sum, item) => sum + item.consumption,
    0
  );
  const totalCost = (totalConsumption * UNIT_COST).toFixed(2);

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
                 <Link to="/dashboard">📊
                   {/* <span role="img" aria-label="dashboard">📊</span> */}
                   <span className="label">Dashboard</span>
                 </Link>
               </li>
               <li>
                 <Link to="/appliances">⚙️
                   {/* <span role="img" aria-label="appliances">⚙️</span> */}
                   <span className="label">Appliances</span>
                 </Link>
               </li>
               <li>
                 <Link to="/cost">💰
                   {/* <span role="img" aria-label="cost">💰</span> */}
                   <span className="label">Cost</span>
                 </Link>
               </li>
               <li>
                 <Link to="/prediction">🔮 
                 <span className="label">Prediction</span>
                 </Link>
               </li>
           
             </ul>
             </div>
     

      {/* Main */}
      <div className="main-content">
        <h1>💰 Electricity Cost Analysis</h1>
         {/* Yearly Summary */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Consumption</h3>
            <p>{totalConsumption} kWh</p>
          </div>
          <div className="stat-card">
            <h3>Total Cost</h3>
            <p>₹{totalCost}</p>
          </div>
        </div>
        {/* Year filter */}
        <div className="year-filter">
          <label>Select Year: </label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>
        </div>

        {/* Bar Chart */}
        <h2>Monthly Electricity Cost ({year})</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(val) => `₹${val}`} />
            <Legend />
            <Bar dataKey="cost" fill="#ff8042" name="Cost (₹)" />
          </BarChart>
        </ResponsiveContainer>

        {/* Pie Chart */}
        <h2 style={{ marginTop: "30px" }}>Cost Distribution ({year})</h2>
        {filteredData.length > 1 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={filteredData}
                dataKey="cost"
                nameKey="month"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ month, cost }) => `${month}: ₹${cost}`}
              >
                {filteredData.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => `₹${val}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <p style={{ marginTop: "10px", color: "gray" }}>
            Not enough data to show distribution for {year}
          </p>
        )}

       
      </div>
    </div>
  );
}
