import axios from "axios";
import { create } from "zustand";
const API_URL =
  import.meta.env.MODE === "development"
    ? "http://localhost:3000/auth"
    : "/auth";
axios.defaults.withCredentials = true;

export const codeAIStore = create((set) => ({
    isLoadingCodingQuestion : false,
    error : null,
    codeQuestionData : [],
    codingID:null,
        resultAfterSubmit : [],
        codeHistory : [],
        isLoadingHistory : false,
        isLoadingAnalysis : false,
        analysisReport:[],
    codingQuestionGenerator : async(prompt) => {
        set({isLoadingCodingQuestion  : true , error:null});
        try {
            const res = await axios.post(`${API_URL}/code`,{prompt});
             const codeQuestionData = res?.data?.data;
             const codingID = res?.data?.codingID;
             set({isLoadingCodingQuestion :false,error:null,codeQuestionData,codingID})
           
            return{ codeQuestionData,codingID, isExistingSession: res?.data?.isExistingSession || false,};
           
        } catch (error) {
            set({
        error: error.response?.data?.msg || "Something Went Wrong",
        isLoadingCodingQuestion : false,
        success: false,
      });
        }
    },
    codeQuesbyID : async(codingId) =>{
        set({isLoadingCodingQuestion  : true , error:null});
        try {
            const res = await axios.get(
        `${API_URL}/startCoding/${codingId}`
      );

            const codeQuestionData = res?.data?.details;
             const codingID = res?.data?.codingId;
             set({isLoadingCodingQuestion :false,error:null,codeQuestionData,codingID})
              return{ codeQuestionData,codingID};
        } catch (error) {

    const message =
      error.response?.data?.message ||
      error.response?.data?.msg ||
      "Something Went Wrong";

    set({
      error: message,
      isLoadingCodingQuestion: false,
    });

    return {
      success: false,
      error: message,
    };
  }
    },
    codeSubmitAI: async (codingId, questionIndex, language, code) => {
  console.log({ codingId, questionIndex, language, code });
  set({ isLoadingCodingQuestion: true, error: null });
  
  try {
    const res = await axios.post(`${API_URL}/submitCode`, {
      codingId,
      questionIndex,
      language,
      code,
    });
    
    // FIX: Axios puts the JSON response directly in `res.data`
    const resultAfterSubmit = res?.data; 
    
    set({ isLoadingCodingQuestion: false, error: null, resultAfterSubmit });
    return resultAfterSubmit;
  } catch (error) {
    set({
      error: error.response?.data?.msg || error.response?.data?.message || "Something Went Wrong",
      isLoadingCodingQuestion: false,
      success: false,
    });
  }
},
getCodingHistory : async(page = 1, limit = 20)=>{
  set({isLoadingHistory  : true , error:null});
  try{
    const res = await axios.get(`${API_URL}/getCodeHistory?page=${page}&limit=${limit}`);
    set({codeHistory : res?.data?.history, isLoadingHistory : false,error : null});
    return res?.data?.history;
  }catch(error){
    set({
        error: error.response?.data?.msg || "Something Went Wrong",
        isLoadingHistory : false,
        success: false,
      });
  }
},

codeAnalysis : async(id,codeData)=>{
            set({isLoadingAnalysis  : true , error:null});
            try {
              const res = await axios.post(`${API_URL}/code/${id}/analysis`,{
                codeAttemptedData: codeData
              });
                set({analysisReport: {
    analysis: res?.data?.result,
    questionDetails: res?.data?.questionDetail
  },isLoadingHistory : false,error : null});

                return res?.data?.result;
            } catch (error) {
              set({
        error: error.response?.data?.msg || "Something Went Wrong",
        isLoadingHistory : false,
        success: false,
      });
            }
},

codeHistoryAnalysis : async(id)=>{
set({isLoadingAnalysis  : true , error:null});
            try {
              const res = await axios.get(`${API_URL}/code/${id}/history`);
                set({analysisReport: {
    analysis: res?.data?.result,
    questionDetails: res?.data?.questionDetail
  },isLoadingHistory : false,error : null});

                return res?.data?.result;
            } catch (error) {
              set({
        error: error.response?.data?.msg || "Something Went Wrong",
        isLoadingHistory : false,
        success: false,
      });
            }
}

}));