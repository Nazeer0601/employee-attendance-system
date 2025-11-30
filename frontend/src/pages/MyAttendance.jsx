import React, { useEffect, useState } from "react";
import API from "../api";
import Navbar from "../components/Navbar";
import AttendanceCard from "../components/AttendanceCard";

export default function MyAttendance() {
  const [history, setHistory] = useState([]);

  const fetch = async () => {
    try {
      const res = await API.get("/attendance/my-history");
      setHistory(res.data.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(()=> { fetch(); }, []);

  return (
    <div className="app-container">
      <Navbar />
      <div className="card">
        <h2>My Attendance</h2>
        {history.length === 0 ? <p className="small">No records found</p> : (
          history.map((h) => <AttendanceCard key={h._id} item={h} />)
        )}
      </div>
    </div>
  );
}
