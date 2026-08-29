import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  isLoading: propIsLoading, 
  onClick, 
  disabled, 
  className,
  ...props 
}) => {
  const [internalIsLoading, setInternalIsLoading] = useState(false);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      const result = onClick(e) as any;
      if (result instanceof Promise) {
        setInternalIsLoading(true);
        try {
          await result;
        } finally {
          setInternalIsLoading(false);
        }
      }
    }
  };

  const isLoading = propIsLoading || internalIsLoading;

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`relative inline-flex items-center justify-center ${className || ''} ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
      {...props}
    >
      {isLoading && (
        <Loader2 className="absolute shrink-0 w-4 h-4 animate-spin" />
      )}
      <span className={`inline-flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
    </button>
  );
};
