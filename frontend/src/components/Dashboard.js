import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid,
  BarChart, Bar, PieChart, Pie, Cell,
  ScatterChart, Scatter
} from "recharts";

export default function Dashboard() {
  const [daily, setDaily] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [appliance, setAppliance] = useState([]);
  const [household, setHousehold] = useState([]);
  const [tempEnergy, setTempEnergy] = useState([]);

  useEffect(() => {
    axios.get("/api/daily").then(res => setDaily(res.data));
    axios.get("/api/monthly").then(res => setMonthly(res.data));
    axios.get("/api/appliance").then(res => setAppliance(res.data));
    axios.get("/api/household").then(res => setHousehold(res.data));
    axios.get("/api/temp-vs-energy").then(res => setTempEnergy(res.data));
  }, []);


  return (
    <div>
        <h1>Daily Consumption(kWh) </h1>
    </div>
  );
}
