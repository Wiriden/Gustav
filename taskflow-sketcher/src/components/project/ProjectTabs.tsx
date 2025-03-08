import { cn } from "@/lib/utils";

type TabType = 'tasks' | 'planering' | 'communication' | 'documents';

interface ProjectTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const ProjectTabs = ({ activeTab, onTabChange }: ProjectTabsProps) => {
  const tabs = [
    { id: 'tasks', name: 'Uppgifter' },
    { id: 'planering', name: 'Planering' },
    { id: 'communication', name: 'Kommunikation' },
    { id: 'documents', name: 'Dokument' }
  ] as const;

  return (
    <div className="px-6">
      <div className="overflow-x-auto">
        <div className="flex border-b border-[#465C71] min-w-max">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={cn(
                "px-4 py-2 text-base transition-colors relative",
                activeTab === tab.id 
                  ? "text-[#ECF0F1]" 
                  : "text-[#BDC3C7] hover:text-[#ECF0F1]"
              )}
              onClick={() => onTabChange(tab.id)}
            >
              {tab.name}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#3498DB]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProjectTabs;
