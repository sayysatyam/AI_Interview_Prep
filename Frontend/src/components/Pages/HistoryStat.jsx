import React, { useEffect } from "react";
import { AIuseStore } from "../../AuthStore/AIStore";
import { useParams, useNavigate } from "react-router-dom";

const HistoryStat = () => {
  const { getHisByTitle, getTitleHistory, isLoading } = AIuseStore();
  const { hisId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (hisId) {
      getHisByTitle(hisId);
    }
  }, [hisId, getHisByTitle]);
    console.log(getTitleHistory);
  const history = getTitleHistory?.interviewDetails || [];

  // Calculate session metrics safely
  const totalQuestions = history.length;
  
  const scores = history
    .map((item) => item?.evaluation?.rating ?? item?.evaluation?.score)
    .filter((score) => typeof score === "number" && !isNaN(score));

  const averageScore = scores.length > 0
    ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(0)
    : (getTitleHistory?.average) || "N/A";

  const answeredCount = history.filter(
    (item) => item?.evaluation?.userAnswer || item?.userAnswer
  ).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F0EBE3] flex items-center justify-center">
        <div className="text-slate-700 font-bold text-lg animate-pulse">
          Loading Interview Analysis...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0EBE3] py-10 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="w-full mx-auto space-y-6 max-w-[90%]">
        
        {/* Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm hover:bg-slate-50 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to History
          </button>

          <div className="flex items-center gap-2 flex-wrap">
            {getTitleHistory?.mode && (
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-full shadow-sm">
                {getTitleHistory.mode}
              </span>
            )}
            <span
              className={`text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-full border shadow-sm ${
                getTitleHistory?.status?.toLowerCase() === "completed"
                  ? "text-emerald-700 bg-emerald-100 border-emerald-300"
                  : "text-amber-700 bg-amber-100 border-amber-300"
              }`}
            >
              {getTitleHistory?.status || "In Progress"}
            </span>
          </div>
        </div>

        {/* Top Session Summary Header */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-bold text-amber-400">
                Detailed Session Report
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {getTitleHistory?.role || "Interview Evaluation"}
              </h1>
              <p className="text-sm text-slate-300">
                Experience Level: <span className="font-semibold text-white">{getTitleHistory?.experience || "N/A"}</span>
              </p>
            </div>
            
            <div className="text-right sm:text-right">
              <span className="text-xs text-slate-400 block font-medium">Session Date</span>
              <span className="text-xs font-semibold text-slate-200">
                {formatDate(getTitleHistory?.createdAt)}
              </span>
            </div>
          </div>

          {/* Metric Tiles Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium block">Average Score</span>
              <span className="text-xl font-extrabold text-amber-400">
                {averageScore} {averageScore !== "N/A" && <span className="text-zinc-400 text-xs">/ 100</span>} 
              </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium block">Total Questions</span>
              <span className="text-xl font-extrabold text-white">{totalQuestions}</span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium block">Questions Answered</span>
              <span className="text-xl font-extrabold text-emerald-400">{answeredCount} <span className="text-xs text-gray-400"> / {totalQuestions}</span> </span>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-400 font-medium block">Completion Status</span>
              <span className="text-sm font-bold text-slate-200 capitalize mt-1 block">
                {getTitleHistory?.status || "Pending"}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Questions & Detail Cards */}
        <div className=" overflow-y-auto space-y-6 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {(!history || history.length === 0) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-800">No questions found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                There are no questions recorded for this interview attempt.
              </p>
            </div>
          )}

          {history?.map((val, idx) => {
            const evalData = val?.evaluation || {};
            const questionText = val?.question;
            const userAnswer = evalData?.userAnswer || val?.userAnswer;
            const feedback = evalData?.feedback || val?.feedback;
            const idealAnswer = evalData?.idealAnswer || evalData?.expectedAnswer;
            const rating = (evalData?.rating) ?? evalData?.score;
            const strengths = evalData?.strengths || evalData?.pros;
            const improvements = evalData?.improvements || evalData?.cons || evalData?.areasForImprovement;

            return (
              <div
                key={val?._id || idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 sm:p-8 space-y-5 hover:shadow-md transition-shadow duration-200"
              >
                {/* Question Header & Individual Score Badge */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <span className="p-2 bg-amber-700 text-white h-8 w-8 min-w-[2rem] flex items-center justify-center rounded-lg font-bold text-sm shadow-sm">
                      {idx + 1}
                    </span>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug pt-0.5">
                      {questionText}
                    </h2>
                  </div>

                  {rating !== undefined && rating !== null && (
                    <div className="flex flex-col items-center shrink-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Rating</span>
                      <span className="px-3 py-1 bg-amber-50 border border-amber-200 rounded-lg text-sm font-black text-amber-800 mt-1">
                        {rating / 10} / 10
                      </span>
                    </div>
                  )}
                </div>

                {/* Question Details Grid */}
                <div className="space-y-3 pt-2 border-t border-slate-100">
                  
                  {/* User Answer */}
                  {userAnswer ? (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                          Your Submitted Answer
                        </span>
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed font-normal whitespace-pre-line">
                        {userAnswer}
                      </p>
                    </div>
                  ) : (
                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 text-xs text-slate-400 italic">
                      No response recorded for this question.
                    </div>
                  )}

                  {/* AI Feedback */}
                  {feedback && (
                    <div className="bg-indigo-50/60 rounded-xl p-4 border border-indigo-100 space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">
                        AI Analysis & Feedback
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {feedback}
                      </p>
                    </div>
                  )}

                  {/* Ideal / Sample Answer */}
                  {idealAnswer && (
                    <div className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 space-y-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                        Suggested / Ideal Answer
                      </span>
                      <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                        {idealAnswer}
                      </p>
                    </div>
                  )}

                  {/* Strengths & Improvements Side-by-Side (If Available) */}
                  {(strengths || improvements) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      {strengths && (
                        <div className="bg-emerald-50/30 p-3.5 rounded-xl border border-emerald-100 space-y-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                            Key Strengths
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {Array.isArray(strengths) ? strengths.join(", ") : strengths}
                          </p>
                        </div>
                      )}

                      {improvements && (
                        <div className="bg-rose-50/30 p-3.5 rounded-xl border border-rose-100 space-y-1">
                          <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                            Areas for Improvement
                          </span>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {Array.isArray(improvements) ? improvements.join(", ") : improvements}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default HistoryStat;