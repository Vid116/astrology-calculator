'use client';

import { useEffect, useState } from 'react';
import { UserMenu } from './UserMenu';

export function FloatingAuth() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed top-4 right-4 z-[9999]"
      style={{
        animation: 'fadeIn 0.3s ease-out',
      }}
    >
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      <UserMenu />
    </div>
  );
}
