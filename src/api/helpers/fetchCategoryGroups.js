import { axiosInstance } from "../../lib/axios.js";


export const FetchALlCategoryGroupsDetails = async () => {
      try {
        const categoryGroupResponse = await axiosInstance.get(
          "/category_group",
          {
            params: {
              per_page: 20,
            },
          }
        );
        return categoryGroupResponse.data.data.data || [];
      } catch (error) {
        console.error("Error fetching category groups:", error);
      }
    };

    export const fetchCategoryGroupDetailsById = async(id) => {
      try{
        const response = await axiosInstance.get(`/category_group/${id}`);
        return response.data.data;
      }catch(error){
        console.error("Error fetching category group by ID:", error);
        throw new Error("Error in fetching category group by ID" + error.message);  
      }
    };


