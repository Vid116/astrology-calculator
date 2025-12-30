import '@/app/tailwind.css';
import Link from 'next/link';
import { CelestialBackground } from '@/components/CelestialBackground';

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <CelestialBackground />

      {/* Veil overlay to dim the background */}
      <div
        className="fixed inset-0 z-[1] pointer-events-none"
        style={{
          background: 'linear-gradient(180deg, rgba(10, 14, 26, 0.7) 0%, rgba(10, 14, 26, 0.85) 50%, rgba(10, 14, 26, 0.7) 100%)',
        }}
      />

      <div className="min-h-screen relative z-10">
        {/* Back to Calculator link */}
        <div className="fixed top-4 left-4 z-50">
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-all duration-300 group"
            style={{
              color: '#67e8f9',
              background: 'rgba(103, 232, 249, 0.08)',
              border: '1px solid rgba(103, 232, 249, 0.2)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <svg
              className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="transition-colors duration-300 group-hover:text-[#ffd800]">
              Back to Calculator
            </span>
          </Link>
        </div>

        {/* Main content container */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 max-w-4xl">
          {children}
        </div>
      </div>
    </>
  );
}
