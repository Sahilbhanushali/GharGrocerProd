import { axiosInstance } from "../../lib/axios";

export const ProductApi = {

    fetchAllProducts: (params) =>
        axiosInstance.get("/product", { params }),

    fetchProductByIdAPI: (productId) =>
    axiosInstance.get("/product/show", {
      params: { id: productId },
    }),

    fetchProductsByCategory: (params = {}) =>
        axiosInstance.get("/product", { params }),
}