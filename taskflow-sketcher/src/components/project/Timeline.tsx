import { supabase } from '@/lib/supabase';
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

interface Task {
  id: number;
  project_id: number;
  title: string;
  start_date: string;
  end_date: string;
  progress: number;
  dependencies?: number[] | null;
  is_ata?: boolean;
}

const Timeline = ({ projectId }: TimelineProps) => {
  const [progress, setProgress] = useState(0);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Hämta uppgifter och beräkna tidslinje
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId || '1');
          
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          setTasks(data);
          
          // Beräkna projektets start- och slutdatum baserat på uppgifterna
          const startDates = data.map(task => new Date(task.start_date).getTime());
          const endDates = data.map(task => new Date(task.end_date).getTime());
          
          const minDate = new Date(Math.min(...startDates));
          const maxDate = new Date(Math.max(...endDates));
          
          setStartDate(minDate);
          setEndDate(maxDate);
          
          // Beräkna genomsnittligt framsteg
          const avgProgress = data.reduce((acc, task) => acc + task.progress, 0) / data.length;
          setProgress(avgProgress);
          
          // Skapa dynamiska milstolpar
          const newMilestones: Milestone[] = [
            { id: '1', date: minDate.toLocaleDateString('sv-SE'), label: 'Startdatum', position: 0 }
          ];
          
          // Hitta kritiska uppgifter för milstolpar (t.ex. med högst framsteg)
          const sortedByProgress = [...data].sort((a, b) => b.progress - a.progress);
          if (sortedByProgress.length > 0 && sortedByProgress[0].progress > 0) {
            const milestone = {
              id: '2',
              date: new Date(sortedByProgress[0].end_date).toLocaleDateString('sv-SE'),
              label: `${sortedByProgress[0].title} (${sortedByProgress[0].progress}%)`,
              position: 50
            };
            newMilestones.push(milestone);
          }
          
          // Slutdatum
          newMilestones.push({
            id: '3',
            date: maxDate.toLocaleDateString('sv-SE'),
            label: 'Slutdatum',
            position: 100
          });
          
          setMilestones(newMilestones);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Kunde inte hämta uppgifter');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
    
    // Prenumerera på realtidsuppdateringar
    const channel = supabase
      .channel('timeline-tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId || '1'}` },
        () => {
          console.log('Timeline: Task data updated, refreshing...');
          fetchTasks();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);
  
  // Formattera datum för visning
  const formatDate = (date: Date | null): string => {
    if (!date) return 'Inte angivet';
    return date.toLocaleDateString('sv-SE', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Beräkna dagar kvar till projektslut
  const calculateDaysRemaining = (): number => {
    if (!endDate) return 0;
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const daysRemaining = calculateDaysRemaining();
  
  if (loading) {
    return <div className="p-4">Laddar tidslinje...</div>;
  }
  
  if (error) {
    return <div className="p-4 text-[#E74C3C]">Fel: {error}</div>;
  }
  
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold text-[#ECF0F1] mb-4">Projekttidslinje</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#34495E] border border-[#465C71] rounded-lg p-4">
          <h4 className="text-sm text-[#BDC3C7]">Startdatum</h4>
          <p className="text-[#ECF0F1] font-medium">{formatDate(startDate)}</p>
        </div>
        
        <div className="bg-[#34495E] border border-[#465C71] rounded-lg p-4">
          <h4 className="text-sm text-[#BDC3C7]">Slutdatum</h4>
          <p className="text-[#ECF0F1] font-medium">{formatDate(endDate)}</p>
        </div>
        
        <div className="bg-[#34495E] border border-[#465C71] rounded-lg p-4">
          <h4 className="text-sm text-[#BDC3C7]">Dagar kvar</h4>
          <p className={`font-medium ${daysRemaining < 30 ? 'text-[#E74C3C]' : 'text-[#2ECC71]'}`}>
            {daysRemaining} dagar
          </p>
        </div>
      </div>
      
      <div className="flex flex-col items-center mt-10 mb-12">
        <div className="mb-2 flex justify-between w-full">
          <span className="text-[#BDC3C7] text-xs">0%</span>
          <span className="text-[#BDC3C7] text-xs">Framsteg: {Math.round(progress)}%</span>
          <span className="text-[#BDC3C7] text-xs">100%</span>
        </div>
        
        <div className="relative w-full h-[6px] bg-[#465C71] rounded">
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
              <div className="w-[12px] h-[12px] rounded-full bg-[#3498DB] relative top-[-3px] z-10" />
              <div className="text-[#ECF0F1] text-xs mt-4">{milestone.label}</div>
              <div className="text-[#BDC3C7] text-xs mt-1">{milestone.date}</div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-8">
        <h4 className="text-md font-medium text-[#ECF0F1] mb-2">Aktiva uppgifter ({tasks.length})</h4>
        <div className="bg-[#34495E] border border-[#465C71] rounded-lg p-4 max-h-[200px] overflow-y-auto">
          {tasks.slice(0, 5).map(task => (
            <div key={task.id} className="mb-3 last:mb-0 border-b border-[#465C71] last:border-0 pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <h5 className="text-[#ECF0F1] font-medium">{task.title}</h5>
                  <p className="text-[#BDC3C7] text-sm">
                    {new Date(task.start_date).toLocaleDateString('sv-SE')} - {new Date(task.end_date).toLocaleDateString('sv-SE')}
                  </p>
                </div>
                <div className="flex items-center">
                  <div className="h-[24px] w-[24px] rounded-full flex items-center justify-center mr-2"
                       style={{ background: task.progress >= 100 ? '#2ECC71' : '#3498DB' }}>
                    <span className="text-xs text-white">{task.progress}%</span>
                  </div>
                  {task.is_ata && (
                    <div className="text-[#F4A261] text-xs font-medium rounded-full bg-[#F4A261]/10 px-2 py-1">
                      ÄTA
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {tasks.length > 5 && (
            <div className="mt-2 text-center">
              <span className="text-[#3498DB] text-sm">Visar 5 av {tasks.length} uppgifter</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Timeline;
