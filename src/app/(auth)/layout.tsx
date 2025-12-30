import '@/app/tailwind.css';
import Link from 'next/link';
import { CelestialBackground } from '@/components/CelestialBackground';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <style>{`
        @keyframes authFadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>

      {/* Use the main CelestialBackground component */}
      <CelestialBackground />

      <div className="min-h-screen flex items-center justify-center relative z-10">
        {/* Content */}
        <div
          className="relative w-full max-w-md mx-4"
          style={{
            animation: 'authFadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
          }}
        >
          {/* Back to home link */}
          <Link
            href="/"
            className="absolute -top-14 left-0 flex items-center gap-2 text-sm transition-all duration-300 group"
            style={{ color: '#67e8f9' }}
          >
            <span
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-300 group-hover:bg-[rgba(103,232,249,0.1)]"
              style={{
                border: '1px solid rgba(103, 232, 249, 0.2)',
                background: 'rgba(103, 232, 249, 0.05)',
              }}
            >
              <svg className="w-4 h-4 transition-transform duration-300 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </span>
            <span className="transition-colors duration-300 group-hover:text-[#ffd800]">
              Back to Calculator
            </span>
          </Link>

          {children}
        </div>
      </div>
    </>
  );
}
