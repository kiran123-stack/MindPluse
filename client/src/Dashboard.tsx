import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({
    stressScore: 0,
    metrics: { totalBackspaces: 0, totalIdle: 0, messageCount: 0 }
  });

  useEffect(() => {
    const secretKey = localStorage.getItem('hana_secret_key');
    if (!secretKey) return;

    const fetchData = async () => {
      try {
        const res = await fetch(`https://mindpulse-backend-e9xg.onrender.com/api/dashboard/${secretKey}`);
        const json = await res.json();
        if (json.success) {
            setData({
                stressScore: json.stressScore,
                metrics: json.metrics
            });
        }
      } catch (err) {
        console.error("Dashboard sync failed");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#030712] min-h-screen text-white p-8 font-sans">
      <nav className="flex justify-between items-center mb-12 border-b border-white/5 pb-6">
        <div className="flex items-center gap-3">
          <img src="/ICO.webp" alt='logo' className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-500 rounded flex items-center justify-center font-bold text-black" />
          <span className="text-lg font-bold tracking-widest uppercase">MindPulse <span className="text-cyan-400">Resonance</span></span>
        </div>
        <button 
          onClick={() => navigate('/')} 
          className="text-xs bg-white/10 px-6 py-2 rounded-xl hover:bg-white/20 transition-all border border-white/10 font-bold tracking-widest"
        >
          BACK TO SESSION
        </button>
      </nav>

      <main className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
        
       
        <div className="col-span-1 md:col-span-2 flex flex-col md:flex-row items-center gap-6 md:gap-10 bg-slate-900/40 border border-white/5 p-8 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-48 h-48 bg-cyan-400/10 blur-[60px] rounded-full pointer-events-none" />
            
            <div className="relative z-10 shrink-0">
                <img 
                    src="/second.png" 
                    alt="Dr. Hana Presenting" 
                    className="w-42 h-42 md:w-48 md:h-48 object-contain drop-shadow-[0_0_40px_rgba(34,211,238,0.5)]"
                />
            </div>
            
            <div className="relative z-10 text-center md:text-left flex-1">
                <h2 className="text-xl md:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 mb-3 tracking-tight">
                   Your Cognitive Resonance Report
                </h2>
                <div className="bg-black/20 border border-white/10 p-4 rounded-2xl">
                    <p className="text-emerald-50/90 text-sm italic leading-relaxed">
                       "I have gently compiled your digital vitals from our time together. Take a look. These numbers are not judgments they are simply a mirror reflecting how hard your mind has been working to protect you today."
                    </p>
                </div>
            </div>
        </div>
        {/* ------------------------------------------- */}

        {/* Pulse Intensity Card  */}
        <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[2.5rem] backdrop-blur-2xl shadow-2xl flex flex-col items-center">
          <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-8">Stress</h3>
          
          <div className="relative w-48 h-48 flex items-center justify-center">
             <svg className="w-full h-full transform -rotate-90">
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-white/5" />
                <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" 
                        strokeDasharray={502.4} 
                        strokeDashoffset={502.4 - (502.4 * data.stressScore) / 100}
                        className="text-cyan-400 transition-all duration-1000 ease-out" />
             </svg>
             <span className="absolute text-5xl font-mono font-bold">{data.stressScore}%</span>
          </div>

          <p className="mt-8 text-center text-sm text-slate-400 italic">
            {data.stressScore > 65 ? "Significant cognitive resonance detected." : "Neural frequency appears fluid and stable."}
          </p>
        </div>

        {/* Cognitive Markers Card (Renamed from Behavioral Logs) */}
        <div className="bg-slate-900/40 border border-white/5 p-10 rounded-[2.5rem] backdrop-blur-2xl">
          <h3 className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-8">Cognitive Markers</h3>
          <div className="space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              {/* Renamed "Backspaces" to "Self-Calibration" */}
              <span className="text-sm text-slate-400">Self-Calibration Nodes</span>
              <span className="text-cyan-400 font-mono">{data.metrics.totalBackspaces}</span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              {/* Renamed "Idle Time" to "Synaptic Delay" */}
              <span className="text-sm text-slate-400">Synaptic Delay Total</span>
              <span className="text-cyan-400 font-mono">{(data.metrics.totalIdle / 1000).toFixed(1)}s</span>
            </div>
            <div className="flex justify-between items-center pb-4">
              
              <span className="text-sm text-slate-400">Interactions</span>
              <span className="text-cyan-400 font-mono">{data.metrics.messageCount}</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;