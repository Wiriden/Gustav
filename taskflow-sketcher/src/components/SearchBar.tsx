
import { Search, Bell, PanelLeft, PanelRight } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  collapsed: boolean;
  statusWidgetCollapsed: boolean;
  onToggleSidebar: () => void;
  onToggleStatusWidget: () => void;
}

const SearchBar = ({ 
  collapsed, 
  statusWidgetCollapsed, 
  onToggleSidebar, 
  onToggleStatusWidget 
}: SearchBarProps) => {
  return (
    <div className="w-full h-[60px] px-4 flex items-center justify-between header-gradient border-b border-[#465C71]">
      <div className="flex items-center">
        <div className="flex items-center mr-8">
          <div className="h-8 w-8 rounded-full bg-[#3498DB] flex items-center justify-center text-[#ECF0F1] font-medium mr-2">
            S
          </div>
          <span className="font-bold text-xl text-[#ECF0F1]">Svenssons Bygg AB</span>
        </div>
        
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#BDC3C7]" />
          <Input 
            className="pl-10 w-[300px] h-[40px] bg-[#34495E] border-2 border-[#3498DB] rounded-lg focus-visible:ring-[#3498DB] text-[#ECF0F1] placeholder-[#BDC3C7]" 
            placeholder="Sök projekt eller kund..." 
          />
        </div>
      </div>
      
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "mr-2 text-[#ECF0F1] hover:bg-[#465C71]/30",
            !statusWidgetCollapsed && "text-[#3498DB]"
          )}
          onClick={onToggleStatusWidget}
          title="Manöverpanelen"
        >
          {statusWidgetCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
        </Button>
        
        <Button variant="ghost" size="icon" className="mr-2 relative hover:bg-[#465C71]/30 text-[#ECF0F1]">
          <Bell className="h-6 w-6" />
          <Badge 
            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-[#E74C3C]"
          >
            3
          </Badge>
        </Button>
        
        <div className="flex items-center space-x-2">
          <div className="flex flex-col items-end">
            <span className="text-sm font-medium text-[#ECF0F1]">Gustav</span>
            <span className="text-xs text-[#BDC3C7]">Admin</span>
          </div>
          <div className="h-10 w-10 rounded-full bg-[#3498DB] flex items-center justify-center text-[#ECF0F1] font-medium">
            G
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchBar;
