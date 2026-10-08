/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Clock,
  Code2,
  ChevronRight,
  Trophy,
  FileCode2,
  CalendarDays,
  ChevronLeft,
} from "lucide-react";


import { codeAIStore } from "../../../AuthStore/codeAI";
const CodeHistory = () => {
  const navigate = useNavigate();

  const { getCodingHistory, codeHistory, isLoadingHistory } = codeAIStore();
const [searchParams, setSearchParams] = useSearchParams();
const page = Number(searchParams.get("page")) || 1;
const limit = Number(searchParams.get("limit")) || 10;
const mode = "code";
  useEffect(() => {
    getCodingHistory(page, limit);
  }, [getCodingHistory, page, limit]);

  const history = Array.isArray(codeHistory) ? codeHistory : [];
  console.log(history);

  const getDifficultyStyle = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case "easy":
        return "bg-green-500/10 text-green-400 border-green-500/20";

      case "medium":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";

      case "hard":
        return "bg-red-500/10 text-red-400 border-red-500/20";

      case "mixed":
        return "bg-gray-500/10 text-gray-400 border-purple-500/20";

      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
        return "text-green-400 bg-green-500/10 border-green-500/20";

      case "in progress":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";

      case "not started":
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";

      default:
        return "text-gray-400 bg-gray-500/10 border-gray-500/20";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (isLoadingHistory) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 w-56 bg-gray-800 rounded mb-3" />
            <div className="h-4 w-80 bg-gray-800 rounded mb-8" />

            <div className="grid gap-5">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-44 bg-[#111827] border border-gray-800 rounded-2xl"
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4" >
      <div className="flex flex-col items-center justify-center text-center  relative mb-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4 rounded-full bg-indigo-50 border border-indigo-100 text-xs font-bold text-green-600 uppercase tracking-widest shadow-sm">
          <Code2 className="w-3.5 h-3.5" />
          <span>Overview</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Coding History
        </h1>

        <p className="mt-3 text-sm sm:text-base text-slate-500 max-w-xl leading-relaxed">
          Track your previous coding interviews, AI evaluations, and performance
          over time.
        </p>
      </div>
      <div className="flex items-center justify-end gap-2 mr-5 mb-5">

              <span className="text-sm text-slate-500">
                Show
              </span>

              <select
  value={limit}
   onChange={(e) => {
    const newLimit = Number(e.target.value);

    setSearchParams({
      page: 1,
      limit: newLimit,
      mode:"coding"
    });
  }}
  className="px-3.5 py-2 text-sm font-medium bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 text-slate-700 rounded-xl transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer shadow-xs"
>
  <option value={5}>5</option>
  <option value={10}>10</option>
  <option value={20}>20</option>
  <option value={50}>50</option>
</select>

              <span className="text-sm text-slate-500">
                per page
              </span>

            </div>
            { history.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3 shadow-sm ">
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 font-bold text-lg">
                ?
              </div>
              <h3 className="text-lg font-semibold text-slate-800">No interview history found</h3>
              <p className="text-slate-500 text-sm max-w-sm mx-auto">
                Complete your first interview session to start tracking your performance and AI scores.
              </p>
            </div>
          )}
      {history?.map((val, idx) => {
        return (
          <>
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden"
            >
              <div
                onClick={() => navigate(`/code/${val._id}/history`)}
                className="group bg-slate-900 text-white p-6 sm:p-8 flex flex-wrap items-center justify-between gap-4 cursor-pointer relative overflow-hidden"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="p-2 bg-amber-700 h-8 w-8 flex items-center justify-center rounded font-bold">
                      {(page - 1) * limit + idx + 1}
                    </h1>
                    <h2 className="text-xl font-medium tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                      {val?.prompt.slice(0, 50)}...
                    </h2>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 ${getStatusStyle(val?.status)}`}
                  >
                    {val?.status}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold capitalize border ${getDifficultyStyle(
                      val?.difficulty,
                    )}`}
                  >
                    {val?.difficulty}
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700 `}
                  >
                    {formatDate(val?.createdAt)}
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </>
        );
      })}
      <div>
        <div className="flex items-center justify-center gap-5 mt-4">
          <button
          disabled= {page==1 || isLoadingHistory}
          onClick={()=>{
            setSearchParams({
  page: page - 1,
  limit: limit,
  mode:"coding"
});
          }}
           className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            <ChevronLeft className="w-4 h-4" />
            PREV
          </button>
          <div className="h-9 min-w-9 px-3 flex items-center justify-center rounded-lg bg-slate-900 text-white text-sm font-semibold">
                {page}
              </div>
          <button 
          disabled={history.length < limit || isLoadingHistory}
          onClick={()=>{
           setSearchParams({
  page: page + 1,
  limit: limit,
  mode:"coding"
});
          }}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
            NEXT
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      
    </div>
  );
};

export default CodeHistory;
