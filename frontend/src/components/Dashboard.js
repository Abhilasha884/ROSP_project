// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
//   BarChart, Bar, PieChart, Pie, Cell, Legend
// } from "recharts";
// import Charts from "./Chart";

// export default function Dashboard() {
//   const [data, setData] = useState([]);

//   useEffect(() => {
//     axios.get("http://localhost:5000/api/consumption")
//       .then(res => setData(res.data))
//       .catch(err => console.error("Error fetching data:", err));
//   }, []);

//   const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF"];

//   return (
//     <div style={{ padding: "20px" }}>
//       <h2>Energy Consumption Dashboard</h2>

//       {/* ✅ Raw List */}
//       <ul>
//         {data.map((row, idx) => (
//           <li key={idx}>
//             <strong>{row["Appliance Type"]}</strong> — {row["Energy Consumption (kWh)"]} kWh
//           </li>
//         ))}
//       </ul>

//       {/* ✅ Bar Chart */}
//       <h3>Consumption by Appliance</h3>
//       <BarChart width={600} height={300} data={data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="Appliance Type" />
//         <YAxis />
//         <Tooltip />
//         <Legend />
//         <Bar dataKey="Energy Consumption (kWh)" fill="#8884d8" />
//       </BarChart>

//       {/* ✅ Line Chart */}
//       <h3>Consumption Trend</h3>
//       <LineChart width={600} height={300} data={data}>
//         <CartesianGrid strokeDasharray="3 3" />
//         <XAxis dataKey="Appliance Type" />
//         <YAxis />
//         <Tooltip />
//         <Line type="monotone" dataKey="Energy Consumption (kWh)" stroke="#82ca9d" />
//       </LineChart>

//       {/* ✅ Pie Chart */}
//       <h3>Appliance Share of Energy</h3>
//       <PieChart width={400} height={400}>
//         <Pie
//           data={data}
//           dataKey="Consumption"
//           nameKey="Appliance"
//           cx="50%"
//           cy="50%"
//           outerRadius={150}
//           fill="#8884d8"
//           label
//         >
//           {data.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//           ))}
//         </Pie>
//         <Tooltip />
//       </PieChart>
//     </div>
//   );
// }

// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import {
//   LineChart,
//   Line,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from "recharts";

// const COLORS = [
//   "#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#8dd1e1",
//   "#a4de6c", "#d0ed57", "#ffa07a", "#d884d8", "#00c49f",
//   "#ffbb28", "#ff8042"
// ];

// // 💡 Define tariff (example: $0.12 per kWh)
// const TARIFF = 0.12;

// const Dashboard = () => {
//   const [data, setData] = useState([]);
//   const [filteredData, setFilteredData] = useState([]);
//   const [years, setYears] = useState([]);
//   const [selectedYear, setSelectedYear] = useState("");
//   const [yearlyTotal, setYearlyTotal] = useState(0);
//   const [yearlyCost, setYearlyCost] = useState(0);

//   useEffect(() => {
//     axios
//       .get("http://localhost:5000/api/consumption")
//       .then((res) => {
//         console.log("API Data:", res.data);

//         // Add monthly cost to each entry
//         const withCost = res.data.map((item) => ({
//           ...item,
//           cost: (item.consumption * TARIFF).toFixed(2),
//         }));

//         setData(withCost);

//         // Extract unique years
//         const uniqueYears = [
//           ...new Set(withCost.map((item) => item.month.split("-")[0]))
//         ];
//         setYears(uniqueYears);
//         setSelectedYear(uniqueYears[0]); // default to first year
//       })
//       .catch((err) => console.error("Error fetching data:", err));
//   }, []);

//   // Filter data & calculate totals
//   useEffect(() => {
//     if (selectedYear && data.length > 0) {
//       const filtered = data.filter(
//         (item) => item.month.startsWith(selectedYear)
//       );
//       setFilteredData(filtered);

//       const totalConsumption = filtered.reduce((sum, item) => sum + item.consumption, 0);
//       setYearlyTotal(totalConsumption.toFixed(2));

//       const totalCost = filtered.reduce((sum, item) => sum + parseFloat(item.cost), 0);
//       setYearlyCost(totalCost.toFixed(2));
//     }
//   }, [selectedYear, data]);

//   return (
//     <div style={{ padding: "20px" }}>
//       <h1>Electricity Consumption Dashboard</h1>

//       {/* Year filter */}
//       <div style={{ marginBottom: "20px" }}>
//         <label style={{ marginRight: "10px" }}>Select Year:</label>
//         <select
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(e.target.value)}
//         >
//           {years.map((year) => (
//             <option key={year} value={year}>
//               {year}
//             </option>
//           ))}
//         </select>
//       </div>

//       <h2>Monthly Energy Consumption & Cost ({selectedYear})</h2>

//       <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
//         {/* Line Chart */}
//         <ResponsiveContainer width="48%" height={400}>
//           <LineChart data={filteredData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" />
//             <YAxis />
//             <Tooltip formatter={(value, name) =>
//               name === "cost" ? [`$${value}`, "Cost"] : [`${value} kWh`, "Consumption"]
//             }/>
//             <Legend />
//             <Line type="monotone" dataKey="consumption" stroke="#8884d8" name="Consumption (kWh)" />
//             <Line type="monotone" dataKey="cost" stroke="#82ca9d" name="Cost ($)" />
//           </LineChart>
//         </ResponsiveContainer>

//         {/* Bar Chart */}
//         <ResponsiveContainer width="48%" height={400}>
//           <BarChart data={filteredData}>
//             <CartesianGrid strokeDasharray="3 3" />
//             <XAxis dataKey="month" />
//             <YAxis />
//             <Tooltip formatter={(value, name) =>
//               name === "cost" ? [`$${value}`, "Cost"] : [`${value} kWh`, "Consumption"]
//             }/>
//             <Legend />
//             <Bar dataKey="consumption" fill="#8884d8" name="Consumption (kWh)" />
//             <Bar dataKey="cost" fill="#82ca9d" name="Cost ($)" />
//           </BarChart>
//         </ResponsiveContainer>
//       </div>

//       {/* Yearly Totals */}
//       <div style={{ marginTop: "30px" }}>
//         <h2>
//           Total Consumption ({selectedYear}): {yearlyTotal} kWh
//         </h2>
//         <h2>
//           Estimated Cost ({selectedYear}): ${yearlyCost}
//         </h2>
//       </div>

//       {/* Pie Chart (Cost Distribution) */}
//       <div style={{ marginTop: "30px", display: "flex", justifyContent: "center" }}>
//         <ResponsiveContainer width="50%" height={400}>
//           <PieChart>
//            <Pie
//             data={filteredData}
//             dataKey="cost"
//             nameKey="month"
//             outerRadius={150}
//             label={({ month, cost }) => `${month}: $${cost}`}
//             >
//             {filteredData.map((entry, index) => (
//             <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//              ))}
//             </Pie>

//             <Tooltip formatter={(value) => `$${value}`} />
//             <Legend />
//           </PieChart>
//         </ResponsiveContainer>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;


// import React, { useEffect, useState } from "react";
// import {
//   BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
//   ResponsiveContainer, PieChart, Pie, Cell, Legend,
//   LineChart, Line
// } from "recharts";

// const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1", "#a4de6c", "#d0ed57", "#ffbb28"];

// export default function Dashboard() {
//   const [data, setData] = useState([]);
//   const [monthlyData, setMonthlyData] = useState([]);
//   const [years, setYears] = useState([]);
//   const [year, setYear] = useState(null);
//   const [activeTab, setActiveTab] = useState("monthly");
//   const [loading, setLoading] = useState(true);
//   const [collapsed, setCollapsed] = useState(false);

//   // Fetch years
//   useEffect(() => {
//     fetch("http://127.0.0.1:5000/api/consumption")
//       .then((res) => res.json())
//       .then((json) => {
//         const available = [...new Set(json.map((d) => d.month.split("-")[0]))];
//         setYears(available);
//         setYear(available[available.length - 1]);
//       });
//   }, []);

//   // Fetch data
//   useEffect(() => {
//     if (!year) return;
//     setLoading(true);
//     Promise.all([
//       fetch(`http://127.0.0.1:5000/api/appliance-consumption/${year}`).then((res) => res.json()),
//       fetch(`http://127.0.0.1:5000/api/consumption/${year}`).then((res) => res.json()),
//     ])
//       .then(([appliance, monthly]) => {
//         setData(appliance);
//         setMonthlyData(monthly);
//         setLoading(false);
//       })
//       .catch(() => setLoading(false));
//   }, [year]);

//   // KPIs
//   const totalConsumption = monthlyData.reduce((a, b) => a + b.consumption, 0);
//   const avgMonthly = (totalConsumption / monthlyData.length || 0).toFixed(1);
//   const peakAppliance =
//     data.length > 0
//       ? data.reduce((max, item) => (item.consumption > max.consumption ? item : max), data[0])
//       : null;

//   return (
//     <div className="dashboard-container">
//       {/* Sidebar */}
//       <aside className={`sidebar ${collapsed ? "collapsed" : ""}`}>
//         {/* <h2 className="logo">⚡ Fusion Smart</h2> */}
//         <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
//           {collapsed ? "☰" : "×"}
//         </button>
//         <ul>
//           <li
//             className={activeTab === "monthly" ? "active" : ""}
//             onClick={() => setActiveTab("monthly")}
//           >
//             📊 {!collapsed && "Dashboard"}
//           </li>
//           <li
//             className={activeTab === "appliance" ? "active" : ""}
//             onClick={() => setActiveTab("appliance")}
//           >
//             ⚙ {!collapsed && "Appliances"}
//           </li>
//           <li
//             className={activeTab === "unit" ? "active" : ""}
//             onClick={() => setActiveTab("unit")}
//           >
//             💰 {!collapsed && "Cost"}
//           </li>
//         </ul>
//       </aside>

//       {/* Main content */}
//       <main className={`main-content ${collapsed ? "collapsed" : ""}`}>
//         <header className="header">
//           <h1>⚡ Electricity Consumption Dashboard</h1>
//         </header>

//         {/* Year Selector */}
//         <div className="year-selector">
//           <label>Select Year:</label>
//           <select value={year || ""} onChange={(e) => setYear(e.target.value)}>
//             {years.map((yr) => (
//               <option key={yr} value={yr}>{yr}</option>
//             ))}
//           </select>
//         </div>

//         {/* KPI Cards */}
//         <div className="kpi-cards">
//           <div className="card">
//             <h3>Total Consumption</h3>
//             <p>{totalConsumption.toFixed(1)} kWh</p>
//           </div>
//           <div className="card">
//             <h3>Avg Monthly</h3>
//             <p>{avgMonthly} kWh</p>
//           </div>
//           <div className="card">
//             <h3>Peak Appliance</h3>
//             <p>
//               {peakAppliance
//                 ? `${peakAppliance.appliance} (${peakAppliance.consumption.toFixed(1)} kWh)`
//                 : "—"}
//             </p>
//           </div>
//         </div>

//         {/* Tab Content */}
//         {loading ? (
//           <p>Loading data...</p>
//         ) : (
//           <>
//             {activeTab === "monthly" && (
//               <div className="chart-container">
//                 <h2>Monthly Energy Consumption ({year})</h2>
//                 <ResponsiveContainer width="100%" height={400}>
//                   <LineChart data={monthlyData}>
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="month" />
//                     <YAxis />
//                     <Tooltip />
//                     <Line type="monotone" dataKey="consumption" stroke="#8884d8" strokeWidth={2} />
//                   </LineChart>
//                 </ResponsiveContainer>
//               </div>
//             )}

//             {activeTab === "appliance" && (
//               <div className="charts-grid">
//                 <div className="chart-container">
//                   <h2>Energy Consumption by Appliance ({year})</h2>
//                   <ResponsiveContainer width="100%" height={400}>
//                     <BarChart data={data}>
//                       <CartesianGrid strokeDasharray="3 3" />
//                       <XAxis dataKey="appliance" />
//                       <YAxis />
//                       <Tooltip />
//                       <Bar dataKey="consumption" fill="#82ca9d" />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </div>
//                 <div className="chart-container">
//                   <h2>Energy Share by Appliance ({year})</h2>
//                   <ResponsiveContainer width="100%" height={400}>
//                     <PieChart>
//                       <Pie
//                         data={data}
//                         dataKey="consumption"
//                         nameKey="appliance"
//                         cx="50%"
//                         cy="50%"
//                         outerRadius={120}
//                         label
//                       >
//                         {data.map((entry, index) => (
//                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                         ))}
//                       </Pie>
//                       <Tooltip />
//                       <Legend />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </div>
//               </div>
//             )}

//             {activeTab === "unit" && (
//               <div className="chart-container">
//                 <h2>Estimated Electricity Cost ({year})</h2>
//                 <p>
//                   Assuming $0.15 per kWh →{" "}
//                   <strong>${(totalConsumption * 0.15).toFixed(2)}</strong>
//                 </p>
//               </div>
//             )}
//           </>
//         )}
//       </main>
//     </div>
//   );
// }
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
        <Link to="/dashboard">📊 Dashboard</Link>
      </li>
      <li>
        <Link to="/appliances">⚙️ Appliances</Link>
      </li>
      <li>
        <Link to="/cost">💰 Cost</Link>
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











        

    
       






