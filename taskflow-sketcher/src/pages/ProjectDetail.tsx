import SearchBar from "@/components/SearchBar";
import Sidebar from "@/components/Sidebar";
import StatusWidget from "@/components/StatusWidget";
import Communication from "@/components/project/Communication";
import DocumentList from "@/components/project/DocumentList";
import Gantt from "@/components/project/Gantt";
import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectTabs from "@/components/project/ProjectTabs";
import TaskList from "@/components/project/TaskList";
import Timeline from "@/components/project/Timeline";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/task-grid.css';

const ProjectDetail = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statusWidgetCollapsed, setStatusWidgetCollapsed] = useState(false);
  const [isGanttExpanded, setIsGanttExpanded] = useState(false);
  const isMobile = useIsMobile();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'tasks' | 'planering' | 'communication' | 'documents'>('tasks');
  
  useEffect(() => {
    if (isMobile) {
      setSidebarCollapsed(true);
      setStatusWidgetCollapsed(true);
    }
  }, [isMobile]);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setSidebarCollapsed(true);
        setStatusWidgetCollapsed(true);
      } else if (width < 1024) {
        setStatusWidgetCollapsed(true);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleStatusWidget = () => {
    setStatusWidgetCollapsed(!statusWidgetCollapsed);
  };

  // Mock project data based on id - fixing the status type to match ProjectProps
  const projectData = {
    id: id || '1',
    title: 'Anderssons Villaägare',
    subtitle: 'Renovering badrum',
    location: 'Storgatan 12, Stockholm',
    date: '15 aug 2025',
    status: 'planering' as 'planering' | 'byggstart' | 'färdigt' | 'avbrutit',
    progress: 25,
  };

  return (
    <div className="flex h-screen bg-[#1E2A44] overflow-hidden">
      <Sidebar 
        collapsed={sidebarCollapsed} 
        onToggle={toggleSidebar} 
      />
      
      <main className={cn(
        "flex flex-col flex-1 transition-all duration-300",
        sidebarCollapsed ? "ml-[60px]" : "ml-[250px]",
        statusWidgetCollapsed ? "mr-[60px]" : "mr-[320px]"
      )}>
        <SearchBar 
          collapsed={sidebarCollapsed} 
          statusWidgetCollapsed={statusWidgetCollapsed}
          onToggleSidebar={toggleSidebar}
          onToggleStatusWidget={toggleStatusWidget}
        />
        
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-[1200px] mx-auto w-full">
            <ProjectHeader project={projectData} />
            <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            {/* Tab content based on active tab */}
            <div className="p-6">
              {activeTab === 'tasks' && <TaskList projectId={id} />}
              {activeTab === 'planering' && (
                <div className="space-y-6">
                  <div className={isGanttExpanded ? 'w-full h-[80vh]' : 'w-full h-[300px]'}>
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-semibold text-[#ECF0F1]">Gantt-schema</h3>
                      <button
                        onClick={() => setIsGanttExpanded(!isGanttExpanded)}
                        className="text-[#3498DB] hover:underline transition-all duration-300"
                      >
                        {isGanttExpanded ? 'Kollapsa Gantt' : 'Expandera Gantt'}
                      </button>
                    </div>
                    <div className="border border-[#465C71] rounded-lg overflow-hidden transition-all duration-300">
                      <Gantt projectId={id} />
                    </div>
                  </div>
                  
                  {/* Visa Timeline under Gantt-schemat (endast om Gantt inte är expanderat) */}
                  {!isGanttExpanded && (
                    <div className="border border-[#465C71] rounded-lg p-4">
                      <Timeline projectId={id} />
                    </div>
                  )}
                </div>
              )}
              {activeTab === 'communication' && <Communication projectId={id} />}
              {activeTab === 'documents' && <DocumentList projectId={id} />}
            </div>
          </div>
        </div>
      </main>
      
      <StatusWidget 
        collapsed={statusWidgetCollapsed} 
        onToggle={toggleStatusWidget} 
      />
    </div>
  );
};

export default ProjectDetail;
