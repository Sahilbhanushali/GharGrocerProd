import { create } from "zustand";
import { persist } from "zustand/middleware";
import { axiosInstance } from "../lib/axios.js";


export const useAuthStore = create(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      loading: false,

      login: (token, userData = null) => {
        localStorage.setItem("authToken", token);
        if (userData) {
          localStorage.setItem("authUser", JSON.stringify(userData));
        }

        set({
          token,
          user: userData,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("authUser");
        localStorage.removeItem("cart"); 
        localStorage.removeItem("wishlist"); 

        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      },

      updateUser: (data) => {
        const updatedUser = { ...get().user, ...data };
        localStorage.setItem("authUser", JSON.stringify(updatedUser));
        set({ user: updatedUser });
      },

      validateToken: async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
          get().logout();
          return false;
        }

        try {
          const response = await axiosInstance.get("/auth/validate", {
            useLocalToken: true,
          });
          return response.data.valid;
        } catch (error) {
          get().logout();
          return false;
        }
      },

      getToken: () => get().token || localStorage.getItem("authToken"),
    }),
    {
      name: "auth-storage",
      getStorage: () => localStorage,
    }
  )
);