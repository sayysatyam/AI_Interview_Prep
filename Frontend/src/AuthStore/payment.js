import axios from "axios";
import {create} from "zustand"
const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/auth"
    : "/auth";
axios.defaults.withCredentials = true;

export const paymentAuthStore = create((set)=>({
    isLoading : false,
      error: null,
      orderDetail : [],
        createPayment : async(planCode)=>{
            set({isLoading : true , error : null});
                try {
                    const res = await axios.post(`${API_URL}/payment-create`,{
                        planCode
                    });
                        set({orderDetail : res?.data?.order, isLoading : false,error: res?.data?.message });
                        return res?.data?.order;
                } catch (error) {
            set({
        error: error.response?.data?.message || "Something Went Wrong",
        isLoading : false,
        success: false,
      });
        }
        },
        verifyPayment: async (paymentData) => {
  set({ isLoading: true, error: null });

  try {
    const res = await axios.post(
      `${API_URL}/payment-verify`,
      paymentData
    );

    set({ isLoading: false, error: null });

    return res.data;
  } catch (error) {
    set({
      isLoading: false,
      error:
        error.response?.data?.message ||
        "Payment verification failed",
    });

    return null;
  }
},
}))