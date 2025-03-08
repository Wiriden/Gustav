
import { useState } from 'react';
import { MapPin, Calendar } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ProjectProps {
  id: string;
  title: string;
  subtitle: string;
  location: string;
  date: string;
  status: 'planering' | 'byggstart' | 'färdigt' | 'avbrutit';
  progress: number;
}

interface ProjectHeaderProps {
  project: ProjectProps;
}

const ProjectHeader = ({ project }: ProjectHeaderProps) => {
  const [status, setStatus] = useState(project.status);
  const [progress, setProgress] = useState(project.progress);

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as 'planering' | 'byggstart' | 'färdigt' | 'avbrutit');
    
    // Update progress based on status
    switch(newStatus) {
      case 'planering':
        setProgress(25);
        break;
      case 'byggstart':
        setProgress(50);
        break;
      case 'färdigt':
        setProgress(100);
        break;
      default:
        setProgress(0);
    }
  };
  
  const getStatusColor = () => {
    switch(status) {
      case 'planering': return '#F4A261';
      case 'byggstart': return '#2ECC71';
      case 'färdigt': return '#2ECC71';
      case 'avbrutit': return '#E74C3C';
      default: return '#BDC3C7';
    }
  };

  return (
    <div className="bg-[#34495E] border border-[#465C71] rounded-lg p-6 my-6 mx-6">
      <div className="mb-4">
        <h1 className="text-[#ECF0F1] text-2xl font-bold">{project.title}</h1>
        <h2 className="text-[#BDC3C7] text-base font-medium mt-1">{project.subtitle}</h2>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm text-[#ECF0F1]">
            <MapPin className="h-4 w-4 mr-2" />
            <span>{project.location}</span>
          </div>
          
          <div className="flex items-center text-sm text-[#ECF0F1]">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{project.date}</span>
          </div>
        </div>
        
        <div className="mt-4 sm:mt-0">
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger 
              className="w-[150px] bg-[#34495E] border-[#465C71] text-[#ECF0F1]"
              style={{ backgroundColor: getStatusColor(), color: '#1E2A44' }}
            >
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-[#34495E] border-[#465C71] text-[#ECF0F1]">
              <SelectItem value="planering">Planering</SelectItem>
              <SelectItem value="byggstart">Byggstart</SelectItem>
              <SelectItem value="färdigt">Färdig</SelectItem>
              <SelectItem value="avbrutit">Avbruten</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[#BDC3C7]">Framsteg</span>
          <span className="text-sm text-[#BDC3C7]">{progress}%</span>
        </div>
        <Progress 
          value={progress} 
          className="h-[8px] w-[200px] bg-[#465C71]" 
          style={{ 
            '--progress-background': '#3498DB',
            transition: 'all 0.5s ease-in-out'
          } as React.CSSProperties} 
        />
      </div>
    </div>
  );
};

export default ProjectHeader;
