import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, PieChart, Pie, Cell
} from "recharts";
import "./dashboard.css";

const DEFAULT_RATE = 6; // ₹ per kWh
const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

export default function Cost() {
  const [collapsed, setCollapsed] = useState(false);
  const [year, setYear] = useState("2023");
  const [rate, setRate] = useState(DEFAULT_RATE);
  const [items, setItems] = useState([]);
  const [totals, setTotals] = useState({ totalConsumption: 0, totalCost: 0 });

  // INR currency formatter (Indian numbering system)
  const inr = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  });

  // Fetch monthly costs for selected filters
  useEffect(() => {
    const url = new URL("http://127.0.0.1:5000/api/cost/consumption");
    url.searchParams.set("year", year);
    url.searchParams.set("rate", rate);
    fetch(url.toString())
      .then((res) => res.json())
      .then((json) => {
        setItems(json.items || []);
        setTotals({
          totalConsumption: json.total_consumption || 0,
          totalCost: json.total_cost || 0,
        });
      })
      .catch((err) => console.error("Error fetching cost data:", err));
  }, [year, rate]);

  // Totals
  const totalConsumption = totals.totalConsumption;
  const totalCost = totals.totalCost;

  return (
    <div className="dashboard-container">
      <Sidebar />
     

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
            <p>{inr.format(totalCost)}</p>
          </div>
        </div>
        {/* Year, Home & Tariff */}
        <div className="year-filter">
          <label>Select Year: </label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
          </select>
          <label style={{ marginLeft: "20px"}}>Tax (₹/kWh): </label>
          <input
            type="number"
            min="0"
            step="0.1"
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            style={{ width: 100 }}
          />

          <a
            href={`http://127.0.0.1:5000/api/consumption.csv?start=${year}-01&end=${year}-12`}
            target="_blank"
            rel="noreferrer"
            style={{ marginLeft: 20 }}
            className="export-btn"
          >
            ⬇️ Export CSV
          </a>
        </div>

        {/* Bar Chart */}
        <h2>Monthly Electricity Cost ({year})</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={items}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(val) => inr.format(val)} />
            <Legend />
            <Bar dataKey="cost" fill="#ff8042" name="Cost (INR)" />
          </BarChart>
        </ResponsiveContainer>

        {/* Pie Chart */}
        <h2 style={{ marginTop: "30px" }}>Cost Distribution ({year})</h2>
        {items.length > 1 ? (
          <ResponsiveContainer width="100%" height={350}>
            <PieChart>
              <Pie
                data={items}
                dataKey="cost"
                nameKey="month"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ month, cost }) => `${month}: ${inr.format(cost)}`}
              >
                {items.map((entry, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(val) => inr.format(val)} />
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
