import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard.js";
import Appliances from "./components/Appliances.js";
import Cost from "./components/Cost.js";
import Prediction from "./components/prediction.js";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />   {/* 👈 default route */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appliances" element={<Appliances />} />
        <Route path="/cost" element={<Cost />} />
        <Route path="/prediction" element={<Prediction />} />
      </Routes>
    </Router>
  );
}
