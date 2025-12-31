'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface CalculatorContextType {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CalculatorContext = createContext<CalculatorContextType | undefined>(undefined);

export function CalculatorProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <CalculatorContext.Provider value={{ isOpen, setIsOpen }}>
      {children}
    </CalculatorContext.Provider>
  );
}

export function useCalculator() {
  const context = useContext(CalculatorContext);
  if (!context) {
    throw new Error('useCalculator must be used within a CalculatorProvider');
  }
  return context;
}
