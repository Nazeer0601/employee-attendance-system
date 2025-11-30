import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";

export default function Login() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await login(email, password);
      const user = res.user;
      if (user.role === "employee") navigate("/employee/dashboard");
      else navigate("/manager/dashboard");
    } catch (err) {
      alert(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="form card">
      <h2 style={{ marginBottom: 8 }}>Login</h2>
      <form onSubmit={submit}>
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" type="email" required />
        <input value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" type="password" required />
        <button type="submit">Login</button>
      </form>
      <p style={{ textAlign: "center", marginTop: 8 }} onClick={() => navigate("/register")}>Create account</p>
    </div>
  );
}
