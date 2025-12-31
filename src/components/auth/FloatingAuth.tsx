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
    <div className="fixed top-4 right-4 z-[9999]">
      {mounted ? (
        <UserMenu />
      ) : (
        // Skeleton placeholder to prevent layout shift
        <div className="flex items-center gap-3">
          <div className="w-20 h-9 rounded-lg bg-white/5 animate-pulse" />
          <div className="w-28 h-9 rounded-lg bg-[#ffd800]/10 animate-pulse" />
        </div>
      )}
    </div>
  );
}
