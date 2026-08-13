import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";

const getErrorMessage = (error) =>
  error.response?.data?.message || error.message || "Something went wrong";

const HEARTBEAT_INTERVAL = 10000;

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isGuestLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  heartbeatId: null,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().startHeartbeat();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().startHeartbeat();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().startHeartbeat();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isLoggingIn: false });
    }
  },

  guestLogin: async () => {
    set({ isGuestLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/guest-login");
      set({ authUser: res.data });
      toast.success("Logged in as guest");

      get().startHeartbeat();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      set({ isGuestLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().stopHeartbeat();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(getErrorMessage(error));
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // Vercel serverless functions can't hold persistent Socket.io connections,
  // so presence is tracked via a periodic authenticated ping instead; the
  // backend stamps `lastSeen` on every authenticated request.
  startHeartbeat: () => {
    if (get().heartbeatId) return;
    const id = setInterval(() => {
      axiosInstance.get("/auth/check").catch(() => {});
    }, HEARTBEAT_INTERVAL);
    set({ heartbeatId: id });
  },
  stopHeartbeat: () => {
    const id = get().heartbeatId;
    if (id) clearInterval(id);
    set({ heartbeatId: null });
  },
}));
