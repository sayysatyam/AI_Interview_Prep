import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Settings,
  Pause,
  Lightbulb,
  SkipForward,
  Loader,
  ChevronRight,
} from "lucide-react";
import maleAiVideo from "../../assets/AiCapabilites Images/male-ai.mp4";
import { AIuseStore } from "../../AuthStore/AIStore";
import { useNavigate } from "react-router-dom";

const Interview = () => {
  const navigate = useNavigate();
  const hasSubmitted = useRef(false);

  const {
    questionSet,
    error,
    interviewId,
    evaluateAnswer,
    isLoading,
    calculate,
  } = AIuseStore();

  useEffect(() => {
    console.log("Question :", questionSet);
  }, [questionSet]);

  useEffect(() => {
    if (!questionSet || questionSet.length === 0) {
      navigate("/startInterview");
    }
  }, [questionSet, navigate]);

  useEffect(() => {
    console.log("error :", error);
  }, [error]);

  useEffect(() => {
    console.log("Id :", interviewId);
  }, [interviewId]);

  const [currentQ, setCurrentQ] = useState(0);

  // No localStorage/sessionStorage
  const [answer, setAnswer] = useState("");

  const [isMicOn, setIsMicOn] = useState(false);

  const videoRef = useRef(null);
  const recognitionRef = useRef(null);

  const q = questionSet?.[currentQ];

  const [seconds, setSeconds] = useState(q?.timeLimit || 0);
  const [EvaluateData, setEvaluateData] = useState("");
  const [Feedback, setFeedback] = useState("");
  const [isSubmitting, setisSubmitting] = useState(false);

  useEffect(() => {
    setSeconds(q?.timeLimit || 0);
  }, [currentQ, q?.timeLimit]);

  const handleNext = async (
    interviewId,
    userAnswer,
    qIndex,
    timeTaken
  ) => {
    if (isSubmitting) return;

    try {
      setisSubmitting(true);

      const result = await evaluateAnswer(
        interviewId,
        userAnswer,
        qIndex,
        timeTaken
      );

      setEvaluateData(result);

      const feedbackText =
        result?.feedback || "Answer evaluated successfully";

      setFeedback(feedbackText);

      setTimeout(async () => {
        setFeedback("");

        if (currentQ === questionSet?.length - 1) {
          const finalResult = await calculate(interviewId);

          console.log("Final Result :", finalResult);

          setisSubmitting(false);

          if (finalResult) {
            navigate("/evaluation", {
              replace: true,
            });
          }

          return;
        }

        // NEXT QUESTION
        setCurrentQ((prev) => prev + 1);
        setAnswer("");
        setisSubmitting(false);
      }, 3000);
    } catch (error) {
      setisSubmitting(false);
      console.log(error);
    }
  };

  useEffect(() => {
    if (seconds === 0 && !hasSubmitted.current) {
      hasSubmitted.current = true;

      handleNext(
        interviewId,
        answer,
        currentQ,
        q?.timeLimit - seconds
      );

      return;
    }

    const timer = setInterval(() => {
      if (isSubmitting) return;

      setSeconds((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds, isSubmitting]);

  useEffect(() => {
    hasSubmitted.current = false;
  }, [currentQ]);

  useEffect(() => {
    setFeedback("");
  }, [currentQ]);

  const TOTAL = q?.timeLimit || 1;

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;

  const pct = (seconds / TOTAL) * 100;

  const timerColor =
    seconds < 30
      ? "text-red-500"
      : seconds < 60
        ? "text-yellow-500"
        : "text-emerald-600";

  const ringStroke =
    seconds < 30
      ? "#ef4444"
      : seconds < 60
        ? "#eab308"
        : "#059669";

  const circ = 2 * Math.PI * 36;
  const offset = circ - (pct / 100) * circ;

  const difficultyConfig = {
    easy: {
      pill: "bg-emerald-100 text-emerald-700 border border-emerald-200",
      dot: "bg-emerald-500",
    },
    medium: {
      pill: "bg-yellow-100 text-yellow-700 border border-yellow-200",
      dot: "bg-yellow-500",
    },
    hard: {
      pill: "bg-red-100 text-red-600 border border-red-200",
      dot: "bg-red-500",
    },
  };

  const currentDifficulty =
    difficultyConfig[q?.difficulty?.toLowerCase()] ||
    difficultyConfig.easy;

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event) => {
      let transcript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        transcript += event.results[i][0].transcript;
      }

      setAnswer(transcript.slice(0, 1000));
    };

    recognition.onend = () => {
      setIsMicOn(false);
    };

    recognitionRef.current = recognition;
  }, []);

  const handleMic = () => {
    if (!recognitionRef.current) return;

    if (isMicOn) {
      recognitionRef.current.stop();
      setIsMicOn(false);
    } else {
      recognitionRef.current.start();
      setIsMicOn(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center-safe justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

        body {
          font-family: 'DM Sans', sans-serif;
        }

        @keyframes wavebar {
          0%, 100% {
            transform: scaleY(0.35);
            opacity: 0.35;
          }

          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }

        @keyframes softpulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }

          50% {
            opacity: 1;
            transform: scale(1.06);
          }
        }

        @keyframes blinkdot {
          0%, 100% {
            opacity: 1;
          }

          50% {
            opacity: 0.2;
          }
        }

        .wave span {
          display: inline-block;
          width: 3px;
          border-radius: 2px;
          background: #059669;
          animation: wavebar 1.2s ease-in-out infinite;
        }

        .wave span:nth-child(1) {
          height: 8px;
          animation-delay: 0s;
        }

        .wave span:nth-child(2) {
          height: 18px;
          animation-delay: 0.12s;
        }

        .wave span:nth-child(3) {
          height: 26px;
          animation-delay: 0.24s;
        }

        .wave span:nth-child(4) {
          height: 14px;
          animation-delay: 0.36s;
        }

        .wave span:nth-child(5) {
          height: 22px;
          animation-delay: 0.48s;
        }

        .wave span:nth-child(6) {
          height: 10px;
          animation-delay: 0.60s;
        }

        .wave span:nth-child(7) {
          height: 18px;
          animation-delay: 0.72s;
        }

        .wave span:nth-child(8) {
          height: 7px;
          animation-delay: 0.84s;
        }

        .glow-ring {
          animation: softpulse 2.8s ease-in-out infinite;
        }

        .live-dot {
          animation: blinkdot 0.9s ease-in-out infinite;
        }

        .speak-dot {
          animation: blinkdot 1.2s ease-in-out infinite;
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-[90%] bg-white rounded-xl shadow-xl shadow-gray-200/80 border border-gray-100 overflow-hidden grid grid-cols-[320px_1fr]"
      >
        {/* LEFT PANEL */}
        <div className="bg-gray-50 border-r border-gray-100 flex flex-col gap-4 p-5">

          {/* Video Card */}
          <div className="rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm relative">
            <video
              ref={videoRef}
              src={maleAiVideo}
              autoPlay
              loop
              muted
              className="w-full h-52 object-cover"
            />

            {/* Speaking badge */}
            <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm border border-gray-100">
              <span className="speak-dot w-2 h-2 rounded-full bg-emerald-500 inline-block" />

              <span className="text-[11px] font-bold text-emerald-700 tracking-wide uppercase">
                AI Speaking
              </span>
            </div>

            {/* Waveform */}
            <div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-white/95 to-transparent pt-8 pb-3 flex justify-center">
              <div className="wave flex items-end gap-0.75">
                {[...Array(8)].map((_, i) => (
                  <span key={i} />
                ))}
              </div>
            </div>
          </div>

          {/* AI Info Row */}
          <div className="flex items-center gap-3 px-1">
            <div className="w-9 h-9 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center glow-ring shrink-0">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#059669"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
              </svg>
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                Aria — AI Interviewer
              </p>

              <p className="text-xs text-gray-400">
                Powered by Smart AI
              </p>
            </div>

            <div className="ml-auto flex items-center gap-1.5 bg-red-50 border border-red-200 rounded-full px-2.5 py-1">
              <span className="live-dot w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />

              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider">
                Live
              </span>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Timer + Status Card */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-4">
            <div className="flex items-center gap-4">

              {/* Ring Timer */}
              <div className="relative w-22 h-22 shrink-0">
                <svg
                  className="-rotate-90"
                  width="88"
                  height="88"
                  viewBox="0 0 88 88"
                >
                  <circle
                    cx="44"
                    cy="44"
                    r="36"
                    fill="none"
                    stroke="#f3f4f6"
                    strokeWidth="7"
                  />

                  <circle
                    cx="44"
                    cy="44"
                    r="36"
                    fill="none"
                    stroke={ringStroke}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    strokeDashoffset={offset}
                    style={{
                      transition:
                        "stroke-dashoffset 1s ease, stroke 0.5s ease",
                    }}
                  />
                </svg>

                <div
                  className={`absolute inset-0 flex flex-col items-center justify-center ${timerColor}`}
                >
                  <span className="text-lg font-bold leading-none">
                    {timeStr}
                  </span>

                  <span className="text-[9px] text-gray-400 uppercase tracking-wider mt-0.5">
                    left
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 flex-1">
                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-0.5">
                    Question
                  </p>

                  <p className="text-2xl font-bold text-gray-800 leading-none">
                    {currentQ + 1}

                    <span className="text-sm font-normal text-gray-400">
                      {" "}
                      / {questionSet?.length}
                    </span>
                  </p>
                </div>

                <div>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold mb-1.5">
                    Progress
                  </p>

                  <div className="flex gap-1">
                    {questionSet?.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                          i < currentQ
                            ? "bg-emerald-500"
                            : i === currentQ
                              ? "bg-yellow-400"
                              : "bg-gray-200"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="h-px bg-gray-100" />

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                <p className="text-[10px] text-emerald-600 uppercase tracking-wider font-bold">
                  Answered
                </p>

                <p className="text-2xl font-bold text-emerald-700 mt-0.5">
                  {currentQ}
                </p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
                <p className="text-[10px] text-yellow-600 uppercase tracking-wider font-bold">
                  Remaining
                </p>

                <p className="text-2xl font-bold text-yellow-700 mt-0.5">
                  {questionSet?.length - currentQ}
                </p>
              </div>
            </div>
          </div>

          {/* Tip Card */}
          <div className="bg-linear-to-br from-emerald-50 to-yellow-50 rounded-2xl border border-emerald-100 p-4 flex gap-3">
            <div className="w-8 h-8 rounded-xl bg-yellow-100 border border-yellow-200 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb size={15} className="text-yellow-600" />
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-semibold text-emerald-700">
                Pro tip:{" "}
              </span>

              Use the{" "}
              <span className="font-semibold text-gray-700">
                STAR method
              </span>{" "}
              — Situation, Task, Action, Result — for behavioral answers.
            </p>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="flex flex-col gap-5 p-6 bg-white">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 leading-tight">
                AI Smart{" "}
                <span className="text-emerald-600">
                  Interview
                </span>
              </h1>

              <p className="text-sm text-gray-400 mt-0.5">
                Practice confidently with AI feedback
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2">
                <span className="speak-dot w-2 h-2 rounded-full bg-emerald-500 inline-block" />

                <span className="text-xs font-semibold text-emerald-700">
                  Session Active
                </span>
              </div>

              <button className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                <Settings size={16} />
              </button>

              <button className="w-9 h-9 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-all">
                <Pause size={16} />
              </button>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Question Card */}
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="relative bg-linear-to-br from-gray-50 to-white rounded-2xl border border-gray-200 p-5 overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <span className="text-xs font-bold text-gray-400 tracking-wider uppercase">
                Q{currentQ + 1} of {questionSet?.length}
              </span>

              <div className="w-px h-3 bg-gray-200" />

              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5 ${currentDifficulty?.pill}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${currentDifficulty?.dot}`}
                />

                {q?.difficulty}
              </span>

              <span className="ml-auto text-[10px] text-gray-400 bg-gray-100 border border-gray-200 px-2.5 py-1 rounded-full font-medium uppercase">
                {q?.category}
              </span>
            </div>

            <p className="text-lg font-semibold text-gray-800 leading-relaxed">
              {q?.question}
            </p>
          </motion.div>

          {/* Answer Area */}
          <div className="flex-1 flex flex-col rounded-2xl border border-gray-200 overflow-hidden bg-white shadow-sm">
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50/70">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Your Answer
              </span>

              <span className="text-xs text-gray-400">
                <span
                  className={`font-semibold ${
                    answer.length > 900
                      ? "text-red-500"
                      : "text-gray-700"
                  }`}
                >
                  {answer.length}
                </span>{" "}
                / 1000
              </span>
            </div>

            <textarea
              disabled={isSubmitting}
              value={answer}
              onChange={(e) =>
                setAnswer(e.target.value.slice(0, 1000))
              }
              placeholder="Start typing your answer here, or press the mic to speak..."
              className="flex-1 resize-none p-5 text-gray-700 placeholder:text-gray-300 text-[15px] leading-relaxed outline-none focus:ring-0 border-0 min-h-55 bg-white"
            />

            {Feedback && (
              <motion.div
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full bg-emerald-50/50 border border-emerald-100 p-5 rounded-t-2xl relative overflow-hidden"
              >
                {/* Decorative vertical accent */}
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Lightbulb
                      size={14}
                      className="text-emerald-600"
                    />
                  </div>

                  <div>
                    <h4 className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1">
                      AI Feedback
                    </h4>

                    <p className="text-gray-700 text-sm leading-relaxed font-medium">
                      {Feedback}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Footer */}
            <div className="flex items-center gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50/50">
              <button
                onClick={() => {
                  handleMic();
                }}
                className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all border ${
                  isMicOn
                    ? "bg-emerald-500 border-emerald-600 text-white shadow-md shadow-emerald-200"
                    : "bg-white border-gray-200 text-gray-400 hover:border-emerald-300 hover:text-emerald-500"
                }`}
              >
                <Mic size={18} />
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => {
                  setFeedback("");

                  handleNext(
                    interviewId,
                    "",
                    currentQ,
                    q?.timeLimit - seconds
                  );
                }}
                className="h-11 px-5 rounded-xl border border-gray-200 bg-gray-50/50 text-gray-500 text-sm font-semibold hover:bg-white hover:border-gray-300 hover:text-gray-700 hover:shadow-sm transition-all flex items-center gap-2 group"
              >
                <SkipForward
                  size={15}
                  className="group-hover:translate-x-0.5 transition-transform"
                />

                Skip
              </button>

              <button
                disabled={isSubmitting}
                onClick={() => {
                  setFeedback("");

                  handleNext(
                    interviewId,
                    answer,
                    currentQ,
                    q?.timeLimit - seconds
                  );
                }}
                className="flex-1 h-11 rounded-xl bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-100 hover:shadow-emerald-200 hover:-translate-y-px active:translate-y-0"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-8 h-8 animate-spin mx-auto transition-normal" />
                  </>
                ) : (
                  <>
                    {currentQ === questionSet?.length - 1
                      ? "Finish Interview"
                      : "Submit Answer"}

                    <ChevronRight size={16} />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bottom hint */}
          <div className="flex items-center justify-between text-xs text-gray-300">
            <span>
              Press{" "}
              <kbd className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px] font-mono border border-gray-200">
                Tab
              </kbd>{" "}
              to jump to answer box
            </span>

            <span>Answer is auto-saved</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Interview;



