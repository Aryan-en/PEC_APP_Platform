import { auth } from "@/config/firebase";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Eye, EyeOff, Menu, X, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export function ApplicationsPortal() {
  const [showPassword, setShowPassword] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    programType: "",
    password: "",
  });

  const programTypes = [
    { id: "btech", label: "B.Tech - Computer Science" },
    { id: "btech-me", label: "B.Tech - Mechanical Engineering" },
    { id: "btech-ce", label: "B.Tech - Civil Engineering" },
    { id: "btech-ee", label: "B.Tech - Electrical Engineering" },
    { id: "mtech", label: "M.Tech - Computer Science" },
    { id: "mtech-others", label: "M.Tech - Other Specializations" },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.programType || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }
    // Navigate to applications dashboard
    navigate("/auth");
  };

  const navigationLinks = [
    { label: "Home", onClick: () => navigate("/") },
    { label: "About PEC", onClick: () => navigate("/about") },
    { label: "Programs", onClick: () => toast.info("Programs information coming soon") },
    { label: "Admissions", onClick: () => toast.info("Admissions information coming soon") },
    { label: "Contact", onClick: () => navigate("/contact") },
  ];

  return (
    <div className="flex min-h-screen bg-black text-zinc-100 font-sans selection:bg-orange-500/30">
      {/* Left Side - Navigation & Info (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col">
        {/* Deep Orange Gradient Overlay */}
        <div className="absolute inset-0 bg-orange-900/20 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/10 z-10" />

        {/* Background Image Removed */}

        {/* Plain content area */}
        <div className="relative z-20 flex flex-col h-full justify-between p-12">
          {/* Top Header */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-orange-500/30 blur-md" aria-hidden="true" />
              <img
                src="/Logo.png"
                alt="PEC Logo"
                className="relative h-14 w-14 rounded-xl border border-orange-300/50 bg-white/10 p-2 object-contain"
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-orange-300/90 font-semibold">
                Applications Portal
              </p>
              <h1 className="text-2xl font-bold tracking-wide text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">
                PEC App
              </h1>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="space-y-4">
            <h3 className="text-sm uppercase tracking-widest text-orange-300/80 font-semibold mb-4">
              Quick Navigation
            </h3>
            {navigationLinks.map((link, idx) => (
              <button
                key={idx}
                onClick={link.onClick}
                className="block text-left w-full px-4 py-2 rounded-lg bg-white/5 border border-zinc-700/30 text-zinc-200 hover:bg-orange-500/20 hover:border-orange-500/50 hover:text-orange-300 transition-all text-sm font-medium"
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Bottom Info */}
          <div className="space-y-3 text-sm">
            <div className="bg-black/40 backdrop-blur border border-orange-500/20 rounded-lg p-4">
              <p className="text-zinc-200 mb-2 font-semibold">Punjab Engineering College</p>
              <p className="text-zinc-400 text-xs leading-relaxed">
                Admission Portal for all Engineering Programs. Apply online to your desired program.
              </p>
            </div>
            <div className="flex gap-2 text-xs text-zinc-500">
              <span>📞 Support: admissions@pec.edu.in</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-12 xl:px-24 bg-[#0a0a0a] relative py-12 lg:py-0 overflow-y-auto">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden absolute top-4 left-4 z-50 p-2 hover:bg-zinc-900 rounded-lg transition-colors"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/80 backdrop-blur-md z-40 flex flex-col p-6 pt-20">
            <nav className="space-y-4">
              {navigationLinks.map((link, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    link.onClick();
                    setMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-zinc-200 hover:bg-orange-500/20 transition-all font-medium"
                >
                  {link.label}
                </button>
              ))}
            </nav>
          </div>
        )}

        {/* Top Header - Institution Info */}
        <div className="lg:absolute lg:top-12 lg:right-12 flex flex-col items-center lg:items-end text-center lg:text-right w-full lg:w-auto mb-16 lg:mb-0 pt-8 lg:pt-0">
          <div className="flex items-center gap-3 lg:hidden mb-6">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6 text-white"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">
              PEC <span className="text-orange-500">App</span>
            </h2>
          </div>
         

        </div>

        {/* Central Login Container */}
        <div className="max-w-md w-full mx-auto my-auto mt-0 lg:mt-auto">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-semibold mb-3 text-white">Applications</h3>
            <p className="text-base text-zinc-400">Enter your credentials to access your application.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2 relative">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] absolute -top-2 left-3 bg-[#0a0a0a] px-2 z-10">
                Email/Roll No.
              </label>
              <Input
                type="text"
                placeholder="your.email@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="bg-zinc-900/30 border-zinc-800 text-white placeholder:text-zinc-700/50 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 h-[52px] transition-all rounded-md px-4"
              />
            </div>

            {/* Program Type Field */}
            <div className="space-y-2 relative">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] absolute -top-2 left-3 bg-[#0a0a0a] px-2 z-10">
                Program Type
              </label>
              <Select value={formData.programType} onValueChange={(value) => setFormData({ ...formData, programType: value })}>
                <SelectTrigger className="bg-zinc-900/30 border-zinc-800 text-white h-[52px] rounded-md">
                  <SelectValue placeholder="Select your program" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-800">
                  {programTypes.map((program) => (
                    <SelectItem key={program.id} value={program.id} className="text-white">
                      {program.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Password Field */}
            <div className="space-y-2 relative">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] absolute -top-2 left-3 bg-[#0a0a0a] px-2 z-10">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-zinc-900/30 border-zinc-800 text-white placeholder:text-zinc-700/50 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 h-[52px] pr-12 transition-all rounded-md px-4"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 top-0 bottom-0 px-4 text-zinc-600 hover:text-orange-500 transition-colors flex items-center justify-center focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* ReCAPTCHA */}
            <div className="flex items-center gap-3 p-4 border border-zinc-800 rounded-lg bg-zinc-900/20">
              <input
                type="checkbox"
                id="recaptcha"
                className="w-5 h-5 rounded border-zinc-700 accent-orange-500 cursor-pointer"
              />
              <label htmlFor="recaptcha" className="text-sm text-zinc-400 cursor-pointer flex-grow">
                I'm not a robot
              </label>
              <span className="text-[10px] text-zinc-600">reCAPTCHA</span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-zinc-900 mt-8">
              <Button
                type="submit"
                className="flex-1 bg-orange-600 hover:bg-orange-500 text-white h-[42px] px-8 text-sm font-bold tracking-wider shadow-[0_0_15px_rgba(234,88,12,0.2)] hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all uppercase"
              >
                Login
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="text-zinc-500 hover:text-white hover:bg-zinc-900/50 h-[42px] px-4 text-sm w-full sm:w-auto font-medium transition-colors"
                onClick={() => navigate("/auth")}
              >
                New Application
              </Button>
            </div>
          </form>

          {/* Additional Links */}
          <div className="mt-8 pt-8 border-t border-zinc-900 space-y-3">
            <Link
              to="#"
              className="block text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              ← Forgot Password?
            </Link>
            <Link
              to="#"
              className="block text-sm text-orange-400 hover:text-orange-300 font-medium transition-colors"
            >
              Create New Application →
            </Link>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="lg:absolute lg:bottom-10 lg:right-12 mt-16 lg:mt-0 text-center lg:text-right space-y-2">
          <p className="text-[9px] text-zinc-600 tracking-[0.2em] font-medium uppercase">
            PEC App v2.4.0
          </p>
          <p className="text-[9px] text-zinc-700 tracking-wider">
            © 2026 Punjab Engineering College
          </p>
        </div>
      </div>
    </div>
  );
}

export default ApplicationsPortal;
