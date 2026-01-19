import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ArrowLeft, FileText, Download, Upload, Shuffle, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { shuffle } from '../lib/utils';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const TopicAllocator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [studentsInput, setStudentsInput] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [isAllocating, setIsAllocating] = useState(false);
  const [allocations, setAllocations] = useState<{ student: string, topic: string }[]>([]);
  
  const studentFileRef = useRef<HTMLInputElement>(null);
  const topicFileRef = useRef<HTMLInputElement>(null);

  const handleAllocate = () => {
    const students = studentsInput.split('\n').map(s => s.trim()).filter(Boolean);
    const topics = topicsInput.split('\n').map(t => t.trim()).filter(Boolean);

    if (students.length === 0 || topics.length === 0) {
      toast.error('Fill both participant and topic lists.');
      return;
    }

    setIsAllocating(true);
    setTimeout(() => {
      const shuffledTopics = shuffle(topics);
      const result = students.map((student, idx) => ({
        student,
        topic: shuffledTopics[idx % shuffledTopics.length]
      }));
      setAllocations(result);
      setIsAllocating(false);
      confetti({ particleCount: 100, spread: 50, origin: { y: 0.6 } });
    }, 600);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'students' | 'topics') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (target === 'students') setStudentsInput(text);
      else setTopicsInput(text);
      toast.success('Imported.');
    };
    reader.readAsText(file);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(33, 33, 33);
    doc.text('Allocation Report', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 28);
    
    // Table Headers
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Participant', 15, 42);
    doc.text('Assigned Topic', 105, 42);
    
    // Drawing a separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 45, 195, 45);
    
    let y = 52;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    
    allocations.forEach((item, index) => {
      // Check for page overflow
      if (y > 280) {
        doc.addPage();
        y = 20;
        // Re-draw headers on new page
        doc.setFont("helvetica", "bold");
        doc.text('Participant', 15, y);
        doc.text('Assigned Topic', 105, y);
        doc.line(15, y + 3, 195, y + 3);
        y += 12;
        doc.setFont("helvetica", "normal");
      }
      
      // Zebra striping for readability (light grey background for even rows)
      if (index % 2 === 0) {
        doc.setFillColor(248, 250, 252);
        doc.rect(15, y - 5, 180, 8, 'F');
      }

      doc.text(`${item.student}`, 15, y);
      doc.text(`${item.topic}`, 105, y);
      y += 8;
    });
    
    doc.save('fatepick-allocations.pdf');
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(allocations);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Allocations");
    XLSX.writeFile(wb, "fatepick-allocations.xlsx");
  };

  return (
    <div className="space-y-8 w-full max-w-5xl mx-auto px-4 md:px-0">
      <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 -ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} /> Back to Dashboard
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
        <Card className="p-6 md:p-8 space-y-8">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Individual Topics</h2>
            <p className="text-muted-foreground text-sm">Assign topics to individuals fairly using a round-robin shuffle.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Participants</label>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => studentFileRef.current?.click()}>
                  <Upload size={14} />
                </Button>
                <input type="file" ref={studentFileRef} className="hidden" accept=".txt,.csv" onChange={(e) => handleFileUpload(e, 'students')} />
              </div>
              <textarea
                className="w-full h-48 p-4 rounded-xl bg-muted/20 border outline-none focus:border-primary transition-all resize-none text-sm custom-scrollbar"
                placeholder="Names..."
                value={studentsInput}
                onChange={(e) => setStudentsInput(e.target.value)}
              />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Topics</label>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => topicFileRef.current?.click()}>
                  <Upload size={14} />
                </Button>
                <input type="file" ref={topicFileRef} className="hidden" accept=".txt,.csv" onChange={(e) => handleFileUpload(e, 'topics')} />
              </div>
              <textarea
                className="w-full h-48 p-4 rounded-xl bg-muted/20 border outline-none focus:border-primary transition-all resize-none text-sm custom-scrollbar"
                placeholder="Topics..."
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
              />
            </div>
          </div>

          <Button className="w-full h-12 font-bold" onClick={handleAllocate} loading={isAllocating}>
            <Shuffle className="mr-2" size={18} /> Allocate Topics
          </Button>
        </Card>

        <div className="space-y-6">
          {allocations.length > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">Results</h3>
                  <p className="text-sm text-muted-foreground">Assignments generated.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={exportPDF} className="h-9 flex-1 sm:flex-none">
                    <Download size={16} className="mr-2" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportExcel} className="h-9 flex-1 sm:flex-none">
                    <FileSpreadsheet size={16} className="mr-2" /> Excel
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar pb-6">
                {allocations.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-xl bg-card border flex justify-between items-center animate-scale-in" style={{ animationDelay: `${idx * 0.03}s` }}>
                    <span className="font-semibold text-sm truncate pr-4">{item.student}</span>
                    <span className="text-primary font-bold px-3 py-1 bg-muted rounded-md text-xs border whitespace-nowrap">
                      {item.topic}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-muted/5 min-h-[400px]">
              <FileText size={48} className="opacity-10 mb-4" />
              <p className="text-sm font-medium">Results will be generated here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};