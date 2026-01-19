import React from 'react';
import { cn } from '../../lib/utils';

export const Card: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({ className, children, ...props }) => {
  return (
    <div className={cn('rounded-xl border bg-card text-card-foreground', className)} {...props}>
      {children}
    </div>
  );
};