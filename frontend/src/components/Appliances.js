import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";
import "./dashboard.css";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];

// Month list
const MONTHS = [
  { value: "All", label: "All" },
  { value: "01", label: "January" },
  { value: "02", label: "February" },
  { value: "03", label: "March" },
  { value: "04", label: "April" },
  { value: "05", label: "May" },
  { value: "06", label: "June" },
  { value: "07", label: "July" },
  { value: "08", label: "August" },
  { value: "09", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function Appliances() {
  const [collapsed, setCollapsed] = useState(false);
  const [year, setYear] = useState("2023");
  const [month, setMonth] = useState("All");
  const [data, setData] = useState([]);

  useEffect(() => {
    let url = `http://127.0.0.1:5000/api/appliance-consumption/${year}`;
    if (month !== "All") {
      url += `/${month}`;  // backend should handle this
    }

    fetch(url)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error fetching appliance data:", err));
  }, [year, month]);

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

      {/* Main */}
      <div className="main-content">
        <h1>⚙️ Appliance-wise Consumption</h1>

        {/* Filters */}
        <div className="year-filter">
          <label>Select Year: </label>
          <select value={year} onChange={(e) => setYear(e.target.value)}>
            <option value="2023">2023</option>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
          </select>

          <label style={{ marginLeft: "20px" }}>Select Month: </label>
          <select value={month} onChange={(e) => setMonth(e.target.value)}>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
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
