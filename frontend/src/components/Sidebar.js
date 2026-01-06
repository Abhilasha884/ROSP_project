import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>
      <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
        {collapsed ? "☰" : "✖"}
      </button>
      <h2>⚡ Current Track</h2>
      <ul>
        <li>
          <Link to="/dashboard">Dashboard</Link>
        </li>
        <li>
          <Link to="/appliances">Appliances</Link>
        </li>
        <li>
          <Link to="/cost">Cost</Link>
        </li>
        <li>
          <Link to="/prediction">Prediction</Link>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
