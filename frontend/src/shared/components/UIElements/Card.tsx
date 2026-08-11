
import { CSSProperties, ReactNode } from 'react';

interface CardProps {
  className?: string;
  style?: CSSProperties;
  children: ReactNode;
}

function Card({ className, style, children }: CardProps) {
  return (
    <div
      className={`relative m-0 shadow-md rounded-md p-2 sm:p-3 md:p-4 overflow-hidden bg-white w-full ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

export default Card;