import axios from "axios";
import { create } from "zustand";
const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/auth"
    : "/auth";
axios.defaults.withCredentials = true;

export const AIuseStore = create((set) => ({
  isQuesLoading:false,
  isLoading: false,
  error: null,
  ResumeData: null,
  success: false,
  questionSet:null,
  interviewId:null,
  getResumeData: async (file) => {
    set({ isLoading: true, error: null });
    try {
      const formData = new FormData();
      formData.append("resume", file);
      const res = await axios.post(`${API_URL}/aiResumeAnalyzer`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      set({
        ResumeData: res?.data?.Resumedata,
        isLoading: false,
        error: null,
        success: true,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Something Went Wrong",
        isLoading: false,
        success: false,
      });
    }
  },
  resetResumeData: () => set({ ResumeData: null }),

  generateQuestion:async(role,skills,experience,mode,resume,project,difficulty,quesNum)=>{
      set({isQuesLoading:true,error:null});
      try {
        const res = await axios.post(`${API_URL}/generate-ques`,{role,skills,experience,mode,resume,project,difficulty,quesNum});

          const data = res.data?.interviewData;
        set({questionSet : data, isQuesLoading:false, error:null, success:true,interviewId: res.data?.interviewId});

        return data;

      } catch (error) {
        set({
        error: error.response?.data?.message || "Something Went Wrong",
        isQuesLoading: false,
        success: false,
      });
      }
  }


}));
