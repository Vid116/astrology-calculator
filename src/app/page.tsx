import { CelestialBackground } from '@/components/CelestialBackground';
import { CalculatorApp, CalculatorProvider } from '@/components/Calculator';
import { FloatingAuth } from '@/components/auth/FloatingAuth';

export default function Home() {
  return (
    <CalculatorProvider>
      <CelestialBackground />
      <FloatingAuth />
      <CalculatorApp />
    </CalculatorProvider>
  );
}
