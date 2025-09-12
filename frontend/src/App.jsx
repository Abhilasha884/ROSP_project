import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Appliances from "./components/Appliances";
import Cost from "./components/Cost";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/appliances" element={<Appliances />} />
        <Route path="/cost" element={<Cost />} />
      </Routes>
    </Router>
  );
}


