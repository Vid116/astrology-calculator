import '@/app/tailwind.css';
import { CelestialBackground } from '@/components/CelestialBackground';
import { BackToCalculatorButton } from '@/components/BackToCalculatorButton';

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
          <BackToCalculatorButton />
        </div>

        {/* Main content container */}
        <div
          className="container mx-auto px-6 sm:px-8 lg:px-12 py-20 max-w-4xl overflow-visible"
          style={{ marginTop: '42px' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
