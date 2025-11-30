import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ["employee", "manager"], default: "employee" },
  employeeId: String,
  department: String,
}, { timestamps: true });

export default mongoose.model("User", userSchema);
