
import {axiosInstance} from "../../lib/axios.js";

export const authApi = {
  otpSend: (data) =>
    axiosInstance.post("/customer/send_otp", data, { useLocalToken: false }),
  otpVerify: (data) =>
    axiosInstance.post("/customer/verify_otp", data, { useLocalToken: false }),
};
