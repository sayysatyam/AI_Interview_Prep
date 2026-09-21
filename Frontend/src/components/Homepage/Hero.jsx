import { motion } from "framer-motion";
import { Clock, MessageCircleQuestionMark, Sparkle, SparkleIcon, Sparkles, Target,
  MessageCircleQuestion,
  Mic,
  BarChart3,
  FileDown,
  Lightbulb,
  FileText,
  Trophy, 
  Zap,
  Users,
  Code,
  Brain} from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRobot, FaSpinner } from "react-icons/fa6";
import RoleBasedImage from "../../assets/AiCapabilites Images/ROle Based interview.jpeg"
import SmartQuestionImage from "../../assets/AiCapabilites Images/SmartQuestionGenerator.jpeg"
import RealTimeImage from "../../assets/AiCapabilites Images/Ai voice.jpeg"
import PerformanceImage from "../../assets/AiCapabilites Images/PerformanceDashboard.jpeg"
import AiFeedbackImage from "../../assets/AiCapabilites Images/AI Feedback.jpeg"
import DownloadablePdfImage from "../../assets/AiCapabilites Images/downloadablePdf.jpeg"
import ResumeBasedImage from "../../assets/AiCapabilites Images/ResumeBased.jpeg"
import MockBasedImage from "../../assets/AiCapabilites Images/MockInterviewScoring.jpeg"
import hrImage from "../../assets/Interview Mode/HR.png"
import techImage from "../../assets/Interview Mode/tech.png"
import confidenceImage from "../../assets/Interview Mode/confi.png"
import aiAdvanceImage from "../../assets/Interview Mode/credit.png"
import rapidImage from "../../assets/Interview Mode/rapidImage.jpeg"
import { AIuseStore } from "../../AuthStore/AIStore";

const Hero = () => {

  const navigate = useNavigate();

  const userManual = [
    {
      Icon: <FaRobot size={24} />,
      step: "STEP 1",
      select: "Role & Experience Selection",
      para: "AI adjust difficulty based on selected jobs",
    },
    {
      Icon: <Mic size={24} />,
      step: "STEP 2",
      select: "Smart Voice Interview",
      para: "Dynamic follow-up question based on your answer",
    },
    {
      Icon: <Clock size={24} />,
      step: "STEP 3",
      select: "Timer Based Simulation",
      para: "Real Interview pressure with time tracking",
    },
  ];
    const aiCapabilities = [
  {
    title: "Role-Based Interview Simulation",
    description: "Practice interviews tailored to your target role with AI-driven questions.",
    image: RoleBasedImage,
    icon: <Target size={24} color="#12be33" strokeWidth={3} />,
    tag: "Adaptive"
  },
  {
    title: "Smart Question Generation",
    description: "Get dynamic, non-repetitive questions across technical and HR scenarios.",
    image: SmartQuestionImage,
    icon: <MessageCircleQuestionMark size={24} color="#12be33" strokeWidth={3} />,
    tag: "Non-repetitive"
  },
  {
    title: "Real-Time Answer Analysis",
    description: "Receive instant feedback on clarity, confidence, and relevance.",
    image: RealTimeImage,
    icon: <Mic size={24} color="#12be33" strokeWidth={3} />,
    tag: "Live feedback"
  },
  {
    title: "Performance Insights",
    description: "Track your progress with analytics and identify improvement areas.",
    image: PerformanceImage,
    icon: <BarChart3 size={24} color="#12be33" strokeWidth={3} />,
    tag: "Analytics"
  },
  {
    title: "Downloadable PDF Reports",
    description: "Export your interview performance and feedback as a clean PDF report.",
    image: DownloadablePdfImage,
    icon: <FileDown size={24} color="#12be33" strokeWidth={3} />,
    tag: "Exportable"
  },
  {
    title: "AI Feedback & Suggestions",
    description: "Get personalized tips and structured guidance to improve answers.",
    image: AiFeedbackImage,
    icon: <Lightbulb size={24} color="#12be33" strokeWidth={3} />,
    tag: "Personalized"
  },
  {
    title: "Resume-Based Questions",
    description: "Generate interview questions based on your resume.",
    image: ResumeBasedImage,
    icon: <FileText size={24} color="#12be33" strokeWidth={3} />,
    tag: "Tailored"
  },
  {
    title: "Mock Interview Scoring",
    description: "Get scored like real interviews and track your ranking.",
    image: MockBasedImage,
    icon: <Trophy size={24} color="#12be33" strokeWidth={3} />,
    tag: "Scored"
  }
];
const interviewModes = [
  {
    title: "HR Interview Mode",
    description: "Practice behavioral and HR questions.",
    icon: <Users size={22} />,
    credits:20,
    image : hrImage
  },
  {
    title: "Technical Interview Mode",
    description: "Prepare for coding and technical questions.",
    icon: <Code size={22} />,
    credits: 10,
    image:techImage
  },
  {
    title: "Confidence Detection Mode",
    description: "Analyze your confidence through voice, tone, and response patterns.",
    icon: <Brain size={22} />,
    credits: 25,
    image : confidenceImage
  },
  {
    title: "Rapid Fire Mode",
    description: "Answer quick questions under time pressure.",
    icon:<Zap size={22}/>,
    credits: 10,
    image :rapidImage
  },
  {
    title: "Resume-Based Mode",
    description: "Get questions based on your resume.",
    icon: <FileText size={22}/>,
    credits: 30,
    image:ResumeBasedImage
  },
  {
    title: "AI Advanced Mode",
    description: "Dynamic follow-up questions like real interviews.",
    icon: <Sparkles size={22} />,
    credits: 50,
    image : aiAdvanceImage
  }
]; 



  return (
    <div className="flex items-center justify-center flex-col">
      <h2 className="flex items-center justify-center gap-2 text-normal text-gray-600">
        <Sparkles className="text-green-500" size={16} fill="#22c55e" />
        AI Powered Smart Interview Platform
      </h2>
      <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 max-w-4xl leading-tight text-center"
        >
           Practice Interviews with{" "}
          <span className="relative inline-block">
            <span className="text-green-600">AI Intelligence</span>
            <svg className="absolute -bottom-1 left-0 w-full" height="6" viewBox="0 0 200 6" preserveAspectRatio="none">
              <path d="M0 5 Q50 0 100 4 Q150 8 200 3" stroke="#16a34a" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
            </svg>
          </span>
        </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeIn" }}
        className="max-w-2xl text-xs md:text-lg text-center p-3 text-gray-500 mt-5"
      >
        Practice role-based interview questions tailored to your target job,
        with AI-driven scenarios and personalized feedback to help you improve.
      </motion.p>

      <div className="flex flex-col md:flex-row gap-4 mt-5 w-full max-w-[60%]">
        <motion.button
          onClick={() => navigate("/startInterview")}
          whileTap={{ scale: 0.95, y: 20 }}
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-full bg-black text-white px-6 py-3 rounded-full font-medium tracking-wider cursor-pointer"
        >
          Start Interview
        </motion.button>

        <motion.button
         onClick={()=>{
          navigate("/history")
         }}
          whileTap={{ scale: 0.95, y: 20 }}
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-full bg-white text-black border-2 border-gray-300 rounded-full px-6 py-3 font-medium cursor-pointer"
        >
          View History
        </motion.button>
         <motion.button
         onClick={()=>{
          navigate("/code")
         }}
          whileTap={{ scale: 0.95, y: 20 }}
          whileHover={{ scale: 1.04 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="w-full bg-white text-black border-2 border-gray-300 rounded-full px-6 py-3 font-medium cursor-pointer"
        >
          Coding
        </motion.button>
      </div>

            <div
            id="how-it-works"
             className=" hidden md:flex lg:flex sm:flex flex-col items-center sm:flex-row sm:items-start flex-wrap justify-center gap-4 mt-16 lg:mt-25 md:mt-25 w-full">
        {userManual.map((item, index) => (
            <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
            whileHover={{ scale: 1.04, rotate: 0,y:-20 }}
            key={index}
            className={`relative w-full max-w-sm sm:w-72 lg:w-80 bg-white p-6 sm:p-10 rounded-3xl border-2 border-green-100 hover:border-green-500 shadow-md hover:shadow-2xl mt-10
                ${index === 0 ? "sm:-rotate-[4deg]" : ""}
                ${index === 1 ? "sm:rotate-3 sm:-mt-6" : ""}
                ${index === 2 ? "sm:-rotate-3" : ""}
            `}
            >
            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-white flex items-center justify-center border-2 border-green-300 w-16 h-16 rounded-2xl font-bold hover:border-green-600 text-green-600">
                {item.Icon}
            </div>
            <div className="flex items-center justify-center flex-col pt-5 text-center">
                <div className="mb-2 text-green-600">{item.step}</div>
                <h2 className="font-bold mb-4">{item.select}</h2>
                <p className="font-normal text-gray-500 leading-relaxed">{item.para}</p>
            </div>
            </motion.div>
        ))}
        </div>

                    <div  
                    id="how-it-works"
                     className="lg:hidden md:hidden sm:hidden flex flex-col sm:flex-row gap-4 mt-20 w-full px-4">
        {userManual.map((item, index) => (
            <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: index * 0.15, ease: "easeOut" }}
            whileHover={{ scale: 1.03, borderColor: "#86efac" }}
            className="relative w-full sm:w-72 lg:w-80 bg-white border border-gray-100 rounded-2xl p-6 overflow-hidden"
            >
            {/* Ghost number */}
            <span className="absolute -bottom-2 -right-1 text-8xl font-bold text-gray-100 leading-none pointer-events-none select-none">
                {String(index + 1).padStart(2, "0")}
            </span>

            <motion.div
                initial={{ scale: 0, rotate: -90 }}
                whileInView={{ scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ type: "spring", stiffness: 200, delay: index * 0.15 + 0.2 }}
                className="w-10 h-10 bg-green-50 border border-green-200 rounded-xl flex items-center justify-center text-lg mb-4"
            >
                {item.Icon}
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.15 + 0.3 }}
                className="text-xs text-green-600 font-medium tracking-wider mb-1"
            >
                {item.step}
            </motion.p>

            <motion.h2
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.15 + 0.35 }}
                className="font-semibold text-base mb-2"
            >
                {item.select}
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.15 + 0.45 }}
                className="text-sm text-gray-500 leading-relaxed relative z-10"
            >
                {item.para}
            </motion.p>
            </motion.div>
        ))}
        </div>


          {/* AI CAPABILITIES */}
       <div className="flex items-center justify-center gap-10 flex-col px-4">

   <section
   id="ai-capabilities"
    className="px-4 py-16 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-xs font-semibold text-green-600 tracking-widest uppercase mb-2">Features</p>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Interview.Prep <span className="text-green-600">AI capabilities</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {aiCapabilities.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.4, delay: index * 0.07 }}
              className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-200 transition-all duration-200 flex flex-col"
            >
              {/* Image */}
              <div className="relative h-36 overflow-hidden">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-linear-to-t from-black/30 to-transparent" />
                <span
                  className="absolute top-3 right-3 text-xs font-medium px-2.5 py-0.5 rounded-full"
                  style={{ background: item.accent, color: item.iconColor }}
                >
                  {item.tag}
                </span>
              </div>

              {/* Content */}
              <div className="p-4 flex flex-col gap-2 flex-1">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: item.accent, color: item.iconColor }}
                >
                  {item.icon}
                </div>
                <h3 className="font-semibold text-gray-900 text-sm leading-snug">{item.title}</h3>
                <p className="text-gray-400 text-xs leading-relaxed flex-1">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
</div>

        {/* INTERVIEW MODE */}

        <div
        id="interview-mode"
        className="flex items-center justify-center gap-10 flex-col px-4">

  <h2 className=" text-3xl md:text-4xl font-semibold mx-auto text-center">
    <p className="text-xs font-semibold text-green-600 tracking-widest uppercase ">Modes</p>
    Multiple Interview <span className="text-green-600">Modes</span>
  </h2>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
    {interviewModes.map((value, index) => (
      <div
        key={index}
        className="bg-white border border-gray-100 w-full rounded-3xl shadow-sm hover:shadow-lg transition-shadow duration-300 p-5 flex flex-col gap-5 group"
      >
        {/* Top: icon + image side by side */}
        <div className="flex items-start justify-between gap-3">
          <p className="w-12 h-12 md:w-14 md:h-14 text-green-600 bg-green-100 flex items-center justify-center rounded-2xl shrink-0 group-hover:bg-green-100 transition-colors duration-200 ">
            {value.icon}
          </p>
          <img
            src={value.image}
            alt={value.title}
            className="w-20 h-20 object-contain rounded-2xl"
          />
        </div>

        {/* Title + credits badge */}
        <div className="flex flex-col gap-1">
          <h2 className="text-base md:text-lg font-bold text-gray-800 leading-snug">
            {value.title}
          </h2>
          <span className="text-[11px] font-medium px-2.5 py-0.5 bg-blue-50 text-blue-600 rounded-full w-fit">
            {value.credits} credits
          </span>
        </div>

        {/* Description */}
        <p className="text-gray-400 text-xs leading-relaxed tracking-wide flex-1">
          {value.description}
        </p>

        {/* Bottom accent bar */}
        <div className="h-1 w-10 rounded-full bg-green-400 group-hover:w-20 transition-all duration-300" />
      </div>
    ))}
  </div>
</div>


 </div>
  );
};

export default Hero;
