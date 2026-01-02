'use client';

import { useState, useRef } from 'react';
import { CosmicDropdown } from '@/components/ui/CosmicDropdown';
import { calculateProfection } from '@/lib/calculations';
import { ProfectionWheel } from './ProfectionWheel';
import type { ProfectionData, ProfectionResult, ZodiacSign } from '@/types/astrology';

const SIGNS: { value: ZodiacSign; label: string }[] = [
  { value: 'Aries', label: 'Aries' },
  { value: 'Taurus', label: 'Taurus' },
  { value: 'Gemini', label: 'Gemini' },
  { value: 'Cancer', label: 'Cancer' },
  { value: 'Leo', label: 'Leo' },
  { value: 'Virgo', label: 'Virgo' },
  { value: 'Libra', label: 'Libra' },
  { value: 'Scorpio', label: 'Scorpio' },
  { value: 'Sagittarius', label: 'Sagittarius' },
  { value: 'Capricorn', label: 'Capricorn' },
  { value: 'Aquarius', label: 'Aquarius' },
  { value: 'Pisces', label: 'Pisces' },
];

interface ProfectionCalculatorProps {
  profectionData: ProfectionData;
  isActive: boolean;
  onCalculate?: () => Promise<boolean>;
  canCalculate?: boolean;
}

export function ProfectionCalculator({ profectionData, isActive, onCalculate, canCalculate = true }: ProfectionCalculatorProps) {
  const [birthDate, setBirthDate] = useState('');
  const [rising, setRising] = useState('');
  const [result, setResult] = useState<ProfectionResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!birthDate) {
      newErrors.birthDate = 'Please select your birth date';
    } else {
      const date = new Date(birthDate);
      const today = new Date();
      if (date > today) {
        newErrors.birthDate = 'Birth date cannot be in the future';
      }
    }

    if (!rising) newErrors.rising = 'Please select a rising sign';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Track calculation usage
    if (onCalculate) {
      const allowed = await onCalculate();
      if (!allowed) return; // Usage limit reached
    }

    const profectionResult = calculateProfection(birthDate, rising, profectionData);
    setResult(profectionResult);

    // Scroll to results after a brief delay for render
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 50);
  };

  return (
    <div className={`calculator-section ${isActive ? 'active' : ''}`}>
      <h2>Profection Years Calculator</h2>
      <p className="description">
        Calculate your annual profections based on your birth date and rising sign
      </p>

      <form onSubmit={handleSubmit} className="calculator-form" noValidate>
        <div className="form-group">
          <label>Birth Date:</label>
          <input
            type="date"
            value={birthDate}
            onChange={e => {
              setBirthDate(e.target.value);
              setErrors(prev => ({ ...prev, birthDate: '' }));
            }}
            className={errors.birthDate ? 'has-error' : ''}
          />
          {errors.birthDate && <div className="validation-error show">{errors.birthDate}</div>}
        </div>

        <div className="form-group">
          <label>Rising Sign (Ascendant):</label>
          <CosmicDropdown
            options={SIGNS}
            value={rising}
            onChange={(val) => {
              setRising(val);
              setErrors(prev => ({ ...prev, rising: '' }));
            }}
            placeholder="Select rising sign..."
            error={errors.rising}
          />
        </div>

        <button type="submit" className="calculate-btn">
          Calculate Profection Years
        </button>
      </form>

      {result && (
        <div ref={resultRef} className="result-section show">
          <h3>Profection Years Result</h3>
          <div className="result-item">
            <strong>Current Age:</strong> <span>{result.age}</span>
          </div>
          <div className="result-item">
            <strong>Current Profection:</strong>{' '}
            <span>
              {result.currentHouse} House - {result.currentSign}
            </span>
          </div>
          <div className="result-item">
            <strong>First Activation Year:</strong> <span>{result.firstActivation}</span>
          </div>

          <ProfectionWheel result={result} />
        </div>
      )}
    </div>
  );
}
