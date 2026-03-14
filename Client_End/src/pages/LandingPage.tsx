import { auth } from "@/config/firebase";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, BookOpen, UserPlus, Briefcase, Heart, Info, FileText, Phone, GraduationCap, Shield } from "lucide-react";

export function LandingPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("/auth");
  };

  const footerLinks = [
    { name: 'Applications', icon: BookOpen, path: '/applications' },
    { name: 'Admissions', icon: UserPlus, path: '/contact' },
    { name: 'Placement', icon: Briefcase, path: '#' },
    { name: 'Donate', icon: Heart, path: '#' },
    { name: 'About Us', icon: Info, path: '#' },
    { name: 'Blog', icon: FileText, path: '/blog' },
    { name: 'Contact Us', icon: Phone, path: '/contact' },
    { name: 'Alumni Registration', icon: GraduationCap, path: '#' },
    { name: 'Privacy Policy', icon: Shield, path: '/privacy' },
  ];

  return (
    <div className="flex min-h-screen bg-black text-zinc-100 font-sans selection:bg-orange-500/30">
      {/* Left Side - Image/Theme (Hidden on small screens) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Deep Orange Gradient Overlay for that dramatic contrast */}
        <div className="absolute inset-0 bg-orange-900/30 mix-blend-multiply z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/10 z-10" />

        {/* Aesthetic background image matching the theme */}
        <img
          src="/DSA_building.jpeg"
          alt="Campus"
          className="object-cover w-full h-full scale-105 hover:scale-110 transition-transform duration-10000"
        />

        {/* Left Side Content */}
        <div className="absolute bottom-12 left-12 z-20 max-w-lg">
          <div className="flex items-center gap-4 mb-6 rounded-2xl border border-zinc-200/20 bg-black/45 backdrop-blur-md px-4 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.45)]">
            <div className="relative">
              <div className="absolute -inset-1 rounded-2xl bg-orange-500/30 blur-md" aria-hidden="true" />
              <img
                src="/Logo.png"
                alt="Punjab Engineering College logo"
                className="relative h-14 w-14 rounded-xl border border-orange-300/50 bg-white/10 p-2 object-contain"
              />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-orange-300/90 font-semibold">Institution Portal</p>
              <h1 className="text-2xl font-bold tracking-wide text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.65)]">
                Punjab Engineering College
              </h1>
              <p className="text-sm text-zinc-200/95">Chandigarh</p>
            </div>
          </div>

        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col px-6 sm:px-12 xl:px-24 bg-[#0a0a0a] relative py-12 lg:py-0 overflow-y-auto">

        {/* Top Header - Institution Info */}
        <div className="lg:absolute lg:top-12 lg:right-12 flex flex-col items-center lg:items-end text-center lg:text-right w-full lg:w-auto mb-16 lg:mb-0">
          <div className="flex items-center gap-3 lg:hidden mb-6">
            <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-widest uppercase">
              Omni<span className="text-orange-500">Flow</span>
            </h2>
          </div>
          <h1 className="text-xl sm:text-2xl font-medium text-zinc-200 tracking-wide">
            Punjab Engineering College, Chandigarh
          </h1>
          <h2 className="text-sm sm:text-base text-orange-500/80 mt-1 font-medium tracking-wider uppercase">
            पंजाब इंजीनियरिंग कॉलेज, चंडीगढ़
          </h2>
        </div>

        {/* Central Login Container */}
        <div className="max-w-md w-full mx-auto my-auto mt-0 lg:mt-auto">
          <div className="mb-10 text-center lg:text-left">
            <h3 className="text-3xl font-semibold mb-3 text-white">Welcome Back</h3>
            <p className="text-base text-zinc-400">Please sign in to your account.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-5">
              <div className="space-y-2 flex-1 relative">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] absolute -top-2 left-3 bg-[#0a0a0a] px-2 z-10">Roll No./Email</label>
                <Input
                  type="text"
                  placeholder="Username/Email"
                  className="bg-zinc-900/30 border-zinc-800 text-white placeholder:text-zinc-700/50 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 h-[52px] transition-all rounded-md px-4 relative z-0"
                  required
                />
              </div>
              <div className="space-y-2 flex-1 relative">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] absolute -top-2 left-3 bg-[#0a0a0a] px-2 z-10">Password</label>
                <div className="relative z-0">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="bg-zinc-900/30 border-zinc-800 text-white placeholder:text-zinc-700/50 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 h-[52px] pr-12 transition-all rounded-md px-4"
                    required
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
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-zinc-900 mt-8">

              {/* Social Logins */}
              <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-start">
                <span className="text-[11px] text-zinc-500 font-medium whitespace-nowrap uppercase tracking-wider">Sign in with:</span>
                <div className="flex gap-2">
                  {[
                    // Google
                    <svg key="google" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-1.53 4.8-5.16 4.8-3.12 0-5.65-2.61-5.65-5.84s2.53-5.84 5.65-5.84c1.76 0 3.2 1.39 3.2 1.39l2.48-2.52s-2.02-2.11-5.68-2.11C8.24 4.08 4 8.16 4 12.5s4.24 8.42 9.08 8.42c5.24 0 8.84-3.69 8.84-8.98 0-.82-.08-1.5-.08-1.5h-9.36z" /></svg>,
                    // LinkedIn
                    <svg key="linkedin" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>,
                    // Microsoft
                    <svg key="microsoft" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zm12.6 0H12.6V0H24v11.4z" /></svg>,
                  ].map((icon, i) => (
                    <button type="button" key={i} className="w-8 h-8 flex items-center justify-center bg-zinc-900/50 rounded-full border border-zinc-800 text-zinc-400 hover:text-orange-500 hover:border-orange-500/50 hover:bg-orange-500/10 transition-all">
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 w-full sm:w-auto flex-col sm:flex-row ml-auto">
                <Button type="button" variant="ghost" className="text-zinc-500 hover:text-white hover:bg-zinc-900/50 h-[42px] px-4 text-xs w-full sm:w-auto font-medium transition-colors">
                  Recover Password
                </Button>
                <Button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white h-[42px] px-8 text-xs font-bold tracking-wider w-full sm:w-auto shadow-[0_0_15px_rgba(234,88,12,0.2)] hover:shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all uppercase">
                  Login to PEC App
                </Button>
              </div>
            </div>
          </form>

          {/* Footer Links (PEC APP Style) */}
          <div className="mt-16 pt-8 border-t border-zinc-900">
            <div className="flex flex-wrap justify-center lg:justify-start gap-2">
              {footerLinks.map((item, i) => (
                <Link
                  key={i}
                  to={item.path}
                  className="group px-3 py-1.5 rounded-sm bg-zinc-900/30 border border-zinc-800/50 text-zinc-500 hover:text-orange-400 hover:border-orange-500/30 hover:bg-orange-500/5 transition-all flex items-center gap-1.5 text-[10px] font-medium tracking-wide uppercase"
                >
                  <item.icon className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                  {item.name}
                </Link>
              ))}

              {/* Special Link */}
              <Link
                to="#"
                className="px-3 py-1.5 rounded-sm bg-[#0a0a0a] border border-zinc-800 flex items-center justify-center hover:border-zinc-600 transition-colors"
                title="Special Integration"
              >
                <svg viewBox="0 0 24 24" fill="none" className="w-3 h-3 text-zinc-500" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom copyright/version */}
        <div className="lg:absolute lg:bottom-10 lg:right-12 mt-16 lg:mt-0 text-center lg:text-right">
          <p className="text-[9px] text-zinc-600 tracking-[0.2em] font-medium uppercase mb-1">PEC App Platform</p>

        </div>
      </div>
    </div>
  );
}

export default LandingPage;
