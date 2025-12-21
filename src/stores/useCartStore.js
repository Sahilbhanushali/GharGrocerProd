import { create } from "zustand";
import { CartAPI } from "../api/cart/cart.api.js";
import { useAuthStore } from "./useAuthStore.js";

export const useCartStore = create((set, get) => ({
  cart: [],
  count: 0,
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  isInitialized: false,
  syncInProgress: false,

  initializeCart: () => {
    const stored = localStorage.getItem("cart");
    const cart = stored ? JSON.parse(stored) : [];
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + ((item.price || 0) * item.qty),
      0
    );
    // set({ cart, count: totalItems, totalItems, totalPrice });
  },

  syncCart: (cart) => {
    const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
    const totalPrice = cart.reduce(
      (sum, item) => sum + ((item.price || 0) * item.qty),
      0
    );

    set({
      cart,
      count: cart.length,   // use total quantity
      totalItems,
      totalPrice,
    });

    localStorage.setItem("cart", JSON.stringify(cart));
    // no background API sync here; actions already hit the API
  },

  // no-op; kept only if some code still calls it
  syncWithAPI: () => {},

  addToCart: async (product, qty = 1) => {
    console.log("addToCart called with:", product, qty);
    const current = get().cart;
    const existing = current.find((item) => item.id === product.id);

    let updated;
    if (existing) {
      const newQty = existing.qty + qty;
      if (newQty === existing.qty) {
        console.log("Quantity unchanged, skipping.");
        return;
      }
      updated = current.map((i) =>
        i.id === product.id ? { ...i, qty: newQty } : i
      );
    } else {
      updated = [...current, { ...product, id: product.id, qty }];
    }

    console.log("syncCart will be called with:", updated);
    get().syncCart(updated);

    const token = useAuthStore.getState().token;
    console.log("Token from useAuthStore:", token);

    if (token) {
      try {
        const finalQty =
          updated.find((i) => i.id === product.id)?.qty ?? qty;
        console.log("About to call CartAPI.add:", product.id, finalQty);
        await CartAPI.add(product.id, finalQty);
      } catch (err) {
        console.error("API add failed:", err);
      }
    } else {
      console.log("No token, skipping CartAPI.add");
    }
  },

  removeFromCart: async (productId) => {
    const current = get().cart;
    const updated = current.filter((i) => i.id !== productId);

    if (updated.length === current.length) return;

    get().syncCart(updated);

    const token = useAuthStore.getState().token;
    if (token) {
      try {
        await CartAPI.remove(productId);
      } catch (err) {
        console.error("API remove failed:", err);
      }
    }
  },

  updateQuantity: async (productId, qty) => {
    if (qty < 1) {
      const updated = get().cart.filter((i) => i.id !== productId);
      get().syncCart(updated);

      const token = useAuthStore.getState().token;
      if (token) {
        try {
          await CartAPI.remove(productId);
        } catch (err) {
          console.error("API remove failed:", err);
        }
      }
      return;
    }

    const current = get().cart;
    const item = current.find((i) => i.id === productId);
    if (!item || item.qty === qty) return;

    const updated = current.map((i) =>
      i.id === productId ? { ...i, qty } : i
    );

    get().syncCart(updated);

    const token = useAuthStore.getState().token;
    if (token) {
      try {
        await CartAPI.add(productId, qty);
      } catch (err) {
        console.error("API quantity update failed:", err);
      }
    }
  },

  loadCartFromAPI: async () => {
    // CRITICAL FIX: Check if already initialized or currently loading
    const state = get();
    if (state.isInitialized || state.loading) {
      console.log("Cart already initialized or loading, skipping...");
      return;
    }

    const token = useAuthStore.getState().token;
    if (!token) {
      get().initializeCart();
      set({ isInitialized: true });
      return;
    }

    console.log("Loading cart from API...");
    set({ loading: true });
    
    try {
      const res = await CartAPI.get();
      const items = res?.data?.data?.items || [];
      console.log("API items:", items);
      
      const apiCart = items.map((it) => ({
        ...it.product,
        id: it.product_id,
        qty: it.qty ?? 1,
        price: Number(it.unit_price) || 0,
        cartItemId: it.id,
      }));

      console.log("API cart loaded successfully:", apiCart);

      get().syncCart(apiCart);
      set({ isInitialized: true });
    } catch (err) {
      console.error("Cart load failed:", err);
      get().initializeCart();
      set({ isInitialized: true });
    } finally {
      set({ loading: false });
    }
  },

  // Add method to reset initialization (useful for logout)
  resetCart: () => {
    set({
      cart: [],
      count: 0,
      totalItems: 0,
      totalPrice: 0,
      loading: false,
      isInitialized: false,
    });
    localStorage.removeItem("cart");
  },

  isInCart: (productId) => get().cart.some((i) => i.id === productId),

  getItemQuantity: (productId) => {
    const item = get().cart.find((i) => i.id === productId);
    return item ? item.qty : 0;
  },
}));