import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Appliances from "./components/appliances";
import Cost from "./components/cost";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />   {/* 👈 default route */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appliances" element={<Appliances />} />
        <Route path="/cost" element={<Cost />} />
      </Routes>
    </Router>
  );
}
