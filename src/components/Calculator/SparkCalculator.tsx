'use client';

import { useState, useRef } from 'react';
import { CosmicDropdown } from '@/components/ui/CosmicDropdown';
import { calculateSpark } from '@/lib/calculations';
import type { SparkEntry, SparkResult, Planet, ZodiacSign } from '@/types/astrology';

const PLANETS: { value: Planet; label: string }[] = [
  { value: 'SUN', label: 'Sun' },
  { value: 'MOON', label: 'Moon' },
  { value: 'MERCURY', label: 'Mercury' },
  { value: 'VENUS', label: 'Venus' },
  { value: 'MARS', label: 'Mars' },
  { value: 'JUPITER', label: 'Jupiter' },
  { value: 'SATURN', label: 'Saturn' },
  { value: 'URANUS', label: 'Uranus' },
  { value: 'NEPTUNE', label: 'Neptune' },
  { value: 'PLUTO', label: 'Pluto' },
  { value: 'OTHER', label: 'Other' },
];

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

interface SparkCalculatorProps {
  sparkDatabase: SparkEntry[];
  isActive: boolean;
  onCalculate?: () => Promise<boolean>;
  canCalculate?: boolean;
}

export function SparkCalculator({ sparkDatabase, isActive, onCalculate, canCalculate = true }: SparkCalculatorProps) {
  const [planet, setPlanet] = useState('');
  const [customPlanet, setCustomPlanet] = useState('');
  const [sign, setSign] = useState('');
  const [degree, setDegree] = useState('');
  const [result, setResult] = useState<SparkResult | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!planet) newErrors.planet = 'Please select a planet';
    if (planet === 'OTHER' && !customPlanet.trim()) {
      newErrors.customPlanet = 'Please enter a custom planet/point name';
    }
    if (!sign) newErrors.sign = 'Please select a sign';
    if (!degree) {
      newErrors.degree = 'Please enter a degree value';
    } else {
      const degreeNum = parseInt(degree);
      if (isNaN(degreeNum) || degreeNum < 0 || degreeNum > 29) {
        newErrors.degree = 'Degree must be between 0 and 29';
      }
    }

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

    const planetName = planet === 'OTHER' ? customPlanet.toUpperCase() : planet;
    const sparkResult = calculateSpark(planetName, sign, degree, sparkDatabase);
    setResult(sparkResult);

    // Scroll to results after a brief delay for render
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: 'auto', block: 'start' });
    }, 50);
  };

  return (
    <div className={`calculator-section ${isActive ? 'active' : ''}`}>
      <h2>Spark Calculator</h2>
      <p className="description">
        Find which &quot;Spark&quot; sign and Decan a planet is in based on its position
      </p>

      <form onSubmit={handleSubmit} className="calculator-form" noValidate>
        <div className="form-group">
          <label>Planet:</label>
          <CosmicDropdown
            options={PLANETS}
            value={planet}
            onChange={(val) => {
              setPlanet(val);
              setErrors(prev => ({ ...prev, planet: '' }));
            }}
            placeholder="Select a planet..."
            error={errors.planet}
          />
          {planet === 'OTHER' && (
            <input
              type="text"
              className={`custom-planet-input ${errors.customPlanet ? 'has-error' : ''}`}
              placeholder="Enter custom planet/point..."
              value={customPlanet}
              onChange={e => {
                setCustomPlanet(e.target.value);
                setErrors(prev => ({ ...prev, customPlanet: '' }));
              }}
            />
          )}
        </div>

        <div className="form-group">
          <label>Sign:</label>
          <CosmicDropdown
            options={SIGNS}
            value={sign}
            onChange={(val) => {
              setSign(val);
              setErrors(prev => ({ ...prev, sign: '' }));
            }}
            placeholder="Select a sign..."
            error={errors.sign}
          />
        </div>

        <div className="form-group">
          <label>Degree (0-29):</label>
          <input
            type="number"
            min="0"
            max="29"
            value={degree}
            onChange={e => {
              setDegree(e.target.value);
              setErrors(prev => ({ ...prev, degree: '' }));
            }}
            className={errors.degree ? 'has-error' : ''}
          />
          {errors.degree && <div className="validation-error show">{errors.degree}</div>}
        </div>

        <button type="submit" className="calculate-btn">
          Calculate Spark
        </button>
      </form>

      {result && (
        <div ref={resultRef} className="result-section show">
          <h3>Spark Calculation Result</h3>
          <div className="result-item">
            <strong>Planet:</strong> <span>{result.planet}</span>
          </div>
          <div className="result-item">
            <strong>Position:</strong> <span>{result.degree}° {result.sign}</span>
          </div>
          <div className="result-item">
            <strong>Spark Sign:</strong> <span>{result.spark}</span>
          </div>
          <div className="result-item">
            <strong>Decan:</strong> <span>{result.decan}</span>
          </div>
          <div className="result-item">
            <strong>Decan Planets:</strong> <span>{result.decanPlanets}</span>
          </div>
          <div className="interpretation">
            <strong>{result.planet}</strong> at <strong>{result.degree}°</strong> in{' '}
            <strong>{result.sign}</strong> has a spark in <strong>{result.spark}</strong> and
            is in the <strong>{result.decan}</strong> decan, ruled by{' '}
            <strong>{result.decanPlanets}</strong>.
          </div>
        </div>
      )}

      {result === null && errors.planet === undefined && degree && sign && (
        <div className="result-section show">
          <div className="error-message">
            No matching data found for {degree}° {sign}. Please check your inputs.
          </div>
        </div>
      )}
    </div>
  );
}
