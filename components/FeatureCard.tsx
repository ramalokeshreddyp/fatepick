import React from 'react';
import { Card } from './ui/Card';
import { ChevronRight } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  desc: string;
  icon: React.ReactNode;
  onClick: () => void;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ title, desc, icon, onClick }) => {
  return (
    <Card 
      onClick={onClick}
      className="group p-8 cursor-pointer flex flex-col justify-between min-h-[220px] border border-border bg-card hover:bg-muted/30 hover:border-muted-foreground/30 transition-all duration-300"
    >
      <div className="space-y-4">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-muted text-foreground group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
          {icon}
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold tracking-tight">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {desc}
          </p>
        </div>
      </div>
      
      <div className="flex items-center text-sm font-semibold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
        Get Started <ChevronRight className="ml-1" size={16} />
      </div>
    </Card>
  );
};