import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Register() {
  const navigate = useNavigate();
  const register = useAuthStore((s) => s.register);
  const [form, setForm] = useState({
    name: "", email: "", password: "", role: "employee", employeeId: "", department: ""
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      alert("Registered. Now login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.error || "Register failed");
    }
  };

  return (
    <div className="form card">
      <h2 style={{ marginBottom: 6 }}>Register</h2>
      <form onSubmit={submit}>
        <input placeholder="Full name" required value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
        <input placeholder="Email" required value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
        <input placeholder="Password" type="password" required value={form.password} onChange={(e)=>setForm({...form,password:e.target.value})} />
        <input placeholder="Employee ID (EMP001)" value={form.employeeId} onChange={(e)=>setForm({...form,employeeId:e.target.value})} />
        <input placeholder="Department" value={form.department} onChange={(e)=>setForm({...form,department:e.target.value})} />
        <select value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}>
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>
        <button type="submit">Register</button>
      </form>
      <p style={{ textAlign: "center", marginTop: 8 }} onClick={() => navigate("/login")}>Already have account?</p>
    </div>
  );
}
