/* eslint-disable react-hooks/set-state-in-effect */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import Editor from "@monaco-editor/react";
import {
  Play,
  Send,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock3,
  Code2,
  Maximize2,
  Minimize2,
  RotateCcw,
  Terminal,
  Loader2,
  XCircle,
} from "lucide-react";
import { codeAIStore } from "../../../AuthStore/codeAI";

const StartCodingInterview = () => {
  const { codeQuesbyID, isLoadingCodingQuestion, codeQuestionData, error } =
    codeAIStore();
  const { id } = useParams();
  const editorRef = useRef(null);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [language, setLanguage] = useState("cpp");
  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [testResult, setTestResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [imgError, setImgError] = useState(false);

  // =========================================================
  // FETCH CODING ROUND
  // =========================================================
  useEffect(() => {
    if (!id) return;
    codeQuesbyID(id);
  }, [id, codeQuesbyID]);

  const questions = useMemo(() => {
    if (!codeQuestionData || !Array.isArray(codeQuestionData.codingDetails)) {
      return [];
    }
    return codeQuestionData.codingDetails;
  }, [codeQuestionData]);

  const question = questions[currentQuestion];

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
      setLanguage(availableLanguages[0]);
    }
  }, [availableLanguages, language]);

  // =========================================================
  // TIMER
  // =========================================================
  useEffect(() => {
    if (!codeQuestionData?.startedAt || questions.length === 0) return;

    const totalMinutes = questions.reduce((total, item) => {
      const limit = Number(item?.timeLimit);
      return !Number.isFinite(limit) ? total : total + limit;
    }, 0);

    if (totalMinutes <= 0) {
      setTimeLeft(null);
      return;
    }

    const startTime = new Date(codeQuestionData.startedAt).getTime();
    if (Number.isNaN(startTime)) return;

    const endTime = startTime + totalMinutes * 60 * 1000;

    const updateTimer = () => {
      const remaining = Math.max(0, endTime - Date.now());
      setTimeLeft(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [codeQuestionData?.startedAt, questions]);

  const formattedTime = useMemo(() => {
    if (timeLeft === null) return "--:--";

    const totalSeconds = Math.floor(timeLeft / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }, [timeLeft]);

  const timerIsLow =
    timeLeft !== null && timeLeft <= 5 * 60 * 1000;

  // =========================================================
  // LOAD QUESTION CODE
  // =========================================================
  useEffect(() => {
    if (!question) return;

    const savedCode =
      typeof question.userCode === "string" &&
      question.userCode.trim() !== ""
        ? question.userCode
        : question.starterCode?.[language] || "";

    setCode(savedCode);
    setTestResult(null);
    setActiveTab("description");
  }, [question, language]);

  // =========================================================
  // MONACO EDITOR MOUNT
  // =========================================================
  const handleEditorMount = (editor) => {
    editorRef.current = editor;
    editor.focus();

    editor.addCommand(2048 | 3, () => {
      handleRun();
    });
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
    setCode(question?.starterCode?.[language] || "");
    setTestResult(null);

    requestAnimationFrame(() =>
      editorRef.current?.focus()
    );
  };

  const handleQuestionChange = (index) => {
    setCurrentQuestion(index);
    setTestResult(null);
    setActiveTab("description");
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
      setTestResult(null);
      setActiveTab("description");
    }
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setTestResult(null);
      setActiveTab("description");
    }
  };

  const handleSubmit = () => {
    if (!question || isRunning) return;

    setIsRunning(true);
    setTestResult(null);

    setTimeout(() => {
      setIsRunning(false);

      setTestResult({
        success: true,
        passed: 0,
        total: question?.testCases?.length || 0,
        message: "Submission API is not connected yet.",
      });
    }, 1200);
  };

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);

    requestAnimationFrame(() => {
      editorRef.current?.layout();
      editorRef.current?.focus();
    });
  };

  // =========================================================
  // RENDER HELPERS
  // =========================================================
  if (isLoadingCodingQuestion) {
    return (
      <div className="min-h-screen bg-[#F0EBE3] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-[#FAF8F5]/80 p-8 rounded-[24px] backdrop-blur-xl shadow-sm border border-[#D8D0C5]">
          <Loader2 className="w-8 h-8 animate-spin text-zinc-800" />

          <p className="text-sm font-medium text-zinc-500">
            Preparing workspace...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0EBE3] flex items-center justify-center px-5">
        <div className="max-w-md w-full bg-[#FAF8F5] border border-[#D8D0C5] rounded-[24px] p-8 text-center shadow-sm">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle className="w-6 h-6 text-red-500" />
          </div>

          <h2 className="text-lg font-semibold text-zinc-900 tracking-tight">
            Unable to load session
          </h2>

          <p className="text-sm text-zinc-500 mt-2 leading-relaxed">
            {error}
          </p>
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

  const panelRadius = isFullscreen
    ? "rounded-none"
    : "rounded-[20px]";

  // =========================================================
  // MAIN UI
  // =========================================================
  return (
    <div
      className={`overflow-hidden font-sans transition-all duration-300 ${containerLayout}`}
    >
      {/* ================================================= */}
      {/* GLOBAL HEADER */}
      {/* ================================================= */}

      {!isFullscreen && (
        <header className="h-16 shrink-0 bg-[#FAF8F5]/80 backdrop-blur-xl border border-[#D8D0C5] shadow-sm rounded-2xl flex items-center justify-between px-5 z-10 relative">
          <div className="flex items-center gap-4">
            <div className="flex gap-3">
              <Code2 className="h-6 w-6" />

              <p className="font-bold tracking-wide">
                Coding Assessment
              </p>
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

          <div className="flex items-center gap-4">
            {timeLeft !== null && (
              <div
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
                  timerIsLow
                    ? "bg-red-50 text-red-600"
                    : "bg-[#E8E1D8] text-zinc-600"
                }`}
              >
                <Clock3 className="w-3.5 h-3.5" />

                {formattedTime}
              </div>
            )}
          </div>
        </header>
      )}

      {/* ================================================= */}
      {/* MAIN CONTENT AREA */}
      {/* ================================================= */}

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
                  key={item?._id || index}
                  onClick={() => handleQuestionChange(index)}
                  className={`flex-1 min-w-[60px] px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
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
            ].map((tab) => (
              <button
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
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-black rounded-t-full" />
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
                      {question.constraints.map(
                        (constraint, index) => (
                          <div
                            key={index}
                            className="flex gap-3 items-start bg-[#F3EEE8] px-4 py-3 rounded-xl border border-[#E2DAD0]"
                          >
                            <code className="text-sm text-zinc-700 font-mono">
                              {constraint}
                            </code>
                          </div>
                        )
                      )}
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
          </div>

          {/* LEFT PANEL FOOTER */}

          <div className="h-16 shrink-0 border-t border-[#D8D0C5] bg-[#F3EEE8]/70 px-5 flex items-center justify-between rounded-b-[20px]">
            <button
              disabled={currentQuestion === 0}
              onClick={handlePrevious}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-zinc-600 hover:bg-[#FAF8F5] hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <button
              disabled={currentQuestion === questions.length - 1}
              onClick={handleNext}
              className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-zinc-600 hover:bg-[#FAF8F5] hover:shadow-sm disabled:opacity-40 disabled:hover:bg-transparent transition-all"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* ================================================= */}
        {/* RIGHT CODE PANEL */}
        {/* ================================================= */}

        <section
          className={`flex-1 min-w-0 bg-[#1C1C1E] flex flex-col min-h-0 border border-black/10 shadow-lg overflow-hidden ${panelRadius}`}
        >
          {/* EDITOR HEADER */}

          <div className="h-14 shrink-0 bg-[#2C2C2E]/40 border-b border-white/5 flex items-center justify-between px-4 backdrop-blur-md">
            {/* LEFT OPTIONS */}

            <div className="flex items-center gap-3">
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => {
                    setLanguage(e.target.value);
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
              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-all"
                title={
                  isFullscreen
                    ? "Exit fullscreen"
                    : "Fullscreen editor"
                }
              >
                {isFullscreen ? (
                  <Minimize2 className="w-4 h-4" />
                ) : (
                  <Maximize2 className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* MONACO EDITOR */}

          <div className="flex-1 min-h-0 relative">
            <Editor
              height="100%"
              language={getMonacoLanguage(language)}
              value={code}
              onChange={(value) => setCode(value || "")}
              onMount={handleEditorMount}
              theme="vs-dark"
              options={{
                fontSize: 14,
                fontFamily:
                  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                lineHeight: 24,
                minimap: { enabled: false },
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

          {/* TEST RESULT OVERLAY */}

          {testResult && (
            <div className="shrink-0 bg-[#2C2C2E] border-t border-white/5 p-4 animate-in slide-in-from-bottom-4 duration-300">
              <div className="flex items-center gap-4">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                    testResult.success
                      ? "bg-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/20 text-rose-400"
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <XCircle className="w-5 h-5" />
                  )}
                </div>

                <div>
                  <h4 className="text-sm font-semibold text-white tracking-tight">
                    {testResult.message}
                  </h4>

                  <p className="text-xs text-white/50 mt-0.5 font-medium">
                    {testResult.passed} / {testResult.total} test
                    cases passed
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ACTION FOOTER */}

          <div className="h-16 shrink-0 bg-[#1C1C1E] border-t border-white/5 px-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Terminal className="w-4 h-4 text-white/30" />

              <span className="text-xs font-medium text-white/30">
                Console
              </span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={handleSubmit}
                disabled={isRunning}
                className="flex items-center gap-2 px-6 py-2 rounded-full bg-white hover:bg-zinc-200 text-black text-xs font-bold disabled:opacity-50 transition-all shadow-md"
              >
                {isRunning ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}

                Submit
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default StartCodingInterview;