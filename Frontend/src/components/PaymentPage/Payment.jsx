import React, { useState } from "react";
import {
  X,
  ArrowLeft,
  Check,
  Sparkles,
  Zap,
  Crown,
  ShieldCheck,
  CreditCard,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState("Plus");

  const plans = [
    {
      label: "Go",
      price: 299,
      description: "For everyday conversations",
      icon: Zap,
      features: [
        "Expanded chat access",
        "More messages and uploads",
        "Access to useful AI tools",
        "Everyday productivity",
      ],
    },
    {
      label: "Plus",
      price: 1999,
      description: "For serious learners and creators",
      icon: Sparkles,
      features: [
        "Everything in Go",
        "Higher usage limits",
        "Advanced AI capabilities",
        "More room for complex tasks",
        "Enhanced productivity tools",
      ],
      popular: true,
    },
    {
      label: "Pro",
      price: 10699,
      description: "For intensive professional work",
      icon: Crown,
      features: [
        "Everything in Plus",
        "Higher usage allowances",
        "Advanced features",
        "Complex project support",
        "Demanding workflow support",
      ],
    },
  ];

  const activePlan = plans.find(
    (plan) => plan.label === selectedPlan
  );

  return (
    <div className="min-h-screen bg-[#F0EBE3] text-[#292821]">
      {/* Header */}
      <header className="flex items-center justify-between px-5 py-5 sm:px-10">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-full border border-[#D9D0C3] bg-white/70 px-4 py-2.5 text-sm font-medium transition hover:bg-white"
        >
          <ArrowLeft size={17} />
          Back
        </button>

        <button
          onClick={() => navigate("/")}
          aria-label="Close payment page"
          className="rounded-full border border-[#D9D0C3] bg-white/70 p-2.5 transition hover:bg-white"
        >
          <X size={20} />
        </button>
      </header>

      <main className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12">
        {/* Heading */}
        <div className="mx-auto mb-12 max-w-3xl text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-green-700">
            <Sparkles size={16} />
            Upgrade your experience
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            More possibilities.
            <span className="mt-2 block text-red-600">
              Fewer limits.
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-[#777166] sm:text-lg">
            Choose a plan that fits your workflow. Get more room
            to learn, build, explore, and create.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-6 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isSelected = selectedPlan === plan.label;

            return (
              <article
                key={plan.label}
                onClick={() => setSelectedPlan(plan.label)}
                className={`relative flex cursor-pointer flex-col rounded-3xl border p-6 transition duration-300 sm:p-7 ${
                  plan.popular
                    ? "border-indigo-500 bg-white shadow-xl shadow-indigo-900/10 xl:-translate-y-3"
                    : "border-[#DED6CA] bg-white/65 hover:-translate-y-1 hover:border-indigo-300 hover:bg-white"
                } ${
                  isSelected
                    ? "ring-2 ring-indigo-500/30"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-md">
                    MOST POPULAR
                  </div>
                )}

                <div className="mb-6 flex items-center justify-between">
                  <div
                    className={`rounded-2xl p-3 ${
                      plan.popular
                        ? "bg-indigo-100 text-indigo-700"
                        : "bg-[#F0EBE3] text-[#49443B]"
                    }`}
                  >
                    <Icon size={23} />
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isSelected
                        ? "bg-indigo-50 text-indigo-700"
                        : "bg-[#F0EBE3] text-[#777166]"
                    }`}
                  >
                    {isSelected ? "Selected" : "Monthly plan"}
                  </span>
                </div>

                <h2 className="text-2xl font-bold">{plan.label}</h2>

                <p className="mt-2 min-h-10 text-sm leading-6 text-[#777166]">
                  {plan.description}
                </p>

                <div className="mb-6 mt-5 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    ₹{plan.price.toLocaleString("en-IN")}
                  </span>
                  <span className="text-sm text-[#898276]">
                    / month
                  </span>
                </div>

                <div className="mb-6 h-px bg-[#EAE3D9]" />

                <p className="mb-4 text-sm font-semibold">
                  What's included
                </p>

                <ul className="mb-8 flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm leading-5 text-[#625D53]"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check size={13} strokeWidth={2.5} />
                      </span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    setSelectedPlan(plan.label);
                  }}
                  className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-sm font-semibold transition ${
                    plan.popular
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/15 hover:bg-indigo-700"
                      : "border border-[#DCD4C8] bg-[#F8F5F0] hover:border-indigo-300 hover:bg-indigo-50"
                  }`}
                >
                  Choose {plan.label}
                  <ArrowRight size={16} />
                </button>
              </article>
            );
          })}
        </div>

        {/* Checkout Summary */}
        <section className="mx-auto mt-10 flex max-w-6xl flex-col gap-5 rounded-2xl border border-[#DED6CA] bg-white/75 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-indigo-50 p-3 text-indigo-700">
              <CreditCard size={22} />
            </div>

            <div>
              <h3 className="font-semibold">
                Continue with {activePlan.label}
              </h3>
              <p className="mt-1 text-sm text-[#777166]">
                ₹{activePlan.price.toLocaleString("en-IN")} / month
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              console.log("Selected plan:", activePlan.label);
            }}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white transition hover:bg-indigo-700"
          >
            Continue to payment
            <ArrowRight size={17} />
          </button>
        </section>

        {/* Footer */}
        <footer className="mt-8 flex flex-col items-center justify-center gap-3 text-center text-xs text-[#898276] sm:flex-row sm:gap-6">
          <span className="flex items-center gap-2">
            <ShieldCheck size={15} />
            Secure checkout
          </span>
          <span>Final pricing and applicable taxes are confirmed at checkout.</span>
        </footer>
      </main>
    </div>
  );
};

export default Payment;
