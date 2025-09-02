import React from "react";
import Dashboard from "./components/Dashboard";
import Charts from "./components/Chart";


export default function App() {
  return (
    <div style={{ padding: 20, fontFamily: "system-ui, Arial" }}>
      <h1>Electricity Consumption Dashboard</h1>
      <Dashboard />
    </div>
  );
}

