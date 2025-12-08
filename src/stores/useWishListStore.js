import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlist: [],
      count: 0,

      // Helper to calculate initial state
      initializeWishlist: () => {
        try {
          const stored = localStorage.getItem("wishlist");
          const wishlist = stored ? JSON.parse(stored) : [];
          return { wishlist, count: wishlist.length };
        } catch (error) {
          console.error("Error loading wishlist:", error);
          return { wishlist: [], count: 0 };
        }
      },

      // Save to localStorage + update store
      syncWishlist: (list) => {
        try {
          localStorage.setItem("wishlist", JSON.stringify(list));
          set({ wishlist: list, count: list.length });
        } catch (error) {
          console.error("Error saving wishlist:", error);
        }
      },

      // ADD or Increase Quantity
      addToWishlist: (product, qty = 1) => {
        const current = get().wishlist;
        const existing = current.find((item) => item.id === product.id);

        let updated;

        if (existing) {
          updated = current.map((item) =>
            item.id === product.id
              ? { ...item, qty: item.qty + qty }
              : item
          );
        } else {
          updated = [...current, { ...product, qty }];
        }

        get().syncWishlist(updated);
      },

      // REMOVE
      removeFromWishlist: (productId) => {
        const current = get().wishlist;
        const updated = current.filter((item) => item.id !== productId);
        get().syncWishlist(updated);
      },

      // CLEAR
      clearWishlist: () => {
        localStorage.removeItem("wishlist");
        set({ wishlist: [], count: 0 });
      },

      // CHECK ITEM
      isInWishlist: (productId) => {
        return get().wishlist.some((item) => item.id === productId);
      },

      // UPDATE QUANTITY
      updateQuantity: (productId, qty) => {
        const current = get().wishlist;
        const updated = current.map((item) =>
          item.id === productId ? { ...item, qty: Math.max(0, qty) } : item
        );
        get().syncWishlist(updated);
      },
     
      // Helper to get item quantity
      getWishlistItemQty: (productId) => {
        const item = get().wishlist.find((item) => item.id === productId);
        return item ? item.qty : 0;
      },
    }),
    {
      name: "wishlist-storage", // unique name for localStorage
      getStorage: () => localStorage,
      onRehydrateStorage: () => (state) => {
        // Called after rehydration
        if (state) {
          state.syncWishlist(state.wishlist);
        }
      },
    }
  )
);