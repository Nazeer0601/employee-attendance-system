import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  date: String,
  checkInTime: String,
  checkOutTime: String,
  status: String,
  totalHours: Number,
}, { timestamps: true });

export default mongoose.model("Attendance", attendanceSchema);
