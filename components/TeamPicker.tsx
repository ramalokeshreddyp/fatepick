import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ArrowLeft, Users, Download, Upload, FileSpreadsheet, FileText, Shuffle } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { shuffle } from '../lib/utils';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

export const TeamPicker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [teamSize, setTeamSize] = useState(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [teams, setTeams] = useState<string[][]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFormTeams = () => {
    const items: string[] = input.split('\n').map(i => i.trim()).filter(Boolean);
    if (items.length < 2) {
      toast.error('Provide at least 2 participants.');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const shuffled = shuffle(items);
      const result: string[][] = [];
      for (let i = 0; i < shuffled.length; i += teamSize) {
        result.push(shuffled.slice(i, i + teamSize));
      }
      setTeams(result);
      setIsGenerating(false);
      confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 } });
      toast.success('Teams Generated Successfully');
    }, 800);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInput(text);
      toast.success('Roster imported.');
    };
    reader.readAsText(file);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    
    // Header Section
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(33, 33, 33);
    doc.text('Team Roster Report', 15, 20);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 100, 100);
    doc.text(`Generated: ${new Date().toLocaleString()}`, 15, 28);
    
    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 35, 195, 35);
    
    let y = 45;
    doc.setTextColor(0, 0, 0);

    teams.forEach((team, i) => {
      if (y > 250) {
        doc.addPage();
        y = 20;
      }

      // Team Header with grey background
      doc.setFillColor(240, 244, 248);
      doc.rect(15, y - 5, 180, 8, 'F');
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(`Team ${i + 1}`, 18, y);
      
      y += 10;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      team.forEach((member) => {
        doc.text(`- ${member}`, 25, y);
        y += 7;
        if (y > 280) { doc.addPage(); y = 20; }
      });
      y += 8;
    });
    
    doc.save('fatepick-teams.pdf');
  };

  const exportExcel = () => {
    const data = teams.flatMap((team, i) =>
      team.map(member => ({ "Team": `Team ${i + 1}`, "Name": member }))
    );
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Teams");
    XLSX.writeFile(wb, "fatepick-teams.xlsx");
  };

  return (
    <div className="space-y-8 w-full max-w-7xl mx-auto px-2 sm:px-4 md:px-0 animate-fade-in-up">
      <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 -ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
        <div className="lg:col-span-5">
          <Card className="p-6 md:p-8 space-y-8 h-full shadow-sm">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold">Team Builder</h2>
              <p className="text-muted-foreground text-sm">Balanced group formation with one click.</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Roster</label>
                <Button variant="outline" size="sm" className="h-8 text-[10px]" onClick={() => fileInputRef.current?.click()}>
                  <Upload size={14} className="mr-1.5" /> Import
                </Button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.csv" onChange={handleFileUpload} />
              </div>
              <textarea
                className="w-full h-48 lg:h-80 p-4 rounded-xl bg-muted/20 border border-border outline-none focus:border-primary transition-all resize-none text-sm custom-scrollbar"
                placeholder="Enter names separated by new lines..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Members per Team</label>
                <span className="text-xl font-black text-primary">{teamSize}</span>
              </div>
              <input 
                type="range" min="1" max="15" step="1" 
                className="w-full h-2 bg-muted rounded-full appearance-none cursor-pointer accent-primary"
                value={teamSize}
                onChange={(e) => setTeamSize(parseInt(e.target.value))}
              />
            </div>

            <Button className="w-full h-12 text-base font-bold" onClick={handleFormTeams} loading={isGenerating}>
              <Shuffle size={18} className="mr-2" /> Generate Teams
            </Button>
          </Card>
        </div>

        <div className="lg:col-span-7 space-y-6">
          {teams.length > 0 ? (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold">Generated Roster</h3>
                  <p className="text-sm text-muted-foreground">{teams.length} teams successfully formed.</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button variant="outline" size="sm" onClick={exportPDF} className="h-9 flex-1 sm:flex-none text-[10px] font-bold">
                    <FileText size={16} className="mr-2" /> PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={exportExcel} className="h-9 flex-1 sm:flex-none text-[10px] font-bold">
                    <FileSpreadsheet size={16} className="mr-2" /> EXCEL
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[600px] lg:max-h-[800px] overflow-y-auto pr-2 custom-scrollbar pb-6">
                {teams.map((team, idx) => (
                  <Card key={idx} className="p-6 border-l-4 border-l-primary shadow-sm animate-scale-in" style={{ animationDelay: `${idx * 0.05}s` }}>
                    <div className="flex justify-between items-center mb-4 pb-2 border-b">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Team {idx + 1}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 bg-muted rounded-full">{team.length} members</span>
                    </div>
                    <ul className="space-y-2">
                      {team.map((member, mIdx) => (
                        <li key={mIdx} className="text-sm font-semibold text-foreground/90 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary/40 flex-shrink-0" />
                          {member}
                        </li>
                      ))}
                    </ul>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-2xl bg-muted/5 min-h-[400px]">
              <Users size={64} className="opacity-10 mb-4" />
              <p className="text-sm font-medium max-w-xs">Enter participants to see groups here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};