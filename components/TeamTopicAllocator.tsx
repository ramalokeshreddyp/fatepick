import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ArrowLeft, LayoutGrid, Download, RefreshCw, Shuffle, Users, Upload } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { shuffle } from '../lib/utils';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const TeamTopicAllocator: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [studentsInput, setStudentsInput] = useState('');
  const [topicsInput, setTopicsInput] = useState('');
  const [teamSize, setTeamSize] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<{ team: string[], topic: string }[]>([]);

  const studentFileRef = useRef<HTMLInputElement>(null);
  const topicFileRef = useRef<HTMLInputElement>(null);

  const handleAllocate = () => {
    const students: string[] = studentsInput.split('\n').map(s => s.trim()).filter(Boolean);
    const topics: string[] = topicsInput.split('\n').map(t => t.trim()).filter(Boolean);

    if (students.length < 2 || topics.length === 0) {
      toast.error('Enter participants and at least one topic');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const shuffledStudents = shuffle(students);
      const shuffledTopics = shuffle(topics);
      
      const formedTeams: string[][] = [];
      for (let i = 0; i < shuffledStudents.length; i += teamSize) {
        formedTeams.push(shuffledStudents.slice(i, i + teamSize));
      }

      const finalResults = formedTeams.map((team, idx) => ({
        team,
        topic: shuffledTopics[idx % shuffledTopics.length]
      }));

      setResults(finalResults);
      setIsGenerating(false);
      confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
      toast.success('Team & Topic Allocation Complete!');
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, target: 'students' | 'topics') => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (target === 'students') setStudentsInput(text);
      else setTopicsInput(text);
      toast.success('Imported successfully.');
    };
    reader.readAsText(file);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(33, 33, 33);
    doc.text('Team-Topic Report', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 28);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 35, 195, 35);
    
    let y = 45;
    doc.setTextColor(0, 0, 0);

    results.forEach((res, i) => {
      if (y > 240) {
        doc.addPage();
        y = 20;
      }

      // Card Header
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y - 5, 180, 10, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Team ${i + 1}`, 18, y + 2);
      doc.setTextColor(100, 100, 100);
      doc.setFontSize(10);
      doc.text(`Assigned: ${res.topic}`, 60, y + 2);
      
      y += 15;
      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      res.team.forEach(m => {
        doc.text(`- ${m}`, 25, y);
        y += 7;
        if (y > 280) { doc.addPage(); y = 20; }
      });
      y += 10;
    });
    
    doc.save('fatepick-team-topics.pdf');
  };

  const exportExcel = () => {
    const data = results.flatMap((res, i) => 
      res.team.map(m => ({ Team: `Team ${i + 1}`, Topic: res.topic, Member: m }))
    );
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Allocations");
    XLSX.writeFile(wb, "fatepick-team-topics.xlsx");
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 px-2 sm:px-4 md:px-0">
      <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 -ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <Card className="lg:col-span-5 p-6 md:p-8 space-y-8 h-fit shadow-sm">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Team Topics</h2>
            <p className="text-muted-foreground text-sm">Form teams and assign topics in one pass.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Students</label>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => studentFileRef.current?.click()}>
                  <Upload size={14} />
                </Button>
                <input type="file" ref={studentFileRef} className="hidden" accept=".txt,.csv" onChange={(e) => handleFileUpload(e, 'students')} />
              </div>
              <textarea
                className="w-full h-48 p-4 rounded-xl bg-muted/20 border border-border outline-none focus:border-primary transition-all resize-none text-sm custom-scrollbar"
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
                className="w-full h-48 p-4 rounded-xl bg-muted/20 border border-border outline-none focus:border-primary transition-all resize-none text-sm custom-scrollbar"
                placeholder="Topics..."
                value={topicsInput}
                onChange={(e) => setTopicsInput(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Team Size</label>
              <span className="text-lg font-bold">{teamSize}</span>
            </div>
            <input 
              type="range" min="1" max="10" step="1" 
              className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
              value={teamSize}
              onChange={(e) => setTeamSize(parseInt(e.target.value))}
            />
          </div>

          <Button 
            className="w-full h-12 text-base font-bold" 
            onClick={handleAllocate}
            loading={isGenerating}
          >
            Allocate Everything
            <Shuffle className="ml-2" size={18} />
          </Button>
        </Card>

        <div className="lg:col-span-7 space-y-6">
          {results.length > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">Results</h3>
                  <p className="text-sm text-muted-foreground">{results.length} teams allocated.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={exportPDF} className="h-9 flex-1 sm:flex-none text-[10px] font-bold">
                    <Download size={16} className="mr-2" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportExcel} className="h-9 flex-1 sm:flex-none text-[10px] font-bold">
                    <RefreshCw size={16} className="mr-2 rotate-90" /> EXCEL
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] lg:max-h-[800px] overflow-y-auto pr-2 custom-scrollbar pb-6">
                {results.map((res, idx) => (
                  <Card key={idx} className="p-6 border-l-4 border-l-primary/50 animate-scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="mb-4 space-y-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Topic</span>
                      <h4 className="font-bold text-primary text-base leading-tight truncate" title={res.topic}>{res.topic}</h4>
                    </div>
                    <ul className="space-y-2">
                      {res.team.map((m, mIdx) => (
                        <li key={mIdx} className="text-xs font-semibold text-foreground/80 flex items-center gap-2">
                          <Users size={12} className="text-muted-foreground flex-shrink-0" /> 
                          <span className="truncate">{m}</span>
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-muted/5 min-h-[400px]">
              <LayoutGrid size={48} className="opacity-10 mb-4" />
              <p className="text-sm font-medium">Allocation results will appear here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};