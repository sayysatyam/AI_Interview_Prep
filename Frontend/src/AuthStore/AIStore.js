import axios from "axios";
import { create } from "zustand";
const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/auth"
    : "/auth";
axios.defaults.withCredentials = true;

export const AIuseStore = create((set) => ({
  isQuesLoading: false,
  isLoading: false,
  error: null,
  ResumeData: null,
  success: false,
  questionSet: null,
  interviewId: null,
  evaluate: null,
  feedback: null,
  finalResult: null,
  historyDetails: [],
  getTitleHistory : [],
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

  generateQuestion: async (
    role,
    skills,
    experience,
    mode,
    resume,
    project,
    difficulty,
    quesNum,
  ) => {
    set({ isQuesLoading: true, error: null });
    try {
      const res = await axios.post(`${API_URL}/generate-ques`, {
        role,
        skills,
        experience,
        mode,
        resume,
        project,
        difficulty,
        quesNum,
      });

      const data = res.data?.interviewData;
      set({
        questionSet: data,
        isQuesLoading: false,
        error: null,
        success: true,
        interviewId: res.data?.interviewId,
      });

      return data;
    } catch (error) {
      set({
        error: error.response?.data?.message || "Something Went Wrong",
        isQuesLoading: false,
        success: false,
      });
    }
  },

  evaluateAnswer: async (interviewId, answer, questionIndex, timeTaken) => {
    set({
      isLoading: true,
      error: null,
      success: false,
    });

    try {
      const res = await axios.post(`${API_URL}/submit-answer`, {
        interviewId,
        answer,
        questionIndex,
        timeTaken,
      });

      const evaluation = res.data?.evaluation;
      const feedback = res.data?.feedback;

      set({
        evaluate: evaluation,
        feedback: feedback,
        isLoading: false,
        error: null,
        success: true,
      });

      return {
        evaluation,
        feedback,
      };
    } catch (error) {
      set({
        error: error.response?.data?.msg || "Something Went Wrong",
        isLoading: false,
        success: false,
      });

      return null;
    }
  },
  calculate: async (interviewId) => {
    set({ error: null, isLoading: true });
    try {
      const res = await axios.post(`${API_URL}/calculate`, { interviewId });
      const data = { result: res.data?.result, feedback: res.data?.feedback };
      set({ finalResult: data, error: null, isLoading: false });
      return data;
    } catch (error) {
      set({
        error: error.response?.data?.msg || "Something Went Wrong",
        isLoading: false,
        success: false,
      });
    }
  },
  getHistory: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(`${API_URL}/getHistory`);
      set({ historyDetails: res.data, isLoading: false, error: null });
      return res.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.response?.data?.msg || "Something Went Wrong",
      });
    }
  },
  getHisByTitle : async(hisId)=>{
    set({isLoading:true , error :null});
    try {
      const res = await axios.get(`${API_URL}/historyStats/${hisId}`);
        set({getTitleHistory : res?.data,isLoading:false,error:null });
        return res.data;
    } catch (error) {
      set({
        isLoading: false,
        error: error?.response?.data?.msg || "Something Went Wrong",
      });
    }
  }
}));
