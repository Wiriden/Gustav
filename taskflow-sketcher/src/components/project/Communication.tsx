
import { useState } from 'react';
import { Send } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";

interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  isCurrentUser?: boolean;
}

interface CommunicationProps {
  projectId?: string;
}

const Communication = ({ projectId }: CommunicationProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'Anna Andersson',
      content: 'Möte imorgon kl. 10:00 för att diskutera materialval för badrummet.',
      timestamp: '2025-07-01 14:30',
      isCurrentUser: false
    }
  ]);
  
  const [newMessage, setNewMessage] = useState('');
  
  const sendMessage = () => {
    if (newMessage.trim()) {
      const message: Message = {
        id: Date.now().toString(),
        sender: 'Gustav',
        content: newMessage,
        timestamp: new Date().toLocaleString('sv-SE'),
        isCurrentUser: true
      };
      
      setMessages([...messages, message]);
      setNewMessage('');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };
  
  return (
    <div className="flex flex-col h-[calc(100vh-300px)]">
      <h3 className="text-lg font-semibold text-[#ECF0F1] mb-4">Kommunikation</h3>
      
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div 
            key={message.id} 
            className={`flex ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-[80%] ${message.isCurrentUser ? 'order-2' : 'order-1'}`}>
              <div className={`flex items-start ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                {!message.isCurrentUser && (
                  <Avatar className="h-8 w-8 mr-2">
                    <div className="bg-[#3498DB] text-xs text-[#ECF0F1] font-medium flex items-center justify-center h-full">
                      {message.sender.charAt(0)}
                    </div>
                  </Avatar>
                )}
                
                <div>
                  <div className={`flex items-center ${message.isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                    <span className="text-xs text-[#BDC3C7]">{message.sender}</span>
                    <span className="text-xs text-[#BDC3C7] ml-2">{message.timestamp}</span>
                  </div>
                  
                  <div 
                    className={`mt-1 p-3 rounded-lg ${
                      message.isCurrentUser 
                        ? 'bg-[#3498DB] text-[#ECF0F1]' 
                        : 'bg-[#34495E] text-[#ECF0F1] border border-[#465C71]'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
                
                {message.isCurrentUser && (
                  <Avatar className="h-8 w-8 ml-2">
                    <div className="bg-[#3498DB] text-xs text-[#ECF0F1] font-medium flex items-center justify-center h-full">
                      G
                    </div>
                  </Avatar>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-auto">
        <div className="flex">
          <Textarea 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Skriv ett meddelande..."
            className="flex-1 bg-[#34495E] border-2 border-[#465C71] text-[#ECF0F1] placeholder-[#BDC3C7] resize-none"
          />
          
          <Button 
            onClick={sendMessage}
            className="ml-2 bg-[#3498DB] hover:bg-[#2980B9] text-[#ECF0F1]"
          >
            <Send className="h-4 w-4" />
            <span className="ml-2">Skicka</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Communication;
