
import { useState } from 'react';
import { cn } from "@/lib/utils";
import { 
  Bell, 
  ChevronDown,
  CheckCircle2,
  Clock,
  Calendar,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  CircleCheck,
  BarChart2,
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";

interface StatusWidgetProps {
  collapsed: boolean;
  onToggle: () => void;
}

const StatusWidget = ({ collapsed, onToggle }: StatusWidgetProps) => {
  const [remindersOpen, setRemindersOpen] = useState(true);
  const [summaryOpen, setSummaryOpen] = useState(true);
  
  const markAsDone = (reminderIndex: number) => {
    // In a real implementation, this would update the backend
    console.log(`Marking reminder ${reminderIndex} as done`);
    // We would update state here to remove or check the item
  };
  
  return (
    <div 
      className={cn(
        "h-full flex flex-col bg-[#34495E] border-l border-[#465C71] transition-all duration-300 ease-in-out overflow-hidden fixed right-0 z-10",
        collapsed ? "w-[60px]" : "w-[320px]"
      )}
    >
      {collapsed ? (
        <div className="h-full flex flex-col items-center py-4">
          <div className="rotate-90 whitespace-nowrap text-lg font-semibold text-[#ECF0F1] absolute top-1/3 -translate-y-1/2">
            Manöverpanelen
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle} 
            className="absolute top-[65%] -translate-x-1/2 text-[#ECF0F1] hover:bg-[#465C71]/30 z-[1001]"
            style={{ left: '30px' }}  // Adjusted position to ensure visibility
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>
      ) : (
        <div className="animate-fade-in h-full overflow-y-auto p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-lg font-semibold text-[#ECF0F1]">Manöverpanelen</h2>
            <div className="flex items-center">
              <Button 
                size="icon" 
                variant="ghost" 
                className="h-6 w-6 text-[#ECF0F1] hover:bg-[#465C71]/30 mr-1"
                onClick={onToggle}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-[#BDC3C7] mb-6">Översikt av aktuella uppdrag</p>
          
          <div className="space-y-4 mb-8">
            {/* Summary section - only hide the content, not the card itself */}
            <div 
              className="neo-card p-4 cursor-pointer" 
              onClick={() => setSummaryOpen(!summaryOpen)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <BarChart2 className="h-4 w-4 mr-2 text-[#3498DB]" />
                  <span className="text-sm font-medium text-[#ECF0F1]">Aktiva uppdrag</span>
                </div>
                <div className="flex items-center">
                  <span className="text-2xl font-semibold text-[#3498DB]">5</span>
                  <div className="w-20 h-20 ml-2 relative">
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="36" 
                        fill="none" 
                        stroke="#34495E" 
                        strokeWidth="8"
                      />
                      <circle 
                        cx="40" 
                        cy="40" 
                        r="36" 
                        fill="none" 
                        stroke="#3498DB" 
                        strokeWidth="8"
                        strokeDasharray="226.2"
                        strokeDashoffset="113.1" // 50% progress
                        transform="rotate(-90 40 40)"
                        className="transition-all duration-1000 ease-in-out"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Show/hide additional content based on summaryOpen state */}
              {summaryOpen && (
                <div className="animate-accordion-down mt-2">
                  <div className="neo-card p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <CircleCheck className="h-4 w-4 mr-2 text-[#2ECC71]" />
                        <span className="text-sm font-medium text-[#ECF0F1]">Färdiga i år</span>
                      </div>
                      <span className="text-2xl font-semibold text-[#2ECC71]">12</span>
                    </div>
                    <div className="mt-2">
                      <Progress 
                        value={50} 
                        className="h-[6px] bg-[#34495E]" 
                        style={{ 
                          '--progress-background': '#2ECC71'
                        } as React.CSSProperties} 
                      />
                    </div>
                  </div>
                  
                  <div className="neo-card p-4 mt-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2 text-[#E74C3C]" />
                        <span className="text-sm font-medium text-[#ECF0F1]">Kunder att kontakta</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-2xl font-semibold text-[#E74C3C]">3</span>
                        <div className="w-3 h-3 rounded-full bg-[#E74C3C] ml-2"></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="mb-6">
            <div 
              className="flex items-center justify-between mb-4 cursor-pointer" 
              onClick={() => setRemindersOpen(!remindersOpen)}
            >
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2 text-[#ECF0F1]" />
                <h3 className="font-medium text-[#ECF0F1]">Att göra</h3>
              </div>
              <Button size="icon" variant="ghost" className="h-6 w-6 text-[#ECF0F1] hover:bg-[#465C71]/30">
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform", 
                  remindersOpen ? "transform rotate-180" : ""
                )} />
              </Button>
            </div>
            
            {remindersOpen && (
              <div className="animate-accordion-down space-y-3">
                <div className="neo-card p-3 flex items-start">
                  <div className="mt-0.5 mr-3">
                    <Clock className="h-4 w-4 text-[#F4A261]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#ECF0F1]">Beställa kakel (10 aug)</p>
                    <p className="text-xs text-[#BDC3C7]">Erikssons Fastigheter AB</p>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 text-[#BDC3C7] hover:text-[#2ECC71]"
                    onClick={() => markAsDone(0)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="neo-card p-3 flex items-start bg-[#E74C3C]/10">
                  <div className="mt-0.5 mr-3">
                    <Calendar className="h-4 w-4 text-[#F4A261]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#ECF0F1]">Boka besiktning (15 aug)</p>
                    <p className="text-xs text-[#BDC3C7]">Anderssons Villaägare</p>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 text-[#BDC3C7] hover:text-[#2ECC71]"
                    onClick={() => markAsDone(1)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="neo-card p-3 flex items-start">
                  <div className="mt-0.5 mr-3">
                    <CheckCircle2 className="h-4 w-4 text-[#2ECC71]" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#ECF0F1]">Fakturera Andersson (20 aug)</p>
                    <p className="text-xs text-[#BDC3C7]">Anderssons Villaägare</p>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="h-6 w-6 text-[#BDC3C7] hover:text-[#2ECC71]"
                    onClick={() => markAsDone(2)}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start text-[#3498DB] text-sm mt-2 hover:bg-[#465C71]/30"
                >
                  <span>Visa alla</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusWidget;
