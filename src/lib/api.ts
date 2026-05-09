import axios, { AxiosError } from "axios";
import { API_BASE_URL } from "@/lib/api-base";

export { API_BASE_URL };

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    try {
      localStorage.setItem("noa_token", token);
    } catch {}
  } else {
    delete api.defaults.headers.common["Authorization"];
    try {
      localStorage.removeItem("noa_token");
    } catch {}
  }
};

// Attach token from localStorage on startup
(() => {
  try {
    const token = typeof window !== "undefined" ? localStorage.getItem("noa_token") : null;
    if (token) setAuthToken(token);
  } catch {}
})();

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response && error.response.status === 401) {
      try {
        localStorage.removeItem("noa_token");
      } catch {}
    }
    return Promise.reject(error);
  }
);

export default api; 