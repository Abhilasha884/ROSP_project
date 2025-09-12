import React, { useState, useEffect } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from "recharts";
import { Link } from "react-router-dom";

import "./dashboard.css";

export default function Dashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const [monthlyData, setMonthlyData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [yearlyData, setYearlyData] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [stats, setStats] = useState({
    total: 0,
    avg: 0,
    peakMonth: "",
    peakValue: 0,
  });

  // Fetch consumption data
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/consumption")
      .then((res) => res.json())
      .then((data) => {
        setMonthlyData(data);

        // Extract unique years
        const yearSet = [...new Set(data.map((d) => d.month.split("-")[0]))];
        setYears(yearSet);

        // Group by year for yearly chart
        const yearly = {};
        let total = 0;
        let peakMonth = "";
        let peakValue = 0;

        data.forEach((item) => {
          const year = item.month.split("-")[0];
          yearly[year] = (yearly[year] || 0) + item.consumption;

          total += item.consumption;
          if (item.consumption > peakValue) {
            peakValue = item.consumption;
            peakMonth = item.month;
          }
        });

        const yearlyArray = Object.entries(yearly).map(([year, total]) => ({
          year,
          total,
        }));
        setYearlyData(yearlyArray);

        setStats({
          total: total.toFixed(2),
          avg: (total / data.length).toFixed(2),
          peakMonth,
          peakValue: peakValue.toFixed(2),
        });

        // Default: show all data
        setFilteredData(data);
      });
  }, []);

  // Handle year filter
  useEffect(() => {
    if (selectedYear === "All") {
      setFilteredData(monthlyData);
    } else {
      const filtered = monthlyData.filter(
        (item) => item.month.split("-")[0] === selectedYear
      );
      setFilteredData(filtered);
    }
  }, [selectedYear, monthlyData]);

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
      <Link to="/dashboard">
        <span role="img" aria-label="dashboard">📊</span>
        <span className="label">Dashboard</span>
      </Link>
    </li>
    <li>
      <Link to="/appliances">
        <span role="img" aria-label="appliances">⚙️</span>
        <span className="label">Appliances</span>
      </Link>
    </li>
    <li>
      <Link to="/cost">
        <span role="img" aria-label="cost">💰</span>
        <span className="label">Cost</span>
      </Link>
    </li>
  </ul>


  </div>

      {/* Main Content */}
      <div className={`main-content ${collapsed ? "collapsed" : ""}`}>
        <h1>⚡ Electricity Consumption Dashboard</h1>

        {/* Stats Section */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>Total Consumption</h3>
            <p>{stats.total} kWh</p>
          </div>
          <div className="stat-card">
            <h3>Avg Monthly</h3>
            <p>{stats.avg} kWh</p>
          </div>
          <div className="stat-card">
            <h3>Peak Month</h3>
            <p>
              {stats.peakMonth} ({stats.peakValue} kWh)
            </p>
          </div>
        </div>

        {/* Year Filter */}
        <div className="year-filter">
          <label>Select Year: </label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="All">All</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* Monthly Bar Chart */}
        <h2>Monthly Energy Consumption ({selectedYear})</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={filteredData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="consumption" fill="#4f46e5" />
          </BarChart>
        </ResponsiveContainer>

        {/* Yearly Line Chart */}
        <h2>Yearly Energy Consumption</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={yearlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="total" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}











        

    
       






