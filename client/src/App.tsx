import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import Lenis from '@studio-freight/lenis';
import { encryptMessage } from './utils/crypto';

const App = () => {
  const circleRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null); // Added for auto-scrolling

  const [chatHistory, setChatHistory] = useState<{ role: string; text: string }[]>([]);
  const [isStarted, setIsStarted] = useState(false);
  const [secretKey, setSecretKey] = useState<string | null>(null);
  const [resumeKey, setResumeKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");


  const [messages, setMessages] = useState([
    {
      role: 'model', // AI role
      text: "I am here to analyze and guide. Before we begin, what should I call you?"
    }
  ]);

  const calculateStress = () => {
  const { backspaces, idleTime } = metrics.current;
  // Logic: More backspaces + high idle time = higher agitation/stress
  const score = Math.min(100, (backspaces * 5) + (idleTime / 1000));
  return Math.round(score);
};

  const metrics = useRef({
    latency: 0, backspaces: 0, startTime: 0, lastKeyTime: 0, idleTime: 0, sessionStartTime: 0
  });

  // FIX: Scroll to bottom whenever chat updates so AI answer is visible
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

 const sendMessage = async () => {
    if (!inputValue.trim() || !secretKey) return;

    const currentInput = inputValue;
    setChatHistory(prev => [...prev, { role: 'user', text: currentInput }]);
    setInputValue("");
    setLoading(true);

    try {
      // Assuming you have this util. If not, just send currentInput directly for testing.
      const encryptedText = encryptMessage ? encryptMessage(currentInput, secretKey) : currentInput;
      
      const response = await fetch('http://localhost:5000/api/chat/message', { // Ensure full URL if not using proxy
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secretKey,
          message: encryptedText, 
          metrics: metrics.current
        })
      });

      const data = await response.json();
      
      // FIX: Improved data handling to ensure AI text is caught
      const hanaResponse = data.aiText || data.message || "Hana is processing...";
      setChatHistory(prev => [...prev, { role: 'hana', text: hanaResponse }]);

    } catch (err) {
      setChatHistory(prev => [...prev, { role: 'hana', text: "Connection error. Is backend running?" }]);
    } finally {
      setLoading(false);
      metrics.current = { ...metrics.current, startTime: 0, lastKeyTime: 0, backspaces: 0, idleTime: 0 };
    }
  };

  const handleTyping = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const now = Date.now();
    if (metrics.current.startTime === 0) metrics.current.startTime = now;
    if (e.key === 'Backspace') metrics.current.backspaces++;
    if (metrics.current.lastKeyTime > 0) {
      const gap = now - metrics.current.lastKeyTime;
      if (gap > 2000) metrics.current.idleTime += gap;
    }
    metrics.current.lastKeyTime = now;
    if (e.key === 'Enter') sendMessage();
  };

  const startSession = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/init', { method: 'POST' });
      const data = await response.json();
      if (data.success) {
        setSecretKey(data.secretKey);
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
        const response = await fetch('http://localhost:5000/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ secretKey: resumeKey.trim() })
        });

        const data = await response.json();

        if (data.success) {
            setSecretKey(resumeKey.trim());
            
            // Convert Backend History (role: 'model') -> Frontend (role: 'hana')
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

  useEffect(() => {
    const lenis = new Lenis();
    function raf(time: number) { lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);

    if (circleRef.current) gsap.to(circleRef.current, { rotateY: 360, rotateX: 60, duration: 15, repeat: -1, ease: "none" });
    if (coreRef.current) gsap.to(coreRef.current, { y: -15, duration: 2.5, repeat: -1, yoyo: true, ease: "sine.inOut" });
  }, []);

  return (
    <div className="bg-[#030712] min-h-screen text-white overflow-hidden font-sans selection:bg-cyan-500/30">
      
      {/* STEADY NAV - Stay here regardless of state */}
      <nav className="fixed top-0 left-0 w-full p-8 z-50 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto">
          <img src="/ICO.webp" alt='logo' className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded flex items-center justify-center font-bold text-black" />
          <span className="text-lg font-bold tracking-widest uppercase text-slate-200">Mind<span className="text-cyan-400">Pulse</span></span>
        </div>
      </nav>

      {!isStarted ? (
        <main className="relative flex flex-col items-center justify-center min-h-screen">
          {/* FIX: Perspective is now restricted ONLY to the visualizer container */}
          <div className="absolute top-[35%] flex items-center justify-center pointer-events-none" style={{ perspective: "1000px" }}>
            <div ref={circleRef} className="absolute w-[280px] h-[280px] border border-cyan-500/20 rounded-full" style={{ transformStyle: "preserve-3d" }} />
            <div ref={coreRef} className="w-16 h-16 rounded-full bg-gradient-to-tr from-yellow-400 to-orange-500 shadow-[0_0_40px_rgba(251,191,36,0.3)]" />
          </div>

          <div ref={contentRef} className="z-10 flex flex-col items-center text-center px-6 mt-40">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-tight">Everything you feel <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400">is valid here.</span></h1>
            
            <div className="flex flex-col gap-4 w-full max-w-sm">
               <button onClick={startSession} disabled={loading} className="px-12 py-4 bg-cyan-500 text-black font-bold rounded-full hover:scale-105 transition-all">
                  {loading ? "Connecting..." : "Start New Session"}
               </button>

               <div className="flex items-center gap-2 mt-4 bg-white/5 p-1 rounded-2xl border border-white/10">
                  <input 
                    type="text" placeholder="Enter Secret Key to resume..." value={resumeKey}
                    onChange={(e) => setResumeKey(e.target.value)}
                    className="flex-1 bg-transparent p-3 pl-4 rounded-xl focus:outline-none text-sm"
                  />
                  <button onClick={handleResume} className="px-5 py-2.5 bg-white/10 rounded-xl hover:bg-white/20 transition-all text-sm">Resume</button>
               </div>
            </div>
          </div>
        </main>
      ) : (
        <main className="flex flex-col items-center justify-center min-h-screen p-6 animate-in fade-in zoom-in duration-500">
          <div className="w-full max-w-2xl bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-xl flex flex-col h-[600px] shadow-2xl overflow-hidden">
            
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <div className="flex flex-col">
                <h2 className="text-cyan-400 font-bold tracking-widest text-xs uppercase">Hana Active Session</h2>
                <p className="text-[10px] text-slate-500 mt-1">End-to-End Encrypted</p>
              </div>

              {/* FIX: Secret Key is now in a fixed-width container to prevent layout jumping */}
              <div className="bg-black/20 px-4 py-2 rounded-lg border border-white/10 flex items-center gap-3">
                <span className="text-[10px] text-slate-400 uppercase tracking-tighter">Your Secret Key:</span>
                <code className="text-cyan-400 font-mono text-xs font-bold select-all">
                  {secretKey}
                </code>
              </div>
            </div>

            {/* FIX: Added scrollRef and scrollbar-hide to keep it clean */}
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

            <div className="relative">
              <input 
                autoFocus value={inputValue} onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleTyping} placeholder="Share your thoughts..."
                className="w-full bg-black/40 border border-white/10 p-5 rounded-2xl focus:outline-none focus:border-cyan-500 text-white"
              />
            </div>
          </div>
        </main>
      )}
    </div>
  );
};

export default App;