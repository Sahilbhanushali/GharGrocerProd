import { axiosInstance } from "../../lib/axios.js";

export const FetchALlBrands = async (page = 1, perPage = 10) => {
  try {
    const brandResponse = await axiosInstance.get("/brand", {
      params: {
        page: page,
        per_page: perPage,
      },
    });
    
    // Return the full response with pagination data
    return brandResponse.data;
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
};

export const fetchBrandDetailsById = async (id) => {
  try {
    const response = await axiosInstance.get(`/brand/${id}`);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching brand by ID:", error);
    throw new Error("Error in fetching brand by ID: " + error.message);
  }
};