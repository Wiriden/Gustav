
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { MapPin, Calendar, User, CircleDot } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";

export type TaskStatus = 'planering' | 'byggstart' | 'färdigt' | 'avbrutit';

export interface TaskCardProps {
  id: string;
  title: string;
  customer: string;
  location: string;
  date: string;
  status: TaskStatus;
  assignee?: string;
  progress?: number;
}

const getStatusColor = (status: TaskStatus) => {
  switch(status) {
    case 'planering': return 'bg-status-planning border-status-planning';
    case 'byggstart': return 'bg-status-construction border-status-construction';
    case 'färdigt': return 'bg-status-completed border-status-completed';
    case 'avbrutit': return 'bg-destructive border-destructive';
    default: return 'bg-muted border-muted';
  }
};

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

const getStatusIconColor = (status: TaskStatus) => {
  switch(status) {
    case 'planering': return '#F4A261';
    case 'byggstart': return '#2ECC71';
    case 'färdigt': return '#2ECC71';
    case 'avbrutit': return '#E74C3C';
    default: return '#BDC3C7';
  }
};

const TaskCard = ({ id, title, customer, location, date, status, assignee, progress = 0 }: TaskCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };
  
  const viewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/project/${id}`);
  };
  
  return (
    <div 
      className={cn(
        "relative w-full neo-card overflow-hidden cursor-pointer",
        "transition-all duration-300",
        isExpanded ? "h-[300px] scale-105" : "h-[180px]",
        isHovered && !isExpanded && "hover:scale-105 hover:shadow-lg",
        "animate-fade-in"
      )}
      onClick={toggleExpand}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{ maxWidth: '300px' }}
    >
      <div className={cn("status-indicator", getStatusColor(status))}></div>
      
      <div className="p-5 pl-6 h-full flex flex-col">
        <div className="flex items-center mb-2 pt-1 pl-1">
          <CircleDot className="h-4 w-4 mr-2" style={{ color: getStatusIconColor(status) }} />
          <div className="text-lg font-bold text-[#ECF0F1]">{customer}</div>
        </div>
        
        <h3 className="text-base font-medium text-[#BDC3C7] mb-3 pl-1 truncate">{title}</h3>
        
        <div className="space-y-3 mb-auto">
          <div className="flex items-center text-sm text-[#BDC3C7]">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          
          <div className="flex items-center text-sm text-[#BDC3C7]">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{date}</span>
          </div>
        </div>
        
        <div className="flex justify-between items-center mt-auto">
          {assignee ? (
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2 bg-primary/20">
                <div className="bg-primary text-xs text-primary-foreground font-medium flex items-center justify-center h-full">
                  {assignee.charAt(0)}
                </div>
              </Avatar>
            </div>
          ) : <div />}
          
          <Badge 
            variant="outline" 
            className={cn(
              "font-medium rounded-md px-3 py-1", 
              getStatusBadgeStyle(status)
            )}
          >
            {getStatusText(status)}
          </Badge>
        </div>
        
        {!isExpanded && (
          <div className="mt-2">
            <div className="flex justify-between items-center text-xs text-[#BDC3C7]">
              <span>Framsteg</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-1 bg-background mt-1" 
              style={{ 
                '--progress-background': '#3498DB'
              } as React.CSSProperties} 
            />
          </div>
        )}
        
        {isExpanded && (
          <div className="mt-4 animate-fade-in">
            <div className="mb-2 flex justify-between items-center">
              <span className="text-sm text-[#BDC3C7]">Framsteg</span>
              <span className="text-sm text-[#BDC3C7]">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-background" 
              style={{ 
                '--progress-background': '#3498DB'
              } as React.CSSProperties} 
            />
            
            <div className="mt-4 flex justify-end">
              <Button variant="secondary" size="sm" className="mr-2 bg-[#34495E] text-[#ECF0F1] hover:bg-[#3498DB]">
                Redigera
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                className="bg-[#3498DB] text-[#ECF0F1] hover:bg-[#2980B9]"
                onClick={viewDetails}
              >
                Visa detaljer
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
