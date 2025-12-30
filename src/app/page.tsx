import { CelestialBackground } from '@/components/CelestialBackground';
import { CalculatorApp } from '@/components/Calculator';
import { FloatingAuth } from '@/components/auth/FloatingAuth';

export default function Home() {
  return (
    <>
      <CelestialBackground />
      <FloatingAuth />
      <CalculatorApp />
    </>
  );
}
