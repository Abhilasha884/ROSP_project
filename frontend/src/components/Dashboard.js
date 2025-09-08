import React, { useState, useEffect } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie,
  Cell, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from "recharts";

const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"];
const UNIT_COST = 9; // Example: ₹9 per kWh, update as needed

export default function Dashboard() {
  const [selectedView, setSelectedView] = useState("monthly");
  const [monthlyData, setMonthlyData] = useState([]);
  const [applianceData, setApplianceData] = useState([]);
  const [year, setYear] = useState("2023");

  useEffect(() => {
    // Fetch monthly data for selected year
    fetch(`http://127.0.0.1:5000/api/consumption/${year}`)
      .then(res => res.json())
      .then(json => setMonthlyData(json));

    // Fetch appliance data for selected year
    fetch(`http://127.0.0.1:5000/api/appliance-consumption/${year}`)
      .then(res => res.json())
      .then(json => setApplianceData(json));
  }, [year]);

  // Unit cost data = monthly consumption × UNIT_COST
  const unitCostData = monthlyData.map(item => ({
    ...item,
    cost: (item.consumption * UNIT_COST).toFixed(2),
  }));

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-64 bg-gray-800 text-white flex flex-col p-4">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <button
          className={`mb-4 p-2 rounded ${selectedView === "monthly" ? "bg-gray-600" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => setSelectedView("monthly")}
        >
          Monthly Visualization
        </button>
        <button
          className={`mb-4 p-2 rounded ${selectedView === "appliance" ? "bg-gray-600" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => setSelectedView("appliance")}
        >
          Appliance-wise Visualization
        </button>
        <button
          className={`p-2 rounded ${selectedView === "unitcost" ? "bg-gray-600" : "bg-gray-700 hover:bg-gray-600"}`}
          onClick={() => setSelectedView("unitcost")}
        >
          Unit Cost
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Monthly View */}
        {selectedView === "monthly" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Monthly Energy Consumption ({year})</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="consumption" stroke="#8884d8" name="Consumption (kWh)" />
                </LineChart>
              </ResponsiveContainer>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumption" fill="#82ca9d" name="Consumption (kWh)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Appliance View */}
        {selectedView === "appliance" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Appliance-wise Consumption ({year})</h2>
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border rounded px-2 py-1 mb-4"
            >
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={applianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="appliance" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="consumption" fill="#82ca9d" name="Consumption (kWh)" />
                </BarChart>
              </ResponsiveContainer>

              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={applianceData}
                    dataKey="consumption"
                    nameKey="appliance"
                    outerRadius={150}
                    label
                  >
                    {applianceData.map((entry, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Unit Cost View */}
        {selectedView === "unitcost" && (
          <div>
            <h2 className="text-xl font-bold mb-4">Unit Cost (Cost Calculation)</h2>

            {/* Year Selector */}
            <select
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border rounded px-2 py-1 mb-4"
            >
              <option value="2023">2023</option>
              <option value="2024">2024</option>
              <option value="2025">2025</option>
            </select>

            {/* Bar Chart */}
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={unitCostData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(val) => `₹${val}`} />
                <Legend />
                <Bar dataKey="cost" fill="#ff8042" name="Cost (₹)" />
              </BarChart>
            </ResponsiveContainer>

            {/* Yearly Summary */}
            <div className="mt-6 p-4 bg-gray-100 rounded shadow">
              <h3 className="text-lg font-semibold mb-2">Yearly Summary ({year})</h3>
              <p>Total Consumption: <strong>
                {monthlyData.reduce((sum, item) => sum + item.consumption, 0)} kWh
              </strong></p>
              <p>Total Cost: <strong>
                ₹{monthlyData.reduce((sum, item) => sum + item.consumption * UNIT_COST, 0).toFixed(2)}
              </strong></p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
