
import {
  Zap,
  Sparkles,
  Crown,
} from "lucide-react";

export const PLANS = [
  {
    code: "go",
    label: "Go",
    price: 299,
    credits: 300,
    description: "A great starting point for your workflow.",
    features: [
      "300 credits",
      "Access to essential features",
      "Perfect for getting started",
    ],
    icon: Zap,
    popular: false,
  },
  {
    code: "plus",
    label: "Plus",
    price: 1999,
    credits: 2500,
    description: "More power for regular users.",
    features: [
      "2,500 credits",
      "Access to premium features",
      "Ideal for regular usage",
    ],
    icon: Sparkles,
    popular: true,
  },
  {
    code: "pro",
    label: "Pro",
    price: 10699,
    credits: 15000,
    description: "Maximum credits for intensive usage.",
    features: [
      "15,000 credits",
      "Access to all available features",
      "Designed for heavy usage",
    ],
    icon: Crown,
    popular: false,
  },
];
