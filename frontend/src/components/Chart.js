// src/components/Charts.js
import React, { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from "recharts";

const Charts = () => {
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [appliance, setAppliance] = useState([]);
  const [household, setHousehold] = useState([]);
  const [temp, setTemp] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/daily")
      .then(res => res.json())
      .then(data => setDaily(data));

    fetch("http://127.0.0.1:5000/api/monthly")
      .then(res => res.json())
      .then(data => setMonthly(data));

    fetch("http://127.0.0.1:5000/api/appliance")
      .then(res => res.json())
      .then(data => setAppliance(data));

    fetch("http://127.0.0.1:5000/api/household")
      .then(res => res.json())
      .then(data => setHousehold(data));

    fetch("http://127.0.0.1:5000/api/temp-vs-energy")
      .then(res => res.json())
      .then(data => setTemp(data));
  }, []);

  const colors = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#0088FE", "#00C49F"];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
      {/* Daily Line Chart */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-2">Daily Energy Consumption</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={daily}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Consumption" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Monthly Bar Chart */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-2">Monthly Energy Consumption</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthly}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Consumption" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Appliance Pie Chart */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-2">Consumption by Appliance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={appliance}
              dataKey="Consumption"
              nameKey="Appliance"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {appliance.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Household Size Bar Chart */}
      <div className="bg-white p-4 rounded-2xl shadow">
        <h2 className="text-lg font-semibold mb-2">Consumption by Household Size</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={household}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="HouseholdSize" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Consumption" fill="#ff7f50" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Temp vs Energy Line Chart */}
      <div className="bg-white p-4 rounded-2xl shadow col-span-1 md:col-span-2">
        <h2 className="text-lg font-semibold mb-2">Temperature vs Energy Consumption</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={temp}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="Temperature" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="Consumption" stroke="#0088FE" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;
