
import { useState } from 'react';
import { FileText, Download, Upload, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Document {
  id: string;
  filename: string;
  uploadDate: string;
  fileUrl?: string;
}

interface DocumentListProps {
  projectId?: string;
}

const DocumentList = ({ projectId }: DocumentListProps) => {
  const [documents, setDocuments] = useState<Document[]>([
    { id: '1', filename: 'Ritning.pdf', uploadDate: '2025-07-01', fileUrl: '#' },
    { id: '2', filename: 'Kontrakt.docx', uploadDate: '2025-07-02', fileUrl: '#' }
  ]);
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  
  const uploadDocument = () => {
    if (newFileName) {
      const doc: Document = {
        id: Date.now().toString(),
        filename: newFileName,
        uploadDate: new Date().toLocaleDateString('sv-SE'),
        fileUrl: '#'
      };
      
      setDocuments([...documents, doc]);
      setNewFileName('');
      setDialogOpen(false);
    }
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-[#ECF0F1]">Projektdokument</h3>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="bg-[#3498DB] hover:bg-[#2980B9] text-[#ECF0F1]"
            >
              <Upload className="h-4 w-4 mr-2" />
              Ladda upp fil
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-[#34495E] text-[#ECF0F1] border-[#465C71]">
            <DialogHeader>
              <DialogTitle className="text-[#ECF0F1]">Ladda upp ny fil</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="filename" className="text-[#ECF0F1]">Filnamn</Label>
                <Input 
                  id="filename" 
                  value={newFileName} 
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="bg-[#465C71] border-[#597393] text-[#ECF0F1]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="fileInput" className="text-[#ECF0F1]">Välj fil</Label>
                <Input 
                  id="fileInput" 
                  type="file"
                  className="bg-[#465C71] border-[#597393] text-[#ECF0F1]"
                />
              </div>
              
              <div className="flex justify-end pt-2">
                <Button 
                  onClick={uploadDocument}
                  className="bg-[#3498DB] hover:bg-[#2980B9] text-[#ECF0F1]"
                >
                  Ladda upp
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="space-y-2">
        {documents.map((doc) => (
          <div 
            key={doc.id} 
            className="bg-[#34495E] border border-[#465C71] rounded-lg h-[48px] px-4 flex items-center justify-between"
          >
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-[#3498DB] mr-3" />
              <span className="text-[#ECF0F1] text-sm">{doc.filename}</span>
            </div>
            
            <div className="flex items-center">
              <span className="text-[#BDC3C7] text-sm mr-4">{doc.uploadDate}</span>
              
              <Button variant="ghost" size="icon" className="text-[#3498DB] hover:bg-[#3498DB]/10">
                <Download className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentList;
