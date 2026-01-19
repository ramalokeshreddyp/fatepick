import React, { useState } from 'react';
import { SinglePicker } from '../components/SinglePicker';
import { TeamPicker } from '../components/TeamPicker';
import { TopicAllocator } from '../components/TopicAllocator';
import { TeamTopicAllocator } from '../components/TeamTopicAllocator';
import { ThemeToggle } from '../components/ThemeToggle';
import { FeatureCard } from '../components/FeatureCard';
import { Sparkles, Users, FileText, LayoutGrid, Zap, ShieldCheck, BarChart3 } from 'lucide-react';

type Feature = 'menu' | 'single' | 'team' | 'topic' | 'team-topic';

const Index: React.FC = () => {
  const [view, setView] = useState<Feature>('menu');

  const renderView = () => {
    switch (view) {
      case 'single': return <div className="w-full max-w-4xl mx-auto animate-fade-in-up"><SinglePicker onBack={() => setView('menu')} /></div>;
      case 'team': return <div className="w-full max-w-7xl mx-auto animate-fade-in-up"><TeamPicker onBack={() => setView('menu')} /></div>;
      case 'topic': return <div className="w-full max-w-5xl mx-auto animate-fade-in-up"><TopicAllocator onBack={() => setView('menu')} /></div>;
      case 'team-topic': return <div className="w-full max-w-6xl mx-auto animate-fade-in-up"><TeamTopicAllocator onBack={() => setView('menu')} /></div>;
      default: return (
        <div className="w-full max-w-6xl space-y-12 md:space-y-20 animate-fade-in-up px-2 sm:px-4 md:px-0">
          <header className="text-center space-y-4 md:space-y-6">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold tracking-tight">
              Fairness by Design.
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Professional tools for unbiased selection, team distribution, and topic allocation. Built for precision.
            </p>
          </header>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <FeatureCard 
              title="Single Picker" 
              desc="Draw one winner from a list instantly."
              icon={<Sparkles size={24} />}
              onClick={() => setView('single')}
            />
            <FeatureCard 
              title="Team Builder" 
              desc="Group participants into balanced teams."
              icon={<Users size={24} />}
              onClick={() => setView('team')}
            />
            <FeatureCard 
              title="Individual Topics" 
              desc="Map topics to individuals fairly."
              icon={<FileText size={24} />}
              onClick={() => setView('topic')}
            />
            <FeatureCard 
              title="Team Topics" 
              desc="Form teams and assign topics at once."
              icon={<LayoutGrid size={24} />}
              onClick={() => setView('team-topic')}
            />
          </div>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 border-t pt-12 md:pt-20">
            <Stat icon={<Zap size={20} />} title="Fast Algorithms" desc="Instant results for even the largest rosters." />
            <Stat icon={<ShieldCheck size={20} />} title="Verified Fair" desc="Unbiased shuffle logic for absolute fairness." />
            <Stat icon={<BarChart3 size={20} />} title="Data Ready" desc="Export reports to PDF or XLSX in one click." />
          </section>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center bg-background py-6 md:py-12 px-4 md:px-6">
      <nav className="w-full max-w-6xl flex justify-between items-center mb-10 md:mb-20">
        <div 
          className="flex items-center gap-3 cursor-pointer select-none" 
          onClick={() => setView('menu')}
        >
          <div className="bg-primary p-2 rounded-lg">
            <Zap className="text-primary-foreground" size={20} />
          </div>
          <h1 className="text-xl font-bold tracking-tight">FatePick</h1>
        </div>
        <ThemeToggle />
      </nav>

      {renderView()}

      <footer className="mt-auto pt-16 md:pt-24 text-muted-foreground text-xs border-t w-full max-w-6xl text-center">
        <p className="mt-6">&copy; 2026 FatePick. Precision Randomization Suite.</p>
      </footer>
    </div>
  );
};

const Stat = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
  <div className="flex gap-4 items-start">
    <div className="p-2 bg-muted rounded-md text-foreground flex-shrink-0">
      {icon}
    </div>
    <div className="space-y-1 text-left">
      <h4 className="font-bold text-foreground text-sm uppercase tracking-wide">{title}</h4>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  </div>
);

export default Index;