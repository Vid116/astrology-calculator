'use client';

import { useEffect, useState } from 'react';
import { UserMenu } from './UserMenu';
import { useCalculator } from '@/components/Calculator/CalculatorContext';

export function FloatingAuth() {
  const [mounted, setMounted] = useState(false);
  const { isOpen: calculatorOpen } = useCalculator();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Hide when calculator is open (it has its own UserMenu)
  if (calculatorOpen) {
    return null;
  }

  return (
    <div className="fixed z-[9999]" style={{ top: '20px', right: '20px' }}>
      {mounted ? (
        <UserMenu />
      ) : (
        // Skeleton placeholder to prevent layout shift
        <div className="flex items-center gap-3">
          <div className="w-[76px] h-11 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-[120px] h-11 rounded-lg bg-[#ffd800]/10 animate-pulse" />
        </div>
      )}
    </div>
  );
}
