import React, { useEffect, useState } from "react";
import { codeAIStore } from "../../../AuthStore/codeAI";
import { Loader } from "lucide-react";
import { userAuthStore } from "../../../AuthStore/user";
import { useLocation, useNavigate } from "react-router-dom";
import { useRef } from "react";
const CodeStart = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [prompt, setPrompt] = useState("");
  const [errorNow, seterrorNow] = useState("");
const promptRef = useRef(null);
  const {
    codingQuestionGenerator,
    isLoadingCodingQuestion,
    codeQuestionData,
    codingID
  } = codeAIStore();

  const { user, isAuthenticated } = userAuthStore();


  const handleStart = async (promptValue) => {
  if (!promptValue?.trim()) return;

  if (!user || !isAuthenticated) {
    sessionStorage.setItem("pendingCodingPrompt", promptValue);

    navigate("/login", {
      state: {
        from: location.pathname,
      },
    });

    return;
  }

  try {
    const result = await codingQuestionGenerator(promptValue);

    if (result) {
      console.log("Coding question generated:", result);

      navigate(`/startCode/${result.codingID}`);
    }
  } catch (error) {
    console.log(error);
    seterrorNow(error);
  }
};

  useEffect(() => {
  if (!isAuthenticated || !user) return;

  const pendingPrompt =
    sessionStorage.getItem("pendingCodingPrompt");

  if (!pendingPrompt) return;

  sessionStorage.removeItem("pendingCodingPrompt");

  const generateAfterLogin = async () => {
    try {
      const result = await codingQuestionGenerator(pendingPrompt);

      if (result) {
        console.log("Coding question generated:", result);

        navigate(`/startCode/${result.codingID}`);
      }
    } catch (error) {
      console.log(error);
      seterrorNow(error);
    }
  };

  generateAfterLogin();

}, [isAuthenticated, user, codingQuestionGenerator, navigate]);

  useEffect(() => {
    console.log(codeQuestionData);
    console.log("codingId : ",codingID);
  }, [codeQuestionData,codingID]);


  const features = [
    {
      number: "01",
      title: "AI Generated Problems",
      text: "Get coding questions tailored to your role, experience and target company.",
    },
    {
      number: "02",
      title: "Real Coding Environment",
      text: "Write, run and test your solution with multiple programming languages.",
    },
    {
      number: "03",
      title: "AI Evaluation",
      text: "Get detailed feedback on correctness, complexity, code quality and approach.",
    },
  ];

  const popularRounds = [
    {
      title: "DSA Fundamentals",
      description: "Arrays, strings, hashing & recursion",
      level: "Beginner",
      image:
        "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Product Company",
      description: "Interview-style DSA & problem solving",
      level: "Medium",
      image:
        "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    },
    {
      title: "Competitive Round",
      description: "Advanced algorithms & optimization",
      level: "Hard",
      image:
        "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=800&q=80",
    },
  ];

  return (
    <div className="min-h-screen w-full px-5 pt-24 pb-16">

      <div className="max-w-6xl mx-auto">

        {/* HERO */}
        <div className="text-center max-w-3xl mx-auto">

          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-5 rounded-full border border-gray-200 bg-white text-[11px] font-medium tracking-wide uppercase text-gray-500 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            AI Coding Practice
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-bold tracking-[-0.045em] text-gray-900 leading-[1.04]">
            Practice smarter.
            <span className="block mt-2 font-medium italic text-gray-400 tracking-[-0.035em]">
              Code with confidence.
            </span>
          </h1>

          <p className="mt-5 text-gray-500 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            Tell us what you're preparing for and let AI create a
            <span className="text-gray-700 font-medium">
              {" "}personalized coding round
            </span>{" "}
            designed around your goals.
          </p>

        </div>

        {/* PROMPT */}
        <div
        ref={promptRef}
        className="w-full max-w-3xl mx-auto mt-9">

          <div className="rounded-2xl border border-gray-200 bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] p-3">

            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tell me about the coding round you want to practice..."
              className="w-full field-sizing-content min-h-10 max-h-40 resize-none border-none outline-none px-4 py-3 text-[15px] text-gray-800 placeholder:text-gray-400"
            />

            <div className="flex items-center justify-between px-2 pt-2">

              <div className="flex gap-2">

                <button
                  onClick={() =>
                    setPrompt(
                      "Give me 5 DSA questions for a product-based company."
                    )
                  }
                  className="px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs text-gray-500 transition"
                >
                  + DSA Round
                </button>

                <button
                  onClick={() =>
                    setPrompt(
                      "Give me a medium difficulty coding interview round with 5 questions."
                    )
                  }
                  className="hidden sm:block px-3 py-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 text-xs text-gray-500 transition"
                >
                  Medium
                </button>

              </div>

              <button
                onClick={()=>{
                    handleStart(prompt)
                }}
                disabled={!prompt.trim()}
                className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center text-lg hover:bg-gray-800 transition disabled:opacity-30 disabled:cursor-not-allowed"
              >
                {isLoadingCodingQuestion ? <Loader  className="h-4 w-4 animate-spin mx-auto"/> :"↑"}
              </button>

            </div>
          </div>

          {/* SUGGESTIONS */}
          <div className="flex flex-wrap justify-center gap-2 mt-5">

            {[
              "Flipkart GRiD",
              "Amazon SDE",
              "Google Internship",
              "DSA Interview",
              "Product Based",
              "Service-Based",
            ].map((item) => (
              <button
                key={item}
                onClick={() =>
                  setPrompt(`Create a coding round for ${item}.`)
                }
                className="px-3 py-1.5 rounded-full border border-gray-200 bg-white text-xs text-gray-500 hover:border-gray-300 hover:text-gray-800 transition"
              >
                {item}
              </button>
            ))}

          </div>
        </div>

        {/* STATS */}
        <div className="max-w-3xl mx-auto grid grid-cols-3 gap-3 mt-10">

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center shadow-sm">
            <p className="text-xl font-semibold text-gray-900">5+</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Question Types
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center shadow-sm">
            <p className="text-xl font-semibold text-gray-900">10+</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Coding Languages
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-center shadow-sm">
            <p className="text-xl font-semibold text-gray-900">AI</p>
            <p className="text-[11px] text-gray-400 mt-1">
              Code Evaluation
            </p>
          </div>

        </div>

        {/* HOW IT WORKS */}
        <div className="mt-14">

          <div className="flex items-end justify-between mb-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
                Simple process
              </p>

              <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 mt-1">
                From prompt to performance.
              </h2>
            </div>

            <p className="hidden sm:block text-xs text-gray-400">
              Your practice. Your pace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

            {features.map((feature) => (
              <div
                key={feature.number}
                className="group rounded-2xl border border-gray-200 bg-white p-5 hover:border-gray-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between mb-8">

                  <span className="text-[11px] font-semibold tracking-widest text-gray-300 h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center ">
                    {feature.number}
                  </span>


                </div>

                <h3 className="text-sm font-semibold text-gray-800">
                  {feature.title}
                </h3>

                <p className="text-xs text-gray-400 leading-relaxed mt-2">
                  {feature.text}
                </p>

              </div>
            ))}

          </div>
        </div>

        {/* POPULAR ROUNDS */}
        <div className="mt-12">

          <div className="mb-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-400">
              Start with a template
            </p>

            <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-gray-900 mt-1">
              Popular coding rounds
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            {popularRounds.map((round) => (
              <button
                key={round.title}
                onClick={() =>
                  {
                    setPrompt(
                    `Create a ${round.title} coding round with 5 questions.`
                  );
                  setTimeout(() => {
                    promptRef?.current?.scrollIntoView({
                      behaviour : "smooth",
                      block : "center"
                    })
                  }, 50);
                }
                }
                className="group text-left rounded-2xl border border-gray-200 bg-white overflow-hidden hover:border-gray-300 hover:shadow-md transition-all cursor-pointer"
              >

                {/* IMAGE */}
                <div className="relative h-36 overflow-hidden bg-gray-100">

                  <img
                    src={round.image}
                    alt={round.title}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent" />

                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-[10px] font-medium text-gray-600">
                    {round.level}
                  </span>

                  <span className="absolute bottom-3 left-4 text-white text-xs font-medium">
                    Coding Practice
                  </span>

                </div>

                {/* CONTENT */}
                <div className="p-5">

                  <div className="flex items-center justify-between">

                    <h3 className="text-sm font-semibold text-gray-800">
                      {round.title}
                    </h3>

                    <span className="text-gray-300 group-hover:text-gray-700 group-hover:translate-x-1 transition-all">
                      →
                    </span>

                  </div>

                  <p className="text-xs text-gray-400 mt-1.5">
                    {round.description}
                  </p>

                </div>

              </button>
            ))}

          </div>
        </div>

        {/* VISUAL BANNER */}
        <div className="mt-12 rounded-3xl overflow-hidden relative min-h-[230px] border border-gray-200">

          <img
            src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1600&q=85"
            alt="Coding workspace"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="absolute inset-0 bg-black/65" />

          <div className="relative z-10 p-8 sm:p-10 max-w-2xl">

            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-300">
              Built for developers
            </p>

            <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight mt-3">
              Think. Code. Run. Improve.
            </h2>

            <p className="text-sm text-gray-300 leading-relaxed mt-3 max-w-lg">
              Practice realistic coding problems, run your solutions against
              test cases and receive AI-powered feedback on your approach.
            </p>

            <button
            
              onClick={() =>
                {setPrompt(
                  "Create a realistic 5-question coding assessment"
                )
                setTimeout(() => {
                  promptRef?.current?.scrollIntoView({
                      behaviour:"smooth",
                    block : "center"
                  })
                }, 50);}
              }
              className="mt-6 px-4 py-2.5 rounded-xl bg-white text-gray-900 text-xs font-semibold hover:bg-gray-100 transition cursor-pointer"
            >
              Start practicing →
            </button>

          </div>

        </div>

        {/* BOTTOM CTA */}
      </div>
    </div>
  );
};

export default CodeStart;