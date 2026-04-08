import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { questionBank } from "./questionBank";
import { Helmet } from 'react-helmet-async';

// =========================
// 🔹 TYPES
// =========================
type ReasonType =
  | "career_confusion"
  | "job_stress"
  | "relationship"
  | "overthinking"
  | "low_motivation"
  | "need_to_talk";

interface Option {
  label: string;
  score: number;
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

//  Proper props definition
interface AssessmentProps {
  selectedReason: ReasonType;
  onComplete: (
    score: number, 
    info: { name: string; age: string }, 
    answers: { question: string; answer: string }[]
  ) => void;
}

// =========================
// 🔹 COMPONENT
// =========================
const Assessment = ({
  selectedReason = "career_confusion", // default fallback
   onComplete
}: AssessmentProps) => {

  const navigate = useNavigate();

  // =========================
  // 🔹 STATE
  // =========================
  const [step, setStep] = useState(0);
  const [userInfo, setUserInfo] = useState({ name: "", age: "" });
  const [totalScore, setTotalScore] = useState(0);
  const [answers, setAnswers] = useState<{question: string, answer: string}[]>([]);

  //  Get questions based on reason
  const currentQuestions: Question[] = questionBank[selectedReason];

  // =========================
  // 🔹 HANDLER
  // =========================
 const handleNext = (score: number, questionText: string, answerLabel: string) => {
    const updatedScore = totalScore + score;
    const newAnswers = [...answers, { question: questionText, answer: answerLabel }];
    
    setTotalScore(updatedScore);
    setAnswers(newAnswers);

    if (step < currentQuestions.length) {
      setStep((prev) => prev + 1);
    } else {
      // Pass the collected answers up to App.tsx
      onComplete(updatedScore, userInfo, newAnswers);
    }
  };
  // =========================
  // 🔹 STEP 0 → USER INFO
  // =========================
  if (step === 0) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-white">
       {/* Inject SEO Tags for Assessment */}
        <Helmet>
          <title>Personal Vitals Assessment | MindPulse</title>
          <meta name="description" content="Complete your personal mental wellness assessment to help calibrate your upcoming encrypted session with Dr. Hana." />
        </Helmet>
        <div className="max-w-md w-full bg-slate-900/40 border border-white/10 p-10 rounded-[2.5rem] backdrop-blur-xl">
          <h2 className="text-2xl font-bold mb-6 text-cyan-400">
            Personal Vitals
          </h2>

          <div className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full bg-black/40 border border-white/10 p-4 rounded-xl focus:border-cyan-500 outline-none"
              onChange={(e) =>
                setUserInfo({ ...userInfo, name: e.target.value })
              }
            />

            <input
              type="number"
              placeholder="Your Age"
              className="w-full bg-black/40 border border-white/10 p-4 rounded-xl focus:border-cyan-500 outline-none"
              onChange={(e) =>
                setUserInfo({ ...userInfo, age: e.target.value })
              }
            />

            <button
              onClick={() => setStep(1)}
              className="w-full bg-cyan-500 text-black font-bold py-4 rounded-xl hover:scale-105 transition-all"
            >
              Begin Assessment
            </button>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // 🔹 QUESTIONS FLOW
  // =========================
  const currentQ = currentQuestions[step - 1];

  if (!currentQ) return null; // safety fallback

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-6 text-white">
      <div className="max-w-2xl w-full">

        {/* Progress */}
        <div className="mb-8 flex justify-between items-end">
          <span className="text-cyan-500 text-xs font-bold tracking-widest uppercase">
            Question {step} of {currentQuestions.length}
          </span>

          <div className="h-1 w-32 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-cyan-500 transition-all duration-500"
              style={{
                width: `${(step / currentQuestions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-3xl font-semibold mb-10 leading-relaxed italic text-emerald-50">
          "{currentQ.text}"
        </h2>

        {/* Options */}
        <div className="grid grid-cols-1 gap-4">
          {currentQ.options.map((opt, i) => (
            <button
              key={i}
              onClick={() => handleNext(opt.score, currentQ.text, opt.label)}
              className="text-left p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-cyan-500/10 hover:border-cyan-500/50 transition-all group"
            >
              <span className="text-slate-400 group-hover:text-cyan-400 transition-colors">
                {opt.label}
              </span>
            </button>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Assessment;