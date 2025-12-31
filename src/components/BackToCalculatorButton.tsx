'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export function BackToCalculatorButton() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Shrink when scrolled past 30px
      setIsScrolled(window.scrollY > 30);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <Link
      href="/"
      className="flex items-center py-2 text-sm rounded-lg transition-all duration-300 group"
      style={{
        paddingLeft: '10px',
        paddingRight: '14px',
        color: '#67e8f9',
        background: 'rgba(103, 232, 249, 0.08)',
        border: '1px solid rgba(103, 232, 249, 0.2)',
        backdropFilter: 'blur(8px)',
      }}
      title="Back to Calculator"
    >
      <svg
        className="w-4 h-4 flex-shrink-0 transition-transform duration-300 group-hover:-translate-x-0.5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      <span
        className="whitespace-nowrap overflow-hidden transition-all duration-300 group-hover:text-[#ffd800]"
        style={{
          maxWidth: isScrolled ? '0px' : '150px',
          opacity: isScrolled ? 0 : 1,
          marginLeft: isScrolled ? '0px' : '8px',
        }}
      >
        Back to Calculator
      </span>
    </Link>
  );
}
