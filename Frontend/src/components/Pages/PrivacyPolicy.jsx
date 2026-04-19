import {
  Shield,
  Lock,
  Eye,
  Database,
  UserCheck,
  Bell,
  Mail,
  ArrowLeft,
  ChevronRight,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const sections = [
  {
    id: "information-we-collect",
    icon: <Database size={18} />,
    title: "Information we collect",
    content: [
      {
        subtitle: "Account information",
        text: "When you create an account, we collect your name, email address, and password. If you sign up via Google or LinkedIn OAuth, we receive your public profile information from those providers.",
      },
      {
        subtitle: "Resume data",
        text: "If you upload a resume, we store it securely to generate personalized interview questions. You can delete your resume from your account settings at any time.",
      },
      {
        subtitle: "Interview session data",
        text: "We store your responses, scores, feedback, and session metadata (duration, mode, role) to power your performance history and adaptive learning.",
      },
      {
        subtitle: "Voice and audio",
        text: "In voice-based interview modes, audio is processed in real time to generate feedback. We do not permanently store raw audio recordings unless you explicitly enable session replay.",
      },
      {
        subtitle: "Usage data",
        text: "We automatically collect device type, browser, IP address, pages visited, and feature interactions to improve the platform and fix issues.",
      },
    ],
  },
  {
    id: "how-we-use",
    icon: <Eye size={18} />,
    title: "How we use your information",
    content: [
      {
        subtitle: "Delivering the service",
        text: "We use your data to generate role-specific questions, analyze your answers, compute scores, and provide personalized feedback across sessions.",
      },
      {
        subtitle: "Improving the platform",
        text: "Aggregated and anonymized usage data helps us train better AI models, identify bugs, and prioritize new features.",
      },
      {
        subtitle: "Communications",
        text: "We may send you product updates, interview tips, and account notifications. You can opt out of marketing emails at any time.",
      },
      {
        subtitle: "Security and fraud prevention",
        text: "We use collected data to detect suspicious activity, enforce our Terms of Service, and protect our users.",
      },
    ],
  },
  {
    id: "data-sharing",
    icon: <UserCheck size={18} />,
    title: "How we share your data",
    content: [
      {
        subtitle: "We do not sell your data",
        text: "Interview.Prep does not sell, rent, or trade your personal information to third parties for marketing purposes. Ever.",
      },
      {
        subtitle: "AI model providers",
        text: "Your interview responses are sent to our AI partners (such as Anthropic) solely to generate feedback. These providers are contractually prohibited from using your data to train their models.",
      },
      {
        subtitle: "Infrastructure providers",
        text: "We use trusted cloud providers for hosting, storage, and analytics. All providers are bound by data processing agreements and industry-standard security requirements.",
      },
      {
        subtitle: "Legal requirements",
        text: "We may disclose your information if required by law, court order, or to protect the rights and safety of our users or the public.",
      },
    ],
  },
  {
    id: "data-storage",
    icon: <Lock size={18} />,
    title: "Data storage and security",
    content: [
      {
        subtitle: "Encryption",
        text: "All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Passwords are hashed using bcrypt and never stored in plain text.",
      },
      {
        subtitle: "Access controls",
        text: "Access to production data is strictly limited to authorized personnel on a need-to-know basis. All access is logged and audited.",
      },
      {
        subtitle: "Data retention",
        text: "We retain your account data for as long as your account is active. Interview session data is kept for 12 months by default. You can request earlier deletion at any time.",
      },
      {
        subtitle: "Breach notification",
        text: "In the unlikely event of a data breach affecting your personal information, we will notify you within 72 hours in compliance with applicable law.",
      },
    ],
  },
  {
    id: "your-rights",
    icon: <UserCheck size={18} />,
    title: "Your rights and choices",
    content: [
      {
        subtitle: "Access and portability",
        text: "You can request a full export of your personal data, including interview history, scores, and feedback, from your account settings.",
      },
      {
        subtitle: "Correction",
        text: "You can update your name, email, and profile information directly in your account settings at any time.",
      },
      {
        subtitle: "Deletion",
        text: "You can delete your account and all associated data permanently from Settings → Account → Delete Account. Deletion is irreversible and processed within 30 days.",
      },
      {
        subtitle: "Opt-out",
        text: "You can unsubscribe from marketing emails via the link in any email, or from your notification preferences in settings.",
      },
      {
        subtitle: "GDPR and CCPA",
        text: "If you are located in the EU or California, you have additional rights including the right to object to processing and lodge complaints with your local supervisory authority.",
      },
    ],
  },
  {
    id: "cookies",
    icon: <Bell size={18} />,
    title: "Cookies and tracking",
    content: [
      {
        subtitle: "Essential cookies",
        text: "We use cookies that are strictly necessary for authentication, session management, and security. These cannot be disabled.",
      },
      {
        subtitle: "Analytics cookies",
        text: "With your consent, we use analytics cookies to understand how users interact with our platform. You can withdraw consent at any time via our cookie banner.",
      },
      {
        subtitle: "No ad tracking",
        text: "We do not use third-party advertising cookies or cross-site tracking.",
      },
    ],
  },
  {
    id: "contact",
    icon: <Mail size={18} />,
    title: "Contact us",
    content: [
      {
        subtitle: "Privacy inquiries",
        text: "Contact our Privacy Team at privacy@interviewprep.ai.",
      },
    ],
  },
];

const PrivacyPolicy = () => {
  const navigate = useNavigate();
  const lastUpdated = "April 1, 2026";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <div className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-5 flex justify-between">
          <button onClick={() => navigate("/")} className="flex gap-2 text-sm">
            <ArrowLeft size={16} /> Back
          </button>

          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 bg-green-500 rounded flex items-center justify-center">
              <Shield size={14} color="white" />
            </div>
            <span className="font-bold text-sm">Interview.Prep</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-[250px_1fr] gap-10">
        {/* SIDEBAR */}
        <aside className="hidden lg:block">
          <nav className="flex flex-col gap-2">
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="text-sm">
                <ChevronRight size={12} /> {s.title}
              </a>
            ))}
          </nav>

          <div className="mt-6">
            <a href="mailto:privacy@interviewprep.ai" className="text-xs underline">
              privacy@interviewprep.ai
            </a>
          </div>
        </aside>

        {/* MAIN */}
        <main>
          <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-6">
            Last updated: {lastUpdated}
          </p>

          {sections.map((section) => (
            <section key={section.id} id={section.id} className="mb-8">
              <h2 className="font-bold mb-3">{section.title}</h2>

              {section.content.map((item, i) => (
                <div key={i} className="mb-3">
                  <p className="font-semibold text-sm">{item.subtitle}</p>
                  <p className="text-sm text-gray-600">{item.text}</p>
                </div>
              ))}
            </section>
          ))}

          <button
            onClick={() => navigate("/contact")}
            className="mt-6 bg-green-500 text-white px-4 py-2 rounded flex items-center gap-2"
          >
            Contact <ArrowRight size={14} />
          </button>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;