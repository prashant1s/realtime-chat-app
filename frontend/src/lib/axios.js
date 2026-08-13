import axios from "axios";

// In production the frontend and backend are separate Vercel projects on
// different domains, so the backend URL must be set explicitly via env var.
const baseURL =
  import.meta.env.MODE === "development"
    ? "http://localhost:5001/api"
    : import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

