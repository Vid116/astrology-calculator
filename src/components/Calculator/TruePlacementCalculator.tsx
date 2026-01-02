'use client';

import { useState, useRef } from 'react';
import { CosmicDropdown } from '@/components/ui/CosmicDropdown';
import { SentenceBuilder } from './SentenceBuilder';
import { calculateTruePlacement } from '@/lib/calculations';
import type {
  SparkEntry,
  TruePlacementEntry,
  TruePlacementResult,
  ZodiacSign,
} from '@/types/astrology';

const PLANETS = [
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

interface TruePlacementCalculatorProps {
  truePlacementDB1: TruePlacementEntry[];
  truePlacementDB2: TruePlacementEntry[];
  sparkDatabase: SparkEntry[];
  planetKeywords: Record<string, string[]>;
  signKeywords: Record<string, string[]>;
  isActive: boolean;
  onCalculate?: () => Promise<boolean>;
  canCalculate?: boolean;
}

export function TruePlacementCalculator({
  truePlacementDB1,
  truePlacementDB2,
  sparkDatabase,
  planetKeywords,
  signKeywords,
  isActive,
  onCalculate,
  canCalculate = true,
}: TruePlacementCalculatorProps) {
  const [planet, setPlanet] = useState('');
  const [sign, setSign] = useState('');
  const [degree, setDegree] = useState('');
  const [rising, setRising] = useState('');
  const [result, setResult] = useState<TruePlacementResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!planet) newErrors.planet = 'Please select a planet';
    if (!sign) newErrors.sign = 'Please select a sign';
    if (!rising) newErrors.rising = 'Please select a rising sign';

    if (degree) {
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

    const placementResult = calculateTruePlacement(
      planet,
      sign,
      rising,
      degree || null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    if (placementResult) {
      setResult(placementResult);
      setNotFound(false);
    } else {
      setResult(null);
      setNotFound(true);
    }

    // Scroll to results immediately
    requestAnimationFrame(() => {
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const buildInterpretation = () => {
    if (!result) return '';

    const sparkPart = result.spark
      ? `, with <strong>${result.spark.spark}</strong> spark in <strong>${result.spark.decan}</strong> decan,`
      : ',';

    if (result.hasDualBase && result.secondBaseSign && result.secondThroughSign) {
      return `<strong>${result.planet}</strong> in <strong>${result.sign}</strong>${sparkPart} expressed through <strong>${result.expressingSign}</strong> with <strong>${result.baseSign}</strong> and <strong>${result.secondBaseSign}</strong> base (through <strong>${result.throughSign}</strong> and <strong>${result.secondThroughSign}</strong>).`;
    }

    return `<strong>${result.planet}</strong> in <strong>${result.sign}</strong>${sparkPart} expressed through <strong>${result.expressingSign}</strong> with <strong>${result.baseSign}</strong> base (through <strong>${result.throughSign}</strong>).`;
  };

  return (
    <div className={`calculator-section ${isActive ? 'active' : ''}`}>
      <h2>True Placement Calculator</h2>
      <p className="description">
        Calculate house placements and interpretations based on planetary positions
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
        </div>

        <div className="form-group">
          <label>Planet Sign:</label>
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
          <label>
            Degree (0-29): <span className="optional">(optional)</span>
          </label>
          <input
            type="number"
            min="0"
            max="29"
            value={degree}
            onChange={e => {
              setDegree(e.target.value);
              setErrors(prev => ({ ...prev, degree: '' }));
            }}
            placeholder="Enter degree (0-29)"
            className={errors.degree ? 'has-error' : ''}
          />
          {errors.degree && <div className="validation-error show">{errors.degree}</div>}
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
            placeholder="Select a sign..."
            error={errors.rising}
          />
        </div>

        <button type="submit" className="calculate-btn">
          Calculate True Placement
        </button>
      </form>

      {result && (
        <div ref={resultRef} className="result-section show">
          <h3>True Placement Result</h3>
          <div className="result-item">
            <strong>House:</strong>{' '}
            <span>
              ({result.isHouse}) {result.isSign}
            </span>
          </div>
          <div className="result-item">
            <strong>Expressing Through:</strong> <span>{result.expressingSign}</span>
          </div>

          {result.hasDualBase && result.secondBaseSign ? (
            <>
              <div className="result-item">
                <strong>Base 1:</strong>{' '}
                <span>
                  ({result.baseHouse}) {result.baseSign} through {result.throughSign}
                </span>
              </div>
              <div className="result-item">
                <strong>Base 2:</strong>{' '}
                <span>
                  ({result.secondBaseHouse}) {result.secondBaseSign} through{' '}
                  {result.secondThroughSign}
                </span>
              </div>
            </>
          ) : (
            <div className="result-item">
              <strong>Base:</strong>{' '}
              <span>
                ({result.baseHouse}) {result.baseSign} through {result.throughSign}
              </span>
            </div>
          )}

          {result.spark && (
            <>
              <div className="result-item">
                <strong>Spark Sign:</strong> <span>{result.spark.spark}</span>
              </div>
              <div className="result-item">
                <strong>Decan:</strong> <span>{result.spark.decan}</span>
              </div>
              <div className="result-item">
                <strong>Decan Planets:</strong> <span>{result.spark.decanPlanets}</span>
              </div>
            </>
          )}

          <div
            className="interpretation"
            dangerouslySetInnerHTML={{ __html: buildInterpretation() }}
          />

          <SentenceBuilder
            planet={result.planet}
            planetKeywords={planetKeywords[result.planet] || []}
            baseSign={result.baseSign}
            baseKeywords={signKeywords[result.baseSign] || []}
            base2Sign={result.secondBaseSign}
            base2Keywords={result.secondBaseSign ? signKeywords[result.secondBaseSign] || [] : []}
            throughSign={result.throughSign}
            throughKeywords={signKeywords[result.throughSign] || []}
            through2Sign={result.secondThroughSign}
            through2Keywords={
              result.secondThroughSign ? signKeywords[result.secondThroughSign] || [] : []
            }
            isSign={result.isSign}
            isSignKeywords={signKeywords[result.isSign] || []}
            inputSign={result.sign}
            inputSignKeywords={signKeywords[result.sign] || []}
            hasDualBase={result.hasDualBase}
          />
        </div>
      )}

      {notFound && (
        <div className="result-section show">
          <div className="error-message">
            No matching data found for {planet} in {sign} with {rising} rising. Please check
            your inputs.
          </div>
        </div>
      )}
    </div>
  );
}
