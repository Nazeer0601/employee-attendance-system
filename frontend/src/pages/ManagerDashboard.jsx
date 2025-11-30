import React, { useEffect, useState } from "react";
import API from "../api";
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

export default function ManagerDashboard() {
  const [stats, setStats] = useState({});
  const [attendance, setAttendance] = useState([]);

  const fetchDashboard = async () => {
    try {
      const res = await API.get("/dashboard/manager");
      setStats(res.data || {});  // ⭐ FIX: never null
    } catch (err) {
      console.error(err);
      alert("Ensure you are logged in as manager");
    }
  };

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance/all?limit=300");
      setAttendance(res.data.data || []);
    } catch (err) {
      console.log("Error loading attendance for charts");
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchAttendance();
  }, []);

  // ⭐ SAFE DEFAULTS
  const absentEmployees = stats?.absentEmployees || [];
  const presentToday = stats?.presentToday || 0;
  const lateToday = stats?.lateToday || 0;
  const totalEmployees = stats?.totalEmployees || 0;

  // ⭐ CHART DATA — DAILY
  const dailyMap = {};
  attendance.forEach((a) => {
    if (!dailyMap[a.date]) dailyMap[a.date] = 0;
    dailyMap[a.date]++;
  });

  const dailyLabels = Object.keys(dailyMap).slice(-7);
  const dailyValues = Object.values(dailyMap).slice(-7);

  // ⭐ CHART DATA — DEPARTMENT
  const deptMap = {};
  attendance.forEach((a) => {
    if (!deptMap[a.department]) deptMap[a.department] = 0;
    deptMap[a.department]++;
  });

  const deptLabels = Object.keys(deptMap);
  const deptValues = Object.values(deptMap);

  return (
    <div className="app-container">
      <Navbar />

      <div className="p-6 bg-white shadow rounded-lg mt-6">

        <h2 className="text-2xl font-semibold mb-4">Manager Dashboard</h2>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">

          <div className="p-4 bg-blue-100 rounded">
            <h3 className="font-medium">Total Employees</h3>
            <p className="text-xl font-bold text-blue-800">{totalEmployees}</p>
          </div>

          <div className="p-4 bg-green-100 rounded">
            <h3 className="font-medium">Present Today</h3>
            <p className="text-xl font-bold text-green-800">{presentToday}</p>
          </div>

          <div className="p-4 bg-yellow-100 rounded">
            <h3 className="font-medium">Late Today</h3>
            <p className="text-xl font-bold text-yellow-800">{lateToday}</p>
          </div>

        </div>

        {/* DAILY TREND CHART */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-2">Attendance Trend (Last 7 Days)</h3>

          <Line
            data={{
              labels: dailyLabels,
              datasets: [
                {
                  label: "Total Attendance",
                  data: dailyValues,
                  borderColor: "blue",
                  backgroundColor: "rgba(0,0,255,0.2)",
                },
              ],
            }}
          />
        </div>

        {/* DEPARTMENT BAR CHART */}
        <div className="card mb-6">
          <h3 className="text-lg font-semibold mb-2">Department-wise Attendance</h3>

          <Bar
            data={{
              labels: deptLabels,
              datasets: [
                {
                  label: "Records",
                  data: deptValues,
                  backgroundColor: "rgba(0,128,0,0.5)",
                },
              ],
            }}
          />
        </div>

        {/* ABSENT LIST */}
        <div className="card">
          <h3 className="text-lg font-semibold mb-2">Absent Today</h3>

          {absentEmployees.length === 0 ? (
            <p className="small">No absentees</p>
          ) : (
            <ul className="list">
              {absentEmployees.map((a) => (
                <li key={a.employeeId} className="small">
                  {a.employeeId} — {a.name} ({a.department})
                </li>
              ))}
            </ul>
          )}
        </div>

      </div>
    </div>
  );
}
