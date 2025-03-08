import { supabase } from '@/lib/supabase';
import { Dialog, Transition } from '@headlessui/react';
import { AlertTriangle, Check, Edit, Plus, Trash2 } from 'lucide-react';
import { Fragment, useEffect, useState } from 'react';

interface TaskManagerProps {
  projectId?: string;
}

interface Task {
  id: number;
  project_id: number;
  company_id: number;
  title: string;
  start_date: string;
  end_date: string;
  progress: number;
  dependencies: number[] | null;
  is_ata: boolean;
}

interface TaskFormData {
  title: string;
  start_date: string;
  end_date: string;
  progress: number;
  dependencies: number[];
  is_ata: boolean;
}

const TaskManager: React.FC<TaskManagerProps> = ({ projectId }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<TaskFormData>({
    title: '',
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    progress: 0,
    dependencies: [],
    is_ata: false
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof TaskFormData, string>>>({});
  
  // Hämta uppgifter för projektet
  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', projectId || '1')
          .order('start_date', { ascending: true });
          
        if (error) throw error;
        
        setTasks(data || []);
      } catch (err) {
        console.error('Error fetching tasks:', err);
        setError('Kunde inte hämta uppgifter');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();
    
    // Realtidsuppdateringar
    const channel = supabase
      .channel('taskmanager-tasks')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'tasks', filter: `project_id=eq.${projectId || '1'}` },
        () => {
          console.log('TaskManager: Task data updated, refreshing...');
          fetchTasks();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);
  
  // Återställ formuläret
  const resetForm = () => {
    setFormData({
      title: '',
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      progress: 0,
      dependencies: [],
      is_ata: false
    });
    setFormErrors({});
    setEditingTask(null);
  };
  
  // Öppna modalfönstret för att lägga till ny uppgift
  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };
  
  // Öppna modalfönstret för att redigera en uppgift
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      start_date: task.start_date.split('T')[0],
      end_date: task.end_date.split('T')[0],
      progress: task.progress,
      dependencies: task.dependencies || [],
      is_ata: task.is_ata
    });
    setIsModalOpen(true);
  };
  
  // Stäng modalfönstret
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };
  
  // Hantera formulärsändringar
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData({ ...formData, [name]: checked });
    } else if (name === 'dependencies') {
      // Hantera multival för beroenden
      const selectedOptions = Array.from((e.target as HTMLSelectElement).selectedOptions, option => parseInt(option.value));
      setFormData({ ...formData, dependencies: selectedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };
  
  // Validera formuläret
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof TaskFormData, string>> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Titel är obligatoriskt';
    }
    
    if (!formData.start_date) {
      errors.start_date = 'Startdatum är obligatoriskt';
    }
    
    if (!formData.end_date) {
      errors.end_date = 'Slutdatum är obligatoriskt';
    }
    
    const startDate = new Date(formData.start_date);
    const endDate = new Date(formData.end_date);
    
    if (startDate > endDate) {
      errors.end_date = 'Slutdatum måste vara efter startdatum';
    }
    
    // Kontrollera cirkulära beroenden
    if (editingTask && formData.dependencies.includes(editingTask.id)) {
      errors.dependencies = 'En uppgift kan inte vara beroende av sig själv';
    }
    
    // Kontrollera datumberoenden
    if (formData.dependencies.length > 0) {
      const dependentTasks = tasks.filter(task => formData.dependencies.includes(task.id));
      for (const depTask of dependentTasks) {
        const depEndDate = new Date(depTask.end_date);
        if (startDate < depEndDate) {
          errors.dependencies = `Uppgiften börjar före beroende "${depTask.title}" är klar`;
          break;
        }
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Spara uppgift (lägg till eller uppdatera)
  const saveTask = async () => {
    if (!validateForm()) return;
    
    try {
      if (editingTask) {
        // Uppdatera befintlig uppgift
        const { error } = await supabase
          .from('tasks')
          .update({
            title: formData.title,
            start_date: formData.start_date,
            end_date: formData.end_date,
            progress: formData.progress,
            dependencies: formData.dependencies.length > 0 ? formData.dependencies : null,
            is_ata: formData.is_ata
          })
          .eq('id', editingTask.id);
          
        if (error) throw error;
      } else {
        // Lägg till ny uppgift
        const { error } = await supabase
          .from('tasks')
          .insert({
            project_id: parseInt(projectId || '1'),
            company_id: 1, // Default-värde
            title: formData.title,
            start_date: formData.start_date,
            end_date: formData.end_date,
            progress: formData.progress,
            dependencies: formData.dependencies.length > 0 ? formData.dependencies : null,
            is_ata: formData.is_ata
          });
          
        if (error) throw error;
      }
      
      closeModal();
    } catch (err) {
      console.error('Error saving task:', err);
      setError('Kunde inte spara uppgiften');
    }
  };
  
  // Radera uppgift
  const deleteTask = async (taskId: number) => {
    if (!confirm("Är du säker på att du vill ta bort denna uppgift?")) return;
    
    // Kontrollera om uppgiften har beroende uppgifter
    const dependentTasks = tasks.filter(task => task.dependencies?.includes(taskId));
    if (dependentTasks.length > 0) {
      alert(`Denna uppgift kan inte tas bort eftersom ${dependentTasks.length} andra uppgifter är beroende av den.`);
      return;
    }
    
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting task:', err);
      setError('Kunde inte ta bort uppgiften');
    }
  };
  
  // Formattera datum för visning
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };
  
  // Beräkna om en uppgift är försenad
  const isTaskDelayed = (task: Task): boolean => {
    const today = new Date();
    const endDate = new Date(task.end_date);
    return (endDate < today && task.progress < 100);
  };
  
  if (loading) {
    return <div className="p-4">Laddar uppgifter...</div>;
  }
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-[#ECF0F1]">Projektuppgifter</h2>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-[#3498DB] hover:bg-[#2980B9] text-white px-4 py-2 rounded transition duration-300"
        >
          <Plus size={16} />
          <span>Lägg till uppgift</span>
        </button>
      </div>
      
      {error && (
        <div className="bg-[#E74C3C]/20 border border-[#E74C3C] text-[#E74C3C] p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {tasks.length === 0 ? (
        <div className="text-center py-8 text-[#BDC3C7]">
          Inga uppgifter tillagda ännu. Klicka på "Lägg till uppgift" för att komma igång.
        </div>
      ) : (
        <div className="bg-[#34495E] rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-[#2C3E50] text-[#ECF0F1]">
                <th className="py-3 px-4 text-left">Titel</th>
                <th className="py-3 px-4 text-left">Datum</th>
                <th className="py-3 px-4 text-left">Framsteg</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-right">Åtgärder</th>
              </tr>
            </thead>
            <tbody>
              {tasks.map(task => (
                <tr 
                  key={task.id} 
                  className="border-b border-[#465C71] last:border-0 hover:bg-[#2C3E50]/30 transition-colors"
                >
                  <td className="py-3 px-4">
                    <div className="text-[#ECF0F1] font-medium">{task.title}</div>
                    {task.dependencies && task.dependencies.length > 0 && (
                      <div className="text-[#BDC3C7] text-xs mt-1">
                        Beroende av: {task.dependencies.map(depId => {
                          const depTask = tasks.find(t => t.id === depId);
                          return depTask ? depTask.title : `#${depId}`;
                        }).join(', ')}
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <div className="text-[#ECF0F1]">{formatDate(task.start_date)}</div>
                    <div className="text-[#BDC3C7] text-xs">till {formatDate(task.end_date)}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="w-full bg-[#465C71] h-2 rounded overflow-hidden">
                      <div 
                        className="h-full bg-[#3498DB]" 
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                    <div className="text-[#BDC3C7] text-xs mt-1">{task.progress}% klart</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {task.is_ata && (
                        <span className="text-[#F4A261] text-xs font-medium bg-[#F4A261]/10 px-2 py-1 rounded-full">
                          ÄTA
                        </span>
                      )}
                      {isTaskDelayed(task) && (
                        <span className="text-[#E74C3C] text-xs font-medium bg-[#E74C3C]/10 px-2 py-1 rounded-full flex items-center gap-1">
                          <AlertTriangle size={12} />
                          Försenad
                        </span>
                      )}
                      {task.progress === 100 && (
                        <span className="text-[#2ECC71] text-xs font-medium bg-[#2ECC71]/10 px-2 py-1 rounded-full flex items-center gap-1">
                          <Check size={12} />
                          Klar
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditModal(task)}
                        className="text-[#3498DB] hover:text-[#2980B9] transition-colors"
                        title="Redigera"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="text-[#E74C3C] hover:text-[#C0392B] transition-colors"
                        title="Ta bort"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Modal för att lägga till/redigera uppgift */}
      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={closeModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-[#1E2A44] p-6 align-middle shadow-xl transition-all">
                  <Dialog.Title as="h3" className="text-lg font-medium text-[#ECF0F1] mb-4">
                    {editingTask ? 'Redigera uppgift' : 'Lägg till ny uppgift'}
                  </Dialog.Title>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-[#BDC3C7] mb-1">Titel *</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full bg-[#34495E] text-[#ECF0F1] rounded border border-[#465C71] px-3 py-2 focus:outline-none focus:border-[#3498DB]"
                        placeholder="Uppgiftstitel"
                      />
                      {formErrors.title && (
                        <p className="text-[#E74C3C] text-xs mt-1">{formErrors.title}</p>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-[#BDC3C7] mb-1">Startdatum *</label>
                        <input
                          type="date"
                          name="start_date"
                          value={formData.start_date}
                          onChange={handleInputChange}
                          className="w-full bg-[#34495E] text-[#ECF0F1] rounded border border-[#465C71] px-3 py-2 focus:outline-none focus:border-[#3498DB]"
                        />
                        {formErrors.start_date && (
                          <p className="text-[#E74C3C] text-xs mt-1">{formErrors.start_date}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm text-[#BDC3C7] mb-1">Slutdatum *</label>
                        <input
                          type="date"
                          name="end_date"
                          value={formData.end_date}
                          onChange={handleInputChange}
                          className="w-full bg-[#34495E] text-[#ECF0F1] rounded border border-[#465C71] px-3 py-2 focus:outline-none focus:border-[#3498DB]"
                        />
                        {formErrors.end_date && (
                          <p className="text-[#E74C3C] text-xs mt-1">{formErrors.end_date}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-[#BDC3C7] mb-1">Framsteg (%)</label>
                      <div className="flex items-center gap-4">
                        <input
                          type="range"
                          name="progress"
                          min="0"
                          max="100"
                          value={formData.progress}
                          onChange={handleInputChange}
                          className="flex-1"
                        />
                        <span className="w-12 text-center text-[#ECF0F1]">{formData.progress}%</span>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm text-[#BDC3C7] mb-1">Beroenden</label>
                      <select
                        name="dependencies"
                        multiple
                        value={formData.dependencies.map(String)}
                        onChange={handleInputChange}
                        className="w-full bg-[#34495E] text-[#ECF0F1] rounded border border-[#465C71] px-3 py-2 focus:outline-none focus:border-[#3498DB]"
                        size={Math.min(4, tasks.length)}
                      >
                        {tasks.filter(t => !editingTask || t.id !== editingTask.id).map(task => (
                          <option key={task.id} value={task.id}>
                            {task.title} ({formatDate(task.end_date)})
                          </option>
                        ))}
                      </select>
                      <p className="text-[#BDC3C7] text-xs mt-1">Håll Ctrl-tangenten nedtryckt för att välja flera</p>
                      {formErrors.dependencies && (
                        <p className="text-[#E74C3C] text-xs mt-1">{formErrors.dependencies}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="is_ata"
                        name="is_ata"
                        checked={formData.is_ata}
                        onChange={handleInputChange}
                        className="mr-2"
                      />
                      <label htmlFor="is_ata" className="text-sm text-[#BDC3C7]">
                        ÄTA-arbete (Ändrings- och tilläggsarbete)
                      </label>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-[#BDC3C7] bg-[#34495E] hover:bg-[#2C3E50] px-4 py-2 rounded transition-colors"
                    >
                      Avbryt
                    </button>
                    <button
                      type="button"
                      onClick={saveTask}
                      className="text-white bg-[#3498DB] hover:bg-[#2980B9] px-4 py-2 rounded transition-colors"
                    >
                      {editingTask ? 'Uppdatera' : 'Spara'}
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
};

export default TaskManager; 