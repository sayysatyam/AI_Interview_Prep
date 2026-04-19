/* eslint-disable react-hooks/exhaustive-deps */
import { motion } from "framer-motion";
import {
  AlertCircle,
  Backpack,
  ChevronsLeftRight,
  FileText,
  Loader,
  User2,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { AIuseStore } from "../../AuthStore/AIStore";
import { useNavigate } from "react-router-dom";

const InterviewStartPage = () => {
  const { getResumeData, ResumeData, isLoading, error,resetResumeData,questionSet,generateQuestion,isQuesLoading} = AIuseStore();
  const [File, setFile] = useState("");
  const [JobRole, setJobRole] = useState("");
  const [ExperienceYear, setExperienceYear] = useState("");
  const [interviewMode, setInterviewMode] = useState("Technical");
  const [AnalysingDone, setAnalysingDone] = useState(false);
  const [Difficulty, setDifficulty] = useState("Mixed");
    const [NumberofQues, setNumberofQues] = useState(5);
    const [localErrorForQues, setlocalErrorForQues] = useState(null);

  console.table("ResumeData : ",ResumeData);

  useEffect(() => {
    if (!JobRole && ResumeData?.experience_fit) {
      setJobRole(ResumeData.experience_fit);
    }
  }, [ResumeData]);

   const experienceYear = (years) => {
  if (years < 1) return "0 – 1 year (Fresher)";
  if (years <= 3) return "1 – 3 years (Junior)";
  if (years <= 6) return "3 – 6 years (Mid-level)";
  if (years <= 10) return "6 – 10 years (Senior)";
  return "10+ years (Lead / Principal)";
};

 useEffect(() => {
  if (!ExperienceYear && ResumeData?.experience?.total_years !== undefined) {
    const label = experienceYear(ResumeData.experience.total_years);
    setExperienceYear(label);
  }
}, [ResumeData]);
            const Beforefeatures = [
    {
      title: "Skill extraction",
      description:
        "Identifies technical and soft skills from your resume automatically.",
      icon: <User2 size={20} strokeWidth={2} />,
      bgColor: "#EAF3DE",
      textColor: "#052e16",
    },
    {
      title: "Experience mapping",
      description:
        "Maps your work history to the role you're targeting for fit analysis.",
      icon: <FileText size={20} />,
      bgColor: "#c7d2fe",
      textColor: "#1e1a78",
    },
    {
      title: "Gap detection",
      description:
        "Spots missing keywords and skills for your target position before you interview.",
      icon: <AlertCircle size={20} />,
      bgColor: "#fed7aa",
      textColor: "#78350f",
    },
  ];

  const steps = [
    {
      number: 1,
      label: "Upload",
      sub: "Resume",
      active: ResumeData ? false : true,
    },
    {
      number: 2,
      label: "AI",
      sub: "Analyses",
      active: ResumeData ? true : false,
    },
    { number: 3, label: "Interview", sub: "Begins", active: false },
  ];

  const FeedbackData = [
    {
      label: "ATS Score",
      score: ResumeData?.ats_score,
      bgColor:
        ResumeData?.ats_score == null
          ? "#9ca3af"
          : ResumeData.ats_score <= 40
            ? "#b91c1c"
            : ResumeData.ats_score <= 70
              ? "#f59e0b"
              : "#16a34a",
    },
    {
      label: "Experience Fit",
      score: ResumeData?.experience_fit,
      bgColor: "#534AB7",
    },
    {
      label: "Experience",
      score:
        ResumeData?.experience?.total_years === 0
          ? "Fresher"
          : `${ResumeData?.experience?.total_years} Years`,
      bgColor: "#0F6E56",
    },
  ];

  const descArray = Array.isArray(ResumeData?.improvement_suggestions)
    ? ResumeData.improvement_suggestions
    : ResumeData?.improvement_suggestions
      ? [ResumeData.improvement_suggestions]
      : [];

  const mainFeebdackData = [
    {
      label: "Key Strengths Detected",
      desc: ResumeData?.projects_analysis,
      icon: <ChevronsLeftRight size={20} />,
      bgColor: "#EAF3DE",
      textColor: "#052e16",
    },
    {
      label: "Possible Skill Gaps",
      desc: descArray,
      icon: <AlertCircle size={20} />,
      bgColor: "#fed7aa",
      textColor: "#78350f",
    },
    {
      label: "Summary",
      desc: ResumeData?.summary,
      icon: <Backpack size={20} />,
      bgColor: "#c7d2fe",
      textColor: "#1e1a78",
    },
  ];
  const handleResume = async () => {
    const res = await getResumeData(File);
    if (res) {
      setAnalysingDone(true)
    }
    else{
      setAnalysingDone(false)
    }
  };
  
  const handleQuestionData = async () => {
  let resume = ResumeData;

  // 🧠 Step 1: If file exists but not analysed → analyse first
  if (File && !ResumeData) {
    const res = await getResumeData(File);
    if (!res) return; // stop if failed
    resume = res; // use fresh data
  }

  // 🎯 Step 2: Generate questions
  const result = await generateQuestion(
    JobRole,
    resume?.skills?.technical || [],
    resume?.experience?.total_years || ExperienceYear, 
    interviewMode,
    resume?.summary || "",
    resume?.projects || [],
    Difficulty.toLowerCase(),
    Number(NumberofQues)
  );

  if (result) {
    console.log("Questions:", result);
  }
};

  useEffect(()=>{
    if(NumberofQues <5 || NumberofQues >15){
      setlocalErrorForQues("Enter In Range of 5-15");
    } else{
      setlocalErrorForQues(null);
    }
     
  },[NumberofQues]);
  return (
    <div className="bg-[#F0EBE3] w-full flex items-center justify-center px-4 sm:px-6 py-10 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-white shadow-2xl rounded-3xl border border-gray-100 w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 overflow-hidden"
      >
        {/* LEFT PANEL */}
        {/* LEFT PANEL */}
        <div className="relative bg-green-50 p-8 border-r border-green-200 ">
          {/* LOADING OVERLAY */}
          {isLoading && (
            <div className="absolute inset-0 bg-green-50/80 backdrop-blur-[1px] z-10 flex flex-col items-center justify-center gap-4 rounded-l-3xl">
              <div className="flex flex-row items-center gap-2">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    className="h-3 w-3 rounded-full bg-green-600"
                    animate={{ y: [0, -10, 0] }}
                    transition={{
                      duration: 0.6,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </div>
              <div className="text-center">
                <p className="text-sm font-medium text-green-800">
                  Analysing your resume
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Extracting skills, experience & gaps…
                </p>
              </div>
            </div>
          )}

          {/* ACTUAL CONTENT — always rendered, dims when loading */}
          <div
            className={`transition-opacity duration-300 ${isLoading ? "opacity-60" : "opacity-100"} flex flex-col justify-around gap-10`}
          >
            <div className="mt-8 flex items-center gap-2">
              {steps.map((step, index) => (
                <React.Fragment key={index}>
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step.active ? "bg-green-700 text-white" : "bg-gray-100 text-gray-400 border border-gray-200"}`}
                    >
                      {step.number}
                    </div>
                    <p
                      className={`text-xs font-medium leading-tight ${step.active ? "text-green-800" : "text-gray-400"}`}
                    >
                      {step.label}
                      <br />
                      <span className="font-normal">{step.sub}</span>
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 border-t border-dashed border-gray-300 mx-1" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div>
              {/* Badge */}
              <span className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-green-200 rounded-full text-xs font-medium text-green-800 w-fit mb-6">
                <ChevronsLeftRight
                  size={14}
                  strokeWidth={2.5}
                  className="text-green-700"
                />
                Powered by AI
              </span>

              <h1 className="text-3xl font-semibold text-green-900 leading-snug mb-2">
                {ResumeData ? (
                  <>
                    Your AI Resume <br /> Insights
                  </>
                ) : (
                  <>
                    Let the AI read <br /> your resume
                  </>
                )}
              </h1>

              <p className="text-sm text-gray-500 leading-relaxed mb-7">
                {ResumeData
                  ? "Your resume has been analysed. Here's what the AI found — strengths, gaps, and how well you match for the role."
                  : "Upload your resume and we'll analyse it in seconds — extracting skills, experience, and gaps before your interview begins."}
              </p>

              {/* After state */}
              {ResumeData && (
                <>
                  <div className="w-full grid grid-cols-3 gap-2 sm:gap-4 mb-4">
                    {FeedbackData.map((value, index) => (
                      <div
                        key={index}
                        className="bg-white border border-gray-100 rounded-xl sm:rounded-2xl px-3 sm:px-5 py-2 sm:py-3 shadow-sm w-full flex flex-col items-center justify-center gap-0.5 sm:gap-1 hover:shadow-md transition"
                      >
                        <p
                          style={{ color: value.bgColor ?? "#16a34a" }}
                          className="text-lg font-bold tracking-tight leading-none text-center"
                        >
                          {value.score ?? "—"}
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-400 font-medium tracking-tight uppercase text-center">
                          {value.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-3">
                    {mainFeebdackData.map((value, index) => (
                      <div
                        key={index}
                        className="bg-white border border-green-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm"
                      >
                        <div
                          style={{
                            backgroundColor: value.bgColor,
                            color: value.textColor,
                          }}
                          className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                        >
                          {value.icon}
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                            {value.label}
                          </h3>
                          {Array.isArray(value.desc) ? (
                            <ul className="text-xs text-gray-500 list-disc pl-4 space-y-1">
                              {value.desc.map((item, i) => (
                                <li key={i}>{item}</li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-xs text-gray-500 leading-relaxed">
                              {value.desc}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* Before state */}
              {!ResumeData && (
                <div className="flex flex-col gap-3">
                  {Beforefeatures.map((value, index) => (
                    <div
                      key={index}
                      className="bg-white border border-green-100 rounded-2xl p-4 flex items-start gap-4 shadow-sm"
                    >
                      <div
                        style={{
                          backgroundColor: value.bgColor,
                          color: value.textColor,
                        }}
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      >
                        {value.icon}
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-800 mb-0.5">
                          {value.title}
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed">
                          {value.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Stepper */}
            
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="p-6 flex flex-col justify-center gap-5 ">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-1">
              Set up your interview
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Get started your way — let AI analyze your resume or customize everything manually.
            </p>

            <div className="h-px bg-gray-100 mb-6" />

            {/* Target Role */}
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-widest text-gray-400 font-medium mb-1.5">
                Target job role
              </label>
              <input
                type="text"
                placeholder="e.g. Senior Product Manager, ML Engineer…"
                onChange={(e) => {
                  setJobRole(e.target.value);
                }}
                value={JobRole}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition" required
              />
            </div>

            {/* Experience */}
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-widest text-gray-400 font-medium mb-1.5">
                Years of experience
              </label>

                      <select
          value={ExperienceYear}
          onChange={(e) => setExperienceYear(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition bg-white" required
        >
          <option value="0 – 1 year (Fresher)">0 – 1 year (Fresher)</option>
          <option value="1 – 3 years (Junior)">1 – 3 years (Junior)</option>
          <option value="3 – 6 years (Mid-level)">3 – 6 years (Mid-level)</option>
          <option value="6 – 10 years (Senior)">6 – 10 years (Senior)</option>
          <option value="10+ years (Lead / Principal)">10+ years (Lead / Principal)</option>
        </select>
            </div>

                {/* Difficulty */}
            <div className="mb-4">
              <label className="block  text-xs uppercase tracking-widest text-gray-400 font-medium mb-1.5 ">
                Select Level
              </label>
                  <select
                  value={Difficulty}
                  onChange={(e)=> setDifficulty(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition bg-white" required>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Mixed">Mixed</option>
                  </select>
            </div>


            <div className="mb-4">
              <label className="block  text-xs uppercase tracking-widest text-gray-400 font-medium mb-1.5 ">
              Enter Number Of Question {"(5-15)"}
              </label>
              <input
               type="number"
                min={5}
                max={15}
            value={NumberofQues}
              onChange={((e)=>setNumberofQues(Number(e.target.value)))}
             className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-700 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-green-200 focus:border-green-400 transition" required
               />
               {localErrorForQues && <p className="text-xs text-red-500 mt-1">{localErrorForQues}</p>}
            </div>

            {/* Interview Mode */}
            <div className="mb-4">
              <label className="block text-xs uppercase tracking-widest text-gray-400 font-medium mb-1.5">
                Interview mode
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: "Technical", desc: "DSA, system design, code" },
                  { label: "Behavioural", desc: "STAR-based HR questions" },
                  { label: "Mixed", desc: "Both in one session" },
                  { label: "Case study", desc: "Problem-solving rounds" },
                ].map((mode, i) => (
                  <div
                    key={i}
                    onClick={()=>{
                        setInterviewMode(mode.label)
                    }}    
                    className={`border rounded-xl px-3 py-2.5 cursor-pointer transition ${interviewMode === mode.label  ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300 hover:bg-green-50/50"}`}
                  >
                    <p
                      className={`text-xs font-semibold ${interviewMode === mode.label ? "text-green-800" : "text-gray-700"}`}
                    >
                      {mode.label}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {mode.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>


                {ResumeData && (
                  <div className="w-full bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col gap-5">

  {/* Projects */}
  <div>
    <h2 className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">
      Projects
    </h2>

    <ul className="space-y-1 text-sm text-gray-700 list-disc pl-5">
      {Array.isArray(ResumeData?.projects) ? (
        ResumeData.projects.map((proj, i) => <li key={i}>{`${proj}.`}</li>)
      ) : (
        <li>{ResumeData?.projects || "No projects found"}</li>
      )}
    </ul>
  </div>

  {/* Divider */}
  <div className="h-px bg-gray-100"></div>

  {/* Skills */}
  <div>
    <h2 className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-2">
      Skills
    </h2>

    <div className="flex flex-wrap gap-2">
      {Array.isArray(ResumeData?.skills?.technical) ? (
        ResumeData.skills.technical.map((skill, i) => (
          <span
            key={i}
            className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full border border-green-200"
          >
            {skill}
          </span>
        ))
      ) : (
        <span className="text-sm text-gray-500">
          {ResumeData?.skills?.technical || "No skills found"}
        </span>
      )}
    </div>
  </div>
</div>

   )}

            {/* OR Divider */}
<div className="flex items-center justify-center gap-3 mb-4 mt-4">
  <hr className="w-full" />
  <p className="text-xs">OR</p>
  <hr className="w-full" />
</div>

{/* Upload Zone — hidden after successful analysis */}
{!ResumeData && (
  <div className="mb-4">
    <label className="text-xs uppercase tracking-widest text-gray-400 font-medium mb-1.5 flex gap-1">
      Upload your resume
      <span>(AI will fill up automatically)</span>
    </label>

    <div
      onClick={() => document.getElementById("resumeInput").click()}
      className="border-2 border-dashed border-green-300 bg-green-50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-green-100 transition"
    >
      <input
        id="resumeInput"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={(e) => {
          const selectedFile = e.target.files[0];
          if (!selectedFile) return;

          if (selectedFile.type !== "application/pdf") {
            alert("Only PDF allowed");
            return;
          }

          if (selectedFile.size > 5 * 1024 * 1024) {
            alert("Max size is 5MB");
            return;
          }

          setFile(selectedFile);
          resetResumeData(); // 🔥 IMPORTANT FIX
        }}
      />

      {File ? (
        <>
          <div className="bg-green-200 h-10 w-10 rounded-full flex items-center justify-center mb-3">
            <FileText />
          </div>

          <p className="text-sm font-medium text-green-800">
            {File.name}
          </p>

          <p className="text-xs text-green-600 mt-1 mb-3">
            {File.size > 1024 * 1024
              ? (File.size / (1024 * 1024)).toFixed(2) + " MB"
              : (File.size / 1024).toFixed(2) + " KB"}
          </p>

          {/* 🔴 Inline error */}
          {error && (
            <p className="text-xs text-red-500 mb-2 flex items-center gap-1">
              <AlertCircle size={12} /> {error}
            </p>
          )}
        </>
      ) : (
        <>
          <div className="bg-green-200 h-10 w-10 rounded-full flex items-center justify-center mb-3">
            <FileText />
          </div>

          <p className="text-sm font-medium text-green-800">
            Drop your resume here
          </p>

          <p className="text-xs text-green-600 mt-1 mb-3">
            PDF only · Max 5MB
          </p>
        </>
      )}

      {File ? (
        <button
          onClick={(e) => {
            e.stopPropagation();

            if (error) {
              // 🔁 Retry / Change
              setFile(null);
              resetResumeData();

              const input = document.getElementById("resumeInput");
              input.value = "";
              input.click();
            } else {
              handleResume();
            }
          }}
          className="bg-green-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg hover:bg-green-800 transition"
        >
          {error ? "Change Resume" : "Analyse"}
        </button>
      ) : (
        <div className="bg-green-700 text-white text-xs font-medium px-4 py-1.5 rounded-lg">
          Browse file
        </div>
      )}
    </div>
  </div>
)}


          </div>

          {/* Submit */}
          <div className="flex flex-col justify-between">
            {(JobRole && interviewMode) ? (
              <>
                {" "}
                <button
                disabled={!!localErrorForQues}
                  onClick={() => !localErrorForQues && handleQuestionData()}
                 
                
                  className="w-full bg-green-700 hover:bg-green-800 transition text-white font-medium py-3 rounded-xl flex items-center justify-center gap-3 text-sm cursor-pointer"
                >
                 {isQuesLoading ? <Loader className="h-6 w-6 animate-spin mx-auto "/> : "All Set For Interview"}
                </button>
              </>
            ) : (
              ""
            )}
            
            <p className="text-[11px] text-gray-400 text-center mt-3 leading-relaxed">
              Your resume is never stored · Used only to personalise your
              interview
            </p>
          </div>

        </div>
      </motion.div>
    </div>
  );
};

export default InterviewStartPage;




