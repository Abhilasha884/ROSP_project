import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import Charts from "./Chart";

export default function Dashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/consumption")
      .then(res => setData(res.data))
      .catch(err => console.error("Error fetching data:", err));
  }, []);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Energy Consumption Dashboard</h2>

      {/* ✅ Raw List */}
      <ul>
        {data.map((row, idx) => (
          <li key={idx}>
            <strong>{row["Appliance Type"]}</strong> — {row["Energy Consumption (kWh)"]} kWh
          </li>
        ))}
      </ul>

      {/* ✅ Bar Chart */}
      <h3>Consumption by Appliance</h3>
      <BarChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Appliance Type" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="Energy Consumption (kWh)" fill="#8884d8" />
      </BarChart>

      {/* ✅ Line Chart */}
      <h3>Consumption Trend</h3>
      <LineChart width={600} height={300} data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="Appliance Type" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="Energy Consumption (kWh)" stroke="#82ca9d" />
      </LineChart>

      {/* ✅ Pie Chart */}
      <h3>Appliance Share of Energy</h3>
      <PieChart width={400} height={400}>
        <Pie
          data={data}
          dataKey="Energy Consumption (kWh)"
          nameKey="Appliance Type"
          cx="50%"
          cy="50%"
          outerRadius={150}
          fill="#8884d8"
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
}
