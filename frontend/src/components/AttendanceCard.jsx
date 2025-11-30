import React from "react";

export default function AttendanceCard({ item }) {
  const statusClass =
    item.status === "present" ? "status-present" :
    item.status === "late" ? "status-late" :
    item.status === "absent" ? "status-absent" : "status-present";

  return (
    <div className="att-row card">
      <div>
        <div style={{ fontWeight: 600 }}>{item.date}</div>
        <div className="small">{item.checkInTime ? new Date(item.checkInTime).toLocaleTimeString() : "—"} / {item.checkOutTime ? new Date(item.checkOutTime).toLocaleTimeString() : "—"}</div>
      </div>
      <div style={{ textAlign: "right" }}>
        <div className={statusClass} style={{ display: "inline-block" }}>{item.status || "present"}</div>
        <div className="small" style={{ marginTop: 8 }}>{item.totalHours ? `${item.totalHours} hrs` : ""}</div>
      </div>
    </div>
  );
}
