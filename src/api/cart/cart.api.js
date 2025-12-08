import { axiosInstance } from "../../lib/axios.js";

export const CartAPI = {

add: (productId, quantity = 1) => {
  console.log("CartAPI.add ->", { productId, quantity });
  return axiosInstance.post(
    "/cart/add",
    { product_id: productId, qty: quantity },
    { useLocalToken: true }
  );
},


  remove: (productId) =>
    axiosInstance.post(
      "/cart/remove",
      {product_id: productId },
      { useLocalToken: true }
    ),

  get: () =>
    axiosInstance.get("/cart", {
      useLocalToken: true,
    }),

};
