
import { useState } from 'react';
import { Plus, UserPlus, ClipboardList, MessageSquare } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

type CreationType = 'customer' | 'task' | 'notification';

const NewTaskButton = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [creationType, setCreationType] = useState<CreationType | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [customerType, setCustomerType] = useState("company");
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined);
  
  const { toast } = useToast();
  
  const handleOpenDialog = (type: CreationType) => {
    setCreationType(type);
    setIsDialogOpen(true);
    setIsDropdownOpen(false);
  };
  
  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setCreationType(null);
  };
  
  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would handle data submission here
    let message = "";
    
    switch(creationType) {
      case 'customer':
        console.log("Creating new customer:", {
          type: customerType,
          name: (document.getElementById('name') as HTMLInputElement)?.value || 'Testkund',
          contactPerson: customerType === 'company' ? (document.getElementById('contact') as HTMLInputElement)?.value || 'Anna Andersson' : undefined,
          phone: (document.getElementById('phone') as HTMLInputElement)?.value || '123456789',
          email: (document.getElementById('email') as HTMLInputElement)?.value || 'test@exempel.com',
          address: (document.getElementById('address') as HTMLInputElement)?.value || 'Testgatan 1'
        });
        message = "Ny kund skapad";
        break;
        
      case 'task':
        console.log("Creating new task:", {
          title: (document.getElementById('title') as HTMLInputElement)?.value || 'Installera fönster',
          description: (document.getElementById('description') as HTMLTextAreaElement)?.value || 'Fönsterbyte i vardagsrum',
          assignedTo: (document.getElementById('assigned') as HTMLSelectElement)?.value || 'Montörer',
          dueDate: dueDate || new Date('2025-08-20'),
          priority: (document.getElementById('priority') as HTMLSelectElement)?.value || 'high'
        });
        message = "Nytt uppdrag skapat";
        
        // Log automatic reminder creation (for backend)
        if (dueDate) {
          const reminderDate = new Date(dueDate);
          reminderDate.setDate(reminderDate.getDate() - 3);
          console.log("Automatic reminder will be created for:", format(reminderDate, 'yyyy-MM-dd'));
        }
        break;
        
      case 'notification':
        console.log("Creating new notification:", {
          recipient: (document.getElementById('recipient') as HTMLSelectElement)?.value || 'Anna Andersson',
          message: (document.getElementById('message') as HTMLTextAreaElement)?.value || 'Möte imorgon kl. 10:00 ang. projektplanering'
        });
        message = "Ny notis skickad";
        break;
    }
    
    toast({
      title: message,
      description: "Innehållet har sparats",
    });
    
    setIsDialogOpen(false);
  };
  
  const renderDialogContent = () => {
    switch(creationType) {
      case 'customer':
        return (
          <form onSubmit={handleCreate}>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="customerType" className="text-[#ECF0F1]">Kundtyp</Label>
                <ToggleGroup 
                  type="single" 
                  defaultValue="company" 
                  className="justify-start" 
                  onValueChange={(value) => {
                    if (value) setCustomerType(value);
                  }}
                >
                  <ToggleGroupItem value="company" className="bg-[#34495E] data-[state=on]:bg-[#3498DB] text-[#ECF0F1]">
                    Företag
                  </ToggleGroupItem>
                  <ToggleGroupItem value="private" className="bg-[#34495E] data-[state=on]:bg-[#3498DB] text-[#ECF0F1]">
                    Privatperson
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="name" className="text-[#ECF0F1]">Namn</Label>
                <Input id="name" placeholder={customerType === "company" ? "Företagsnamn" : "För- och efternamn"} className="bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1]" />
              </div>
              
              {customerType === "company" && (
                <div className="grid gap-2">
                  <Label htmlFor="contact" className="text-[#ECF0F1]">Kontaktperson</Label>
                  <Input id="contact" placeholder="Namn på kontaktperson" className="bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1]" />
                </div>
              )}
              
              <div className="grid gap-2">
                <Label htmlFor="phone" className="text-[#ECF0F1]">Telefon</Label>
                <Input id="phone" placeholder="Telefonnummer" className="bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1]" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="email" className="text-[#ECF0F1]">E-post</Label>
                <Input id="email" type="email" placeholder="E-postadress" className="bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1]" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="address" className="text-[#ECF0F1]">Adress</Label>
                <Input id="address" placeholder="Gatuadress" className="bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1]" />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="bg-[#34495E] text-[#ECF0F1] border-[#465C71]">
                Avbryt
              </Button>
              <Button type="submit" className="bg-[#3498DB] text-[#ECF0F1] hover:bg-[#2980B9]">Spara</Button>
            </DialogFooter>
          </form>
        );
        
      case 'task':
        return (
          <form onSubmit={handleCreate}>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title" className="text-[#ECF0F1]">Titel</Label>
                <Input id="title" placeholder="Titel på uppdraget" className="bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1]" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="description" className="text-[#ECF0F1]">Beskrivning</Label>
                <Textarea id="description" placeholder="Detaljerad beskrivning" className="bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1] min-h-[100px]" />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="assigned" className="text-[#ECF0F1]">Tilldelad till</Label>
                <Select>
                  <SelectTrigger id="assigned" className="bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1]">
                    <SelectValue placeholder="Välj person eller team" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#34495E] border-[#465C71] text-[#ECF0F1]">
                    <SelectItem value="anna">Anna Andersson</SelectItem>
                    <SelectItem value="montorer">Montörer</SelectItem>
                    <SelectItem value="projektledare">Projektledare</SelectItem>
                    <SelectItem value="chef">Chef</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="due-date" className="text-[#ECF0F1]">Förfallodatum</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" id="due-date" className={cn(
                      "justify-start text-left font-normal w-full bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1]",
                      !dueDate && "text-[#BDC3C7]"
                    )}>
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dueDate ? format(dueDate, "yyyy-MM-dd") : <span>Välj datum</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-[#34495E] border-[#465C71]">
                    <Calendar
                      mode="single"
                      selected={dueDate}
                      onSelect={setDueDate}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="priority" className="text-[#ECF0F1]">Prioritet</Label>
                <Select>
                  <SelectTrigger id="priority" className="bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1]">
                    <SelectValue placeholder="Välj prioritet" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#34495E] border-[#465C71] text-[#ECF0F1]">
                    <SelectItem value="low">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#2ECC71] mr-2"></div>
                        Låg
                      </div>
                    </SelectItem>
                    <SelectItem value="medium">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#F4A261] mr-2"></div>
                        Medel
                      </div>
                    </SelectItem>
                    <SelectItem value="high">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-[#E74C3C] mr-2"></div>
                        Hög
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="bg-[#34495E] text-[#ECF0F1] border-[#465C71]">
                Avbryt
              </Button>
              <Button type="submit" className="bg-[#3498DB] text-[#ECF0F1] hover:bg-[#2980B9]">Spara</Button>
            </DialogFooter>
          </form>
        );
        
      case 'notification':
        return (
          <form onSubmit={handleCreate}>
            <div className="grid gap-6 py-4">
              <div className="grid gap-2">
                <Label htmlFor="recipient" className="text-[#ECF0F1]">Mottagare</Label>
                <Select>
                  <SelectTrigger id="recipient" className="bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1]">
                    <SelectValue placeholder="Välj mottagare" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#34495E] border-[#465C71] text-[#ECF0F1]">
                    <SelectItem value="anna">Anna Andersson</SelectItem>
                    <SelectItem value="montorer">Montörer (Grupp)</SelectItem>
                    <SelectItem value="projektledare">Projektledare (Grupp)</SelectItem>
                    <SelectItem value="alla">Alla</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="message" className="text-[#ECF0F1]">Meddelande</Label>
                <Textarea id="message" placeholder="Ditt meddelande" className="bg-[#34495E] border-[#BDC3C7] border-2 text-[#ECF0F1] min-h-[120px]" />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleCloseDialog} className="bg-[#34495E] text-[#ECF0F1] border-[#465C71]">
                Avbryt
              </Button>
              <Button type="submit" className="bg-[#3498DB] text-[#ECF0F1] hover:bg-[#2980B9]">Skicka</Button>
            </DialogFooter>
          </form>
        );
        
      default:
        return null;
    }
  };
  
  const getDialogTitle = () => {
    switch(creationType) {
      case 'customer': return 'Ny Kund';
      case 'task': return 'Nytt Uppdrag';
      case 'notification': return 'Ny Notis';
      default: return '';
    }
  };
  
  const dropdownOptions = [
    { type: 'customer', label: 'Ny Kund', icon: <UserPlus className="h-4 w-4 mr-2" /> },
    { type: 'task', label: 'Nytt Uppdrag', icon: <ClipboardList className="h-4 w-4 mr-2" /> },
    { type: 'notification', label: 'Ny Notis', icon: <MessageSquare className="h-4 w-4 mr-2" /> },
  ];
  
  return (
    <>
      <div className="relative">
        {isDropdownOpen && (
          <div className="absolute bottom-20 right-4 w-[200px] rounded-lg shadow-lg bg-[#34495E] border border-[#465C71] overflow-hidden animate-fade-in z-50">
            {dropdownOptions.map((option) => (
              <button
                key={option.type}
                className="flex items-center w-full px-4 py-3 text-[#ECF0F1] hover:bg-[#465C71]/30 transition-colors"
                onClick={() => handleOpenDialog(option.type as CreationType)}
              >
                {option.icon}
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        )}
        
        <Button 
          className="fixed bottom-6 right-6 z-40 rounded-full w-14 h-14 shadow-lg flex items-center justify-center hover:scale-110 transition-transform bg-[#3498DB]"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        >
          <Plus className="h-6 w-6 text-[#ECF0F1]" />
        </Button>
      </div>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px] bg-[#34495E] border-[#465C71] animate-fade-in">
          <DialogHeader>
            <DialogTitle className="text-[#ECF0F1] text-lg">{getDialogTitle()}</DialogTitle>
            <DialogDescription className="text-[#BDC3C7]">
              Fyll i informationen nedan och klicka på Spara.
            </DialogDescription>
          </DialogHeader>
          
          {renderDialogContent()}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default NewTaskButton;
