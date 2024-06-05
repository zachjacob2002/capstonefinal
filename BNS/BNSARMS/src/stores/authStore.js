// authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  isAuthenticated: localStorage.getItem("isAuthenticated") === "true",
  user: JSON.parse(localStorage.getItem("user")),
  login: (user) => {
    localStorage.setItem("isAuthenticated", "true");
    localStorage.setItem("user", JSON.stringify(user));
    set({ isAuthenticated: true, user });
    // Add this to log the user on login
  },
  logout: () => {
    localStorage.setItem("isAuthenticated", "false");
    localStorage.setItem("user", null);
    set({ isAuthenticated: false, user: null });
    console.log("Logged out"); // Log on logout
  },
}));

export default useAuthStore;
