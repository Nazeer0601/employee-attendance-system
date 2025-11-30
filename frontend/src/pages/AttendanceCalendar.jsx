import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import API from "../api";
import moment from "moment";

export default function AttendanceCalendar() {
  const [attendance, setAttendance] = useState([]);

  const fetchAttendance = async () => {
    try {
      const res = await API.get("/attendance/my-history");

      // FIXED: your API returns an object, extract array
      setAttendance(res.data.attendance || []);
    } catch (err) {
      console.log("Error fetching calendar data");
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  // Convert history to quick lookup
  const attendanceMap = {};
  const list = Array.isArray(attendance) ? attendance : [];

  list.forEach((a) => {
    attendanceMap[a.date] = a.status;
  });

  const year = moment().year();
  const month = moment().month();
  const daysInMonth = moment().daysInMonth();

  const getStatusColor = (status) => {
    if (!status) return "bg-gray-200";
    if (status === "present") return "bg-green-300";
    if (status === "late") return "bg-yellow-300";
    if (status === "absent") return "bg-red-300";
    if (status === "half-day") return "bg-orange-300";
    return "bg-gray-200";
  };

  return (
    <div className="app-container">
      <Navbar />

      <div className="bg-white shadow p-6 mt-6 rounded-lg">
        <h2 className="text-2xl font-semibold mb-4">Attendance Calendar</h2>

        <h3 className="text-xl font-medium mb-4">
          {moment().format("MMMM YYYY")}
        </h3>

        <div className="grid grid-cols-7 text-center font-semibold mb-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {[...Array(daysInMonth)].map((_, index) => {
            const day = index + 1;
            const dateStr = moment({ year, month, day }).format("YYYY-MM-DD");
            const status = attendanceMap[dateStr];

            return (
              <div
                key={day}
                className={`h-20 flex flex-col items-center justify-center rounded ${getStatusColor(
                  status
                )}`}
              >
                <p className="font-bold">{day}</p>
                <p className="text-xs capitalize">{status || "no data"}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-6">
          <h4 className="font-semibold mb-2">Legend:</h4>
          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-green-300 rounded"></div> Present
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-300 rounded"></div> Late
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-300 rounded"></div> Absent
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-300 rounded"></div> Half Day
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
