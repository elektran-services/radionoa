import { create } from "zustand";
import api, { setAuthToken } from "@/lib/api";

export type StationProfile = {
  id: string;
  stationName: string;
  frequency: string;
  userName: string;
  email: string;
};

export type LoginResponse = {
  message: string;
  token: string;
  station: StationProfile;
};

export type RegisterResponse = LoginResponse;

export type ProfileResponse = {
  station: StationProfile;
};

type AuthState = {
  token: string | null;
  station: StationProfile | null;
  isLoading: boolean;
  error: string | null;
  login: (payload: { email: string; password: string }) => Promise<void>;
  register: (payload: {
    stationName: string;
    frequency: string;
    userName: string;
    email: string;
    password: string;
  }) => Promise<void>;
  loadProfile: () => Promise<void>;
  logout: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("noa_token") : null,
  station: null,
  isLoading: false,
  error: null,
  async login(payload) {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<LoginResponse>("/api/auth/login", payload);
      const token = data.token;
      setAuthToken(token);
      set({ token });
      await useAuthStore.getState().loadProfile();
    } catch (e) {
      const errorMessage = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Login failed";
      set({ error: errorMessage });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
  async register(payload) {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post<RegisterResponse>("/api/auth/register", payload);
      const token = data.token;
      setAuthToken(token);
      set({ token });
      await useAuthStore.getState().loadProfile();
    } catch (e) {
      const errorMessage = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Registration failed";
      set({ error: errorMessage });
      throw e;
    } finally {
      set({ isLoading: false });
    }
  },
  async loadProfile() {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get<ProfileResponse>("/api/auth/profile");
      set({ station: data.station || null });
    } catch (e) {
      const status = (e as { response?: { status?: number; data?: { message?: string } } })?.response?.status;
      const errorMessage = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || "Failed to load profile";
      if (status === 401) {
        // Clear token to prevent infinite retry loops
        setAuthToken(null);
        set({ token: null, station: null, error: errorMessage });
      } else {
        set({ error: errorMessage });
      }
    } finally {
      set({ isLoading: false });
    }
  },
  logout() {
    setAuthToken(null);
    set({ token: null, station: null });
  },
})); 