import React, { useEffect } from "react";
import { AIuseStore } from "../../AuthStore/AIStore";
import { useNavigate } from "react-router-dom";

const History = () => {
  const { getHistory, historyDetails } = AIuseStore();
  const navigate = useNavigate();

  useEffect(() => {
    getHistory();
  }, [getHistory]);
  console.log(historyDetails);

  const getDifficultyBadge = (difficulty = "medium") => {
    const diff = difficulty.toLowerCase();
    if (diff === "easy") return "bg-emerald-500/10 text-emerald-300 border-emerald-200";
    if (diff === "hard") return "bg-rose-500/10 text-rose-600 border-rose-200";
    return "bg-amber-500/10 text-amber-700 border-amber-200";
  };

  return (
    <div className="min-h-screen bg-[#F0EBE3] py-12 px-4 sm:px-6 lg:px-8 font-sans antialiased">
      <div className="w-full mx-auto space-y-8">
        
        {/* Page Title */}
        <div className="text-center space-y-3 py-4">
          <div className="inline-block px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-xs font-semibold text-green-600 uppercase tracking-wider mb-1">
            Overview
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Interview History
          </h1>
          <p className="text-base text-slate-600 max-w-md mx-auto leading-relaxed">
            Review your past mock sessions, AI evaluations, and targeted feedback.
          </p>
        </div>

        {/* Scrollable Container if content exceeds max-height */}
        <div className="max-h-[75vh] overflow-y-auto space-y-6 pr-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          
          {/* Empty State Fallback */}
          {(!historyDetails || historyDetails.length === 0) && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 font-bold text-lg">
                ?
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No interview history found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Complete your first interview session to start tracking your performance and AI scores.
              </p>
            </div>
          )}

          {/* Interview Cards */}
          {historyDetails?.map((history, index) => {
            const firstDetail = history.interviewDetails?.[0];
            const difficulty = firstDetail?.difficulty || "medium";

            return (
              <div
                key={index}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
              >
                {/* Header */}
                <div
                  onClick={() => navigate(`/historyStats/${history?._id}`)}
                  className="group bg-slate-900 text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 cursor-pointer relative overflow-hidden"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h1 className="p-2 bg-amber-700 h-8 w-8 flex items-center justify-center rounded font-bold">
                        {index + 1}
                      </h1>
                      <h2 className="text-2xl font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                        {history.role}
                      </h2>
                      <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md bg-white/10 text-slate-300">
                        {history.mode}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                      {history.experience}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getDifficultyBadge(
                        difficulty
                      )}`}
                    >
                      {difficulty}
                    </span>
                    
                    {/* Hover Arrow Indicator */}
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200 ml-2">
                      <span>View Stats</span>
                      <svg
                        className="w-4 h-4 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Questions List */}

              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default History;