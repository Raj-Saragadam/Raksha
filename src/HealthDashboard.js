import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

function HealthDashboard() {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/health-data");
      const latestData = res.data;
      setData(prev => [...prev.slice(-19), latestData]); // Keep last 20 points
    } catch (err) {
      console.error("Error fetching health data:", err);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 60px)', overflowY: 'auto', padding: '1rem' }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>📊 Live Health Dashboard</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "30px" }}>
        <div className="card">
          <h3 style={{ textAlign: "center" }}>Heartbeat (bpm)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={[50, 150]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="heartbeat" stroke="#ff6b6b" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card">
          <h3 style={{ textAlign: "center" }}>SPO₂ (%)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={[80, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="spo2" stroke="#1dd1a1" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ gridColumn: "span 2" }}>
          <h3 style={{ textAlign: "center" }}>Blood Pressure (mmHg)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="timestamp" />
              <YAxis domain={[60, 180]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="bp_systolic" stroke="#54a0ff" activeDot={{ r: 8 }} name="Systolic" />
              <Line type="monotone" dataKey="bp_diastolic" stroke="#5f27cd" activeDot={{ r: 8 }} name="Diastolic" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <style jsx>{`
        .card {
          background: white;
          padding: 20px;
          border-radius: 20px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
}

export default HealthDashboard;
