import { GitHubLogoIcon, LinkedInLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons";
import { Sparkles, Mail,    ArrowRight, MessageCircle, BookOpen, Shield, X } from "lucide-react";
import { FaXTwitter } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
const Footer = () => {
  const navigate = useNavigate();

  const links = {
    Product: [
      { label: "Start Interview", path: "/startInterview" },
      { label: "Interview Modes", path: "/#interview-mode" },
      { label: "AI Capabilities", path: "/#ai-capabilities",  },
      { label: "View History", path: "/history" },
      { label: "Pricing", path: "/pricing" },
    ],
    Resources: [
      { label: "How it works", path: "/#how-it-works"},
      { label: "Interview Tips", path: "/tips" },
      { label: "Resume Guide", path: "/resume-guide" },
      { label: "Blog", path: "/blog" },
      { label: "FAQ", path: "/faq" },
    ],
    Company: [
      { label: "About Us", path: "/about" },
      { label: "Careers", path: "/careers" },
      { label: "Contact", path: "/contact" },
      { label: "Privacy Policy", path: "/privacy-policy" },
      { label: "Terms of Service", path: "/terms" },
    ],
  };

  const socials = [
    { icon: <FaXTwitter size={16} />, href: "#", label: "Twitter" },
    { icon: <LinkedInLogoIcon size={16} />, href: "#", label: "LinkedIn" },
    { icon: <GitHubLogoIcon size={16} />, href: "#", label: "GitHub" },
    { icon: <Mail size={16} />, href: "mailto:hello@interviewprep.ai", label: "Email" },
  ];

  const badges = [
    { icon: <Shield size={13} />, text: "SOC 2 Compliant" },
    { icon: <MessageCircle size={13} />, text: "AI Powered" },
    { icon: <BookOpen size={13} />, text: "10k+ Users" },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-20">

      {/* ── CTA BANNER ── */}
      <div className="border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-white text-xl md:text-2xl font-bold mb-1">
              Ready to ace your next interview?
            </h3>
            <p className="text-gray-400 text-sm">
              Join thousands of job seekers practicing smarter with AI.
            </p>
          </div>
          <button
            onClick={() => navigate("/startInterview")}
            className="flex items-center gap-2 bg-green-500 hover:bg-green-400 text-white font-semibold px-6 py-3 rounded-full text-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Start for free <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* ── MAIN FOOTER ── */}
      <div className="max-w-6xl mx-auto px-4 py-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

        {/* Brand col */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <Sparkles size={16} color="white" fill="white" />
            </div>
            <span className="text-white font-bold text-lg tracking-tight">Interview.Prep</span>
          </div>

          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            AI-powered interview practice tailored to your role, experience, and industry. Get better with every session.
          </p>

          {/* Trust badges */}
          <div className="flex flex-wrap gap-2">
            {badges.map((b, i) => (
              <span
                key={i}
                className="flex items-center gap-1.5 text-xs text-gray-400 bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-full"
              >
                <span className="text-green-400">{b.icon}</span>
                {b.text}
              </span>
            ))}
          </div>

          {/* Socials */}
          <div className="flex items-center gap-2 mt-1">
            {socials.map((s, i) => (
              <a
                key={i}
                href={s.href}
                aria-label={s.label}
                className="w-8 h-8 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(links).map(([heading, items]) => (
          <div key={heading} className="flex flex-col gap-4">
            <h4 className="text-white text-xs font-semibold tracking-widest uppercase">{heading}</h4>
            <ul className="flex flex-col gap-2.5">
              {items.map((item, i) => (
  <li key={i}>
    <a
      href={item.path}
      className="text-gray-400 hover:text-green-400 text-sm transition-colors"
    >
      {item.label}
    </a>
  </li>
))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-white text-sm font-medium">Get interview tips in your inbox</p>
            <p className="text-gray-500 text-xs mt-0.5">Weekly tips, no spam. Unsubscribe anytime.</p>
          </div>
          <div className="flex w-full sm:w-auto gap-2">
            <input
              type="email"
              placeholder="you@email.com"
              className="flex-1 sm:w-56 bg-gray-800 border border-gray-700 text-sm text-gray-200 placeholder-gray-500 px-4 py-2.5 rounded-full outline-none focus:border-green-500 transition-colors"
            />
            <button className="bg-green-500 hover:bg-green-400 text-white text-sm font-medium px-5 py-2.5 rounded-full transition-colors whitespace-nowrap">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* ── BOTTOM BAR ── */}
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {new Date().getFullYear()} Interview.Prep. All rights reserved.</p>
          <div className="flex items-center gap-4">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map((label, i) => (
              <button key={i} className="hover:text-gray-300 transition-colors">
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

    </footer>
  );
};

export default Footer;