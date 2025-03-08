
import { useEffect, useState } from 'react';

interface TimelineProps {
  projectId?: string;
}

interface Milestone {
  id: string;
  date: string;
  label: string;
  position: number; // Position in percentage (0-100)
}

const Timeline = ({ projectId }: TimelineProps) => {
  const [progress, setProgress] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', date: '2025-07-01', label: 'Startdatum', position: 0 },
    { id: '2', date: '2025-08-01', label: 'Byggstart', position: 50 },
    { id: '3', date: '2025-08-15', label: 'Slutdatum', position: 100 }
  ]);
  
  // Animate progress on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(25);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-[#ECF0F1] mb-8">Projekttidslinje</h3>
      
      <div className="flex flex-col items-center mt-10 mb-16">
        <div className="relative w-[400px] h-[4px] bg-[#465C71] rounded">
          {/* Progress bar */}
          <div 
            className="absolute top-0 left-0 h-full bg-[#3498DB] rounded transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
          
          {/* Milestones */}
          {milestones.map((milestone) => (
            <div 
              key={milestone.id}
              className="absolute top-0 flex flex-col items-center"
              style={{ left: `${milestone.position}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-[12px] h-[12px] rounded-full bg-[#3498DB] relative top-[-4px] z-10" />
              <div className="text-[#ECF0F1] text-xs mt-4">{milestone.label}</div>
              <div className="text-[#BDC3C7] text-xs mt-1">{milestone.date}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="text-md font-medium text-[#ECF0F1] mb-2">Kommande milstolpar</h4>
        <div className="bg-[#34495E] border border-[#465C71] rounded-lg p-4">
          <div className="flex justify-between items-center">
            <div>
              <h5 className="text-[#ECF0F1] font-medium">Byggstart</h5>
              <p className="text-[#BDC3C7] text-sm">Material levererat och installationsarbete påbörjas</p>
            </div>
            <div className="text-[#BDC3C7]">2025-08-01</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
