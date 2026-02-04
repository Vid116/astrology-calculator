'use client';

import { useAuth } from '@/components/auth/AuthProvider';
import Image from 'next/image';

export default function GoodVibesAstrologyPage() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#67e8f9]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ffd800] animate-spin" />
            <div className="absolute inset-2 rounded-full border border-[#67e8f9]/10" />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,216,0,0.1) 0%, transparent 70%)',
              }}
            />
          </div>
          <p className="text-[#67e8f9] text-sm tracking-wider animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16" style={{ paddingLeft: '5px', paddingRight: '5px' }}>
      {/* Header */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          marginTop: '25px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.15)',
          boxShadow: `
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 10px 40px rgba(0, 0, 0, 0.4),
            0 0 60px rgba(103, 232, 249, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Decorative Background */}
        <div
          className="absolute inset-0 opacity-30 rounded-2xl overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(103, 232, 249, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 70% 100%, rgba(255, 216, 0, 0.08) 0%, transparent 50%)
            `,
          }}
        />

        <div className="relative p-8 md:p-12">
          <div className="flex items-center gap-5 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.15) 0%, rgba(30, 150, 252, 0.1) 100%)',
                boxShadow: '0 0 20px rgba(103, 232, 249, 0.2)',
              }}
            >
              <Image
                src="/signs-svg/Renata-good-vibes-LOGO-05-Pur.png"
                alt="Good Vibes Astrology"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="font-cinzel text-2xl md:text-3xl text-white tracking-wide">
                Good Vibes Astrology
              </h1>
              <p className="text-[#6b7a90] text-sm mt-2">
                Your personal cosmic guidance
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          marginTop: '7px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        <div className="p-8 md:p-12 flex flex-col items-center justify-center min-h-[300px]">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-6 overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.12) 0%, rgba(30, 150, 252, 0.08) 100%)',
              boxShadow: '0 0 30px rgba(103, 232, 249, 0.2)',
            }}
          >
            <Image
              src="/signs-svg/Renata-good-vibes-LOGO-05-Pur.png"
              alt="Good Vibes Astrology"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h2 className="text-xl font-semibold text-white mb-4 text-center">
            Coming Soon
          </h2>
          <p className="text-[#a1a1aa] max-w-md leading-relaxed text-center">
            We&apos;re working on something special for you. Check back soon for personalized astrological insights and guidance.
          </p>
        </div>
      </div>
    </div>
  );
}
