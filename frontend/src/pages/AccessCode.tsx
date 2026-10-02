import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/auth";
import { 
  Lock, Unlock, Eye, EyeOff, Sparkles, CheckCircle2, 
  Calendar, Target, BrainCircuit, ArrowRight, Clock, ChevronRight,
  Code2, BarChart3, LayoutGrid, CheckSquare, Layers, Shield
} from "lucide-react";

export default function AccessCode() {
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isShaking, setIsShaking] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { unlock } = useAuth();
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError("Please enter your access code.");
      triggerShake();
      return;
    }
    
    if (unlock(code)) {
      setIsUnlocking(true);
      setTimeout(() => navigate("/", { replace: true }), 1000);
    } else {
      setError("Incorrect access code.");
      triggerShake();
    }
  };

  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  return (
    <div className="relative min-h-screen bg-[#050714] text-white overflow-hidden font-sans selection:bg-cyan-500/30 flex flex-col">
      
      {/* --- BACKGROUND --- */}
      <div className="absolute inset-0 z-0 overflow-hidden bg-[#050714]">
        <div className="absolute inset-0 bg-[url('/bg-personal.jpg')] bg-cover bg-center bg-no-repeat blur-[3px] scale-[1.03] transition-all duration-1000" />
        {/* Layered Gradients for readability and mood - Lightened so image is visible */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#050714]/90 via-[#050714]/50 to-[#050714]/30" />
        <div className="absolute inset-0 bg-[#050714]/20" /> {/* Subtle overall darkening for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/10 to-purple-900/10 mix-blend-overlay" />
      </div>

      {/* --- TOP NAVIGATION --- */}
      <nav className={`relative z-20 flex items-center justify-between px-8 py-6 lg:px-16 transition-all duration-1000 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center overflow-hidden">
              <img src="/custom-logo.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">My Workspace</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-400">
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Plan</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Track</span>
            <span className="w-1 h-1 rounded-full bg-gray-700" />
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">Achieve</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-bold tracking-widest text-gray-300 uppercase">Private Workspace</span>
        </div>
      </nav>

      {/* --- MAIN LAYOUT --- */}
      <main className="relative z-10 flex-1 flex flex-col lg:flex-row w-full max-w-[1800px] mx-auto pb-24">
        
        {/* LEFT SIDE: HERO */}
        <div className={`hidden lg:flex flex-col justify-center px-12 xl:px-20 w-[40%] transition-all duration-1000 delay-100 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-12'}`}>
          <div className="relative z-20">
            <h1 className="text-5xl xl:text-[64px] font-bold tracking-tight leading-[1.1] mb-6">
              Your Work.<br />
              Your Focus.<br />
              <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Your System.</span>
            </h1>
            <p className="text-lg text-gray-400 leading-relaxed max-w-sm">
              Organize your studies, projects, deadlines, events and daily priorities in one focused workspace.
            </p>
          </div>
        </div>

        {/* MIDDLE: FLOATING UI ELEMENTS (Absolute positioned over the center) */}
        <div className="absolute inset-0 pointer-events-none z-10 hidden lg:block overflow-hidden">
          
          {/* 3 Deadlines */}
          <div className="absolute top-[18%] left-[32%] xl:left-[35%] backdrop-blur-xl bg-[#0F172A]/60 border border-white/10 px-4 py-3 rounded-2xl flex items-center gap-4 shadow-2xl animate-[float_6s_ease-in-out_infinite]">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">3 Deadlines</p>
              <p className="text-[11px] text-gray-400">This Week</p>
            </div>
          </div>

          {/* Focus 82% */}
          <div className="absolute top-[22%] left-[48%] xl:left-[50%] backdrop-blur-xl bg-[#0F172A]/60 border border-white/10 px-5 py-3 rounded-full flex items-center gap-3 shadow-2xl animate-[float_5s_ease-in-out_infinite_1s]">
            <Target className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">Focus 82%</span>
            <div className="w-16 h-1.5 bg-white/10 rounded-full ml-2 overflow-hidden">
              <div className="h-full bg-cyan-400 w-[82%]" />
            </div>
          </div>

          {/* Today's Priority */}
          <div className="absolute top-[38%] left-[28%] xl:left-[32%] backdrop-blur-xl bg-[#0F172A]/80 border border-white/10 p-5 rounded-3xl w-72 shadow-2xl animate-[float_7s_ease-in-out_infinite_0.5s]">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <span className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">Today's Priority</span>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0 border border-blue-500/30">
                <CheckCircle2 className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1 leading-tight">Complete DBMS Assignment</h3>
                <div className="flex items-center gap-3">
                  <span className="flex items-center text-[10px] text-gray-400"><Clock className="w-3 h-3 mr-1" /> Due Today</span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/20">HIGH PRIORITY</span>
                </div>
              </div>
            </div>
          </div>

          {/* Project Progress */}
          <div className="absolute top-[52%] left-[45%] xl:left-[48%] backdrop-blur-xl bg-[#0F172A]/80 border border-white/10 p-5 rounded-3xl w-72 shadow-2xl animate-[float_8s_ease-in-out_infinite_1.5s]">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center shrink-0">
                <Code2 className="w-5 h-5 text-indigo-400" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-gray-400 mb-0.5">Project Progress</p>
                <h3 className="text-sm font-semibold text-white">Civic Bridge</h3>
              </div>
              <span className="text-xs font-bold text-indigo-400">78%</span>
            </div>
            <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 w-[78%]" />
            </div>
          </div>

          {/* Upcoming Event */}
          <div className="absolute bottom-[25%] left-[25%] xl:left-[30%] backdrop-blur-xl bg-[#0F172A]/80 border border-white/10 px-5 py-4 rounded-2xl flex items-center gap-4 shadow-2xl animate-[float_6s_ease-in-out_infinite_2s]">
            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex flex-col items-center justify-center border border-purple-500/30">
              <span className="text-[9px] font-bold text-purple-300 uppercase">Oct</span>
              <span className="text-sm font-bold text-white">24</span>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Upcoming Event</p>
              <h3 className="text-sm font-semibold text-white">Hackathon Submission</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Tomorrow • 6:30 PM</p>
            </div>
            <ChevronRight className="w-4 h-4 text-gray-600 ml-2" />
          </div>

          {/* AI Insights */}
          <div className="absolute bottom-[20%] left-[45%] xl:left-[48%] backdrop-blur-xl bg-[#0F172A]/70 border border-white/10 px-5 py-3 rounded-2xl flex items-center gap-4 shadow-2xl animate-[float_7s_ease-in-out_infinite_0.5s]">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
              <BrainCircuit className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">AI Insights</p>
              <p className="text-[11px] text-gray-400">Better decisions, faster.</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: ACCESS PANEL */}
        <div className={`flex-1 flex items-center justify-center lg:justify-end px-6 lg:px-16 xl:px-32 w-full transition-all duration-1000 delay-300 ${mounted ? 'opacity-100 translate-y-0 lg:translate-x-0' : 'opacity-0 translate-y-12 lg:translate-x-12 lg:translate-y-0'} ${isUnlocking ? 'scale-[1.03] opacity-0' : ''}`}>
          
          <div className={`relative w-full max-w-[440px] ${isShaking ? "animate-[shake_0.5s_cubic-bezier(.36,.07,.19,.97)_both]" : ""}`}>
            {/* Panel Backglow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/40 via-blue-500/40 to-purple-600/40 rounded-[2.5rem] blur-2xl opacity-50 transition duration-1000"></div>
            
            {/* Glass Panel */}
            <div className="relative backdrop-blur-3xl bg-[#0B1121]/60 border border-white/10 rounded-[2.5rem] p-10 sm:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
              
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 mb-6 shadow-inner relative overflow-hidden group">
                  <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition duration-500" />
                  {isUnlocking ? (
                    <Unlock className="w-7 h-7 text-white animate-bounce" />
                  ) : (
                    <Lock className="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-500" />
                  )}
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3">Welcome Back</h2>
                <p className="text-gray-400 text-sm leading-relaxed mb-10 px-4">
                  Enter your access code to unlock your workspace.
                </p>

                <form onSubmit={handleSubmit} className="w-full space-y-6 text-left">
                  <div>
                    <label htmlFor="code" className="block text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      Access Code
                    </label>
                    <div className="relative group/input">
                      <input
                        id="code"
                        type={showPassword ? "text" : "password"}
                        value={code}
                        onChange={(e) => {
                          setCode(e.target.value);
                          if (error) setError("");
                        }}
                        className={`block w-full bg-[#050714]/80 border ${
                          error ? "border-red-500/50" : "border-white/10 group-hover/input:border-white/20 focus:border-cyan-500/50"
                        } text-white rounded-2xl px-5 py-4 pl-5 pr-12 focus:outline-none focus:ring-0 placeholder-gray-600 font-medium tracking-wide transition-all duration-300 shadow-inner`}
                        placeholder="••••••••"
                        disabled={isUnlocking}
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-2 px-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors disabled:opacity-50"
                        disabled={isUnlocking}
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-3 px-1">
                      <div className="flex items-center text-xs text-gray-500">
                        <Shield className="w-3.5 h-3.5 mr-1.5 opacity-70" />
                        Case sensitive · 8 characters
                      </div>
                    </div>

                    {/* Error container */}
                    <div className={`overflow-hidden transition-all duration-300 ease-out flex justify-center ${error ? "max-h-12 opacity-100 mt-4" : "max-h-0 opacity-0"}`}>
                      <p className="text-[13px] font-medium text-red-400 bg-red-400/10 px-4 py-2 rounded-full inline-flex items-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-400 mr-2 animate-pulse" />
                        {error}
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isUnlocking}
                    className="w-full relative group/btn overflow-hidden rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 p-[1px] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-80 disabled:hover:scale-100"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 opacity-20 blur-md group-hover/btn:opacity-60 transition duration-500" />
                    <div className="relative w-full h-full bg-gradient-to-r from-cyan-500 to-purple-600 rounded-2xl flex items-center justify-center py-4 px-6 text-white font-semibold text-[15px] shadow-lg">
                      {isUnlocking ? (
                        <>
                          <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
                          <span>Unlocking...</span>
                        </>
                      ) : (
                        <>
                          <span>Unlock Workspace</span>
                          <ArrowRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1.5 transition-transform duration-300" />
                        </>
                      )}
                    </div>
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* --- BOTTOM NAVIGATION --- */}
      <div className={`absolute bottom-0 inset-x-0 z-30 pb-8 px-12 lg:px-24 hidden md:flex items-end justify-between transition-all duration-1000 delay-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-12">
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-cyan-500/20 group-hover:border-cyan-500/30 transition-all duration-300">
              <CheckSquare className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-white mb-0.5">Tasks</p>
              <p className="text-[9px] text-gray-500">Stay on track</p>
            </div>
          </div>
          
          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-blue-500/20 group-hover:border-blue-500/30 transition-all duration-300">
              <Layers className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-white mb-0.5">Projects</p>
              <p className="text-[9px] text-gray-500">Build your dreams</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-indigo-500/20 group-hover:border-indigo-500/30 transition-all duration-300">
              <Calendar className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-white mb-0.5">Calendar</p>
              <p className="text-[9px] text-gray-500">Never miss a thing</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-purple-500/20 group-hover:border-purple-500/30 transition-all duration-300">
              <BarChart3 className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-white mb-0.5">Analytics</p>
              <p className="text-[9px] text-gray-500">See your progress</p>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-pink-500/20 group-hover:border-pink-500/30 transition-all duration-300">
              <LayoutGrid className="w-4 h-4 text-pink-400" />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold text-white mb-0.5">More</p>
              <p className="text-[9px] text-gray-500">And much more</p>
            </div>
          </div>
        </div>

        <div className="text-right pb-4">
          <p className="font-['Dancing_Script',cursive] text-2xl text-white/40 -rotate-3 hover:text-white/80 transition-colors cursor-default">
            Small steps<br/>Big dreams
          </p>
        </div>
      </div>

      {/* --- STYLES --- */}
      <style dangerouslySetInnerHTML={{__html: `
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        
        .font-sans {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes shake {
          10%, 90% { transform: translate3d(-1px, 0, 0); }
          20%, 80% { transform: translate3d(2px, 0, 0); }
          30%, 50%, 70% { transform: translate3d(-4px, 0, 0); }
          40%, 60% { transform: translate3d(4px, 0, 0); }
        }
      `}} />
    </div>
  );
}
