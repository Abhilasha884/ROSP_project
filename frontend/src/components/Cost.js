import React from "react";
import { Link } from "react-router-dom";
import "./dashboard.css";

export default function Cost() {
  return (
    <div className="dashboard-container">
      <div className="sidebar">
        <button className="collapse-btn">☰</button>
        <h2>⚡ CurrentTrack</h2>
        <ul>
          <li><Link to="/">📊 Dashboard</Link></li>
          <li><Link to="/appliances">⚙️ Appliances</Link></li>
          <li><Link to="/cost">💰 Cost</Link></li>
        </ul>
      </div>
      <div className="main-content">
        <h1>💰 Cost Page</h1>
        <p>Here you will display electricity cost analysis.</p>
      </div>
    </div>
  );
}
