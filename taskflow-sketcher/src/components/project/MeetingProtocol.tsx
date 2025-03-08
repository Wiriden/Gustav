import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from '@/lib/supabase';
import { cn } from "@/lib/utils";
import * as Headless from '@headlessui/react';
import {
    Calendar,
    ChevronDown,
    Edit,
    FileText,
    List,
    Plus,
    Save,
    Trash2,
    Users,
    X
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface MeetingProtocolProps {
  projectId?: string;
}

interface Meeting {
  id: number;
  project_id: number;
  title: string;
  date: string;
  attendees: string[];
  agenda: string[];
  minutes: string;
  completed: boolean;
  created_at?: string;
}

interface MeetingFormData {
  title: string;
  date: string;
  attendees: string[];
  agenda: string[];
  minutes: string;
  completed: boolean;
}

interface AgendaItem {
  id: string;
  text: string;
}

interface AttendeeItem {
  id: string;
  name: string;
  present: boolean;
}

const MeetingProtocol: React.FC<MeetingProtocolProps> = ({ projectId }) => {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
  const [expandedMeeting, setExpandedMeeting] = useState<number | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<MeetingFormData>({
    title: '',
    date: new Date().toISOString().split('T')[0],
    attendees: [],
    agenda: [],
    minutes: '',
    completed: false
  });
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MeetingFormData, string>>>({});
  const [newAttendee, setNewAttendee] = useState('');
  const [attendeeList, setAttendeeList] = useState<AttendeeItem[]>([]);
  const [newAgendaItem, setNewAgendaItem] = useState('');
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  
  // Hämta möten för projektet
  useEffect(() => {
    const fetchMeetings = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('meetings')
          .select('*')
          .eq('project_id', projectId || '1')
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        setMeetings(data || []);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Kunde inte hämta möten');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeetings();
    
    // Realtidsuppdateringar
    const channel = supabase
      .channel('meetings-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'meetings', filter: `project_id=eq.${projectId || '1'}` },
        () => {
          console.log('MeetingProtocol: Meetings data updated, refreshing...');
          fetchMeetings();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);
  
  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      attendees: [],
      agenda: [],
      minutes: '',
      completed: false
    });
    setAgendaItems([]);
    setAttendeeList([]);
    setNewAgendaItem('');
    setNewAttendee('');
    setFormErrors({});
    setEditingMeeting(null);
  };
  
  // Öppna modal för att lägga till nytt möte
  const openAddModal = () => {
    resetForm();
    setIsModalOpen(true);
  };
  
  // Öppna modal för att redigera ett möte
  const openEditModal = (meeting: Meeting) => {
    setEditingMeeting(meeting);
    setFormData({
      title: meeting.title,
      date: meeting.date.split('T')[0],
      attendees: meeting.attendees || [],
      agenda: meeting.agenda || [],
      minutes: meeting.minutes || '',
      completed: meeting.completed || false
    });
    
    // Konvertera agenda till agendaItems
    setAgendaItems((meeting.agenda || []).map((item, index) => ({
      id: `agenda-${index}`,
      text: item
    })));
    
    // Konvertera attendees till attendeeList
    setAttendeeList((meeting.attendees || []).map((name, index) => ({
      id: `attendee-${index}`,
      name: name,
      present: true
    })));
    
    setIsModalOpen(true);
  };
  
  // Stäng modal
  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };
  
  // Hantera textfältändringar
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  // Hantera checkbox ändringar
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };
  
  // Lägga till deltagare
  const addAttendee = () => {
    if (!newAttendee.trim()) return;
    
    const newAttendeeItem: AttendeeItem = {
      id: `attendee-${Date.now()}`,
      name: newAttendee.trim(),
      present: true
    };
    
    setAttendeeList([...attendeeList, newAttendeeItem]);
    setNewAttendee('');
  };
  
  // Ta bort deltagare
  const removeAttendee = (id: string) => {
    setAttendeeList(attendeeList.filter(attendee => attendee.id !== id));
  };
  
  // Lägga till agendapunkt
  const addAgendaItem = () => {
    if (!newAgendaItem.trim()) return;
    
    const newItem: AgendaItem = {
      id: `agenda-${Date.now()}`,
      text: newAgendaItem.trim()
    };
    
    setAgendaItems([...agendaItems, newItem]);
    setNewAgendaItem('');
  };
  
  // Ta bort agendapunkt
  const removeAgendaItem = (id: string) => {
    setAgendaItems(agendaItems.filter(item => item.id !== id));
  };
  
  // Validera formulär
  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof MeetingFormData, string>> = {};
    
    if (!formData.title.trim()) {
      errors.title = 'Titel är obligatoriskt';
    }
    
    if (!formData.date) {
      errors.date = 'Datum är obligatoriskt';
    }
    
    if (attendeeList.length === 0) {
      errors.attendees = 'Minst en deltagare krävs';
    }
    
    if (agendaItems.length === 0) {
      errors.agenda = 'Minst en agendapunkt krävs';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Spara möte
  const saveMeeting = async () => {
    if (!validateForm()) return;
    
    // Konvertera attendeeList och agendaItems till arrays för lagring
    const attendees = attendeeList.map(a => a.name);
    const agenda = agendaItems.map(a => a.text);
    
    try {
      if (editingMeeting) {
        // Uppdatera befintligt möte
        const { error } = await supabase
          .from('meetings')
          .update({
            title: formData.title,
            date: formData.date,
            attendees,
            agenda,
            minutes: formData.minutes,
            completed: formData.completed
          })
          .eq('id', editingMeeting.id);
          
        if (error) throw error;
      } else {
        // Skapa nytt möte
        const { error } = await supabase
          .from('meetings')
          .insert({
            project_id: parseInt(projectId || '1'),
            title: formData.title,
            date: formData.date,
            attendees,
            agenda,
            minutes: formData.minutes,
            completed: formData.completed
          });
          
        if (error) throw error;
      }
      
      closeModal();
    } catch (err) {
      console.error('Error saving meeting:', err);
      setError('Kunde inte spara mötet');
    }
  };
  
  // Radera möte
  const deleteMeeting = async (meetingId: number) => {
    if (!confirm('Är du säker på att du vill ta bort detta möte?')) return;
    
    try {
      const { error } = await supabase
        .from('meetings')
        .delete()
        .eq('id', meetingId);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError('Kunde inte ta bort mötet');
    }
  };
  
  // Expandera/kollapsa mötesdetaljer
  const toggleMeetingExpansion = (meetingId: number) => {
    setExpandedMeeting(expandedMeeting === meetingId ? null : meetingId);
  };
  
  // Formatera datum för visning
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('sv-SE');
  };
  
  if (loading) {
    return <div className="p-4">Laddar mötesprotokoll...</div>;
  }
  
  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-[#ECF0F1]">Mötesprotokoll</h3>
        <Button
          onClick={openAddModal}
          className="bg-[#3498DB] hover:bg-[#2980B9] text-[#ECF0F1] flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Nytt protokoll</span>
        </Button>
      </div>
      
      {error && (
        <div className="bg-[#E74C3C]/20 border border-[#E74C3C] text-[#E74C3C] p-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {meetings.length === 0 ? (
        <div className="text-center py-8 text-[#BDC3C7] bg-[#34495E] rounded-lg">
          Inga mötesprotokoll tillagda ännu. Klicka på "Nytt protokoll" för att komma igång.
        </div>
      ) : (
        <div className="space-y-4">
          {meetings.map(meeting => (
            <div 
              key={meeting.id} 
              className="bg-[#34495E] rounded-lg overflow-hidden border border-[#465C71]"
            >
              {/* Mötesheader */}
              <div 
                className={cn(
                  "p-4 flex justify-between items-center cursor-pointer",
                  meeting.completed && "bg-[#2ECC71]/10"
                )}
                onClick={() => toggleMeetingExpansion(meeting.id)}
              >
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-3 text-[#3498DB]" />
                  <div>
                    <div className="text-[#ECF0F1] font-medium">{meeting.title}</div>
                    <div className="text-[#BDC3C7] text-sm">{formatDate(meeting.date)}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {meeting.completed && (
                    <span className="text-[#2ECC71] text-xs bg-[#2ECC71]/20 px-2 py-1 rounded">
                      Slutfört
                    </span>
                  )}
                  <ChevronDown 
                    className={cn(
                      "h-5 w-5 text-[#BDC3C7] transition-transform",
                      expandedMeeting === meeting.id && "transform rotate-180"
                    )}
                  />
                </div>
              </div>
              
              {/* Expanderad vy */}
              {expandedMeeting === meeting.id && (
                <div className="p-4 border-t border-[#465C71]">
                  <div className="flex justify-between mb-4">
                    <h4 className="text-[#ECF0F1] font-medium">Detaljer</h4>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(meeting)}
                        className="text-[#3498DB] hover:text-[#2980B9] transition-colors"
                        title="Redigera"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => deleteMeeting(meeting.id)}
                        className="text-[#E74C3C] hover:text-[#C0392B] transition-colors"
                        title="Ta bort"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    {/* Deltagare */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-[#3498DB]" />
                        <h5 className="text-[#ECF0F1] font-medium">Deltagare</h5>
                      </div>
                      <ul className="list-disc list-inside text-[#BDC3C7]">
                        {meeting.attendees?.map((attendee, i) => (
                          <li key={i} className="mb-1">{attendee}</li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Agenda */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <List size={16} className="text-[#3498DB]" />
                        <h5 className="text-[#ECF0F1] font-medium">Agenda</h5>
                      </div>
                      <ol className="list-decimal list-inside text-[#BDC3C7]">
                        {meeting.agenda?.map((item, i) => (
                          <li key={i} className="mb-1">{item}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                  
                  {/* Protokoll */}
                  <div className="mt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-[#3498DB]" />
                      <h5 className="text-[#ECF0F1] font-medium">Anteckningar</h5>
                    </div>
                    <div className="bg-[#2C3E50] p-3 rounded text-[#ECF0F1] whitespace-pre-wrap">
                      {meeting.minutes || <em className="text-[#BDC3C7]">Inga anteckningar tillgängliga.</em>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Modal för att lägga till/redigera möte */}
      <Headless.Transition appear show={isModalOpen}>
        <Headless.Dialog className="relative z-50" onClose={closeModal}>
          <Headless.Transition.Child
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/75" />
          </Headless.Transition.Child>
          
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <Headless.Transition.Child
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Headless.Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-lg bg-[#1E2A44] p-6 align-middle shadow-xl transition-all">
                  <div className="flex justify-between items-center mb-4">
                    <Headless.Dialog.Title className="text-lg font-medium text-[#ECF0F1]">
                      {editingMeeting ? 'Redigera protokoll' : 'Nytt mötesprotokoll'}
                    </Headless.Dialog.Title>
                    <button onClick={closeModal} className="text-[#BDC3C7] hover:text-[#ECF0F1]">
                      <X size={18} />
                    </button>
                  </div>
                  
                  <Tabs defaultValue="details" className="w-full">
                    <TabsList className="w-full bg-[#34495E]">
                      <TabsTrigger value="details" className="flex-1">Detaljer</TabsTrigger>
                      <TabsTrigger value="attendees" className="flex-1">Deltagare</TabsTrigger>
                      <TabsTrigger value="agenda" className="flex-1">Agenda</TabsTrigger>
                      <TabsTrigger value="minutes" className="flex-1">Anteckningar</TabsTrigger>
                    </TabsList>
                    
                    {/* Detaljer */}
                    <TabsContent value="details" className="mt-4 space-y-4">
                      <div>
                        <label className="block text-sm text-[#BDC3C7] mb-1">Titel *</label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleInputChange}
                          className="w-full bg-[#34495E] text-[#ECF0F1] rounded border border-[#465C71] px-3 py-2 focus:outline-none focus:border-[#3498DB]"
                          placeholder="Mötestitel"
                        />
                        {formErrors.title && (
                          <p className="text-[#E74C3C] text-xs mt-1">{formErrors.title}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm text-[#BDC3C7] mb-1">Datum *</label>
                        <input
                          type="date"
                          name="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full bg-[#34495E] text-[#ECF0F1] rounded border border-[#465C71] px-3 py-2 focus:outline-none focus:border-[#3498DB]"
                        />
                        {formErrors.date && (
                          <p className="text-[#E74C3C] text-xs mt-1">{formErrors.date}</p>
                        )}
                      </div>
                      
                      <div className="flex items-center mt-2">
                        <Checkbox
                          id="completed"
                          name="completed"
                          checked={formData.completed}
                          onCheckedChange={(checked) => 
                            setFormData({ ...formData, completed: checked as boolean })
                          }
                          className="mr-2"
                        />
                        <label htmlFor="completed" className="text-sm text-[#BDC3C7]">
                          Markera protokollet som slutfört
                        </label>
                      </div>
                    </TabsContent>
                    
                    {/* Deltagare */}
                    <TabsContent value="attendees" className="mt-4">
                      <div className="mb-4">
                        <label className="block text-sm text-[#BDC3C7] mb-1">Lägg till deltagare</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newAttendee}
                            onChange={(e) => setNewAttendee(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addAttendee()}
                            className="flex-1 bg-[#34495E] text-[#ECF0F1] rounded border border-[#465C71] px-3 py-2 focus:outline-none focus:border-[#3498DB]"
                            placeholder="Namn på deltagare"
                          />
                          <Button
                            onClick={addAttendee}
                            className="bg-[#3498DB] hover:bg-[#2980B9] text-[#ECF0F1]"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                        {formErrors.attendees && (
                          <p className="text-[#E74C3C] text-xs mt-1">{formErrors.attendees}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {attendeeList.length === 0 ? (
                          <p className="text-[#BDC3C7] italic">Inga deltagare tillagda ännu.</p>
                        ) : (
                          attendeeList.map(attendee => (
                            <div 
                              key={attendee.id} 
                              className="flex items-center justify-between p-2 bg-[#34495E] rounded"
                            >
                              <div className="flex items-center">
                                <Avatar className="h-6 w-6 mr-2">
                                  <div className="bg-[#3498DB] text-xs text-[#ECF0F1] font-medium flex items-center justify-center h-full">
                                    {attendee.name.charAt(0)}
                                  </div>
                                </Avatar>
                                <span className="text-[#ECF0F1]">{attendee.name}</span>
                              </div>
                              
                              <button
                                onClick={() => removeAttendee(attendee.id)}
                                className="text-[#E74C3C] hover:text-[#C0392B]"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                    
                    {/* Agenda */}
                    <TabsContent value="agenda" className="mt-4">
                      <div className="mb-4">
                        <label className="block text-sm text-[#BDC3C7] mb-1">Lägg till agendapunkt</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newAgendaItem}
                            onChange={(e) => setNewAgendaItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addAgendaItem()}
                            className="flex-1 bg-[#34495E] text-[#ECF0F1] rounded border border-[#465C71] px-3 py-2 focus:outline-none focus:border-[#3498DB]"
                            placeholder="Agendapunkt"
                          />
                          <Button
                            onClick={addAgendaItem}
                            className="bg-[#3498DB] hover:bg-[#2980B9] text-[#ECF0F1]"
                          >
                            <Plus size={16} />
                          </Button>
                        </div>
                        {formErrors.agenda && (
                          <p className="text-[#E74C3C] text-xs mt-1">{formErrors.agenda}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {agendaItems.length === 0 ? (
                          <p className="text-[#BDC3C7] italic">Ingen agenda tillagd ännu.</p>
                        ) : (
                          agendaItems.map((item, index) => (
                            <div 
                              key={item.id} 
                              className="flex items-center justify-between p-2 bg-[#34495E] rounded"
                            >
                              <div className="flex items-center">
                                <span className="text-[#3498DB] font-medium mr-2">{index + 1}.</span>
                                <span className="text-[#ECF0F1]">{item.text}</span>
                              </div>
                              
                              <button
                                onClick={() => removeAgendaItem(item.id)}
                                className="text-[#E74C3C] hover:text-[#C0392B]"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                    
                    {/* Anteckningar */}
                    <TabsContent value="minutes" className="mt-4">
                      <div>
                        <label className="block text-sm text-[#BDC3C7] mb-1">Mötesanteckningar</label>
                        <Textarea
                          name="minutes"
                          value={formData.minutes}
                          onChange={handleInputChange}
                          placeholder="Skriv mötesanteckningar här..."
                          className="w-full bg-[#34495E] text-[#ECF0F1] rounded border border-[#465C71] px-3 py-2 focus:outline-none focus:border-[#3498DB] min-h-[200px] resize-y"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                  
                  <div className="mt-6 flex justify-end gap-3">
                    <Button
                      onClick={closeModal}
                      variant="outline"
                      className="text-[#BDC3C7] border-[#465C71] hover:bg-[#2C3E50]"
                    >
                      Avbryt
                    </Button>
                    <Button
                      onClick={saveMeeting}
                      className="bg-[#3498DB] hover:bg-[#2980B9] text-[#ECF0F1] flex items-center gap-2"
                    >
                      <Save size={16} />
                      <span>{editingMeeting ? 'Uppdatera' : 'Spara'}</span>
                    </Button>
                  </div>
                </Headless.Dialog.Panel>
              </Headless.Transition.Child>
            </div>
          </div>
        </Headless.Dialog>
      </Headless.Transition>
    </div>
  );
};

export default MeetingProtocol; 