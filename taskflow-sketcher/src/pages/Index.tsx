
import { useState, useEffect } from 'react';
import { useIsMobile } from "@/hooks/use-mobile";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import TaskGrid from "@/components/TaskGrid";
import StatusWidget from "@/components/StatusWidget";
import NewTaskButton from "@/components/NewTaskButton";
import { cn } from "@/lib/utils";
import '../styles/task-grid.css';

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [statusWidgetCollapsed, setStatusWidgetCollapsed] = useState(false);
  const isMobile = useIsMobile();
  
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
          <TaskGrid sidebarCollapsed={sidebarCollapsed} />
        </div>
      </main>
      
      <StatusWidget 
        collapsed={statusWidgetCollapsed} 
        onToggle={toggleStatusWidget} 
      />
      
      <NewTaskButton />
    </div>
  );
};

export default Index;
