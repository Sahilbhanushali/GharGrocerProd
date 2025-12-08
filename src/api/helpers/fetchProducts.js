import {ProductApi} from "../products/product.api.js";


export const fetchProducts = async(params = {
    // discounted_product : 1,
    per_page : 10,
}) => {
    try {
        const response = await ProductApi.fetchAllProducts(params);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
}


export const fetchProductById = async(productId) => {
    try {
        const response = await ProductApi.fetchProductByIdAPI(productId);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching product by ID:", error);
        throw error;
    }
}
