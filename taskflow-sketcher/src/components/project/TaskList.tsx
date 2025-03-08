
import { useState } from 'react';
import { Check, Clock, Plus, X } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Task {
  id: string;
  title: string;
  description?: string;
  assignee: string;
  status: 'pending' | 'completed';
  dueDate?: string;
  priority?: 'low' | 'medium' | 'high';
}

interface TaskListProps {
  projectId?: string;
}

const TaskList = ({ projectId }: TaskListProps) => {
  const [tasks, setTasks] = useState<Task[]>([
    { 
      id: '1', 
      title: 'Beställa material', 
      assignee: 'Anna Andersson', 
      status: 'pending',
      priority: 'medium',
      dueDate: '2025-08-05'
    },
    { 
      id: '2', 
      title: 'Boka besiktning', 
      assignee: 'Montörer', 
      status: 'completed',
      priority: 'high',
      dueDate: '2025-08-02'
    }
  ]);
  
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    assignee: '',
    status: 'pending',
    dueDate: '',
    priority: 'medium'
  });
  
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const toggleTaskStatus = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: task.status === 'pending' ? 'completed' : 'pending' } 
        : task
    ));
  };
  
  const addTask = () => {
    if (newTask.title && newTask.assignee) {
      const task: Task = {
        id: Date.now().toString(),
        title: newTask.title,
        description: newTask.description,
        assignee: newTask.assignee,
        status: 'pending',
        dueDate: newTask.dueDate,
        priority: newTask.priority as 'low' | 'medium' | 'high'
      };
      
      setTasks([...tasks, task]);
      setNewTask({
        title: '',
        description: '',
        assignee: '',
        status: 'pending',
        dueDate: '',
        priority: 'medium'
      });
      setDialogOpen(false);
    }
  };
  
  const getPriorityColor = (priority?: string) => {
    switch(priority) {
      case 'low': return 'text-[#3498DB]';
      case 'medium': return 'text-[#F4A261]';
      case 'high': return 'text-[#E74C3C]';
      default: return 'text-[#BDC3C7]';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-[#ECF0F1]">Projektuppgifter</h3>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#3498DB] hover:bg-[#2980B9] rounded-md px-3 py-2 text-[#ECF0F1]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Lägg till uppgift
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#34495E] text-[#ECF0F1] border-[#465C71]">
            <DialogHeader>
              <DialogTitle className="text-[#ECF0F1]">Lägg till ny uppgift</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[#ECF0F1]">Titel</Label>
                <Input 
                  id="title" 
                  value={newTask.title} 
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="bg-[#465C71] border-[#597393] text-[#ECF0F1]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-[#ECF0F1]">Beskrivning</Label>
                <Textarea 
                  id="description" 
                  value={newTask.description} 
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="bg-[#465C71] border-[#597393] text-[#ECF0F1] min-h-[100px]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assignee" className="text-[#ECF0F1]">Tilldelad</Label>
                <Input 
                  id="assignee" 
                  value={newTask.assignee} 
                  onChange={(e) => setNewTask({...newTask, assignee: e.target.value})}
                  className="bg-[#465C71] border-[#597393] text-[#ECF0F1]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dueDate" className="text-[#ECF0F1]">Förfallodatum</Label>
                <Input 
                  id="dueDate" 
                  type="date" 
                  value={newTask.dueDate} 
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="bg-[#465C71] border-[#597393] text-[#ECF0F1]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="priority" className="text-[#ECF0F1]">Prioritet</Label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value) => setNewTask({...newTask, priority: value as 'low' | 'medium' | 'high'})}
                >
                  <SelectTrigger id="priority" className="bg-[#465C71] border-[#597393] text-[#ECF0F1]">
                    <SelectValue placeholder="Välj prioritet" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#34495E] border-[#465C71] text-[#ECF0F1]">
                    <SelectItem value="low">Låg</SelectItem>
                    <SelectItem value="medium">Medel</SelectItem>
                    <SelectItem value="high">Hög</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={addTask}
                  className="bg-[#3498DB] hover:bg-[#2980B9] text-[#ECF0F1]"
                >
                  Lägg till
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-2">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            className="bg-[#34495E] border border-[#465C71] rounded-lg h-[48px] px-4 flex items-center justify-between"
          >
            <div className="flex items-center flex-1">
              <button 
                className={`w-8 h-8 rounded-full mr-3 flex items-center justify-center ${
                  task.status === 'pending' 
                    ? 'bg-[#F4A261]/20 text-[#F4A261]' 
                    : 'bg-[#2ECC71]/20 text-[#2ECC71]'
                }`}
                onClick={() => toggleTaskStatus(task.id)}
              >
                {task.status === 'pending' 
                  ? <Clock className="h-4 w-4" /> 
                  : <Check className="h-4 w-4" />
                }
              </button>
              
              <div className="flex-1">
                <span className="text-[#ECF0F1] text-sm">{task.title}</span>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className={`text-xs ${getPriorityColor(task.priority)} mr-4`}>
                {task.priority === 'low' ? 'Låg' : task.priority === 'medium' ? 'Medel' : 'Hög'}
              </span>
              
              <span className="text-[#BDC3C7] text-sm mr-4">{task.assignee}</span>
              
              <button className="text-[#E74C3C] hover:bg-[#E74C3C]/10 p-1 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
