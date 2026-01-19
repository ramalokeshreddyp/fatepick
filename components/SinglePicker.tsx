import React, { useState, useRef } from 'react';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { ArrowLeft, Upload, Trophy, ListRestart } from 'lucide-react';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';

export const SinglePicker: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePick = async () => {
    const items = input.split('\n').map(i => i.trim()).filter(Boolean);
    if (items.length < 2) {
      toast.error('Enter at least 2 items to draw.');
      return;
    }

    setIsSpinning(true);
    setResult(null);

    let counter = 0;
    const totalTicks = 30;
    const interval = setInterval(() => {
      setResult(items[Math.floor(Math.random() * items.length)]);
      counter++;
      
      if (counter >= totalTicks) {
        clearInterval(interval);
        const final = items[Math.floor(Math.random() * items.length)];
        setResult(final);
        setIsSpinning(false);
        
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
        });
        
        toast.success(`Result: ${final}`);
      }
    }, 60);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      setInput(text);
      toast.success('List imported.');
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 w-full max-w-4xl mx-auto px-2 sm:px-4 md:px-0">
      <Button variant="ghost" onClick={onBack} className="flex items-center gap-2 -ml-2 text-muted-foreground hover:text-foreground">
        <ArrowLeft size={18} /> Back
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
        <Card className="p-6 md:p-8 space-y-6 shadow-sm">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Single Picker</h2>
            <p className="text-muted-foreground text-sm">Select one random winner from your list.</p>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Entries</label>
              <Button variant="outline" size="sm" className="h-8 text-[10px]" onClick={() => fileInputRef.current?.click()}>
                <Upload size={14} className="mr-1.5" /> Import
              </Button>
              <input type="file" ref={fileInputRef} className="hidden" accept=".txt,.csv" onChange={handleFileUpload} />
            </div>
            <textarea
              className="w-full h-48 md:h-64 p-4 rounded-xl bg-muted/20 border border-border focus:border-primary outline-none transition-all resize-none font-medium text-sm custom-scrollbar"
              placeholder="Paste entries here (one per line)..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <Button 
            className="w-full h-12 text-base font-bold" 
            onClick={handlePick}
            loading={isSpinning}
          >
            {isSpinning ? 'Randomizing...' : 'Run Selection'}
          </Button>
        </Card>

        <div className="space-y-6 h-full min-h-[300px] md:min-h-[400px]">
          <Card className="p-6 md:p-8 h-full flex flex-col items-center justify-center border-dashed border-2 bg-muted/5 min-h-[300px]">
            {!result && !isSpinning ? (
              <div className="text-center space-y-3">
                <div className="p-5 bg-muted rounded-full w-fit mx-auto">
                  <Trophy size={40} className="text-muted-foreground opacity-30" />
                </div>
                <p className="text-muted-foreground text-sm font-medium">Result will be displayed here.</p>
              </div>
            ) : (
              <div className="text-center space-y-6 w-full animate-scale-in">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary">
                  {isSpinning ? 'Shuffling Deck...' : 'Selection Complete'}
                </span>
                <div className="p-6 md:p-10 bg-card rounded-2xl border-2 border-primary/20 shadow-xl max-w-full overflow-hidden">
                  <h3 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black break-words leading-tight text-foreground">
                    {result}
                  </h3>
                </div>
                {!isSpinning && (
                  <Button variant="outline" size="sm" onClick={() => setResult(null)} className="mt-4">
                    <ListRestart size={14} className="mr-2" /> Clear
                  </Button>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};