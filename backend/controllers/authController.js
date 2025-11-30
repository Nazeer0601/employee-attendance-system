import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, employeeId, department } = req.body;

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name, email, password: hashed, role, employeeId, department
    });

    res.json({ message: "Registered", user });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid Email" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ error: "Wrong Password" });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET);

    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.json(user);
};



// ⭐ ADD THIS NEW FUNCTION BELOW (REQUIRED FOR FILTERS)
export const getAllUsers = async (req, res) => {
  try {
    // Return only select fields (name, employeeId, role)
    const users = await User.find({}, "name employeeId role");

    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Error fetching users" });
  }
};
