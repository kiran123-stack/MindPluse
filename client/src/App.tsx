import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import CalmWelcome from './CalmWelcome';
import ReasonSelection from './ReasonSelection';
import Assessment from './Assessment';
import { decryptMessage } from './utils/crypto';
import { Helmet } from 'react-helmet-async';

interface SessionState {
  reason: string;
  userInfo: { name: string; age: string };
  assessmentScore: number;
  assessmentAnswers: { question: string; answer: string }[]; 
}

const App = () => {
  // =========================
  // 🔹 REFS (for animations & DOM control)
  // =========================
  const circleRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);


  // =========================
  // 🔹 GLOBAL SESSION STATE
  // =========================

  const [secretKey, setSecretKey] = useState<string | null>(() => localStorage.getItem('hana_secret_key'));
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);

  const [isStarted, setIsStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const [resumeKey, setResumeKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  // =========================
  // 🔹 SESSION DATA (used before AI starts)
  // =========================

  const navigate = useNavigate();
 const [sessionData, setSessionData] = useState<SessionState>(() => {
    const saved = localStorage.getItem('hana_session_data');
    return saved ? JSON.parse(saved) : {
      reason: '',
      userInfo: { name: '', age: '' },
      assessmentScore: 0,
      assessmentAnswers: [] // NEW
    };
  });
  useEffect(() => {
    localStorage.setItem('hana_session_data', JSON.stringify(sessionData));
  }, [sessionData]);

  // =========================
  // 🔹 HANDLERS
  // =========================

  // Save selected reason and move to assessment
  const handleReasonSelected = (reasonId: string) => {
    setSessionData(prev => ({ ...prev, reason: reasonId }));
    navigate('/assessment');
  };
  // After assessment complete → initialize AI
  const handleAssessmentComplete = (score: number, info: { name: string, age: string }, answers: { question: string; answer: string }[]) => {
    const finalData = { ...sessionData, assessmentScore: score, userInfo: info, assessmentAnswers: answers };
    setSessionData(finalData);
    initializeHana(finalData);
  };


  // =========================
  // 🔹 USER BEHAVIOR METRICS (for AI analysis)
  // =========================
  const metrics = useRef({
    latency: 0,
    backspaces: 0,
    startTime: 0,
    lastKeyTime: 0,
    idleTime: 0,
    sessionStartTime: Date.now() // FIX: ensure proper latency calculation
  });


  // =========================
  // 🔹 EFFECTS
  // =========================

  // Auto start session if key exists
  useEffect(() => {
    if (secretKey) {
      setIsStarted(true);
    }
  }, [secretKey]);


  // Auto scroll chat to bottom

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  // GSAP animations (only for landing screen)
  useEffect(() => {
    if (!isStarted && !isSpeaking) {
      const ctx = gsap.context(() => {
        if (circleRef.current) {
          gsap.to(circleRef.current, {
            rotateY: 360, rotateX: 60, duration: 15, repeat: -1, ease: "none"
          });
        }
        if (coreRef.current) {
          gsap.to(coreRef.current, {
            y: -15, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut"
          });
        }
        if (contentRef.current) {
          gsap.from(contentRef.current, {
            opacity: 0, y: 20, duration: 1, delay: 0.2
          });
        }
      });
      return () => ctx.revert();
    }
  }, [isStarted, isSpeaking]);

  // Smooth scroll using Lenis
  useEffect(() => {
    const lenis = new Lenis();
    let animationFrameId: number;
    function raf(time: number) {
      lenis.raf(time);
      animationFrameId = requestAnimationFrame(raf);
    }
    animationFrameId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(animationFrameId);
      lenis.destroy();
    };
  }, []);

  // =========================
  // 🔹 CORE CHAT FUNCTION
  // =========================

  const sendMessage = async () => {
    if (!inputValue.trim() || !secretKey) return;
    const currentInput = inputValue;
    const currentMetrics = { ...metrics.current };

    // Add user message
    setChatHistory(prev => [...prev, { role: 'user', text: currentInput }]);
    setInputValue("");
    setLoading(true);

    metrics.current = {
      latency: 0,
      backspaces: 0,
      startTime: 0,
      lastKeyTime: 0,
      idleTime: 0,
      sessionStartTime: Date.now()
    };

    try {
      const response = await fetch('https://mindpulse-backend-e9xg.onrender.com/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretKey, message: currentInput, metrics: currentMetrics
        })
      });
      const data = await response.json();
      if (data.isLocked) setIsLocked(true);
      const hanaResponse = data.aiText || data.message || "Hana is silent.";
      setChatHistory(prev => [...prev, { role: 'hana', text: hanaResponse }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'hana', text: "Hana cannot reach the server." }]);
    } finally {
      setLoading(false);
    }
  };

  // Track typing behavior
  const handleTyping = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = Date.now();

    if (metrics.current.startTime === 0) {
      metrics.current.startTime = now;
    }

    if (e.key === 'Backspace') {
      metrics.current.backspaces++;
    }

    if (metrics.current.latency === 0) {
      metrics.current.latency = now - metrics.current.sessionStartTime;
    }

    if (metrics.current.lastKeyTime > 0) {
      const gap = now - metrics.current.lastKeyTime;

      if (gap > 2000) {
        metrics.current.idleTime += gap;
      }
    }

    metrics.current.lastKeyTime = now;

    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  // =========================
  // 🔹 SESSION CONTROL
  // =========================

  const handleResume = async () => {
    if (resumeKey.trim().length < 5) {
      alert("Please enter a valid Secret Key");
      return;
    }
    setLoading(true);
    try {
      const minWait = new Promise(resolve => setTimeout(resolve, 3000));
      const response = await fetch('https://mindpulse-backend-e9xg.onrender.com/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ secretKey: resumeKey.trim() })
      });
      const [data] = await Promise.all([response.json(), minWait]);

      if (data.success) {
        setSecretKey(resumeKey.trim());
        localStorage.setItem('hana_secret_key', resumeKey.trim());
        const formattedHistory = data.history.map((msg: any) => ({
          role: msg.role === 'model' ? 'hana' : 'user',
          // Decrypt each message using the local secretKey
          text: decryptMessage(msg.content, resumeKey.trim())
        }));
        setChatHistory(formattedHistory);


        // setIsSpeaking for welcome message to interact user till backend connect
        setIsSpeaking(true);
      } else {
        alert(data.message || "Invalid Key");
      }
    } catch (error) {
      alert("Could not connect to Hana.");
    } finally {
      setLoading(false);
    }
  };

  // Finish welcome speech → start UI
  const finalizeStart = () => {
  setIsSpeaking(false);
  navigate('/reasons'); // Move to reasons AFTER the welcome animation
};
  const handleLogout = () => {
    setSecretKey(null);
    setIsStarted(false);
    setIsSpeaking(false);
    setChatHistory([]);
    localStorage.removeItem('hana_secret_key');
  };
  // Initialize AI with context data
  const initializeHana = async (data: any) => {
    try {
      setSessionData(data);

      // ✅ FIX: You must assign the fetch call to a variable named 'response'
      const response = await fetch('https://mindpulse-backend-e9xg.onrender.com/api/auth/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      // Now this line will work because 'response' exists!
      const responseData = await response.json();

      if (responseData.success && responseData.secretKey) {
        setSecretKey(responseData.secretKey);
        localStorage.setItem('hana_secret_key', responseData.secretKey);

        const userName = data.userInfo?.name || "my friend";

        setChatHistory([{ 
          role: 'hana', 
          text: `Hello ${userName}. I am Dr. Hana. I have reviewed your vitals, and I am here for you. How are you feeling right now?` 
        }]);

        // Start the chat directly (Welcome already happened!)
        setIsStarted(true);
        navigate('/');
      } else {
        alert("Failed to initialize session on the server.");
      }
    } catch (e) {
      console.error("Scaling error: Backend busy");
    }
  };
  // =========================
  // 🔹 ROUTES
  // =========================
  return (
    <Routes>
      <Route path="/reasons" element={<ReasonSelection onSelect={handleReasonSelected} />} />
      <Route path="/assessment" element={
        <Assessment
          selectedReason={sessionData.reason as any}
          onComplete={handleAssessmentComplete}
        />
      } />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={
        <div className="bg-[#030712] min-h-screen text-white overflow-hidden font-sans selection:bg-cyan-500/30">
         {/* Inject SEO Tags for the Landing Page */}
          <Helmet>
            <title>MindPulse | AI Mental Health Companion</title>
            <meta name="description" content="MindPulse is your secure, end-to-end encrypted AI companion for navigating career confusion, work pressure, relationship issues, and overthinking." />
            <meta property="og:title" content="MindPulse | AI Mental Health Companion" />
            <meta property="og:type" content="website" />
          </Helmet>
          <nav className="fixed top-0 left-0 w-full p-4 md:p-8 z-50 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <img src="/ICO.webp" alt='MindPulse Brand Logo' className="w-8 h-8 rounded" />
              <span className="text-lg font-bold tracking-widest uppercase text-slate-200">Mind<span className="text-cyan-400">Pulse</span></span>
            </div>
          </nav>

          {/* 1. WELCOME SPEECH (Active after backend connects) */}
          {isSpeaking && <CalmWelcome onComplete={finalizeStart} />}

          {!isStarted && !isSpeaking ? (
            // --- 2. HERO SECTION ---
            <main className="relative flex flex-col items-center justify-center min-h-screen">
              <div className="absolute top-[35%] flex items-center justify-center pointer-events-none" style={{ perspective: "1000px" }}>
                <div ref={circleRef} className="absolute w-[280px] h-[280px] border border-cyan-500/20 rounded-full" style={{ transformStyle: "preserve-3d" }} />
                <div ref={coreRef} className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-[0_0_40px_rgba(251,191,36,0.3)]" />
              </div>

              <div ref={contentRef} className="z-10 flex flex-col items-center text-center px-6 mt-40">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">Everything you feel <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">is valid here.</span></h1>

                <div className="flex flex-col gap-6 w-full max-w-sm backdrop-blur-sm bg-black/20 p-6 rounded-3xl border border-white/5 shadow-2xl">
                  <div className="w-full">
                    <p className="text-left text-xs text-cyan-400 mb-2 font-bold tracking-widest uppercase">Resume Session</p>
                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 transition-all focus-within:border-cyan-500/50">
                      <input type="text" placeholder="Enter Secret Key..." value={resumeKey} onChange={(e) => setResumeKey(e.target.value)} className="flex-1 bg-transparent p-3 pl-4 rounded-xl focus:outline-none text-sm text-white" />
                      <button onClick={handleResume} className="px-5 py-2.5 bg-white/10 rounded-xl hover:bg-cyan-500 hover:text-black font-bold transition-all text-sm">Resume</button>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 opacity-50">
                    <div className="h-px flex-1 bg-white/10"></div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">OR</span>
                    <div className="h-px flex-1 bg-white/10"></div>
                  </div>

                  <button onClick={() => setIsSpeaking(true)} disabled={loading} className="w-full px-8 py-4 bg-cyan-900/20 border border-cyan-500/20 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500 hover:text-black hover:scale-105 transition-all">
                    {loading ? "Starting..." : "Start New Session"}
                  </button>
                </div>
              </div>
            </main>
          ) : isStarted && !isSpeaking && (
            // --- 3. CHAT INTERFACE ---
            <main className="flex flex-col items-center justify-center min-h-screen p-4 md:p-6 animate-in fade-in zoom-in duration-500">
              <div className="w-full max-w-2xl bg-slate-900/40 border border-white/5 rounded-3xl p-4 md:p-8 backdrop-blur-xl flex flex-col h-[85vh] md:h-[600px] shadow-2xl overflow-hidden">

                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <div className="flex flex-col">
                    <h2 className="text-cyan-400 font-bold tracking-widest text-xs uppercase">Hana Active Session</h2>
                    <p className="text-[10px] text-slate-500 mt-1">End-to-End Encrypted</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => navigate('/dashboard')} className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-cyan-500/20">VIEW ANALYSIS</button>
                    <button onClick={handleLogout} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-red-500/20">EXIT</button>
                  </div>
                </div>

                <div className="bg-black/20 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3 mb-4 justify-center">
                  <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Secret Key:</span>
                  <code className="text-cyan-400 font-mono text-xs font-bold select-all">{secretKey}</code>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide scroll-smooth">
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50' : 'bg-white/5 border border-white/10 text-slate-300'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {loading && <div className="text-cyan-500 text-[10px] animate-pulse uppercase tracking-widest">Hana is sensing...</div>}
                </div>

                <div className="relative flex flex-col md:flex-row items-stretch md:items-center gap-2">
                  <input
                    autoFocus
                    disabled={isLocked || loading}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleTyping}
                    placeholder={isLocked ? "Session ended. See you tomorrow." : "Share your thoughts..."}
                    className={`flex-1 bg-black/40 border border-white/10 p-5 rounded-2xl focus:outline-none focus:border-cyan-500 text-white ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <button onClick={sendMessage} className="bg-cyan-500 text-black px-4 py-4 rounded-2xl font-bold hover:scale-105 transition-all">send</button>
                </div>
              </div>
            </main>
          )}
        </div>
      } />
    </Routes>
  );
};

export default App;