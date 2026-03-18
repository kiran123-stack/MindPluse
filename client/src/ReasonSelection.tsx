import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Zap, 
  Heart, 
  Brain, 
  BatteryLow, 
  MessageCircle 
} from 'lucide-react'; // Example icons

interface ReasonSelectionProps {
  onSelect: (reasonId: string) => void;
}

// Define the structure for our reason cards
interface SelectionCard {
  id: string;
  label: string;
  color: string;
  icon: React.ReactNode;
}

const ReasonSelection : React.FC<ReasonSelectionProps> = ({ onSelect }) => {
  const navigate = useNavigate();

  // Configuration for your "boxes"
  const reasons: SelectionCard[] = [
  {
    id: 'career_confusion',
    label: 'Career Confusion',
    color: 'bg-blue-500/20 border-blue-500/50 text-blue-400',
    icon: <Briefcase size={24} />,
  },
  {
    id: 'job_stress',
    label: 'Work Pressure',
    color: 'bg-orange-500/20 border-orange-500/50 text-orange-400',
    icon: <Zap size={24} />,
  },
  {
    id: 'relationship',
    label: 'Relationship Issues',
    color: 'bg-pink-500/20 border-pink-500/50 text-pink-400',
    icon: <Heart size={24} />,
  },
  {
    id: 'overthinking',
    label: 'Overthinking',
    color: 'bg-purple-500/20 border-purple-500/50 text-purple-400',
    icon: <Brain size={24} />,
  },
  {
    id: 'low_motivation',
    label: 'Low Motivation',
    color: 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400',
    icon: <BatteryLow size={24} />,
  },
  {
    id: 'need_to_talk',
    label: 'Need to Talk',
    color: 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400',
    icon: <MessageCircle size={24} />,
  },
];

  const handleSelection = (id: string) => {
    console.log(`User selected: ${id}`);
    onSelect(id); // ✅ Call the prop from App.tsx so it navigates to '/assessment'
  };

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="max-w-2xl w-full text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">What's on your mind?</h2>
        <p className="text-slate-400">Selecting a focus area helps Hana understand you better.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full max-w-4xl">
        {reasons.map((reason) => (
          <button
            key={reason.id}
            onClick={() => handleSelection(reason.id)}
            className={`flex flex-col items-center justify-center p-8 rounded-3xl border transition-all duration-300 hover:scale-105 active:scale-95 ${reason.color}`}
          >
            <div className="mb-4">{reason.icon}</div>
            <span className="font-bold tracking-tight">{reason.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReasonSelection;