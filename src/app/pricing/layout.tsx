import '@/app/tailwind.css';
import { CelestialBackground } from '@/components/CelestialBackground';
import { BackToCalculatorButton } from '@/components/BackToCalculatorButton';

export default function PricingLayout({
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
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24 max-w-6xl"
          style={{ marginTop: '42px' }}
        >
          {children}
        </div>
      </div>
    </>
  );
}
