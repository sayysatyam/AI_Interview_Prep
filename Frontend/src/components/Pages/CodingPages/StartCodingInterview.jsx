/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useMemo, useRef, useState } from "react";

import { useNavigate, useParams } from "react-router-dom";

import Editor, { loader } from "@monaco-editor/react";

import * as monaco from "monaco-editor";

loader.config({ monaco });

import {
  Play,
  Send,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Code2,
  RotateCcw,
  Terminal,
  Loader2,
  XCircle,
  LucideMaximize,
  LucideMinimize,
  Sun,
  MoonIcon,
  Code,
  TriangleAlert,
} from "lucide-react";

import { codeAIStore } from "../../../AuthStore/codeAI";
import toast from "react-hot-toast";

const StartCodingInterview = () => {
  const {
    codeQuesbyID,

    codeQuestionData,

    error,

    codeSubmitAI,
    codeAnalysis
  } = codeAIStore();

  const { id } = useParams();

  const STORAGE_KEY = `coding-interview-${id}`;

  const editorRef = useRef(null);

  const [currentQuestion, setCurrentQuestion] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")
          ?.currentQuestion ?? 0
      );
    } catch {
      return 0;
    }
  });

  const [language, setLanguage] = useState(() => {
    try {
      return (
        JSON.parse(localStorage.getItem(STORAGE_KEY) || "null")?.language ||
        "cpp"
      );
    } catch {
      return "cpp";
    }
  });

useEffect(()=>{
    console.log("Here : ",codeQuestionData); //
},[codeQuestionData]);

  const timeOverHandled = useRef(false);

  const [code, setCode] = useState("");

  const [activeTab, setActiveTab] = useState("description");

  const [testResult, setTestResult] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const [isFinishing, setisFinishing] = useState(false);

  const [isFullscreen, setIsFullscreen] = useState(false);

  const [imgError, setImgError] = useState(false);

  const [isSubmitting, setisSubmitting] = useState(false);

  const [testPanelHeight, setTestPanelHeight] = useState(280);

  const [isDragging, setIsDragging] = useState(false);

  const [isDark, setisDark] = useState(true);

  const [submissionResults, setSubmissionResults] = useState({});
  const [showTimeOver, setshowTimeOver] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [codeRunned, setcodeRunned] = useState(false);
  const [codeSubmitted, setcodeSubmitted] = useState(false);

  const navigate = useNavigate();

  const timeLeftColor = ()=>{
    if(timeLeft <= 600){
      return "text-red-500 animate-pulse"; 
    }
    if(timeLeft >600 && timeLeft < 2700){
      return "text-yellow-500"
    } 
    return "text-green-500  "
  }

const hours = Math.floor(timeLeft / 3600);
const minutes = Math.floor((timeLeft % 3600) / 60);
const seconds = timeLeft % 60;


  const [draftState, setDraftState] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");

      return {
        codes:
          stored?.codes && typeof stored.codes === "object" ? stored.codes : {},

        currentQuestion: Number.isInteger(stored?.currentQuestion)
          ? stored.currentQuestion
          : 0,

        language:
          typeof stored?.language === "string" ? stored.language : "cpp",
      };
    } catch {
      return { codes: {}, currentQuestion: 0, language: "cpp" };
    }
  });

  const selectedCodeKeyRef = useRef(null);

  const draftRef = useRef(draftState);

  const currentCodeRef = useRef("");

  const updateDraft = (next) => {
    draftRef.current = next;

    setDraftState(next);

    try {
      localStorage.setItem(
        STORAGE_KEY,

        JSON.stringify({ ...next, updatedAt: Date.now() }),
      );
    } catch (err) {
      console.error("Unable to save coding draft:", err);
    }
  };

  const startResize = (e) => {
    e.preventDefault();

    setIsDragging(true);

    const startY = e.clientY;

    const startHeight = testPanelHeight;

    const handleMouseMove = (e) => {
      const delta = startY - e.clientY;

      const newHeight = Math.min(
        Math.max(startHeight + delta, 100),

        window.innerHeight * 0.65,
      );

      setTestPanelHeight(newHeight);
    };

    const handleMouseUp = () => {
      setIsDragging(false);

      document.removeEventListener("mousemove", handleMouseMove);

      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);

    document.addEventListener("mouseup", handleMouseUp);
  };

  const mode = () => {
    setisDark(!isDark);
  };

  const themeMode = isDark ? "vs-dark" : "vs";

useEffect(() => {
  if (!id) return;

  const fetchQuestion = async () => {
    const result = await codeQuesbyID(id);

    if (!result?.success) {
      
      if (result?.error === "Time is over") {
        setshowTimeOver(true);
      }
      return;
    }
  };

  fetchQuestion();
}, [id, codeQuesbyID]);

  const questions = useMemo(() => {
    if (!codeQuestionData || !Array.isArray(codeQuestionData.codingDetails)) {
      return [];
    }

    return codeQuestionData.codingDetails;
  }, [codeQuestionData]);

  const question = questions[currentQuestion];

  useEffect(() => {
    if (questions.length && currentQuestion >= questions.length) {
      handleQuestionChange(0);
    }
  }, [questions.length, currentQuestion]);

  const availableLanguages = useMemo(() => {
    if (
      Array.isArray(question?.allowedLanguages) &&
      question.allowedLanguages.length > 0
    ) {
      return question.allowedLanguages;
    }

    return ["cpp", "python", "javascript"];
  }, [question]);

  useEffect(() => {
    if (
      availableLanguages.length > 0 &&
      !availableLanguages.includes(language)
    ) {
      handleLanguageChange(availableLanguages[0]);
    }
  }, [availableLanguages, language]);


  const questionKey = question
    ? `${question._id || question.id || currentQuestion}_${language}`
    : null;

  useEffect(() => {
    if (!questionKey || !question) return;

    if (selectedCodeKeyRef.current === questionKey) return;

    selectedCodeKeyRef.current = questionKey;

    const stored = draftRef.current.codes[questionKey];

    const initial =
      typeof stored === "string"
        ? stored
        : typeof question.userCode === "string" && question.userCode.length > 0
          ? question.userCode
          : question.starterCode?.[language] || "";

    currentCodeRef.current = initial;

    setCode(initial);

    setTestResult(submissionResults[currentQuestion] || null);

    setActiveTab("description");
  }, [questionKey, language, question, currentQuestion, submissionResults]);

  const updateCode = (nextCode) => {
    const next = nextCode ?? "";

    currentCodeRef.current = next;

    setCode(next);

    if (!questionKey || selectedCodeKeyRef.current !== questionKey) return;

    updateDraft({
      ...draftRef.current,

      codes: { ...draftRef.current.codes, [questionKey]: next },

      currentQuestion,

      language,
    });
  };

  // =========================================================

    /// HANDLE TIME OVER ///

  const handleTimeOver = async () => {
  if (timeOverHandled.current) return;

  timeOverHandled.current = true;

  try {
    setisFinishing(true);
    const stored = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "{}"
    );

    const codes = stored?.codes || {};

    const codeData = questions.map((question, index) => {
      const questionId =
        question?._id || question?.id || index;

      const codeKey = `${questionId}_${language}`;

      return {
        questionNo: index + 1,
        title: question?.title || "",
        difficulty: question?.difficulty || "",
        topic: question?.topic || "",
        description: question?.description || "",
        constraints: question?.constraints || [],
        inputFormat: question?.inputFormat || "",
        outputFormat: question?.outputFormat || "",
        examples: question?.examples || [],

        userCode: codes[codeKey] || question?.starterCode,

        language,

        submissionResult:
          submissionResults[index] || null
      };
    });
    
    const result = await codeAnalysis(id, codeData);
    localStorage.clear();
    navigate(`/code/${id}/analysis`);

  } catch (error) {
      setIsRunning(false);
    setisSubmitting(false)
    setisFinishing(false);
    console.error("Time over analysis failed:", error);
    setshowTimeOver(true);
  }
};

  const handleSubmissionError = (error) => {
    console.error("❌ Submission error:", error);

    const responseData = error?.response?.data;

    const message =
      responseData?.message ||
      responseData?.msg ||
      responseData?.error ||
      error?.message ||
      "Something went wrong while submitting your code.";

    const status = responseData?.status || "Server Error";

    setTestResult({
      success: false,

      status,

      failedTestCase: responseData?.failedTestCase || 1,

      isHidden: responseData?.isHidden || false,

      message,

      actualOutput: responseData?.actualOutput ?? "",

      expectedOutput: responseData?.expectedOutput ?? "",

      executionTime: responseData?.executionTime ?? 0,
    });
  };

  const handleRun = async () => {
    if (!id || !question || isRunning || isSubmitting) return;

    try {
      setIsRunning(true);
      setTestResult(null);

      const result = await codeSubmitAI(
        id,
        currentQuestion,
        language,
        currentCodeRef.current,
      );

      if (result) {
        setTestResult(result?.data ?? result);
        setcodeRunned(true);
      }
    } catch (error) {
      handleSubmissionError(error);
      setcodeRunned(true);
    } finally {
      setIsRunning(false);
      setcodeRunned(true);
    }
  };

  const handleSubmit = async () => {
    if (!id || !question || isRunning || isSubmitting) return;

    try {
      setisSubmitting(true);
      setTestResult(null);

      const result = await codeSubmitAI(
        id,
        currentQuestion,
        language,
        currentCodeRef.current,
      );

      if (result) {
        const submission = result?.data ?? result;

        setTestResult(submission);
        setSubmissionResults((prev) => ({
          ...prev,
          [currentQuestion]: submission,
        }));
        setActiveTab("submission");
        setcodeSubmitted(true);
      }
    } catch (error) {
      handleSubmissionError(error);
      setcodeSubmitted(true);
    } finally {
      setisSubmitting(false);
      setcodeSubmitted(true);
    }
  };

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    editor.focus();

    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,

      () => {
        handleRun();
      },
    );
  };

  const getLanguageName = (lang) => {
    switch (lang) {
      case "cpp":
        return "C++";

      case "python":
        return "Python";

      case "javascript":
        return "JavaScript";

      default:
        return lang;
    }
  };

  const getMonacoLanguage = (lang) => {
    switch (lang) {
      case "cpp":
        return "cpp";

      case "python":
        return "python";

      case "javascript":
        return "javascript";

      default:
        return "plaintext";
    }
  };

  const formatValue = (value) => {
    if (typeof value === "string") return value;

    if (value === undefined) return "";

    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  const handleResetCode = () => {
    updateCode(question?.starterCode?.[language] || "");

    setTestResult(null);

    requestAnimationFrame(() => editorRef.current?.focus());
  };

  const handleLanguageChange = (nextLanguage) => {
    if (nextLanguage === language) return;

    setLanguage(nextLanguage);

    updateDraft({
      ...draftRef.current,

      currentQuestion,

      language: nextLanguage,
    });
  };

  const handleQuestionChange = (index) => {
    setCurrentQuestion(index);

    updateDraft({
      ...draftRef.current,

      currentQuestion: index,

      language,
    });

    // Show saved submission ONLY if this question was submitted

    const savedSubmission = submissionResults[index];

    setTestResult(savedSubmission || null);

    setActiveTab("description");
    setcodeRunned(false);
    setcodeSubmitted(false);
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      handleQuestionChange(currentQuestion - 1);

      setTestResult(null);

      setActiveTab("description");
      setcodeRunned(false);
        setcodeSubmitted(false);
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      handleQuestionChange(currentQuestion + 1);

      setTestResult(null);

      setActiveTab("description");
      setcodeRunned(false);
        setcodeSubmitted(false);
    }
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);

    requestAnimationFrame(() => {
      editorRef.current?.layout();

      editorRef.current?.focus();
    });
  };
    
  


        ///RUN USE EFFECT  TO SET TIMER/////
useEffect(() => {
  if (!codeQuestionData?.endsAt) return;

  const updateTimer = () => {
    const remaining = Math.max(
      0,
      Math.floor(
        (new Date(codeQuestionData.endsAt).getTime() - Date.now()) / 1000
      )
    );

    setTimeLeft(remaining);

    if (remaining === 0) {
      handleTimeOver();
    }
  };

  updateTimer();

  const timer = setInterval(updateTimer, 1000);

  return () => clearInterval(timer);
}, [codeQuestionData?.endsAt]);

  if(showTimeOver){
    return(
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
    <div className="w-100 rounded-xl bg-white p-8 text-center shadow-xl">

      <div className="mb-4 text-5xl">
        ⏰
      </div>

      <h2 className="mb-2 text-2xl font-bold text-red-500">
        Time is Over
      </h2>

      <p className="mb-6 text-gray-600">
        Your coding round has ended.
      </p>

      <button
        onClick={() => navigate("/codeHistory")}
        className="rounded-lg bg-black px-6 py-3 text-white cursor-pointer"
      >
        Go to History
      </button>

    </div>
  </div>
    )
  }

  if (error ) {
    return (
      <div className="min-h-screen bg-[#F0EBE3] flex items-center justify-center px-5">
        <div className="max-w-md w-full bg-[#FAF8F5] border border-[#D8D0C5] rounded-3xl p-8 text-center shadow-sm ">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>

          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
            Unable to load session
          </h2>

          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">{error}</p>
          <button
        onClick={() => navigate("/codeHistory")}
        className="rounded-lg bg-black px-6 py-3 text-white cursor-pointer mt-4"
      >
        Go to History
      </button>
        </div>
        
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-[#F0EBE3] flex items-center justify-center">
        <p className="text-sm font-medium text-zinc-500 bg-[#FAF8F5] px-6 py-3 rounded-full shadow-sm border border-[#D8D0C5]">
          No coding questions found.
        </p>
      </div>
    );
  }

  const containerLayout = isFullscreen
    ? "fixed inset-0 z-50 w-screen h-screen p-0 m-0 rounded-none bg-[#1C1C1E]"
    : "h-screen bg-[#F0EBE3] p-3 sm:p-4 gap-3 sm:gap-4 flex flex-col";

  const panelRadius = isFullscreen ? "rounded-none" : "rounded-[20px]";

  // =========================================================

  const currentSubmission = submissionResults[currentQuestion] || null;

  const submissionMessage = "Please Execute all your code before finishing the test";

  // MAIN UI

  // =========================================================

  return (
    <div
      className={`overflow-hidden font-sans transition-all duration-300 ${containerLayout}`}
    >
      {!isFullscreen && (
        <header className="h-16 shrink-0 bg-[#FAF8F5]/80 backdrop-blur-xl border border-[#D8D0C5] shadow-sm rounded-2xl flex items-center justify-between px-5 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <Code2 className="h-6 w-6" />

              <p className="font-bold tracking-wide">Coding Assessment</p>
            </div>

            <div className="h-6 w-px bg-[#CFC6BA]" />

            <div>
              <p className="text-[14px] text-gray-400 font-mono">
                Question{" "}
                <span>
                  {currentQuestion + 1} out of {questions.length}
                </span>
              </p>
            </div>

            
          </div>
          <span className={`flex items-center justify-end gap-2 rounded-xl bg-indigo-50 px-4 py-2.5 text-lg font-bold ${timeLeftColor()} shadow-lg border border-gray-700`}>
  <span className="text-red-400">⏱</span>
  <span className="font-mono tracking-widest">
    {String(hours).padStart(2, "0")}:
    {String(minutes).padStart(2, "0")}:
    {String(seconds).padStart(2, "0")}
  </span>
</span>
        </header>
      )}

      <main
        className={`flex-1 min-h-0 flex flex-col lg:flex-row ${
          isFullscreen ? "w-full h-full" : "gap-2 sm:gap-2"
        } z-0`}
      >
        {/* ================================================= */}

        {/* LEFT PROBLEM PANEL */}

        {/* ================================================= */}

        <section
          className={`w-full lg:w-[45%] xl:w-[40%] bg-[#FAF8F5] border border-[#D8D0C5] shadow-sm flex flex-col min-h-0 ${panelRadius} ${
            isFullscreen ? "hidden" : "flex"
          }`}
        >
          {/* SEGMENTED CONTROLS */}

          <div className="px-5 pt-5 pb-2 shrink-0">
            <div className="bg-[#E8E1D8] p-1 rounded-xl flex items-center overflow-x-auto hide-scrollbar">
              {questions.map((item, index) => (
                <button
                disabled={isRunning || isSubmitting}
                  key={item?._id || index}
                  onClick={() => handleQuestionChange(index)}
                  className={`flex-1 min-w-15 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentQuestion === index
                      ? "bg-[#FAF8F5] text-black shadow-sm"
                      : "text-zinc-500 hover:text-zinc-800"
                  }`}
                >
                  Q{index + 1}
                </button>
              ))}
            </div>
          </div>

          {/* TABS */}

          <div className="px-5 border-b border-[#DDD5CA] flex items-center gap-6 shrink-0 mt-2">
            {[
              "description",
              "examples",
              "constraints",
              ...(submissionResults[currentQuestion] ? ["submission"] : []),
            ].map((tab) => (
              <button
              disabled={isRunning || isSubmitting}
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-xs font-semibold capitalize transition-all relative ${
                  activeTab === tab
                    ? "text-black"
                    : "text-zinc-400 hover:text-zinc-700"
                }`}
              >
                {tab}

                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 right-0 h- bg-black rounded-t-full" />
                )}
              </button>
            ))}
          </div>

          {/* PROBLEM CONTENT */}

          <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 custom-scrollbar">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 tracking-tight leading-tight">
                  {question.title}
                </h2>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      question.difficulty === "easy"
                        ? "bg-emerald-50 text-emerald-600"
                        : question.difficulty === "medium"
                          ? "bg-amber-50 text-amber-600"
                          : "bg-rose-50 text-rose-600"
                    }`}
                  >
                    {question.difficulty}
                  </span>

                  {question.topic && (
                    <span className="px-2.5 py-1 rounded-full bg-[#E8E1D8] text-zinc-600 text-[10px] font-bold uppercase tracking-wider">
                      {question.topic}
                    </span>
                  )}
                </div>
              </div>

              <div>
                {question.redirectUrl && (
                  <a
                    href={question.redirectUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center p-2 rounded-xl bg-[#F3EEE8] hover:bg-[#E8E1D8] border border-[#DDD5CA] transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0"
                    title="Solve on Platform"
                  >
                    {question?.platformImage && !imgError ? (
                      <img
                        src={question.platformImage}
                        alt="Platform"
                        className="w-7 h-7 object-contain group-hover:opacity-90 transition-opacity"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <Code2 className="w-7 h-7 text-gray-600 group-hover:text-yellow-600 transition-colors" />
                    )}
                  </a>
                )}
              </div>
            </div>

            {/* DESCRIPTION TAB */}

            {activeTab === "description" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line font-medium">
                  {question.description}
                </div>

                {question.inputFormat && (
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
                      Input Format
                    </h3>

                    <div className="rounded-xl bg-[#F3EEE8] border border-[#E2DAD0] p-4">
                      <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                        {question.inputFormat}
                      </p>
                    </div>
                  </div>
                )}

                {question.outputFormat && (
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
                      Output Format
                    </h3>

                    <div className="rounded-xl bg-[#F3EEE8] border border-[#E2DAD0] p-4">
                      <p className="text-sm text-zinc-600 leading-relaxed whitespace-pre-line">
                        {question.outputFormat}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* EXAMPLES TAB */}

            {activeTab === "examples" && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {Array.isArray(question.examples) &&
                question.examples.length > 0 ? (
                  question.examples.map((example, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-[#E2DAD0] overflow-hidden shadow-sm"
                    >
                      <div className="bg-[#FAF8F5] px-4 py-3 border-b border-[#E2DAD0] flex items-center">
                        <span className="bg-black text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Example {index + 1}
                        </span>
                      </div>

                      <div className="p-4 bg-[#F3EEE8] border-b border-[#E2DAD0]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                          Input
                        </p>

                        <pre className="text-sm text-zinc-800 font-mono whitespace-pre-wrap">
                          {formatValue(example.input)}
                        </pre>
                      </div>

                      <div className="p-4 bg-[#F3EEE8] border-b border-[#E2DAD0]">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                          Output
                        </p>

                        <pre className="text-sm text-zinc-800 font-mono whitespace-pre-wrap">
                          {formatValue(example.output)}
                        </pre>
                      </div>

                      {example.explanation && (
                        <div className="p-4 bg-[#FAF8F5]">
                          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mb-2">
                            Explanation
                          </p>

                          <p className="text-sm text-zinc-600 leading-relaxed">
                            {example.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500 font-medium">
                    No examples provided.
                  </p>
                )}
              </div>
            )}

            {/* CONSTRAINTS TAB */}

            {activeTab === "constraints" && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-4">
                    Constraints
                  </h3>

                  {Array.isArray(question.constraints) &&
                  question.constraints.length > 0 ? (
                    <div className="space-y-3">
                      {question.constraints.map((constraint, index) => (
                        <div
                          key={index}
                          className="flex gap-3 items-start bg-[#F3EEE8] px-4 py-3 rounded-xl border border-[#E2DAD0]"
                        >
                          <code className="text-sm text-zinc-700 font-mono">
                            {constraint}
                          </code>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-zinc-500">
                      No constraints specified.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#F3EEE8] rounded-xl border border-[#E2DAD0] p-4 text-center">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Time Limit
                    </p>

                    <p className="text-lg font-semibold text-zinc-900 mt-1">
                      {question.timeLimit ?? 2}s
                    </p>
                  </div>

                  <div className="bg-[#F3EEE8] rounded-xl border border-[#E2DAD0] p-4 text-center">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                      Memory Limit
                    </p>

                    <p className="text-lg font-semibold text-zinc-900 mt-1">
                      {question.memoryLimit ?? 256} MB
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "submission" && (
              <div className="space-y-5 animate-in fade-in duration-300">
                {!currentSubmission ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-[#E8E1D8] flex items-center justify-center mb-4">
                      <Send className="w-5 h-5 text-zinc-500" />
                    </div>

                    <h3 className="text-sm font-bold text-zinc-900">
                      No Submission Yet
                    </h3>

                    <p className="text-xs text-zinc-500 mt-2 max-w-xs leading-relaxed">
                      Submit your code to see the execution result, test cases,
                      execution time and submission status.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* ========================= */}

                    {/* SUBMISSION STATUS */}

                    {/* ========================= */}

                    <div
                      className={`rounded-2xl border p-5 ${
                        currentSubmission.success
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-rose-50 border-rose-200"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {currentSubmission.success ? (
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center">
                              <XCircle className="w-5 h-5 text-rose-600" />
                            </div>
                          )}

                          <div>
                            <p
                              className={`text-sm font-bold ${
                                currentSubmission.success
                                  ? "text-emerald-700"
                                  : "text-rose-700"
                              }`}
                            >
                              {currentSubmission.status || "Submission Result"}
                            </p>

                            <p className="text-xs text-zinc-500 mt-1">
                              {currentSubmission.message ||
                                "Code execution completed"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ========================= */}

                    {/* ANALYTICS */}

                    {/* ========================= */}

                    <div>
                      <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
                        Submission Analytics
                      </h3>

                      <div className="grid grid-cols-2 gap-3">
                        {/* Passed Test Cases */}

                        <div className="rounded-xl bg-[#F3EEE8] border border-[#E2DAD0] p-4">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Test Cases
                          </p>

                          <p className="text-xl font-bold text-zinc-900 mt-1">
                            {currentSubmission.passedTestCases ?? 0}

                            <span className="text-sm font-medium text-zinc-400">
                              {" "}
                              / {currentSubmission.totalTestCases ?? 0}
                            </span>
                          </p>

                          <p className="text-[11px] text-zinc-500 mt-1">
                            Passed
                          </p>
                        </div>

                        {/* Execution Time */}

                        <div className="rounded-xl bg-[#F3EEE8] border border-[#E2DAD0] p-4">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Execution Time
                          </p>

                          <p className="text-xl font-bold text-zinc-900 mt-1">
                            {currentSubmission?.executionTime ?? 0}

                            <span className="text-sm font-medium text-zinc-400">
                              {" "}
                              ms
                            </span>
                          </p>

                          <p className="text-[11px] text-zinc-500 mt-1">
                            Runtime
                          </p>
                        </div>

                        {/* Status */}

                        <div className="rounded-xl bg-[#F3EEE8] border border-[#E2DAD0] p-4">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Status
                          </p>

                          <p
                            className={`text-sm font-bold mt-2 ${
                              currentSubmission.success
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {currentSubmission.status || "Unknown"}
                          </p>
                        </div>

                        {/* Success */}

                        <div className="rounded-xl bg-[#F3EEE8] border border-[#E2DAD0] p-4">
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                            Result
                          </p>

                          <p
                            className={`text-sm font-bold mt-2 ${
                              currentSubmission.success
                                ? "text-emerald-600"
                                : "text-rose-600"
                            }`}
                          >
                            {currentSubmission.success ? "Accepted" : "Failed"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ========================= */}

                    {/* SUBMITTED CODE */}

                    {/* ========================= */}

                    {currentSubmission.userCode && (
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
                          Submitted Code
                        </h3>

                        <div className="rounded-xl bg-[#1C1C1E] border border-[#2C2C2E] overflow-hidden">
                          <pre className="p-4 text-xs text-white/80 font-mono overflow-x-auto max-h-64 whitespace-pre-wrap">
                            {currentSubmission.userCode}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* ========================= */}

                    {/* MESSAGE */}

                    {/* ========================= */}

                    {currentSubmission.message && (
                      <div>
                        <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider mb-3">
                          Message
                        </h3>

                        <div className="rounded-xl bg-[#F3EEE8] border border-[#E2DAD0] p-4">
                          <p className="text-sm text-zinc-600 leading-relaxed">
                            {currentSubmission.message}
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* LEFT PANEL FOOTER */}

          <div className="h-16 shrink-0 border-t border-[#D8D0C5] bg-[#F3EEE8]/70 px-5 flex items-center justify-between rounded-b-[20px]">
            <button
              disabled={currentQuestion === 0}
              onClick={handlePrevious}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-zinc-600 hover:bg-[#FAF8F5] hover:shadow-xs disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              disabled={currentQuestion === questions.length - 1}
              onClick={handleNext}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-zinc-600 hover:bg-[#FAF8F5] hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>


        <section className="w-full flex-1 min-h-0 flex flex-col bg-[#1C1C1E] overflow-hidden rounded-2xl ">


          <section className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* EDITOR HEADER */}

            <div className="h-14 shrink-0 bg-[#2C2C2E]/40 border-b border-white/5 flex items-center justify-between px-4 backdrop-blur-md">
              {/* LEFT OPTIONS */}

              <div className="flex items-center gap-3">
                <div className="relative">
                  <select
                    value={language}
                    onChange={(e) => {
                      handleLanguageChange(e.target.value);

                      setTestResult(null);
                    }}
                    className="appearance-none bg-[#3A3A3C] border border-white/10 hover:border-white/20 text-white text-xs font-medium rounded-full pl-4 pr-8 py-1.5 outline-none cursor-pointer transition-all shadow-sm"
                  >
                    {availableLanguages.map((lang) => (
                      <option key={lang} value={lang}>
                        {getLanguageName(lang)}
                      </option>
                    ))}
                  </select>

                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronRight className="w-3 h-3 text-white/50 rotate-90" />
                  </div>
                </div>

                <button
                  onClick={handleResetCode}
                  className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                  title="Reset code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* RIGHT OPTIONS */}

              <div className="flex items-center gap-2">
                <div className="flex items-center justify-center text-white">
                  {isDark ? (
                    <button
                      onClick={mode}
                      className="flex items-center justify-center w-9 h-9 rounded-full



                 bg-white/5 border border-white/10



                 text-white/70



                 hover:bg-white/10 hover:text-white



                 hover:border-white/20



                 transition-all duration-200



                 active:scale-90



                 cursor-pointer"
                      aria-label="Switch to light mode"
                    >
                      <MoonIcon size={18} strokeWidth={2} />
                    </button>
                  ) : (
                    <button
                      onClick={mode}
                      className="flex items-center justify-center w-9 h-9 rounded-full



                 bg-white/5 border border-black/10



                 text-white/90



                 hover:bg-black/60 hover:text-white



                 hover:border-black/20



                 transition-all duration-200



                 active:scale-90



                 cursor-pointer"
                      aria-label="Switch to dark mode"
                    >
                      <Sun size={18} strokeWidth={2} />
                    </button>
                  )}
                </div>

                <button
                  onClick={handleRun}
                  disabled={isRunning || isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold disabled:opacity-50 transition-all shadow-md cursor-pointer"
                >
                  {isRunning ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5" />
                  )}

                  {isRunning ? "Running..." : "Run"}
                </button>

                <button

                
                  onClick={()=>{
                     if (!codeRunned) {
      toast.custom((t) => (
  <div
  className={`flex items-center gap-3 px-4 py-3 rounded-xl
    bg-zinc-950 border border-amber-500/40
    shadow-2xl text-white min-w-90 mr-2
    ${t.visible ? "animate-in fade-in slide-in-from-bottom-3" : ""}`}
>
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-400">
      ⚠
    </div>

    <div>
      <p className="text-sm font-semibold">
        Code not executed
      </p>
      <p className="text-xs text-zinc-400 mt-0.5">
        Run your code before submitting it for evaluation.
      </p>
    </div>
  </div>
), {
  position: "bottom-right",
  duration: 3000,
});

      return;
    }
    handleSubmit();
                  }}
                  disabled={isSubmitting || isRunning}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold disabled:opacity-50 transition-all shadow-md cursor-pointer"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Code className="w-3.5 h-3.5" />
                  )}

                  {isSubmitting ? "Executing..." : "Execute"}
                </button>

                {currentQuestion + 1 === questions.length && (<button
                  onClick={handleTimeOver}
                  disabled={isRunning || isSubmitting || isFinishing}
                  className="flex items-center gap-2 px-6 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold disabled:opacity-50 transition-all shadow-md cursor-pointer"
                >
                  {isFinishing ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}

                  {isFinishing ? "Finishing..." : "Finish"}
                </button>
              )}


                <button
                  onClick={toggleFullscreen}
                  className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                >
                  {isFullscreen ? (
                    <LucideMinimize className="w-4 h-4" />
                  ) : (
                    <LucideMaximize className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex-1 min-h-0 relative">
              <Editor
                height="100%"
                language={getMonacoLanguage(language)}
                value={code}
                onChange={(value) => updateCode(value || "")}
                onMount={handleEditorMount}
                theme={themeMode}
                options={{
                  fontSize: 14,

                  fontFamily:
                    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",

                  lineHeight: 24,

                  minimap: {
                    enabled: false,
                  },

                  automaticLayout: true,

                  wordWrap: "off",

                  scrollBeyondLastLine: false,

                  smoothScrolling: true,

                  cursorBlinking: "smooth",

                  cursorSmoothCaretAnimation: "on",

                  renderWhitespace: "selection",

                  bracketPairColorization: {
                    enabled: true,
                  },

                  tabSize: 4,

                  insertSpaces: true,

                  autoIndent: "full",

                  suggestOnTriggerCharacters: true,

                  quickSuggestions: true,

                  folding: true,

                  lineNumbers: "on",

                  glyphMargin: false,

                  scrollbar: {
                    verticalScrollbarSize: 8,

                    horizontalScrollbarSize: 8,

                    useShadows: false,
                  },

                  overviewRulerBorder: false,

                  hideCursorInOverviewRuler: true,

                  renderLineHighlight: "none",

                  padding: {
                    top: 24,

                    bottom: 24,
                  },
                }}
              />
            </div>
          </section>

          <section
            style={{
              height: `${testPanelHeight}px`,
            }}
            className={`shrink-0 bg-[#1C1C1E] border-t border-white/10 flex flex-col ${
              isDragging ? "select-none" : ""
            } `}
          >
            {/* ================================================ */}

            {/* RESIZE HANDLE                                    */}

            {/* ================================================ */}

            <div
              onMouseDown={startResize}
              className="h-1.5 shrink-0 cursor-row-resize hover:bg-white/20 transition-colors group relative"
            >
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 w-15 h-1 rounded-full bg-white/20 group-hover:bg-white/40 transition-colors" />
            </div>

            <div className="h-12 shrink-0 px-5 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-2">
                  <div className="border border-green-500 p-px rounded-xs">
                    <Terminal className="w-4 h-4 text-green-400  " />
                  </div>

                  <span className="text-sm font-medium text-white">
                    Testcase
                  </span>
                </div>

                {/* RESULT */}

                {testResult && (
                  <>
                    <div className="h-4 w-px bg-white/10" />

                    <div
                      className={`flex items-center gap-2 text-xs font-medium ${
                        testResult.success
                          ? "text-emerald-400"
                          : "text-rose-400"
                      }`}
                    >
                      {testResult.success ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <XCircle className="w-4 h-4" />
                      )}

                      {testResult.status === "Accepted"
                        ? testResult.message
                        : testResult.status}
                    </div>

                    <span className="text-xs text-white/40">
                      {testResult.success
                        ? `${testResult.passedTestCases ?? 0}/${testResult.totalTestCases ?? 0} passed`
                        : `${Math.max(
                            0,

                            (testResult.failedTestCase || 1) - 1,
                          )}/${testResult.totalTestCases ?? question?.testCases?.length ?? 0} passed`}
                    </span>
                  </>
                )}
              </div>

              {/* RIGHT */}
                
              {(!codeSubmitted && !testResult) && (  <div className="text-[14px] font-bold text-red-500/70 animate-pulse">{submissionMessage}</div>)}

              <div className="text-[11px] text-white/30">Drag to resize</div>
            </div>

            {/* ================================================ */}

            {/* TESTCASE CONTENT                                */}

            {/* ================================================ */}

            <div className="flex-1 min-h-0 overflow-y-auto">
              <div className="p-4">
                <div className="space-y-3">
                  {(() => {
                    const sourceTestCases =
                      Array.isArray(testResult?.testCases) &&
                      testResult.testCases.length > 0
                        ? testResult.testCases
                        : question?.testCases || [];

                    const visibleTestCases = sourceTestCases

                      .filter((testCase) => !testCase?.isHidden)

                      .slice(0, 2);

                    return visibleTestCases.map((testCase, idx) => {
                      const result = testResult?.testCases?.find(
                        (item) =>
                          Number(item?.testCaseNumber) ===
                          Number(testCase?.testCaseNumber),
                      );

                      const passed = result?.passed ?? result?.success ?? null;

                      return (
                        <div
                          key={testCase?.testCaseNumber ?? idx}
                          className="rounded-lg border border-white/5 bg-[#242426] overflow-hidden"
                        >
                          {/* TESTCASE TITLE */}

                          <div className="px-4 py-3 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-3">
                              <span className="text-xs font-semibold text-white">
                                Case {idx + 1}
                              </span>

                              {passed === true && (
                                <span className="flex items-center gap-1 text-[11px] text-emerald-400">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  Passed
                                </span>
                              )}

                              {passed === false && (
                                <span className="flex items-center gap-1 text-[11px] text-rose-400">
                                  <XCircle className="w-3.5 h-3.5" />
                                  Failed
                                </span>
                              )}
                            </div>
                          </div>

                          {/* TESTCASE BODY */}

                          <div className="grid grid-cols-3 gap-3 p-3">
                            {/* INPUT */}

                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">
                                Input
                              </div>

                              <pre className="bg-[#1C1C1E] rounded-md p-3 text-xs text-white/70 font-mono overflow-x-auto">
                                {testCase?.input || "—"}
                              </pre>
                            </div>

                            {/* EXPECTED OUTPUT */}

                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">
                                Expected Output
                              </div>

                              <pre className="bg-[#1C1C1E] rounded-md p-3 text-xs text-white/70 font-mono overflow-x-auto">
                                {testCase?.expectedOutput ||
                                  result?.expectedOutput ||
                                  "—"}
                              </pre>
                            </div>

                            {/* ACTUAL OUTPUT */}

                            <div>
                              <div className="text-[10px] uppercase tracking-wider text-white/30 mb-2">
                                Output
                              </div>

                              {isRunning || isSubmitting ? (
                                <div className="bg-[#1C1C1E] rounded-md p-3 h-11 animate-pulse">
                                  <div className="h-3 w-3/4 bg-white/10 rounded" />
                                </div>
                              ) : (
                                <pre
                                  className={`bg-[#1C1C1E] rounded-md p-3 text-xs font-mono overflow-x-auto ${
                                    passed === true
                                      ? "text-emerald-400"
                                      : passed === false
                                        ? "text-rose-400"
                                        : "text-white/50"
                                  }`}
                                >
                                  {result?.actualOutput ??
                                    result?.output ??
                                    "Run your code to see output"}
                                </pre>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            </div>
          </section>
        </section>
      </main>
    </div>
  );
};

export default StartCodingInterview;
