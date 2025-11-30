import React, { useEffect, useState } from "react";
import API from "../api";
import useAuthStore from "../store/authStore";
import AttendanceCard from "../components/AttendanceCard";
import Navbar from "../components/Navbar";

import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function EmployeeDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [today, setToday] = useState(null);
  const [loadingAction, setLoadingAction] = useState(false);
  const [history, setHistory] = useState([]);

  const fetchStats = async () => {
    try {
      // Monthly + today + recent
      const res = await API.get("/dashboard/employee");
      setStats(res.data.monthSummary);
      setRecent(res.data.recent || []);
      setToday(res.data.todayStatus);

      // Full history for charts
      const h = await API.get("/attendance/my-history");

      // ⭐ FIX: always set array safely
      const safeHistory = Array.isArray(h.data.data)
        ? h.data.data
        : Array.isArray(h.data)
        ? h.data
        : [];

      setHistory(safeHistory);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleCheckIn = async () => {
    setLoadingAction(true);
    try {
      await API.post("/attendance/checkin");
      await fetchStats();
      alert("Checked in!");
    } catch (err) {
      alert(err.response?.data?.error || "Check-in failed");
    }
    setLoadingAction(false);
  };

  const handleCheckOut = async () => {
    setLoadingAction(true);
    try {
      await API.post("/attendance/checkout");
      await fetchStats();
      alert("Checked out!");
    } catch (err) {
      alert(err.response?.data?.error || "Check-out failed");
    }
    setLoadingAction(false);
  };

  // ⭐ FIX: safe array for charts
  const safeHistory = Array.isArray(history) ? history : [];
  const last7 = safeHistory.slice(-7);

  const dates = last7.map((e) => e.date);

  const trendValues = last7.map((e) =>
    e.status === "present" ? 1 : e.status === "late" ? 0.5 : 0
  );

  const hours = last7.map((e) => Number(e.totalHours || 0));

  return (
    <div className="app-container">
      <Navbar />

      {/* TOP CARD */}
      <div className="card">
        <h2>Welcome, {user?.name}</h2>
        <div className="small">Role: {user?.role}</div>

        <div style={{ marginTop: 12 }}>
          <div style={{ display: "flex", gap: 10 }}>
            <button disabled={loadingAction} onClick={handleCheckIn}>
              Check In
            </button>
            <button disabled={loadingAction} onClick={handleCheckOut}>
              Check Out
            </button>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <strong>Today's Status: </strong> {today}
        </div>

        <div style={{ marginTop: 8 }}>
          <strong>Month Summary:</strong>
          <div className="small">
            Present: {stats?.present || 0} • Late: {stats?.late || 0} • Half-day:{" "}
            {stats?.halfDay || 0}
          </div>
          <div className="small">Total Hours: {stats?.totalHours || 0}</div>
        </div>
      </div>

      {/* 📊 LINE CHART */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Attendance Trend (Last 7 Days)</h3>

        <Line
          data={{
            labels: dates,
            datasets: [
              {
                label: "Attendance Score",
                data: trendValues,
                borderColor: "blue",
                backgroundColor: "rgba(0,0,255,0.2)",
              },
            ],
          }}
        />
      </div>

      {/* 📊 BAR CHART */}
      <div className="card" style={{ marginTop: 20 }}>
        <h3>Hours Worked (Last 7 Days)</h3>

        <Bar
          data={{
            labels: dates,
            datasets: [
              {
                label: "Hours",
                data: hours,
                backgroundColor: "rgba(0,128,0,0.5)",
              },
            ],
          }}
        />
      </div>

      {/* RECENT ATTENDANCE */}
      <div style={{ marginTop: 18 }} className="card">
        <h3>Recent attendance</h3>
        {recent.length === 0 ? (
          <p className="small">No recent records</p>
        ) : (
          recent.map((r) => <AttendanceCard key={r._id} item={r} />)
        )}
      </div>
    </div>
  );
}
