import {create} from "zustand";
import axios from "axios";
const API_URL =
  typeof import.meta !== "undefined" &&
  import.meta.env &&
  import.meta.env.DEV
    ? "http://localhost:3000/auth"
    : "/auth";
axios.defaults.withCredentials=true;
export const userAuthStore = create((set)=>({
    user:null,
    isAuthenticated :false,
    error:null,
    isLoading:false,
    isCheckingAuth : true,
    successmsg:null,
    success:false,
    verifyLoading:false,
    isSingup:false,
    googleLoading: false,
    googleError: null,
    signup : async(name,email,password)=>{
            set({isLoading:true,signupError:null,isSingup:false});
            try{
                const response =  await axios.post(`${API_URL}/signup`,{email,password,name});
                    set({user:response.data.user,isAuthenticated:true,isLoading:false,successmsg:response.data.message,success:true,isSingup:true});
                    return true;
            }
            catch(error){
                set({signupError:error.response.data.msg|| "User Signing Up", isLoading:false,success:false,isSingup:false});
                throw error;
            }
    },
    resendVerificationCode: async () => {
  set({ isLoading: true, error: null });
  try {
    const response = await axios.post(`${API_URL}/resendotp`);
    set({ isLoading: false });
    return response.data; 
  } catch (error) {
    const msg =
      error.response?.data?.msg || "Something went wrong";
    set({ error: msg, isLoading: false });
    return null;
  }
},
    verifyEmail : async(code)=>{
        set({isLoading:true,error:null});
        try {
            const response = await axios.post(`${API_URL}/verify-email`,{code});
            set({user:response.data.user,isAuthenticated:true,isLoading:false,successmsg:response.data.message});
            return true;
        } catch (error) {
            set({error:error.response?.data?.msg, isLoading:false});
                throw error;
        }
    },
    login : async(email,password)=>{
        set({isLoading:true,Logingerror:null});
        try {
            const response = await axios.post(`${API_URL}/login`,{email,password});
            set({user:response.data.user,isAuthenticated:true,isLoading:false});
            return true;
        } catch (error) {
            set({Logingerror:error.response?.data?.msg|| "Invalid Credentials", isLoading:false});
        }
    },
checkAuth: async () => {
  set({ isCheckingAuth: true, error: null });

  try {
    const response = await axios.get(`${API_URL}/check-auth`,{
        withCredentials: true,
    });

    set({
      user: response.data.user,
      isAuthenticated: true,
      isCheckingAuth: false,
    });
  } catch (error) {
    set({
      isAuthenticated: false,
      isCheckingAuth: false,
      error: error.response?.data?.message || "Authentication failed",
    });
  }
},


logOut : async()=>{
    set({isLogOutLoading:true, error:null});
    try {
         await axios.post(`${API_URL}/logout`);
        set({
            user:null,
            isAuthenticated:false,
            isLoading:false,
        });
        return true;
    } catch (error) {
        set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: error.response?.data?.msg
    });
    }
},
clearError: () =>
  set({
    error: null,
    Logingerror: null,
    signupError: null,
    forgotPasserror: null,
  }),
       
forgetPassword : async(email)=>{
            set({isLoading:true, forgotPasserror:null});
            try {
              const response =  await axios.post(`${API_URL}/forgot-password`,{email});
              set({user:response.data.user,isLoading:false});
              return true;
            } catch (error) {
                set({forgotPasserror:error.response?.data?.message|| "Invalid Credentials", isLoading:false});
            }
        },
verifyresettoken: async (token) => {
  set({ verifyLoading: true, error: null });
  try {
    await axios.get(`${API_URL}/reset-password/${token}`);
  } catch (error) {
    set({
      error: error.response?.data?.message || "Invalid Credentials",
    });
  } finally {
    set({ verifyLoading: false });
  }
},
    resetpassword :async(token,password)=>{
        set({isLoading:true,error:null});
        try {
            const response = await axios.post(`${API_URL}/reset-password/${token}`,{password});
            set({user:response.data.user,isLoading:false})
            return true;
        } catch (error) {
            set({error:error.response?.data?.message|| "Error", isLoading:false,});
        }
},
profilePic: async (file) => {
  const formData = new FormData();
  formData.append("profilePic", file);

  set({ isLoading: true, error: null });

  try {
    const response = await axios.put(
      `${API_URL}/profile-pic`, // ✅ match backend
      formData
    );

    set((state) => ({
      user: {
        ...state.user,
        profilePic: response.data.profilePic,
      },
      isLoading: false,
    }));
  } catch (error) {
    set({
      error: error?.response?.data?.message || "Error",
      isLoading: false,
    });
  }
},
googleLogin : async(token)=>{
    set({ googleLoading: true, googleError: null });
    try {
      const res = await axios.post(`${API_URL}/google`,{token},);
       set({
      user: res.data.user,
      isAuthenticated: true,
      googleLoading: false,
    });
    return true;
    } catch (error) {
      set({
      googleError:
        error.response?.data?.msg || "Google authentication failed",
      googleLoading: false,
    });
    return false;
    }
},
updateUserProfile: async (name, avatar) => {
  set({ isLoading: true, error: null });

  try {
    const payload = {};
    if (name && name.trim()) payload.name = name.trim();
    if (avatar) payload.avatar = avatar;


    if (Object.keys(payload).length === 0) {
      set({ isLoading: false });
      return false;
    }

    const res = await axios.put(
      `${API_URL}/updateProfile`,
      payload
    );

    set({
      user: res.data.user,
      isLoading: false,
    });

    return true;
  } catch (error) {
    set({
      error: error.response?.data?.msg || "Error updating profile",
      isLoading: false,
    });
    return false;
  }
}

}));