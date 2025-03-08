
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  Package, 
  ShoppingCart, 
  BarChart2, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react';

type NavItem = {
  name: string;
  path: string;
  icon: React.ReactNode;
  count?: number;
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  
  const navItems: NavItem[] = [
    { name: 'Översikt', path: '/', icon: <LayoutDashboard className="h-5 w-5" /> },
    { name: 'Byggprojekt', path: '/projects', icon: <ClipboardList className="h-5 w-5" />, count: 5 },
    { name: 'Kunder', path: '/customers', icon: <Users className="h-5 w-5" /> },
    { name: 'Lager', path: '/inventory', icon: <Package className="h-5 w-5" /> },
    { name: 'Inköp', path: '/purchases', icon: <ShoppingCart className="h-5 w-5" /> },
    { name: 'Insikter', path: '/insights', icon: <BarChart2 className="h-5 w-5" /> },
  ];

  return (
    <div 
      className={cn(
        "flex flex-col h-screen bg-[#1E2A44] py-6 fixed z-10 transition-all duration-300 ease-in-out border-r border-[#465C71] left-0",
        collapsed ? "w-[60px]" : "w-[250px]"
      )}
    >
      <div className="flex items-center px-6 mb-8">
        {!collapsed && (
          <div className="flex items-center space-x-2 animate-fade-in">
            <div className="h-8 w-8 rounded-full bg-[#3498DB] flex items-center justify-center text-[#ECF0F1] font-medium">
              S
            </div>
            <span className="font-semibold text-lg text-[#ECF0F1]">Svenssons Bygg AB</span>
          </div>
        )}
        {collapsed && (
          <div className="w-full flex justify-center animate-fade-in">
            <div className="h-10 w-10 rounded-full bg-[#3498DB] flex items-center justify-center text-[#ECF0F1] font-medium">
              S
            </div>
          </div>
        )}
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-4 py-3 text-base rounded-md transition-all duration-200",
                location.pathname === item.path 
                  ? "bg-[#3498DB] text-[#ECF0F1]" 
                  : "text-[#ECF0F1] hover:bg-[#34495E]",
                collapsed ? "justify-center" : "justify-between"
              )}
            >
              <div className="flex items-center">
                <div className={cn("flex items-center justify-center", collapsed ? "" : "mr-3")}>
                  {item.icon}
                </div>
                {!collapsed && <span>{item.name}</span>}
              </div>
              {!collapsed && item.count !== undefined && (
                <div className="bg-[#3498DB]/20 text-[#ECF0F1] font-medium text-xs rounded-full px-2 py-0.5 min-w-[22px] text-center">
                  {item.count}
                </div>
              )}
            </Link>
          ))}
        </nav>
      </div>
      
      <div className="px-4 mt-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="w-full flex justify-center p-2 hover:bg-[#34495E] text-[#ECF0F1]"
        >
          {collapsed ? 
            <ChevronRight className="h-5 w-5" /> : 
            <ChevronLeft className="h-5 w-5" />
          }
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
