import { axiosInstance } from "../../lib/axios.js";


export const FetchALlCategory = async () => {
      try {
        const categoryResponse = await axiosInstance.get(
          "/category",
        );
        console.log(categoryResponse);
        
        return categoryResponse.data.data.data || [];
      } catch (error) {
        console.error("Error fetching category groups:", error);
      }
    };

    export const fetchCategoryDetailsById = async(id) => {
      try{
        const response = await axiosInstance.get(`/category/show/${id}`);
        return response.data.data;
      }catch(error){
        console.error("Error fetching category group by ID:", error);
        throw new Error("Error in fetching category group by ID" + error.message);  
      }
    };


