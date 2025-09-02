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
import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#8884d8", "#82ca9d", "#ffc658", "#ff8042",
  "#8dd1e1", "#a4de6c", "#d0ed57", "#ffbb28",
];

export default function Dashboard() {
  const [data, setData] = useState([]);
  const [year, setYear] = useState("2023"); // default year
  const availableYears = ["2022", "2023", "2024"]; // adjust based on dataset

  useEffect(() => {
    fetch(`http://127.0.0.1:5000/api/appliance-consumption/${year}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((err) => console.error("Error fetching data:", err));
  }, [year]);

  return (
    <div className="p-6">
      {/* Year Filter */}
      <div className="mb-6">
        <label className="mr-2 font-semibold">Select Year:</label>
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="border rounded px-2 py-1"
        >
          {availableYears.map((yr) => (
            <option key={yr} value={yr}>
              {yr}
            </option>
          ))}
        </select>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="p-6 bg-white shadow rounded-2xl">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Energy Consumption by Appliance ({year})
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="appliance" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="consumption" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="p-6 bg-white shadow rounded-2xl">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            Energy Consumption Share by Appliance ({year})
          </h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={data}
                dataKey="consumption"
                nameKey="appliance"
                cx="50%"
                cy="50%"
                outerRadius={150}
                label
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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






