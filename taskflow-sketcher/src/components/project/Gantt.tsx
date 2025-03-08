import { supabase } from '@/lib/supabase';
import * as d3 from 'd3';
import { AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';

/**
 * Interface för en uppgift i Gantt-diagrammet
 * Följer Tasks Table-schemat från architecture.mermaid
 */
interface Task {
  id: number;
  project_id: number;
  company_id: number;
  title: string;
  start_date: string;
  end_date: string;
  progress: number;
  dependencies: number[] | null;
  is_ata: boolean;
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
  const [tasks, setTasks] = useState<Task[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [criticalPath, setCriticalPath] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .limit(100);
      if (error) {
        setError(error.message);
        console.error('Error fetching tasks:', error);
      } else {
        setTasks(data || []);
      }
    };

    fetchTasks();
  }, []);

  // Funktion för att växla ÄTA-status för en uppgift
  const toggleAta = async (taskId: number, isAta: boolean) => {
    const { error } = await supabase
      .from('tasks')
      .update({ is_ata: !isAta })
      .eq('id', taskId);
    if (error) {
      setError(error.message);
      console.error('Error updating ÄTA:', error);
    } else {
      setTasks(tasks.map(task => task.id === taskId ? { ...task, is_ata: !isAta } : task));
    }
  };

  // Beräkna kritiska vägar med Critical Path Method (CPM)
  useEffect(() => {
    if (tasks.length === 0) return;
    
    // Beräkna duration för varje uppgift i dagar
    const calculateDuration = (task: Task) => {
      const startDate = new Date(task.start_date);
      const endDate = new Date(task.end_date);
      return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)));
    };
    
    // Skapa en graf av uppgifter och deras beroenden
    const taskMap: { [key: number]: Task } = {};
    tasks.forEach(task => {
      taskMap[task.id] = task;
    });
    
    // Beräkna earliest start/finish och latest start/finish för varje uppgift
    const durations: { [key: number]: number } = {};
    const earliestStart: { [key: number]: number } = {};
    const earliestFinish: { [key: number]: number } = {};
    const latestStart: { [key: number]: number } = {};
    const latestFinish: { [key: number]: number } = {};
    
    // Initialisera värden
    tasks.forEach(task => {
      durations[task.id] = calculateDuration(task);
      earliestStart[task.id] = 0;
      earliestFinish[task.id] = durations[task.id];
    });
    
    // Framåtpass - beräkna earliest start/finish
    let changed = true;
    while (changed) {
      changed = false;
      tasks.forEach(task => {
        if (task.dependencies && task.dependencies.length > 0) {
          let maxEarliestFinish = 0;
          task.dependencies.forEach(depId => {
            if (earliestFinish[depId] > maxEarliestFinish) {
              maxEarliestFinish = earliestFinish[depId];
            }
          });
          
          if (maxEarliestFinish > 0 && earliestStart[task.id] !== maxEarliestFinish) {
            earliestStart[task.id] = maxEarliestFinish;
            earliestFinish[task.id] = maxEarliestFinish + durations[task.id];
            changed = true;
          }
        }
      });
    }
    
    // Hitta projektets sluttid (max earliest finish)
    const projectEnd = Math.max(...Object.values(earliestFinish));
    
    // Initialisera latest finish till projektets sluttid
    tasks.forEach(task => {
      latestFinish[task.id] = projectEnd;
      latestStart[task.id] = projectEnd - durations[task.id];
    });
    
    // Bakåtpass - beräkna latest start/finish
    changed = true;
    while (changed) {
      changed = false;
      // Gå igenom uppgifterna i omvänd ordning
      [...tasks].reverse().forEach(task => {
        // Hitta alla uppgifter som beror på denna uppgift
        const dependents = tasks.filter(t => 
          t.dependencies && t.dependencies.includes(task.id)
        );
        
        if (dependents.length > 0) {
          let minLatestStart = Number.MAX_SAFE_INTEGER;
          dependents.forEach(dep => {
            if (latestStart[dep.id] < minLatestStart) {
              minLatestStart = latestStart[dep.id];
            }
          });
          
          if (minLatestStart < Number.MAX_SAFE_INTEGER && latestFinish[task.id] !== minLatestStart) {
            latestFinish[task.id] = minLatestStart;
            latestStart[task.id] = minLatestStart - durations[task.id];
            changed = true;
          }
        }
      });
    }
    
    // Beräkna slack för varje uppgift och identifiera kritiska vägar (slack = 0)
    const criticalTasks: number[] = [];
    tasks.forEach(task => {
      const slack = latestStart[task.id] - earliestStart[task.id];
      if (Math.abs(slack) < 0.001) {
        criticalTasks.push(task.id);
      }
    });
    
    setCriticalPath(criticalTasks);
  }, [tasks]);

  useEffect(() => {
    if (tasks.length === 0) return;

    const width = 800;
    const height = tasks.length * 40 + 50;
    const svg = d3.select('#gantt-chart')
      .attr('width', width)
      .attr('height', height);

    svg.selectAll('*').remove();

    const xScale = d3.scaleTime()
      .domain([
        d3.min(tasks, d => new Date(d.start_date))!,
        d3.max(tasks, d => new Date(d.end_date))!
      ])
      .range([0, width - 150]);

    // Rita uppgifter
    svg.selectAll('rect')
      .data(tasks)
      .enter()
      .append('rect')
      .attr('x', d => xScale(new Date(d.start_date)) + 100)
      .attr('y', (d, i) => i * 40 + 30)
      .attr('width', d => xScale(new Date(d.end_date)) - xScale(new Date(d.start_date)))
      .attr('height', 20)
      .attr('fill', d => criticalPath.includes(d.id) ? '#E74C3C' : '#3498DB')
      .attr('class', 'transition-all duration-300 cursor-pointer')
      .on('click', (event, d) => setExpanded(expanded === d.id ? null : d.id));

    // Rita uppgiftsetiketter
    svg.selectAll('text.task-label')
      .data(tasks)
      .enter()
      .append('text')
      .attr('class', 'task-label')
      .attr('x', 10)
      .attr('y', (d, i) => i * 40 + 45)
      .text(d => d.title + (criticalPath.includes(d.id) ? ' (Kritisk)' : '') + (d.is_ata ? ' (ÄTA)' : ''))
      .attr('fill', '#FFFFFF');

    // Rita ÄTA-ikoner
    svg.selectAll('g.ata-icon')
      .data(tasks.filter(task => task.is_ata))
      .enter()
      .append('g')
      .attr('class', 'ata-icon')
      .attr('transform', (d, i) => {
        const taskIndex = tasks.findIndex(t => t.id === d.id);
        return `translate(${xScale(new Date(d.start_date)) + 80}, ${taskIndex * 40 + 30})`;
      })
      .append('path')
      .attr('d', 'M0 0 L10 5 L0 10 Z')
      .attr('fill', '#F4A261')
      .attr('class', 'transition-all duration-300');

    // Lägg till pilmarkör för beroenden
    svg.append('defs').append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 5)
      .attr('refY', 5)
      .attr('markerWidth', 6)
      .attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#3498DB');

    // Rita beroenden med pilar och etiketter
    tasks.forEach((task, i) => {
      if (task.dependencies && task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          const depTask = tasks.find(t => t.id === depId);
          if (depTask) {
            const depIndex = tasks.indexOf(depTask);
            const isCriticalDependency = criticalPath.includes(task.id) && criticalPath.includes(depId);
            
            const group = svg.append('g')
              .attr('class', 'dependency-line')
              .on('mouseover', function() {
                d3.select(this).select('line').attr('stroke', '#E74C3C');
                d3.select(this).select('text').attr('opacity', 1);
              })
              .on('mouseout', function() {
                d3.select(this).select('line')
                  .attr('stroke', isCriticalDependency ? '#E74C3C' : '#3498DB');
                d3.select(this).select('text').attr('opacity', 0);
              });

            group.append('line')
              .attr('x1', xScale(new Date(depTask.end_date)) + 100)
              .attr('y1', depIndex * 40 + 40)
              .attr('x2', xScale(new Date(task.start_date)) + 100)
              .attr('y2', i * 40 + 40)
              .attr('stroke', isCriticalDependency ? '#E74C3C' : '#3498DB')
              .attr('stroke-width', isCriticalDependency ? 3 : 2)
              .attr('marker-end', 'url(#arrow)')
              .attr('class', 'transition-all duration-300');

            group.append('text')
              .attr('x', (xScale(new Date(depTask.end_date)) + xScale(new Date(task.start_date))) / 2 + 100)
              .attr('y', (depIndex * 40 + i * 40) / 2 + 40)
              .text(`Beroende av ${depTask.title}${isCriticalDependency ? ' (Kritisk)' : ''}`)
              .attr('fill', '#FFFFFF')
              .attr('opacity', 0)
              .attr('class', 'transition-all duration-300');
          }
        });
      }
    });

    // Lägg till förklaring för kritiska vägar och ÄTA
    const legend = svg.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(${width - 140}, 10)`);
    
    // Kritisk väg
    legend.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 20)
      .attr('height', 10)
      .attr('fill', '#E74C3C');
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 10)
      .text('Kritisk väg')
      .attr('fill', '#FFFFFF')
      .attr('font-size', '12px');
    
    // ÄTA
    legend.append('path')
      .attr('d', 'M0 20 L10 25 L0 30 Z')
      .attr('fill', '#F4A261');
    
    legend.append('text')
      .attr('x', 25)
      .attr('y', 30)
      .text('ÄTA-arbete')
      .attr('fill', '#FFFFFF')
      .attr('font-size', '12px');
  }, [tasks, expanded, criticalPath]);

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
    <div className="p-4 bg-[#1E2A44] rounded-lg">
      <h2 className="text-xl text-[#3498DB] mb-4">Gantt-diagram</h2>
      {error && <p className="text-[#E74C3C] mb-2">{error}</p>}
      <div className="mb-2">
        <span className="text-white">Kritiska vägar: </span>
        <span className="text-[#E74C3C]">{criticalPath.length} uppgifter</span>
        <span className="text-white ml-4">ÄTA-arbeten: </span>
        <span className="text-[#F4A261]">{tasks.filter(t => t.is_ata).length} uppgifter</span>
      </div>
      <svg id="gantt-chart" />
      {tasks.map(task => (
        expanded === task.id && (
          <div key={task.id} className="mt-2 p-2 bg-[#2A3A5E] rounded transition-all duration-300">
            <p>Start: {formatDate(task.start_date)}</p>
            <p>Slut: {formatDate(task.end_date)}</p>
            <p>Framsteg: {task.progress}%</p>
            <p>Beroenden: {task.dependencies ? task.dependencies.map(depId => {
              const depTask = tasks.find(t => t.id === depId);
              return depTask ? depTask.title : depId;
            }).join(', ') : 'Inga'}</p>
            <p>Kritisk väg: <span className={criticalPath.includes(task.id) ? 'text-[#E74C3C]' : ''}>{criticalPath.includes(task.id) ? 'Ja' : 'Nej'}</span></p>
            <div className="flex items-center mt-2">
              <AlertTriangle className={`mr-2 ${task.is_ata ? 'text-[#F4A261]' : 'text-gray-400'}`} />
              <button
                onClick={() => toggleAta(task.id, task.is_ata)}
                className="text-[#3498DB] hover:underline"
              >
                {task.is_ata ? 'Ta bort ÄTA' : 'Markera som ÄTA'}
              </button>
            </div>
          </div>
        )
      ))}
    </div>
  );
};

export default Gantt; 