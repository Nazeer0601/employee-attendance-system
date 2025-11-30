import React from "react";
import { create } from "zustand";
import API from "../api";

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null,
  setAuth: (user, token) => {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
    set({ user, token });
  },
  logout: () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    set({ user: null, token: null });
  },
  login: async (email, password) => {
    const res = await API.post("/auth/login", { email, password });
    set({ user: res.data.user, token: res.data.token });
    localStorage.setItem("user", JSON.stringify(res.data.user));
    localStorage.setItem("token", res.data.token);
    return res.data;
  },
  register: async (payload) => {
    const res = await API.post("/auth/register", payload);
    return res.data;
  }
}));

export default useAuthStore;
