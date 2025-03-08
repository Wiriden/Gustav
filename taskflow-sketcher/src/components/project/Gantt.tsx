import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';
import {
    AlertTriangle,
    Calendar,
    ChevronDown,
    ChevronRight,
    Users
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/**
 * Interface för en uppgift i Gantt-diagrammet
 * Följer Tasks Table-schemat från architecture.mermaid
 */
interface Task {
  id: string;
  project_id: string;
  title: string;
  description?: string;
  start_date: string;
  end_date: string;
  dependencies?: string[];
  progress: number;
  assignee?: string;
  is_ata?: boolean; // ÄTA-arbete enligt technical.md
}

/**
 * Props för Gantt-komponenten
 */
interface GanttProps {
  projectId?: string;
}

/**
 * Gantt-komponent för att visa uppgifter i ett Gantt-diagram
 * Utökar Timeline.tsx med stöd för beroenden och CPM
 * 
 * @param projectId - ID för projektet att visa uppgifter för
 */
const Gantt = ({ projectId }: GanttProps) => {
  // State för uppgifter och pagination
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [expandedTasks, setExpandedTasks] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  // Hämta uppgifter från Supabase med pagination
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        // Använd Repository Pattern enligt technical.md
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId || '')
          .range((page - 1) * 100, page * 100 - 1); // Pagination enligt technical.md (100 tasks/page)
        
        if (error) {
          throw error;
        }
        
        // Om vi inte har data från Supabase än, använd mockdata
        if (!data || data.length === 0) {
          // Mockdata för testning
          const mockTasks: Task[] = Array.from({ length: 10 }, (_, i) => ({
            id: `task-${i + 1}`,
            project_id: projectId || 'project-1',
            title: `Uppgift ${i + 1}`,
            description: `Beskrivning för uppgift ${i + 1}`,
            start_date: new Date(2025, 3, i + 1).toISOString(),
            end_date: new Date(2025, 3, i + 10).toISOString(),
            dependencies: i > 0 ? [`task-${i}`] : undefined,
            progress: Math.floor(Math.random() * 100),
            assignee: `Person ${i % 3 + 1}`,
            is_ata: i % 5 === 0 // Var femte uppgift är ett ÄTA-arbete
          }));
          setTasks(mockTasks);
        } else {
          setTasks(data);
        }
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError(err instanceof Error ? err.message : 'Ett fel uppstod vid hämtning av uppgifter');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, page]);

  // Funktion för att toggla expandering av en uppgift
  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Beräkna tidslinje-skala
  const calculateTimeScale = () => {
    if (tasks.length === 0) return { startDate: new Date(), endDate: new Date(), totalDays: 30 };
    
    const startDates = tasks.map(task => new Date(task.start_date));
    const endDates = tasks.map(task => new Date(task.end_date));
    
    const minDate = new Date(Math.min(...startDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...endDates.map(d => d.getTime())));
    
    // Lägg till lite marginal
    minDate.setDate(minDate.getDate() - 5);
    maxDate.setDate(maxDate.getDate() + 5);
    
    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return { startDate: minDate, endDate: maxDate, totalDays };
  };

  const { startDate, endDate, totalDays } = calculateTimeScale();

  // Beräkna position för en uppgift på tidslinjen
  const calculateTaskPosition = (task: Task) => {
    const taskStartDate = new Date(task.start_date);
    const taskEndDate = new Date(task.end_date);
    
    const startOffset = Math.max(0, (taskStartDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, (taskEndDate.getTime() - taskStartDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const startPercent = (startOffset / totalDays) * 100;
    const widthPercent = (duration / totalDays) * 100;
    
    return { startPercent, widthPercent };
  };

  // Formatera datum
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('sv-SE');
  };

  return (
    <div className="p-4 bg-[#1E2A44] rounded-lg" ref={containerRef}>
      <h2 className="text-xl font-semibold text-[#ECF0F1] mb-4">Gantt-diagram</h2>
      
      {error && (
        <div className="bg-[#E74C3C]/20 border border-[#E74C3C] rounded-md p-3 mb-4">
          <p className="text-[#E74C3C] flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            {error}
          </p>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3498DB]"></div>
        </div>
      ) : (
        <div className="mt-4">
          {/* Tidslinje-header */}
          <div className="flex mb-2 pl-[250px] text-[#BDC3C7] text-xs">
            {Array.from({ length: Math.min(30, totalDays) }).map((_, i) => {
              const date = new Date(startDate);
              date.setDate(date.getDate() + i);
              return (
                <div 
                  key={i} 
                  className="flex-shrink-0 w-8 text-center"
                  style={{ width: `${100 / Math.min(30, totalDays)}%` }}
                >
                  {date.getDate()}
                </div>
              );
            })}
          </div>
          
          {/* Uppgifter */}
          <div className="space-y-2">
            {tasks.map(task => {
              const { startPercent, widthPercent } = calculateTaskPosition(task);
              const isExpanded = expandedTasks[task.id] || false;
              
              return (
                <div 
                  key={task.id} 
                  className="bg-[#34495E] border border-[#465C71] rounded-md overflow-hidden transition-all duration-300"
                >
                  {/* Uppgiftsrad */}
                  <div className="flex items-center p-3">
                    <button 
                      onClick={() => toggleTaskExpansion(task.id)}
                      className="mr-2 text-[#3498DB] hover:text-[#2980B9] transition-transform duration-300"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5" />
                      ) : (
                        <ChevronRight className="w-5 h-5" />
                      )}
                    </button>
                    
                    <div className="w-[200px] mr-4">
                      <div className="flex items-center">
                        <span className="font-medium text-[#ECF0F1]">{task.title}</span>
                        {task.is_ata && (
                          <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#F4A261] text-[#1E2A44] rounded">
                            ÄTA
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-[#BDC3C7]">
                        {task.assignee || 'Ej tilldelad'}
                      </div>
                    </div>
                    
                    <div className="flex-grow relative h-6">
                      <div className="absolute top-0 left-0 h-full bg-[#465C71] rounded-sm w-full"></div>
                      <div 
                        className="absolute top-0 left-0 h-full bg-[#3498DB] rounded-sm transition-all duration-300"
                        style={{ 
                          left: `${startPercent}%`, 
                          width: `${widthPercent}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Expanderad vy */}
                  {isExpanded && (
                    <div className="px-10 pb-3 pt-1 text-[#ECF0F1] transition-all duration-300">
                      <Separator className="mb-3 bg-[#465C71]" />
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-1">Detaljer</h4>
                          <p className="text-sm text-[#BDC3C7] mb-2">{task.description || 'Ingen beskrivning'}</p>
                          
                          <div className="flex items-center text-xs text-[#BDC3C7] mb-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>Start: {formatDate(task.start_date)}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-[#BDC3C7] mb-1">
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>Slut: {formatDate(task.end_date)}</span>
                          </div>
                          
                          <div className="flex items-center text-xs text-[#BDC3C7]">
                            <Users className="w-3 h-3 mr-1" />
                            <span>Tilldelad: {task.assignee || 'Ej tilldelad'}</span>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-1">Framsteg</h4>
                          <Progress value={task.progress} className="h-2 mb-1" />
                          <p className="text-xs text-[#BDC3C7]">{task.progress}% färdigt</p>
                          
                          {task.dependencies && task.dependencies.length > 0 && (
                            <div className="mt-3">
                              <h4 className="text-sm font-medium mb-1">Beroenden</h4>
                              <div className="text-xs text-[#BDC3C7]">
                                {task.dependencies.map(depId => {
                                  const depTask = tasks.find(t => t.id === depId);
                                  return (
                                    <div key={depId} className="mb-1">
                                      {depTask ? depTask.title : depId}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-end mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs mr-2 bg-transparent border-[#465C71] text-[#ECF0F1] hover:bg-[#465C71] hover:text-[#ECF0F1]"
                        >
                          Redigera
                        </Button>
                        <Button 
                          size="sm"
                          className="text-xs bg-[#3498DB] hover:bg-[#2980B9] text-white"
                        >
                          Uppdatera status
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Pagination */}
          {tasks.length >= 100 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="bg-transparent border-[#465C71] text-[#ECF0F1] hover:bg-[#465C71] hover:text-[#ECF0F1]"
              >
                Föregående
              </Button>
              <span className="text-sm text-[#BDC3C7]">Sida {page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={tasks.length < 100}
                className="bg-transparent border-[#465C71] text-[#ECF0F1] hover:bg-[#465C71] hover:text-[#ECF0F1]"
              >
                Nästa
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Gantt; 