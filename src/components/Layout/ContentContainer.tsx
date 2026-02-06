import { ReactNode } from 'react';

interface ContentContainerProps {
  children: ReactNode;
  className?: string;
}

export default function ContentContainer({ children, className = '' }: ContentContainerProps) {
  return (
    <div className={`content-container ${className}`}>
      {children}
    </div>
  );
}