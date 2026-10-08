/* eslint-disable no-unused-vars */

import React, { useEffect, useMemo, useState } from "react";

import {

  Award,

  CheckCircle2,

  XCircle,

  AlertCircle,

  Code2,

  Target,

  TrendingUp,

  Brain,

  Lightbulb,

  ChevronDown,

  ChevronUp,

  ArrowLeft,

  BarChart3,

  Terminal,

  Zap,

  Clock,

  Cpu,

  FileCode2,

  BookOpen,

  ListChecks,

} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { codeAIStore } from "../../../AuthStore/codeAI";

const CodeHistoryAnalysis = () => {

  const navigate = useNavigate();

  const { id } = useParams();

  const { analysisReport} = codeAIStore();

  const [openQuestion, setOpenQuestion] = useState(null);


  useEffect(() => {

    console.log("Analysis Report:", analysisReport);

  }, [analysisReport]);

  const analysis = analysisReport?.analysis;

  const questionDetails = analysisReport?.questionDetails || [];

  if (!analysis) {

    return (

      <div className="min-h-screen bg-[#F0EBE3] flex items-center justify-center px-4">

        <div className="text-center">

          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center">

            <Brain className="text-green-600" size={30} />

          </div>

          <h2 className="text-xl font-semibold text-gray-900">

            No Analysis Available

          </h2>

          <p className="text-sm text-gray-500 mt-2">

            Your coding round analysis has not been generated yet.

          </p>

          <button

            onClick={() => navigate("/codeHistory")}

            className="mt-6 bg-black text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-800 transition"

          >

            Back to History

          </button>

        </div>

      </div>

    );

  }

  const {

    overallScore = 0,

    questionsAttempted = 0,

    questionsSolved = 0,

    totalQuestions = 0,

    strengths = [],

    weaknesses = [],

    topicAnalysis = [],

    questionAnalysis = [],

    codingPatterns = [],

    recommendations = [],

    finalAssessment = "",

  } = analysis || {};

  /*

  ============================================================

  QUESTION COUNTS

  ============================================================

  */

  const solvedCount = questionAnalysis.filter(

    (q) => q.status === "solved",

  ).length;

  const partialCount = questionAnalysis.filter(

    (q) => q.status === "partially_solved",

  ).length;

  const failedCount = questionAnalysis.filter(

    (q) => q.status === "failed",

  ).length;

  const notAttemptedCount = questionAnalysis.filter(

    (q) => q.status === "not_attempted",

  ).length;

  const actualSolved =

    questionAnalysis.length > 0 ? solvedCount : questionsSolved;

  const actualAttempted =

    questionAnalysis.length > 0

      ? solvedCount + partialCount + failedCount

      : questionsAttempted;

  const actualFailed = questionAnalysis.length > 0 ? failedCount : 0;

  const actualNotAttempted =

    questionAnalysis.length > 0

      ? notAttemptedCount

      : Math.max(totalQuestions - questionsAttempted, 0);

  const successRate =

    totalQuestions > 0 ? Math.round((actualSolved / totalQuestions) * 100) : 0;

  /*

  ============================================================

  HELPERS

  ============================================================

  */

  const getScoreColor = (score) => {

    if (score >= 80) return "text-green-600";

    if (score >= 60) return "text-yellow-600";

    if (score >= 40) return "text-orange-600";

    return "text-red-600";

  };

  const getScoreLabel = (score) => {

    if (score >= 80) return "Excellent";

    if (score >= 60) return "Good";

    if (score >= 40) return "Needs Improvement";

    return "Needs Practice";

  };

  const getStatus = (status) => {

    switch (status) {

      case "solved":

        return {

          label: "Solved",

          color: "text-green-600",

          bg: "bg-green-50",

          border: "border-green-200",

          icon: <CheckCircle2 size={16} />,

        };

      case "partially_solved":

        return {

          label: "Partially Solved",

          color: "text-yellow-600",

          bg: "bg-yellow-50",

          border: "border-yellow-200",

          icon: <AlertCircle size={16} />,

        };

      case "failed":

        return {

          label: "Failed",

          color: "text-red-500",

          bg: "bg-red-50",

          border: "border-red-200",

          icon: <XCircle size={16} />,

        };

      default:

        return {

          label: "Not Attempted",

          color: "text-gray-500",

          bg: "bg-gray-50",

          border: "border-gray-200",

          icon: <Code2 size={16} />,

        };

    }

  };

  /*

  ============================================================

  FIND QUESTION DETAIL

  ============================================================

  */

  const getQuestionDetail = (question) => {

    if (!question) return null;

    return (

      questionDetails.find(

        (item) => Number(item.questionNo) === Number(question.questionNo),

      ) || null

    );

  };

  const getQuestionAnalytics = (question) => {

    if (!question) return null;

    return (

      questionAnalysis.find(

        (item) => Number(item.questionNo) === Number(question.questionNo),

      ) || null

    );

  };

  /*

  ============================================================

  FORMAT ARRAY / OBJECT

  ============================================================

  */

  const renderValue = (value) => {

    if (!value) return null;

    if (Array.isArray(value)) {

      return (

        <div className="space-y-2">

          {value.map((item, index) => (

            <div key={index} className="text-sm text-gray-600 leading-6">

              •{" "}

              {typeof item === "object" ? JSON.stringify(item, null, 2) : item}

            </div>

          ))}

        </div>

      );

    }

    if (typeof value === "object") {

      return (

        <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-6">

          {JSON.stringify(value, null, 2)}

        </pre>

      );

    }

    return <p className="text-sm text-gray-600 leading-6">{value}</p>;

  };

  return (

    <div className="min-h-screen bg-[#F0EBE3] text-gray-900">

      {/* ======================================================

          HEADER

      ====================================================== */}

      <header className="sticky top-0 z-50 border-b border-gray-200 bg-[#F0EBE3]/95 backdrop-blur">

        <div className="max-w-375 mx-auto px-5 md:px-8 h-18 flex items-center justify-between">

          <div className="flex items-center gap-4">

            <div className="w-11 h-11 rounded-2xl bg-white border border-gray-200 shadow-sm flex items-center justify-center">

              <Terminal size={21} className="text-green-600" />

            </div>

            <div>

              <h1 className="text-lg font-bold tracking-tight text-gray-900">

                Coding Round Analysis

              </h1>

              <p className="text-xs text-gray-500 mt-0.5">

                AI-powered coding performance

              </p>

            </div>

          </div>

          <button

            onClick={() => navigate("/codeHistory")}

            className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 bg-white text-gray-700 hover:border-green-400 hover:text-green-600 transition-all text-sm font-medium shadow-sm"

          >

            <ArrowLeft size={16} />

            Back to History

          </button>

        </div>

      </header>

      {/* ======================================================

          MAIN

      ====================================================== */}

      <main className="max-w-[1500px] mx-auto px-5 md:px-8 py-8 space-y-6">

        {/* ====================================================

            TOP PERFORMANCE

        ==================================================== */}

        <section className="grid grid-cols-1 xl:grid-cols-[330px_1fr] gap-5">

          {/* SCORE */}

          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm">

            <div className="flex items-center justify-between mb-6">

              <div>

                <p className="text-xs uppercase tracking-wider text-gray-400">

                  Overall Score

                </p>

                <h2 className="text-lg font-bold mt-1 text-gray-900">

                  Performance

                </h2>

              </div>

              <div className="w-10 h-10 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">

                <Award size={21} className="text-green-600" />

              </div>

            </div>

            <div className="flex justify-center py-5">

              <div className="relative w-40 h-40 flex items-center justify-center">

                <svg

                  className="absolute inset-0 w-full h-full -rotate-90"

                  viewBox="0 0 160 160"

                >

                  <circle

                    cx="80"

                    cy="80"

                    r="68"

                    fill="none"

                    stroke="#E5E7EB"

                    strokeWidth="10"

                  />

                  <circle

                    cx="80"

                    cy="80"

                    r="68"

                    fill="none"

                    stroke="#16a34a"

                    strokeWidth="10"

                    strokeLinecap="round"

                    strokeDasharray={`${

                      Math.min(Math.max(overallScore, 0), 100) * 4.27

                    } 427`}

                  />

                </svg>

                <div className="text-center z-10">

                  <p

                    className={`text-4xl font-bold ${getScoreColor(

                      overallScore,

                    )}`}

                  >

                    {overallScore}

                  </p>

                  <p className="text-xs text-gray-400">/ 100</p>

                </div>

              </div>

            </div>

            <div className="text-center">

              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-600 text-xs font-semibold">

                <Zap size={13} />

                {getScoreLabel(overallScore)}

              </span>

            </div>

          </div>

          {/* STATISTICS */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            <StatCard

              title="Attempted"

              value={actualAttempted}

              icon={<Target size={18} />}

              accent="green"

            />

            <StatCard

              title="Solved"

              value={actualSolved}

              icon={<CheckCircle2 size={18} />}

              accent="green"

            />

            <StatCard

              title="Partially Solved"

              value={partialCount}

              icon={<AlertCircle size={18} />}

              accent="yellow"

            />

            <StatCard

              title="Failed"

              value={actualFailed}

              icon={<XCircle size={18} />}

              accent="red"

            />

            <StatCard

              title="Not Attempted"

              value={actualNotAttempted}

              icon={<Code2 size={18} />}

              accent="gray"

            />

            <StatCard

              title="Total Questions"

              value={totalQuestions}

              icon={<ListChecks size={18} />}

              accent="green"

            />

            <StatCard

              title="Success Rate"

              value={`${successRate}%`}

              icon={<TrendingUp size={18} />}

              accent="yellow"

            />

          </div>

        </section>

        {/* ====================================================

            FINAL ASSESSMENT

        ==================================================== */}

        <section className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">

          <SectionHeader icon={<Brain size={18} />} title="Final Assessment" />

          <div className="p-6">

            <div className="border-l-2 border-green-500 pl-5">

              <p className="text-sm text-gray-600 leading-7">

                {finalAssessment || "No final assessment available."}

              </p>

            </div>

          </div>

        </section>

        {/* ====================================================

            STRENGTHS + WEAKNESSES

        ==================================================== */}

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* STRENGTHS */}

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">

            <SectionHeader

              icon={<CheckCircle2 size={18} className="text-green-600" />}

              title="Strengths"

            />

            <div className="p-5">

              {strengths.length > 0 ? (

                <div className="space-y-2">

                  {strengths.map((item, index) => (

                    <div

                      key={index}

                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-50/60 border border-green-100"

                    >

                      <CheckCircle2

                        size={15}

                        className="text-green-600 shrink-0"

                      />

                      <span className="text-sm text-gray-700">{item}</span>

                    </div>

                  ))}

                </div>

              ) : (

                <EmptyText text="No major strengths identified yet." />

              )}

            </div>

          </div>

          {/* WEAKNESSES */}

          <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">

            <SectionHeader

              icon={<AlertCircle size={18} className="text-red-500" />}

              title="Areas to Improve"

            />

            <div className="p-5">

              {weaknesses.length > 0 ? (

                <div className="space-y-2">

                  {weaknesses.map((item, index) => (

                    <div

                      key={index}

                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50/60 border border-red-100"

                    >

                      <AlertCircle

                        size={15}

                        className="text-red-500 shrink-0"

                      />

                      <span className="text-sm text-gray-700">{item}</span>

                    </div>

                  ))}

                </div>

              ) : (

                <EmptyText text="No major weaknesses identified." />

              )}

            </div>

          </div>

        </section>

        {/* ====================================================

            TOPIC ANALYSIS

        ==================================================== */}

        <section className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">

          <SectionHeader

            icon={<BarChart3 size={18} className="text-green-600" />}

            title="Topic Analysis"

          />

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">

            {topicAnalysis.length > 0 ? (

              topicAnalysis.map((topic, index) => (

                <div

                  key={index}

                  className="bg-[#F9F7F3] border border-gray-200 rounded-2xl p-5 hover:border-green-300 hover:shadow-sm transition"

                >

                  <div className="flex items-center justify-between mb-3">

                    <h3 className="text-sm font-semibold text-gray-800">

                      {topic.topic}

                    </h3>

                    <span

                      className={`font-mono text-sm font-semibold ${getScoreColor(

                        topic.score,

                      )}`}

                    >

                      {topic.score}/100

                    </span>

                  </div>

                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">

                    <div

                      className="h-full bg-green-500 rounded-full transition-all"

                      style={{

                        width: `${Math.min(topic.score || 0, 100)}%`,

                      }}

                    />

                  </div>

                  <p className="text-xs text-gray-500 mt-3">

                    {topic.performance}

                  </p>

                  {topic.observations?.length > 0 && (

                    <div className="mt-4 pt-3 border-t border-gray-200 space-y-2">

                      {topic.observations.map((observation, i) => (

                        <p key={i} className="text-xs text-gray-500">

                          <span className="text-green-600 mr-2">•</span>

                          {observation}

                        </p>

                      ))}

                    </div>

                  )}

                </div>

              ))

            ) : (

              <EmptyText text="No topic analysis available." />

            )}

          </div>

        </section>

        {/* ====================================================

            QUESTION ANALYSIS

        ==================================================== */}

        <section className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">

          <SectionHeader

            icon={<Code2 size={18} className="text-green-600" />}

            title="Question Analysis"

          />

          <div className="p-4 space-y-3">

            {questionAnalysis.length > 0 ? (

              questionAnalysis.map((question, index) => {

                const isOpen = openQuestion === index;

                // Original question data

                const originalQuestionDetail = getQuestionDetail(question);

                // AI analysis data is the primary source for evaluation metrics

                const questionAnalytics = getQuestionAnalytics(question);

                // Keep using questionDetail everywhere in the UI,

                // but override evaluation fields with values from AI analysis.

                const questionDetail = originalQuestionDetail

                  ? {

                      ...originalQuestionDetail,

                      status:

                        questionAnalytics?.status ??

                        originalQuestionDetail.status ??

                        "not_attempted",

                      testsPassed:

                        questionAnalytics?.testsPassed ??

                        originalQuestionDetail.testsPassed ??

                        0,

                      totalTests:

                        questionAnalytics?.totalTests ??

                        originalQuestionDetail.totalTests ??

                        0,

                      executionTime:

                        questionAnalytics?.executionTime ??

                        originalQuestionDetail.executionTime ??

                        0,

                      memoryUsed:

                        questionAnalytics?.memoryUsed ??

                        originalQuestionDetail.memoryUsed ??

                        0,

                    }

                  : null;

                // Status shown throughout the UI comes from questionDetail.status.

                const status = getStatus(

                  questionDetail?.status || "not_attempted",

                );

                return (

                  <div

                    key={question.questionNo || index}

                    className="border border-gray-200 rounded-2xl overflow-hidden bg-white"

                  >

                    <button

                      onClick={() => setOpenQuestion(isOpen ? null : index)}

                      className="w-full px-5 py-4 flex items-center justify-between hover:bg-[#F9F7F3] transition text-left"

                    >

                      <div className="flex items-center gap-4 min-w-0">

                        <div className="w-10 h-10 shrink-0 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-sm font-mono text-green-700">

                          {String(question.questionNo || index + 1).padStart(

                            2,

                            "0",

                          )}

                        </div>

                        <div className="min-w-0">

                          <p className="text-sm font-semibold text-gray-800 truncate">

                            {questionDetail?.title ||

                              `Question ${question.questionNo || index + 1}`}

                          </p>

                          <div className="flex items-center gap-2 mt-1 flex-wrap">

                            <div

                              className={`flex items-center gap-1.5 text-xs ${status.color}`}

                            >

                              {status.icon}

                              {status.label}

                            </div>

                            {questionDetail?.difficulty && (

                              <span className="text-xs text-gray-400">

                                • {questionDetail.difficulty}

                              </span>

                            )}

                            {questionDetail?.topic && (

                              <span className="text-xs text-green-600">

                                • {questionDetail.topic}

                              </span>

                            )}

                          </div>

                        </div>

                      </div>

                      <div className="text-gray-400 shrink-0 ml-3">

                        {isOpen ? (

                          <ChevronUp size={18} />

                        ) : (

                          <ChevronDown size={18} />

                        )}

                      </div>

                    </button>

                    {/* ==================================================

                        DETAILS

                    ================================================== */}

                    {isOpen && (

                      <div className="border-t border-gray-200 p-5 space-y-5 bg-[#FCFBF9]">

                        {/* ================================================

                            QUESTION INFORMATION

                        ================================================ */}

                        {questionDetail && (

                          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">

                            <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">

                              <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">

                                <BookOpen

                                  size={17}

                                  className="text-green-600"

                                />

                              </div>

                              <div>

                                <p className="text-xs uppercase tracking-wider text-gray-400">

                                  Question

                                </p>

                                <h3 className="text-sm font-bold text-gray-900">

                                  {questionDetail.title}

                                </h3>

                              </div>

                            </div>

                            <div className="p-5 space-y-5">

                              {/* TITLE / META */}

                              <div className="flex flex-wrap gap-2">

                                {questionDetail.difficulty && (

                                  <span className="px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-green-700 text-xs font-medium">

                                    {questionDetail.difficulty}

                                  </span>

                                )}

                                {questionDetail.topic && (

                                  <span className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium">

                                    {questionDetail.topic}

                                  </span>

                                )}

                                {questionDetail.language && (

                                  <span className="px-3 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-600 text-xs font-mono">

                                    {questionDetail.language}

                                  </span>

                                )}

                              </div>

                              {/* DESCRIPTION */}

                              {questionDetail.description && (

                                <QuestionInfoBlock

                                  title="Problem Description"

                                  value={questionDetail.description}

                                />

                              )}

                              {/* CONSTRAINTS */}

                              {questionDetail.constraints && (

                                <QuestionInfoBlock

                                  title="Constraints"

                                  value={questionDetail.constraints}

                                />

                              )}

                              {/* INPUT */}

                              {questionDetail.inputFormat && (

                                <QuestionInfoBlock

                                  title="Input Format"

                                  value={questionDetail.inputFormat}

                                />

                              )}

                              {/* OUTPUT */}

                              {questionDetail.outputFormat && (

                                <QuestionInfoBlock

                                  title="Output Format"

                                  value={questionDetail.outputFormat}

                                />

                              )}

                              {/* EXAMPLES */}

                              {questionDetail.examples && (

                                <div>

                                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-3">

                                    Examples

                                  </p>

                                  <div className="space-y-3">

                                    {Array.isArray(questionDetail.examples) ? (

                                      questionDetail.examples.map(

                                        (example, i) => (

                                          <div

                                            key={i}

                                            className="bg-white border border-gray-200 rounded-2xl p-4"

                                          >

                                            {/* Example Header */}

                                            <div className="flex items-center gap-2 mb-4">

                                              <div className="w-7 h-7 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-xs font-semibold text-green-600">

                                                {i + 1}

                                              </div>

                                              <span className="text-sm font-semibold text-gray-800">

                                                Example {i + 1}

                                              </span>

                                            </div>

                                            {/* Input / Output */}

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                                              {/* Input */}

                                              <div className="bg-[#F9F7F3] border border-gray-200 rounded-xl p-4">

                                                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">

                                                  Input

                                                </p>

                                                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap break-words">

                                                  {typeof example.input ===

                                                  "object"

                                                    ? JSON.stringify(

                                                        example.input,

                                                        null,

                                                        2,

                                                      )

                                                    : example.input}

                                                </pre>

                                              </div>

                                              {/* Output */}

                                              <div className="bg-[#F9F7F3] border border-gray-200 rounded-xl p-4">

                                                <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">

                                                  Output

                                                </p>

                                                <pre className="text-xs font-mono text-green-700 whitespace-pre-wrap break-words">

                                                  {typeof example.output ===

                                                  "object"

                                                    ? JSON.stringify(

                                                        example.output,

                                                        null,

                                                        2,

                                                      )

                                                    : example.output}

                                                </pre>

                                              </div>

                                            </div>

                                            {/* Explanation */}

                                            {example.explanation && (

                                              <div className="mt-3 px-4 py-3 rounded-xl bg-green-50/60 border border-green-100">

                                                <div className="flex items-center gap-2 mb-1.5">

                                                  <Lightbulb

                                                    size={14}

                                                    className="text-green-600"

                                                  />

                                                  <p className="text-[10px] uppercase tracking-wider font-semibold text-green-700">

                                                    Explanation

                                                  </p>

                                                </div>

                                                <p className="text-xs text-gray-600 leading-5">

                                                  {example.explanation}

                                                </p>

                                              </div>

                                            )}

                                          </div>

                                        ),

                                      )

                                    ) : (

                                      <div className="bg-white border border-gray-200 rounded-2xl p-4">

                                        <pre className="text-xs text-gray-600 whitespace-pre-wrap">

                                          {JSON.stringify(

                                            questionDetail.examples,

                                            null,

                                            2,

                                          )}

                                        </pre>

                                      </div>

                                    )}

                                  </div>

                                </div>

                              )}

                            </div>

                          </div>

                        )}

                        {/* ==================================================

                            SUBMISSION INFORMATION

                        ================================================== */}

                        {questionDetail && (

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                            <MiniStat

                              icon={<CheckCircle2 size={15} />}

                              title="Tests Passed"

                              value={`${questionDetail.testsPassed ?? 0}/${

                                questionDetail.totalTests ?? 0

                              }`}

                            />

                            <MiniStat

                              icon={<Clock size={15} />}

                              title="Execution"

                              value={

                                questionDetail.executionTime

                                  ? `${questionDetail.executionTime} ms`

                                  : "N/A"

                              }

                            />

                            <MiniStat

                              icon={<Cpu size={15} />}

                              title="Memory"

                              value={

                                questionDetail.memoryUsed

                                  ? `${questionDetail.memoryUsed}`

                                  : "N/A"

                              }

                            />

                            <MiniStat

                              icon={<Target size={15} />}

                              title="Status"

                              value={

                                questionDetail.status ||

                                question.status ||

                                "N/A"

                              }

                            />

                          </div>

                        )}

                        {/* ==================================================

                            USER CODE

                        ================================================== */}

                        {questionDetail?.userCode ? (

                          <div>

                            <div className="flex items-center gap-2 mb-3">

                              <FileCode2 size={16} className="text-green-600" />

                              <h4 className="text-sm font-semibold text-gray-800">

                                Submitted Code

                              </h4>

                            </div>

                            <div className="bg-gray-950 rounded-2xl overflow-hidden">

                              <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">

                                <span className="text-[11px] text-gray-400 font-mono">

                                  {questionDetail.language || "code"}

                                </span>

                                <span className="text-[11px] text-gray-500">

                                  User Submission

                                </span>

                              </div>

                              <pre className="p-5 overflow-x-auto max-h-[500px] text-xs leading-6 text-gray-200">

                                <code>{questionDetail.userCode}</code>

                              </pre>

                            </div>

                          </div>

                        ) : (<div>

                            <div className="flex items-center gap-2 mb-3">

                              <FileCode2 size={16} className="text-green-600" />

                              <h4 className="text-sm font-semibold text-gray-800">

                                Submitted Code

                              </h4>

                            </div>

                            <div className="bg-gray-950 rounded-2xl overflow-hidden">

                              <div className="px-4 py-2.5 border-b border-gray-800 flex items-center justify-between">

                                <span className="text-[11px] text-gray-400 font-mono">

                                  {questionDetail.language || "code"}

                                </span>

                                <span className="text-[11px] text-gray-500">

                                  User Submission

                                </span>

                              </div>

                              <pre className="p-5 overflow-x-auto max-h-125 text-xs leading-6 text-gray-200">

                                <code> </code>

                              </pre>

                            </div>

                          </div>) }

                        {/* ==================================================

                            AI ANALYSIS

                        ================================================== */}

                        <div className="border-t border-gray-200 pt-5">

                          <div className="flex items-center gap-2 mb-5">

                            <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">

                              <Brain size={17} className="text-green-600" />

                            </div>

                            <div>

                              <p className="text-xs uppercase tracking-wider text-gray-400">

                                AI Evaluation

                              </p>

                              <h3 className="text-sm font-bold text-gray-900">

                                Question Performance

                              </h3>

                            </div>

                          </div>

                          <div className="space-y-5">

                            {/* APPROACH */}

                            <AnalysisBlock

                              title="Approach"

                              value={question.approach}

                            />

                            {/* CORRECTNESS */}

                            <AnalysisBlock

                              title="Correctness"

                              value={question.correctness}

                            />

                            {/* COMPLEXITIES */}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                              <ComplexityCard

                                title="Time Complexity"

                                value={question.timeComplexity}

                              />

                              <ComplexityCard

                                title="Space Complexity"

                                value={question.spaceComplexity}

                              />

                            </div>

                            {/* CODE QUALITY */}

                            <AnalysisBlock

                              title="Code Quality"

                              value={question.codeQuality}

                            />

                            {/* MISTAKES */}

                            {question.mistakes?.length > 0 && (

                              <div>

                                <div className="flex items-center gap-2 mb-3">

                                  <XCircle size={16} className="text-red-500" />

                                  <h4 className="text-sm font-semibold text-red-500">

                                    Mistakes

                                  </h4>

                                </div>

                                <div className="space-y-2">

                                  {question.mistakes.map((mistake, i) => (

                                    <div

                                      key={i}

                                      className="px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-xs text-gray-600"

                                    >

                                      {mistake}

                                    </div>

                                  ))}

                                </div>

                              </div>

                            )}

                            {/* IMPROVEMENTS */}

                            {question.improvements?.length > 0 && (

                              <div>

                                <div className="flex items-center gap-2 mb-3">

                                  <CheckCircle2

                                    size={16}

                                    className="text-green-600"

                                  />

                                  <h4 className="text-sm font-semibold text-green-600">

                                    Improvements

                                  </h4>

                                </div>

                                <div className="space-y-2">

                                  {question.improvements.map((item, i) => (

                                    <div

                                      key={i}

                                      className="px-4 py-3 rounded-xl bg-green-50 border border-green-100 text-xs text-gray-600"

                                    >

                                      {item}

                                    </div>

                                  ))}

                                </div>

                              </div>

                            )}

                            {/* AI FEEDBACK */}

                            {question.aiFeedback && (

                              <div className="border border-green-200 bg-green-50/70 rounded-2xl p-4">

                                <div className="flex items-center gap-2 mb-2">

                                  <Lightbulb

                                    size={16}

                                    className="text-green-600"

                                  />

                                  <h4 className="text-sm font-semibold text-green-700">

                                    AI Feedback

                                  </h4>

                                </div>

                                <p className="text-xs text-gray-600 leading-6">

                                  {question.aiFeedback}

                                </p>

                              </div>

                            )}

                          </div>

                        </div>

                      </div>

                    )}

                  </div>

                );

              })

            ) : (

              <EmptyText text="No question analysis available." />

            )}

          </div>

        </section>

        {/* ====================================================

            CODING PATTERNS

        ==================================================== */}

        {codingPatterns.length > 0 && (

          <section className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">

            <SectionHeader

              icon={<Code2 size={18} className="text-green-600" />}

              title="Coding Patterns"

            />

            <div className="p-5 flex flex-wrap gap-2">

              {codingPatterns.map((pattern, index) => (

                <span

                  key={index}

                  className="px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-xs text-green-700 font-mono"

                >

                  {pattern}

                </span>

              ))}

            </div>

          </section>

        )}

        {/* ====================================================

            RECOMMENDATIONS

        ==================================================== */}

        <section className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">

          <SectionHeader

            icon={<Lightbulb size={18} className="text-green-600" />}

            title="Recommendations"

          />

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-3">

            {recommendations.length > 0 ? (

              recommendations.map((recommendation, index) => (

                <div

                  key={index}

                  className="flex gap-3 p-4 bg-[#F9F7F3] border border-gray-200 rounded-2xl"

                >

                  <div className="w-7 h-7 shrink-0 rounded-lg bg-green-50 border border-green-200 flex items-center justify-center text-xs text-green-600 font-mono">

                    {index + 1}

                  </div>

                  <p className="text-xs text-gray-600 leading-5">

                    {recommendation}

                  </p>

                </div>

              ))

            ) : (

              <EmptyText text="No recommendations available." />

            )}

          </div>

        </section>

        {/* ====================================================

            BOTTOM

        ==================================================== */}

        <div className="flex justify-center py-5">

          <button

            onClick={() => navigate("/codeHistory")}

            className="flex items-center gap-2 px-6 py-3 rounded-full bg-black hover:bg-gray-800 text-white transition text-sm font-medium shadow-sm"

          >

            <ArrowLeft size={16} />

            Back to Coding History

          </button>

        </div>

      </main>

    </div>

  );

};

/* ============================================================

   STAT CARD

============================================================ */

const StatCard = ({ title, value, icon, accent }) => {

  const colors = {

    green: "text-green-600 bg-green-50 border-green-200",

    red: "text-red-500 bg-red-50 border-red-200",

    yellow: "text-yellow-600 bg-yellow-50 border-yellow-200",

    gray: "text-gray-500 bg-gray-50 border-gray-200",

  };

  return (

    <div className="bg-white border border-gray-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition">

      <div

        className={`w-10 h-10 rounded-xl border flex items-center justify-center ${

          colors[accent] || colors.green

        }`}

      >

        {icon}

      </div>

      <p className="text-xs text-gray-400 mt-5">{title}</p>

      <p className="text-2xl font-bold mt-1 text-gray-900">{value}</p>

    </div>

  );

};

/* ============================================================

   SECTION HEADER

============================================================ */

const SectionHeader = ({ icon, title }) => {

  return (

    <div className="px-5 py-4 border-b border-gray-200 flex items-center gap-3">

      <div className="w-9 h-9 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center text-green-600">

        {icon}

      </div>

      <h2 className="text-sm font-bold text-gray-800">{title}</h2>

    </div>

  );

};

/* ============================================================

   ANALYSIS BLOCK

============================================================ */

const AnalysisBlock = ({ title, value }) => {

  if (!value) return null;

  return (

    <div>

      <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">

        {title}

      </p>

      {typeof value === "string" ? (

        <p className="text-sm text-gray-600 leading-6">{value}</p>

      ) : (

        <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-6">

          {JSON.stringify(value, null, 2)}

        </pre>

      )}

    </div>

  );

};

/* ============================================================

   QUESTION INFO BLOCK

============================================================ */

const QuestionInfoBlock = ({ title, value }) => {

  if (!value) return null;

  return (

    <div>

      <p className="text-xs uppercase tracking-wider text-gray-400 mb-2">

        {title}

      </p>

      <div className="bg-[#F9F7F3] border border-gray-200 rounded-xl p-4">

        {Array.isArray(value) ? (

          <div className="space-y-2">

            {value.map((item, index) => (

              <div key={index} className="text-sm text-gray-600 leading-6">

                • {typeof item === "object" ? JSON.stringify(item) : item}

              </div>

            ))}

          </div>

        ) : typeof value === "object" ? (

          <pre className="text-xs text-gray-600 whitespace-pre-wrap leading-6">

            {JSON.stringify(value, null, 2)}

          </pre>

        ) : (

          <p className="text-sm text-gray-600 leading-6">{value}</p>

        )}

      </div>

    </div>

  );

};

/* ============================================================

   MINI STAT

============================================================ */

const MiniStat = ({ icon, title, value }) => {

  return (

    <div className="bg-white border border-gray-200 rounded-2xl p-4">

      <div className="flex items-center gap-2 text-green-600">

        {icon}

        <span className="text-[10px] uppercase tracking-wider text-gray-400">

          {title}

        </span>

      </div>

      <p className="text-sm font-semibold text-gray-800 mt-2 truncate">

        {value}

      </p>

    </div>

  );

};

/* ============================================================

   COMPLEXITY CARD

============================================================ */

const ComplexityCard = ({ title, value }) => {

  return (

    <div className="bg-white border border-gray-200 rounded-2xl p-4">

      <p className="text-[10px] uppercase tracking-wider text-gray-400 mb-2">

        {title}

      </p>

      <p className="font-mono text-sm text-green-600">{value || "N/A"}</p>

    </div>

  );

};

/* ============================================================

   EMPTY

============================================================ */

const EmptyText = ({ text }) => {

  return <p className="text-sm text-gray-400 py-3">{text}</p>;

};

export default CodeHistoryAnalysis;
