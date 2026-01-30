import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Dashboard from './Dashboard';

const App = () => {
  const circleRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load key from storage so refresh doesn't kill the session
  const [secretKey, setSecretKey] = useState<string | null>(() => localStorage.getItem('hana_secret_key'));
  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  
  // Logic: If we have a key, we are "Started"
  const [isStarted, setIsStarted] = useState(false);

  const [resumeKey, setResumeKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const navigate = useNavigate();

  const metrics = useRef({
    latency: 0, backspaces: 0, startTime: 0, lastKeyTime: 0, idleTime: 0, sessionStartTime: 0
  });

  // FIX 1: Auto-start if key exists in local storage
  useEffect(() => {
    if (secretKey) {
        setIsStarted(true);
    }
  }, [secretKey]);

  // FIX 2: Scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  // FIX 3: Hero Section Animation
  useEffect(() => {
    if (!isStarted) {
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
  }, [isStarted]);

  // Smooth Scroll
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

  const sendMessage = async () => {
    if (!inputValue.trim() || !secretKey) return;

    const currentInput = inputValue;
    const currentMetrics = { ...metrics.current };

    setChatHistory(prev => [...prev, { role: 'user', text: currentInput }]);
    setInputValue("");
    setLoading(true);

    metrics.current = { latency: 0, backspaces: 0, startTime: 0, lastKeyTime: 0, idleTime: 0, sessionStartTime: 0 };

    try {
      const messagePayload = currentInput; 
      
      const response = await fetch('https://mindpulse-backend-e9xg.onrender.com/api/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretKey,
          message: messagePayload, 
          metrics: currentMetrics
        })
      });

      const data = await response.json();
      const hanaResponse = data.aiText || data.message || "Hana is silent.";
      setChatHistory(prev => [...prev, { role: 'hana', text: hanaResponse }]);

    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'hana', text: "Hana cannot reach the server." }]);
    } finally {
      setLoading(false);
    }
  };

  const handleTyping = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = Date.now();
   // 1. If this is the very first key of the session/message
  if (metrics.current.startTime === 0) {
    metrics.current.startTime = now;
    // Assuming the input was cleared when the message was sent
    // We calculate latency as the time from when the user could start typing to now
  }

  // calculate backspaces
    if (e.key === 'Backspace') metrics.current.backspaces++;
    
    // 3. Calculate Latency (Time since the last message or component mount)
  if (metrics.current.latency === 0) {
     // Start tracking the "Hesitation"
     metrics.current.latency = now - (metrics.current.sessionStartTime || now);
  }

  // 4. Idle Time Logic
  if (metrics.current.lastKeyTime > 0) {
    const gap = now - metrics.current.lastKeyTime;
    if (gap > 2000) metrics.current.idleTime += gap;
  }
  
  metrics.current.lastKeyTime = now;
  if (e.key === 'Enter') sendMessage();
};

  // --- START SESSION LOGIC ---
  const startSession = async () => {
    setLoading(true);
    try {
      // We send an EMPTY name (""). This triggers the Backend to say:
      // "Name is unknown" -> System Prompt -> Hana asks "What is your name?"
      const response = await fetch('https://mindpulse-backend-e9xg.onrender.com/api/auth/init', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: "" }) 
      });
      const data = await response.json();
      if (data.success) {
        setSecretKey(data.secretKey);
        localStorage.setItem('hana_secret_key', data.secretKey);
        setIsStarted(true); 
      }
    } catch (error) {
      alert("Backend not responding.");
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async () => {
    if (resumeKey.trim().length < 5) {
        alert("Please enter a valid Secret Key");
        return;
    }
    setLoading(true);
    try {
        const response = await fetch('https://mindpulse-backend-e9xg.onrender.com/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secretKey: resumeKey.trim() })
        });
        const data = await response.json();

        if (data.success) {
            setSecretKey(resumeKey.trim());
            localStorage.setItem('hana_secret_key', resumeKey.trim());
            
            const formattedHistory = data.history.map((msg: any) => ({
                role: msg.role === 'model' ? 'hana' : 'user',
                text: msg.content
            }));
            
            setChatHistory(formattedHistory);
            setIsStarted(true);
        } else {
            alert(data.message || "Invalid Key");
        }
    } catch (error) {
        alert("Could not connect to Hana.");
    } finally {
        setLoading(false);
    }
  };

  const handleLogout = () => {
      setSecretKey(null);
      setIsStarted(false);
      setChatHistory([]);
      localStorage.removeItem('hana_secret_key');
  };

  return (
    <Routes>
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/" element={
        <div className="bg-[#030712] min-h-screen text-white overflow-hidden font-sans selection:bg-cyan-500/30">
          
          {/* NAV */}
          <nav className="fixed top-0 left-0 w-full p-8 z-50 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-3 pointer-events-auto">
              <img src="/ICO.webp" alt='logo' className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded flex items-center justify-center font-bold text-black" />
              <span className="text-lg font-bold tracking-widest uppercase text-slate-200">Mind<span className="text-cyan-400">Pulse</span></span>
            </div>
          </nav>

          {!isStarted ? (
            // --- HERO SECTION ---
            <main className="relative flex flex-col items-center justify-center min-h-screen">
              <div className="absolute top-[35%] flex items-center justify-center pointer-events-none" style={{ perspective: "1000px" }}>
                <div ref={circleRef} className="absolute w-[280px] h-[280px] border border-cyan-500/20 rounded-full" style={{ transformStyle: "preserve-3d" }} />
                <div ref={coreRef} className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-[0_0_40px_rgba(251,191,36,0.3)]" />
              </div>

              <div ref={contentRef} className="z-10 flex flex-col items-center text-center px-6 mt-40">
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-tight">Everything you feel <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">is valid here.</span></h1>
                
                {/* --- INPUT SECTION --- */}
                <div className="flex flex-col gap-6 w-full max-w-sm backdrop-blur-sm bg-black/20 p-6 rounded-3xl border border-white/5 shadow-2xl">
                    
                   {/* 1. RESUME SECTION (FIRST) */}
                   <div className="w-full">
                       <p className="text-left text-xs text-cyan-400 mb-2 font-bold tracking-widest uppercase">Resume Session</p>
                       <div className="flex items-center gap-2 bg-white/5 p-1 rounded-2xl border border-white/10 transition-all focus-within:border-cyan-500/50">
                         <input 
                           type="text" placeholder="Enter Secret Key..." value={resumeKey}
                           onChange={(e) => setResumeKey(e.target.value)}
                           className="flex-1 bg-transparent p-3 pl-4 rounded-xl focus:outline-none text-sm text-white"
                         />
                         <button onClick={handleResume} className="px-5 py-2.5 bg-white/10 rounded-xl hover:bg-cyan-500 hover:text-black font-bold transition-all text-sm">Resume</button>
                       </div>
                   </div>

                   {/* DIVIDER */}
                   <div className="flex items-center gap-3 opacity-50">
                        <div className="h-px flex-1 bg-white/10"></div>
                        <span className="text-[10px] uppercase tracking-widest text-slate-500">OR</span>
                        <div className="h-px flex-1 bg-white/10"></div>
                   </div>

                   {/* 2. START NEW SESSION BUTTON (NO NAME INPUT) */}
                   <button onClick={startSession} disabled={loading} className="w-full px-8 py-4 bg-cyan-900/20 border border-cyan-500/20 text-cyan-400 font-bold rounded-xl hover:bg-cyan-500 hover:text-black hover:scale-105 transition-all shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                     {loading ? "Connecting..." : "Start New Session"}
                   </button>

                </div>
              </div>
            </main>
          ) : (
            // --- CHAT INTERFACE ---
            <main className="flex flex-col items-center justify-center min-h-screen p-6 animate-in fade-in zoom-in duration-500">
              <div className="w-full max-w-2xl bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl flex flex-col h-[600px] shadow-2xl overflow-hidden">
                
                <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
                  <div className="flex flex-col">
                    <h2 className="text-cyan-400 font-bold tracking-widest text-xs uppercase">Hana Active Session</h2>
                    <p className="text-[10px] text-slate-500 mt-1">End-to-End Encrypted</p>
                  </div>

                  <div className="flex gap-3">
                    <button 
                        onClick={() => navigate('/dashboard')}
                        className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 px-4 py-2 rounded-lg text-xs font-bold transition-all border border-cyan-500/20"
                    >
                        VIEW ANALYSIS
                    </button>
                    
                    <button 
                        onClick={handleLogout}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-2 rounded-lg text-xs font-bold transition-all border border-red-500/20"
                    >
                        EXIT
                    </button>
                  </div>
                </div>

                <div className="bg-black/20 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3 mb-4 justify-center">
                    <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Secret Key:</span>
                    <code className="text-cyan-400 font-mono text-xs font-bold select-all">{secretKey}</code>
                </div>

                <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2 scrollbar-hide scroll-smooth">
                  {chatHistory.length === 0 && <p className="text-slate-500 italic text-center mt-20 text-sm">"I'm here. Take a breath and tell me what's happening."</p>}
                  {chatHistory.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-50' : 'bg-white/5 border border-white/10 text-slate-300'}`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {loading && <div className="text-cyan-500 text-[10px] animate-pulse uppercase tracking-widest">Hana is sensing...</div>}
                </div>

               <div className="relative flex items-center gap-2">
  <input 
    autoFocus value={inputValue} onChange={(e) => setInputValue(e.target.value)}
    onKeyDown={handleTyping} placeholder="Share your thoughts..."
    className="flex-1 bg-black/40 border border-white/10 p-5 rounded-2xl focus:outline-none focus:border-cyan-500 text-white"
  />
  <button 
    onClick={sendMessage}
    className="bg-cyan-500 text-black px-6 py-4 rounded-2xl font-bold hover:scale-105 transition-all md:hidden"
  >
    SEND
  </button>
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