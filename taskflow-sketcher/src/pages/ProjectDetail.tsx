
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import StatusWidget from "@/components/StatusWidget";
import ProjectHeader from "@/components/project/ProjectHeader";
import ProjectTabs from "@/components/project/ProjectTabs";
import TaskList from "@/components/project/TaskList";
import Timeline from "@/components/project/Timeline";
import Communication from "@/components/project/Communication";
import DocumentList from "@/components/project/DocumentList";
import { cn } from "@/lib/utils";
import '../styles/task-grid.css';

const ProjectDetail = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statusWidgetCollapsed, setStatusWidgetCollapsed] = useState(false);
  const isMobile = useIsMobile();
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState<'tasks' | 'timeline' | 'communication' | 'documents'>('tasks');
  
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
              {activeTab === 'timeline' && <Timeline projectId={id} />}
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
