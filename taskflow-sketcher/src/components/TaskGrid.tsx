import { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import TaskCard, { TaskStatus } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Filter, 
  LayoutGrid,
  List,
  Calendar,
  MapPin
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useIsMobile } from "@/hooks/use-mobile";

interface Task {
  id: string;
  title: string;
  customer: string;
  location: string;
  date: string;
  status: TaskStatus;
  assignee?: string;
  progress?: number;
}

interface TaskGridProps {
  sidebarCollapsed: boolean;
}

const TaskGrid = ({ sidebarCollapsed }: TaskGridProps) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed'>('active');
  const isMobile = useIsMobile();
  const [columns, setColumns] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setColumns(1);
      } else if (width < 1024) {
        setColumns(2);
      } else {
        setColumns(3);
      }
    };
    
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const tasks: Task[] = [
    {
      id: '1',
      title: 'Renovering badrum',
      customer: 'Anderssons Villaägare',
      location: 'Storgatan 12, Stockholm',
      date: '15 aug 2025',
      status: 'planering',
      progress: 25,
    },
    {
      id: '2',
      title: 'Nytt kök installation',
      customer: 'Erikssons Fastigheter AB',
      location: 'Björkvägen 8, Göteborg',
      date: '22 aug 2025',
      status: 'byggstart',
      progress: 60,
    },
    {
      id: '3',
      title: 'Takläggning flerbostadshus',
      customer: 'Kommunala Bostäder',
      location: 'Parkgatan 45, Malmö',
      date: '5 aug 2025',
      status: 'färdigt',
      progress: 100,
    },
    {
      id: '4',
      title: 'Målning fasad',
      customer: 'Petterssons Boende',
      location: 'Lindvägen 23, Uppsala',
      date: '10 sep 2025',
      status: 'planering',
      assignee: 'Johan',
      progress: 15,
    },
    {
      id: '5',
      title: 'Installation av fiber',
      customer: 'BRF Solsidan',
      location: 'Solsidan 1, Täby',
      date: '18 aug 2025',
      status: 'byggstart',
      progress: 45,
    },
    {
      id: '6',
      title: 'Mainline',
      customer: 'Petterssons Bostäder',
      location: 'Lindvägen 10, Malmö',
      date: '10 sep 2025',
      status: 'planering',
      progress: 10,
    }
  ];
  
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return task.status === 'planering' || task.status === 'byggstart';
    if (activeTab === 'completed') return task.status === 'färdigt';
    return true;
  });
  
  return (
    <div className="w-full">
      <div className="px-6 mt-6 mb-6">
        <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#BDC3C7]" />
            <Input 
              className="pl-10 w-full md:w-[200px] h-[40px] bg-[#34495E] border-[#3498DB] border-2 rounded-lg text-[#ECF0F1] placeholder-[#BDC3C7]" 
              placeholder="Sök kund..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2">
            <div className="flex space-x-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px] bg-[#34495E] text-[#ECF0F1] border-none rounded-md py-2">
                  <div className="flex items-center">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    <span>Status: {statusFilter === 'all' ? 'Alla' : 
                           statusFilter === 'planning' ? 'Planering' : 
                           statusFilter === 'active' ? 'Byggstart' : 'Färdigt'}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#34495E] text-[#ECF0F1] border-[#465C71]">
                  <SelectItem value="all">Alla</SelectItem>
                  <SelectItem value="planning">Planering</SelectItem>
                  <SelectItem value="active">Byggstart</SelectItem>
                  <SelectItem value="completed">Färdigt</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-[150px] bg-[#34495E] text-[#ECF0F1] border-none rounded-md py-2">
                  <div className="flex items-center">
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    <span>Sortera: {sortOrder === 'newest' ? 'Datum' : 
                           sortOrder === 'oldest' ? 'Äldsta' : 
                           sortOrder === 'az' ? 'A-Ö' : 'Ö-A'}</span>
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-[#34495E] text-[#ECF0F1] border-[#465C71]">
                  <SelectItem value="newest">Datum</SelectItem>
                  <SelectItem value="oldest">Äldsta</SelectItem>
                  <SelectItem value="az">A-Ö</SelectItem>
                  <SelectItem value="za">Ö-A</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="border border-[#465C71] rounded-md flex">
              <Button 
                variant={viewMode === 'grid' ? "secondary" : "ghost"} 
                size="icon"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none text-[#ECF0F1] hover:bg-[#465C71]/30"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? "secondary" : "ghost"} 
                size="icon"
                onClick={() => setViewMode('list')}
                className="rounded-l-none text-[#ECF0F1] hover:bg-[#465C71]/30"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      
        <div className="flex flex-wrap items-center justify-center border-b mb-6 border-[#465C71]">
          <Button
            variant="ghost"
            className={cn(
              "px-6 py-3 rounded-md font-medium relative transition-colors duration-300 mx-1",
              activeTab === 'all' ? "bg-[#3498DB] text-[#ECF0F1]" : "bg-[#34495E] text-[#ECF0F1]"
            )}
            onClick={() => setActiveTab('all')}
          >
            Alla uppdrag
          </Button>
          
          <Button
            variant="ghost"
            className={cn(
              "px-6 py-3 rounded-md font-medium relative transition-colors duration-300 mx-1",
              activeTab === 'active' ? "bg-[#3498DB] text-[#ECF0F1]" : "bg-[#34495E] text-[#ECF0F1]"
            )}
            onClick={() => setActiveTab('active')}
          >
            Aktiva
          </Button>
          
          <Button
            variant="ghost"
            className={cn(
              "px-6 py-3 rounded-md font-medium relative transition-colors duration-300 mx-1",
              activeTab === 'completed' ? "bg-[#3498DB] text-[#ECF0F1]" : "bg-[#34495E] text-[#ECF0F1]"
            )}
            onClick={() => setActiveTab('completed')}
          >
            Avslutade
          </Button>
        </div>
      </div>
      
      <div className="px-6 pb-20">
        {viewMode === 'grid' ? (
          <div className="task-grid">
            {filteredTasks.map((task) => (
              <TaskCard key={task.id} {...task} />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <div key={task.id} className="flex flex-col md:flex-row md:items-center justify-between bg-[#34495E] rounded-lg p-4 border border-[#465C71] hover:shadow-md transition-shadow">
                <div className="flex-1 mb-3 md:mb-0">
                  <div className="text-[#ECF0F1] font-bold text-lg mb-1">{task.customer}</div>
                  <h3 className="text-[#BDC3C7] text-base">{task.title}</h3>
                </div>
                
                <div className="flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex items-center text-sm text-[#BDC3C7]">
                    <MapPin className="h-4 w-4 mr-1.5" />
                    <span className="truncate">{task.location}</span>
                  </div>
                  
                  <div className="hidden md:block text-muted-foreground">•</div>
                  
                  <div className="flex items-center text-sm text-[#BDC3C7]">
                    <Calendar className="h-4 w-4 mr-1.5" />
                    <span>{task.date}</span>
                  </div>
                  
                  <div className="hidden md:block text-muted-foreground">•</div>
                  
                  <div>
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "font-medium rounded-md px-3 py-1",
                        getStatusBadgeStyle(task.status)
                      )}
                    >
                      {getStatusText(task.status)}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskGrid;

const getStatusText = (status: TaskStatus) => {
  switch(status) {
    case 'planering': return 'Planering';
    case 'byggstart': return 'Byggstart';
    case 'färdigt': return 'Färdigt';
    case 'avbrutit': return 'Avbrutit';
    default: return 'Okänd';
  }
};

const getStatusBadgeStyle = (status: TaskStatus) => {
  switch(status) {
    case 'planering': return 'bg-[#F4A261] text-[#1E2A44]';
    case 'byggstart': return 'bg-[#2ECC71] text-[#1E2A44]';
    case 'färdigt': return 'bg-status-completed text-background';
    case 'avbrutit': return 'bg-destructive text-destructive-foreground';
    default: return 'bg-muted text-muted-foreground';
  }
};
