import { motion } from "framer-motion";
import {
  AlertCircle,
  Award,
  BarChart2,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  Mic,
  RotateCcw,
  Star,
  Target,
  ThumbsUp,
  TrendingUp,
  Zap,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useNavigate } from "react-router-dom";
import { AIuseStore } from "../../AuthStore/AIStore";

const EvaluationPage = () => {
  const {finalResult} = AIuseStore();
  const navigate = useNavigate();
  const [chartType, setChartType] = useState("bar");
    const [Result, setResult] = useState("");
    const [Feedback, setFeedback] = useState(null);
    const [Strength, setStrength] = useState(null);
    const [Weakness, setWeakness] = useState(null);
    useEffect(()=>{
      setResult(finalResult?.result)
    },[finalResult])

    useEffect(()=>{
      setFeedback(finalResult?.feedback?.parsed)
    },[finalResult]);

    useEffect(()=>{
      setWeakness(finalResult?.feedback?.parsed?.weaknesses
);
    },[finalResult]);

    useEffect(()=>{
    setStrength(finalResult?.feedback?.parsed?.
strengths)
    },[finalResult]);

  const getRatingColor = (rating) => {
    const map = {
      Excellent: { text: "#16a34a", bg: "#EAF3DE", border: "#86efac" },
      Good:      { text: "#0F6E56", bg: "#E1F5EE", border: "#6ee7b7" },
      Average:   { text: "#b45309", bg: "#fef3c7", border: "#fcd34d" },
      Poor:      { text: "#b91c1c", bg: "#fee2e2", border: "#fca5a5" },
    };
    return map[rating] ?? map["Average"];
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#0F6E56";
    if (score >= 40) return "#f59e0b";
    return "#b91c1c";
  };

  const ratingStyle = getRatingColor(Result?.rating);

  const chartData = [
    { name: "Avg Score",     value: Result?.averageScore || 0 },
    { name: "Confidence",    value: Result?.confidence || 0 },
    { name: "Communication", value: Result?.communication || 0 },
    { name: "Correctness",   value: Result?.correctness || 0 },
    { name: "Accuracy",      value: Result?.accuracy || 0 },
  ];

  const metrics = [
    { label: "Confidence",    value: Result?.confidence || 0 ,    icon: <Zap size={16} />,          bgColor: "#EAF3DE", textColor: "#052e16", desc: "How assured your answers sounded" },
    { label: "Communication", value: Result?.communication || 0 , icon: <MessageSquare size={16} />, bgColor: "#c7d2fe", textColor: "#1e1a78", desc: "Clarity and structure of responses" },
    { label: "Correctness",   value: Result?.correctness || 0 ,   icon: <CheckCircle2 size={16} />,  bgColor: "#fed7aa", textColor: "#78350f", desc: "Technical accuracy of your answers" },
    { label: "Accuracy",      value: Result?.accuracy || 0 ,      icon: <Target size={16} />,        bgColor: "#E1F5EE", textColor: "#0F6E56", desc: "Relevance and precision of answers" },
  ];


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden:   { opacity: 0, y: 16 },
    visible:  { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  };

  const CircleProgress = ({ value, size = 80, stroke = 7 }) => {
    const r    = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const off  = circ - (value / 100) * circ;
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
        <motion.circle
          cx={size/2} cy={size/2} r={r}
          fill="none" stroke={getScoreColor(value)} strokeWidth={stroke}
          strokeDasharray={circ} strokeLinecap="round"
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
    );
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
          <p className="text-xs font-semibold text-gray-700">{label}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Score:{" "}
            <span className="font-bold" style={{ color: getScoreColor(payload[0].value) }}>
              {payload[0].value}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  const RadarTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
          <p className="text-xs font-semibold text-gray-700">{payload[0].payload.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            Score:{" "}
            <span className="font-bold" style={{ color: getScoreColor(payload[0].value) }}>
              {payload[0].value}%
            </span>
          </p>
        </div>
      );
    }
    return null;
  };
const feedbackIcons = [
  {
    icon: <Lightbulb />,
    bg: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: <MessageSquare />,
    bg: "bg-blue-100 text-blue-600",
  },
  {
    icon: <ThumbsUp />,
    bg: "bg-green-100 text-green-600",
  },
  {
    icon: <AlertCircle />,
    bg: "bg-red-100 text-red-600",
  },
];

  return (
    <div className="bg-[#F0EBE3] min-h-screen w-full px-4 sm:px-6 py-10 flex flex-col items-center">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[90%] flex flex-col gap-6"
      >

        {/* HEADER */}
        <motion.div variants={itemVariants} className="flex items-center justify-between">
         <div className="ml-3 mb-6">
  <div className="flex items-center gap-2 mb-1">
    <span className="w-1 h-10 rounded-full bg-indigo-600"></span>

    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
      Interview Evaluation
    </h1>
  </div>

  <p className="text-sm sm:text-base text-gray-500 ml-3">
    A detailed breakdown of your interview performance and insights.
  </p>
</div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 text-xs font-medium text-gray-500 border border-gray-200 bg-white px-4 py-2 rounded-xl hover:bg-gray-50 transition"
            >
              <RotateCcw size={13} /> Retake
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="flex items-center gap-2 text-xs font-medium text-white bg-green-700 px-4 py-2 rounded-xl hover:bg-green-800 transition"
            >
              Dashboard <ChevronRight size={13} />
            </button>
          </div>
        </motion.div>
        {/* HERO CARD */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-8"
        >

          <div className="relative flex items-center justify-center shrink-0">
            <CircleProgress value={Result?.averageScore || 0 } size={120} stroke={9} />
            <div className="absolute flex flex-col items-center">
              <span className="text-2xl font-bold leading-none" style={{ color: getScoreColor(Result?.averageScore) }}>
                {Result?.averageScore || 0}%
              </span>
              <span className="text-[10px] text-gray-400 mt-0.5 uppercase tracking-wider">avg score</span>
            </div>
          </div>

          <div className="flex-1 text-center sm:text-left">
            {Result ? ( <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 mb-4">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-emerald-700">
                Interview Completed Successfully
              </span>
            </div>) : ( <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-100 border border-red-200 mb-4">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-semibold text-red-700">
                Something Went Wrong
              </span>
            </div>)}
            <div className="flex   items-center justify-center sm:justify-start gap-2 mb-2">
              <Award size={16} className="text-green-700" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Overall Rating</span>
            </div>
            <h2 className="text-3xl font-semibold text-gray-800 mb-1">{Result?.rating}</h2>
            <p className="text-sm text-gray-500 leading-relaxed max-w-md">
              You completed {Result?.totalQuestions} questions with a solid performance. Focus on the improvement areas below to reach the next level.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 shrink-0 w-full sm:w-auto">
            {[
              { label: "Questions", value: Result?.totalQuestions || 0 ,      color: "#534AB7" },
              { label: "Avg Score", value: `${Result?.averageScore || 0 }%`,  color: getScoreColor(Result?.averageScore) },
              { label: "Accuracy",  value: `${Result?.accuracy || 0 }%`,      color: getScoreColor(Result?.accuracy) },
              { label: "Rating",    value: Result?.rating || 0 ,              color: ratingStyle.text },
            ].map((s, i) => (
              <div key={i} className="bg-gray-50 border border-gray-100 rounded-2xl px-4 py-3 flex flex-col items-center justify-center gap-0.5">
                <span className="text-lg font-bold leading-none" style={{ color: s.color }}>{s.value}</span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CHART SECTION */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <BarChart2 size={16} className="text-green-700" />
              <h2 className="text-base font-semibold text-gray-800">Score Overview</h2>
            </div>
            <div className="flex items-center gap-1 bg-gray-100 rounded-xl p-1">
              {["bar", "radar"].map((type) => (
                <button
                  key={type}
                  onClick={() => setChartType(type)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-lg transition capitalize ${
                    chartType === type
                      ? "bg-white text-gray-800 shadow-sm"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-gray-400 mb-6">All scores measured out of 100.</p>

          <ResponsiveContainer width="100%" height={280}>
            {chartType === "bar" ? (
              <BarChart data={chartData} barSize={36}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 11, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb", radius: 8 }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={getScoreColor(entry.value)} />
                  ))}
                </Bar>
              </BarChart>
            ) : (
              <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
                <PolarGrid stroke="#f3f4f6" />
                <PolarAngleAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: "#d1d5db" }}
                  tickCount={5}
                  axisLine={false}
                />
                <Radar
                  dataKey="value"
                  stroke="#0F6E56"
                  fill="#0F6E56"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Tooltip content={<RadarTooltip />} />
              </RadarChart>
            )}
          </ResponsiveContainer>

          {/* Legend dots */}
          <div className="flex items-center justify-center gap-4 mt-4 flex-wrap">
            {chartData.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: getScoreColor(d.value) }} />
                <span className="text-[11px] text-gray-500">{d.name}: <strong>{d.value}%</strong></span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* PERFORMANCE METRICS */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <BarChart2 size={16} className="text-green-700" />
            <h2 className="text-base font-semibold text-gray-800">Performance Insights</h2>
          </div>
          <p className="text-xs text-gray-400 mb-6">Track your progress with analytics and identify improvement areas.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {metrics.map((m, i) => (
              <motion.div
                key={i}
                variants={itemVariants}
                className="border border-gray-100 rounded-2xl p-4 flex items-center gap-4 hover:shadow-sm transition"
              >
                <div
                  style={{ backgroundColor: m.bgColor, color: m.textColor }}
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                >
                  {m.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-semibold text-gray-700">{m.label}</h3>
                    <span className="text-sm font-bold" style={{ color: getScoreColor(m.value) }}>
                      {m.value}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${m.value}%` }}
                      transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: getScoreColor(m.value) }}
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{m.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
                {/* Strength && Weakness */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

  {/* Strength Card */}
  <div className="relative overflow-hidden rounded-xl border border-emerald-100 bg-linear-to-br from-emerald-50 via-white to-emerald-100/40 shadow-lg">
    
    {/* Glow */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/40 rounded-full blur-3xl" />

    {/* Header */}
    <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center shadow-md">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 13l4 4L19 7"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900">Strengths</h2>
          <p className="text-xs text-gray-500">
            Things performed really well
          </p>
        </div>
      </div>

      <div className="px-3 py-1 rounded-full bg-emerald-500 text-white text-sm font-semibold shadow">
        {Strength?.length ?? 0}
      </div>
    </div>

    {/* List */}
    <div className="relative px-6 pb-6 space-y-3">
      {Strength?.map((item, i) => (
        <div
          key={i}
          className="group flex items-start gap-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-sm px-4 py-3 hover:scale-[1.02] hover:shadow-md transition-all duration-300"
        >
          <div className="mt-1 flex items-center justify-center w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 text-xs font-bold shrink-0">
            {i + 1}
          </div>

          <p className="text-sm leading-relaxed text-gray-700 group-hover:text-gray-900 transition">
            {item}
          </p>
        </div>
      ))}
    </div>
  </div>

  {/* Weakness Card */}
  <div className="relative overflow-hidden rounded-3xl border border-rose-100 bg-linear-to-br from-rose-50 via-white to-rose-100/40 shadow-lg">

    {/* Glow */}
    <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-rose-200/40 rounded-full blur-3xl" />

    {/* Header */}
    <div className="relative flex items-center justify-between px-6 pt-6 pb-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M18 6L6 18M6 6l12 12"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900">Weaknesses</h2>
          <p className="text-xs text-gray-500">
            Areas needing improvement
          </p>
        </div>
      </div>

      <div className="px-3 py-1 rounded-full bg-rose-500 text-white text-sm font-semibold shadow">
        {Weakness?.length ?? 0}
      </div>
    </div>

    {/* List */}
    <div className="relative px-6 pb-6 space-y-3">
      {Weakness?.map((item, i) => (
        <div
          key={i}
          className="group flex items-start gap-4 rounded-2xl bg-white/80 backdrop-blur-sm border border-white shadow-sm px-4 py-3 hover:scale-[1.02] hover:shadow-md transition-all duration-300"
        >
          <div className="mt-1 flex items-center justify-center w-7 h-7 rounded-full bg-rose-100 text-rose-600 text-xs font-bold shrink-0">
            {i + 1}
          </div>

          <p className="text-sm leading-relaxed text-gray-700 group-hover:text-gray-900 transition">
            {item}
          </p>
        </div>
      ))}
    </div>
  </div>

</div>
        {/* AI FEEDBACK */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 sm:p-8">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare size={16} className="text-green-700" />
            <h2 className="text-base font-semibold text-gray-800">AI Feedback & Suggestions</h2>
          </div>
          <p className="text-xs text-gray-400 mb-6">Get personalised tips and structured guidance to improve answers.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
  {Feedback?.suggestions?.map((f, i) => {
    const Icon = feedbackIcons[i];

    return (
      <motion.div
        key={i}
        variants={itemVariants}
        className="border border-gray-100 rounded-2xl p-4 flex items-start gap-4 hover:shadow-sm transition"
      >
        <div className= {`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${Icon?.bg}`}>
          {Icon?.icon}
        </div>

        <div>
          <h3 className="text-sm font-semibold text-gray-800 mb-1">
            {f?.title}
          </h3>

          <p className="text-xs text-gray-500 leading-relaxed">
            {f?.description}
          </p>
        </div>
      </motion.div>
    );
  })}
</div>
        </motion.div>

        {/* BOTTOM CTA */}
        <motion.div
          variants={itemVariants}
          className="bg-green-700 rounded-xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div>
            <h3 className="text-white font-semibold text-lg mb-1">Ready to improve?</h3>
            <p className="text-green-200 text-sm">Take another interview with a refined focus area.</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-white text-green-800 text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-green-50 transition"
            >
              <RotateCcw size={14} /> Try Again
            </button>
            <button
              onClick={() => navigate("/history")}
              className="flex items-center gap-2 bg-green-900 text-white text-sm font-medium px-5 py-2.5 rounded-xl hover:bg-green-950 transition"
            >
              View History <ChevronRight size={14} />
            </button>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
};

export default EvaluationPage;