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

type SubTab = 'basic' | 'ruler' | 'yoyo' | 'phs' | 'phsr' | 'mixmatch';

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

const HOUSES: { value: ZodiacSign; label: string }[] = [
  { value: 'Aries', label: '1st' },
  { value: 'Taurus', label: '2nd' },
  { value: 'Gemini', label: '3rd' },
  { value: 'Cancer', label: '4th' },
  { value: 'Leo', label: '5th' },
  { value: 'Virgo', label: '6th' },
  { value: 'Libra', label: '7th' },
  { value: 'Scorpio', label: '8th' },
  { value: 'Sagittarius', label: '9th' },
  { value: 'Capricorn', label: '10th' },
  { value: 'Aquarius', label: '11th' },
  { value: 'Pisces', label: '12th' },
];

// Modern rulers for each sign
const SIGN_RULERS: Record<string, string> = {
  Aries: 'MARS',
  Taurus: 'VENUS',
  Gemini: 'MERCURY',
  Cancer: 'MOON',
  Leo: 'SUN',
  Virgo: 'MERCURY',
  Libra: 'VENUS',
  Scorpio: 'PLUTO',
  Sagittarius: 'JUPITER',
  Capricorn: 'SATURN',
  Aquarius: 'URANUS',
  Pisces: 'NEPTUNE',
};

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
  const [activeSubTab, setActiveSubTab] = useState<SubTab>('basic');

  // Basic calculator state
  const [planet, setPlanet] = useState('');
  const [sign, setSign] = useState('');
  const [degree, setDegree] = useState('');
  const [rising, setRising] = useState('');
  const [result, setResult] = useState<TruePlacementResult | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const resultRef = useRef<HTMLDivElement>(null);

  // Ruler calculator state
  const [rulerPlanet, setRulerPlanet] = useState('');
  const [rulerSign, setRulerSign] = useState('');
  const [rulerDegree, setRulerDegree] = useState('');
  const [rulerRising, setRulerRising] = useState('');
  const [rulerPlanetSign, setRulerPlanetSign] = useState(''); // Sign the ruler planet is in
  const [rulerPlanetDegree, setRulerPlanetDegree] = useState(''); // Degree of the ruler planet
  const [rulerResult, setRulerResult] = useState<TruePlacementResult | null>(null);
  const [rulerNotFound, setRulerNotFound] = useState(false);
  const [rulerErrors, setRulerErrors] = useState<Record<string, string>>({});
  const rulerResultRef = useRef<HTMLDivElement>(null);
  const [rulerPanelEnabled, setRulerPanelEnabled] = useState(true);

  // YoYo calculator state
  const [yoyoPlanet, setYoyoPlanet] = useState('');
  const [yoyoHouse, setYoyoHouse] = useState('');
  const [yoyoSign, setYoyoSign] = useState('');
  const [yoyoErrors, setYoyoErrors] = useState<Record<string, string>>({});
  const [yoyoSubmitted, setYoyoSubmitted] = useState(false);
  const [yoyoKeywords, setYoyoKeywords] = useState<{
    planet1: string;
    house1: string;
    sign1: string;
    sign2: string;
    house2: string;
    planet2: string;
  }>({
    planet1: '',
    house1: '',
    sign1: '',
    sign2: '',
    house2: '',
    planet2: '',
  });
  const yoyoResultRef = useRef<HTMLDivElement>(null);

  // PHSR calculator state
  const [phsrPlanet, setPhsrPlanet] = useState('');
  const [phsrSign, setPhsrSign] = useState('');
  const [phsrRising, setPhsrRising] = useState('');
  const [phsrRulerSign, setPhsrRulerSign] = useState('');
  const [phsrResult, setPhsrResult] = useState<TruePlacementResult | null>(null);
  const [phsrRulerResult, setPhsrRulerResult] = useState<TruePlacementResult | null>(null);
  const [phsrNotFound, setPhsrNotFound] = useState(false);
  const [phsrErrors, setPhsrErrors] = useState<Record<string, string>>({});
  const phsrResultRef = useRef<HTMLDivElement>(null);

  // PHSR word selection state
  const [phsrWords, setPhsrWords] = useState({
    planetWord: '',
    houseWord: '',
    connector1: '',
    signWord: '',
    rulerWord: '',
    rulerHouseWord: '',
    connector2: '',
    rulerSignWord: '',
  });

  // PHS calculator state
  const [phsPlanet, setPhsPlanet] = useState('');
  const [phsSign, setPhsSign] = useState('');
  const [phsRising, setPhsRising] = useState('');
  const [phsResult, setPhsResult] = useState<TruePlacementResult | null>(null);
  const [phsNotFound, setPhsNotFound] = useState(false);
  const [phsErrors, setPhsErrors] = useState<Record<string, string>>({});
  const phsResultRef = useRef<HTMLDivElement>(null);

  // PHS word selection state
  const [phsWords, setPhsWords] = useState({
    planetWord: '',
    houseWord: '',
    connector: '',
    signWord: '',
  });

  // Mix & Match calculator state
  const [mixPlanet, setMixPlanet] = useState('');
  const [mixSign, setMixSign] = useState('');
  const [mixRising, setMixRising] = useState('');
  const [mixRulerSign, setMixRulerSign] = useState('');
  const [mixResult, setMixResult] = useState<TruePlacementResult | null>(null);
  const [mixRulerResult, setMixRulerResult] = useState<TruePlacementResult | null>(null);
  const [mixNotFound, setMixNotFound] = useState(false);
  const [mixErrors, setMixErrors] = useState<Record<string, string>>({});
  const mixResultRef = useRef<HTMLDivElement>(null);

  // Mix & Match word selection state
  const [mixWords, setMixWords] = useState({
    planetWord: '',
    connector1: '',
    houseWord: '',
    biRulerWord: '',
    biRuler2Word: '',
    signWord: '',
    rulerWord: '',
    connector2: '',
    rulerHouseWord: '',
    rulerSignWord: '',
  });

  // Sign to house number mapping (natural zodiac order)
  const SIGN_TO_HOUSE: Record<string, string> = {
    'Aries': '1st',
    'Taurus': '2nd',
    'Gemini': '3rd',
    'Cancer': '4th',
    'Leo': '5th',
    'Virgo': '6th',
    'Libra': '7th',
    'Scorpio': '8th',
    'Sagittarius': '9th',
    'Capricorn': '10th',
    'Aquarius': '11th',
    'Pisces': '12th',
  };

  // Connector options
  const CONNECTOR_OPTIONS = [
    'direct through',
    'is focused into',
    'relates to',
    'contributes to',
    'is based on',
    'may come through',
  ];

  // Get the ruler planet based on the selected sign (for Ruler tab)
  const derivedRulerPlanet = rulerSign ? SIGN_RULERS[rulerSign] : '';
  const rulerPlanetLabel = derivedRulerPlanet
    ? PLANETS.find(p => p.value === derivedRulerPlanet)?.label || ''
    : '';

  // Get the ruler planet based on the selected sign (for PHSR tab)
  const phsrDerivedRuler = phsrSign ? SIGN_RULERS[phsrSign] : '';
  const phsrRulerLabel = phsrDerivedRuler
    ? PLANETS.find(p => p.value === phsrDerivedRuler)?.label || ''
    : '';

  // Get the ruler planet based on the selected sign (for Mix & Match tab)
  const mixDerivedRuler = mixSign ? SIGN_RULERS[mixSign] : '';
  const mixRulerLabel = mixDerivedRuler
    ? PLANETS.find(p => p.value === mixDerivedRuler)?.label || ''
    : '';

  // Get planet label for Mix & Match
  const getMixPlanetLabel = () => {
    return PLANETS.find(p => p.value === mixPlanet)?.label || mixPlanet;
  };

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

  // Ruler calculator validation
  const validateRuler = () => {
    const newErrors: Record<string, string> = {};

    if (!rulerPlanet) newErrors.rulerPlanet = 'Please select a planet';
    if (!rulerSign) newErrors.rulerSign = 'Please select a sign';
    if (!rulerRising) newErrors.rulerRising = 'Please select a rising sign';

    // Only validate ruler fields if ruler panel is enabled
    if (rulerPanelEnabled && !rulerPlanetSign) {
      newErrors.rulerPlanetSign = 'Please select the ruler planet sign';
    }

    if (rulerDegree) {
      const degreeNum = parseInt(rulerDegree);
      if (isNaN(degreeNum) || degreeNum < 0 || degreeNum > 29) {
        newErrors.rulerDegree = 'Degree must be between 0 and 29';
      }
    }

    if (rulerPanelEnabled && rulerPlanetDegree) {
      const degreeNum = parseInt(rulerPlanetDegree);
      if (isNaN(degreeNum) || degreeNum < 0 || degreeNum > 29) {
        newErrors.rulerPlanetDegree = 'Degree must be between 0 and 29';
      }
    }

    setRulerErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Ruler calculator submit
  const handleRulerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRuler()) return;

    // Track calculation usage
    if (onCalculate) {
      const allowed = await onCalculate();
      if (!allowed) return;
    }

    // Calculate the main planet placement
    const mainResult = calculateTruePlacement(
      rulerPlanet,
      rulerSign,
      rulerRising,
      rulerDegree || null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    // Calculate the ruler planet placement only if ruler panel is enabled
    let rulerPlacementResult = null;
    if (rulerPanelEnabled) {
      rulerPlacementResult = calculateTruePlacement(
        derivedRulerPlanet,
        rulerPlanetSign,
        rulerRising,
        rulerPlanetDegree || null,
        truePlacementDB1,
        truePlacementDB2,
        sparkDatabase
      );
    }

    if (mainResult) {
      // Combine results - add ruler info to main result only if enabled
      const combinedResult = {
        ...mainResult,
        ...(rulerPanelEnabled && rulerPlacementResult ? {
          rulerPlanet: rulerPlanetLabel,
          rulerPlanetSign: rulerPlanetSign,
          rulerPlanetDegree: rulerPlanetDegree || null,
          rulerPlacement: rulerPlacementResult,
        } : {}),
      };
      setRulerResult(combinedResult as TruePlacementResult);
      setRulerNotFound(false);
    } else {
      setRulerResult(null);
      setRulerNotFound(true);
    }

    requestAnimationFrame(() => {
      rulerResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  // Helper to build interpretation for any result
  const buildInterpretationFor = (res: TruePlacementResult | null) => {
    if (!res) return '';

    const sparkPart = res.spark
      ? `, with <strong>${res.spark.spark}</strong> degree in <strong>${res.spark.decan}</strong> decan,`
      : ',';

    if (res.hasDualBase && res.secondBaseSign && res.secondThroughSign) {
      return `<strong>${res.planet}</strong> in <strong>${res.sign}</strong>${sparkPart} expressed through <strong>${res.expressingSign}</strong> with <strong>${res.baseSign}</strong> and <strong>${res.secondBaseSign}</strong> base (through <strong>${res.throughSign}</strong> and <strong>${res.secondThroughSign}</strong>).`;
    }

    return `<strong>${res.planet}</strong> in <strong>${res.sign}</strong>${sparkPart} expressed through <strong>${res.expressingSign}</strong> with <strong>${res.baseSign}</strong> base (through <strong>${res.throughSign}</strong>).`;
  };

  const buildInterpretation = () => buildInterpretationFor(result);

  // Helper to build cosmological sentence for any result
  const buildCosmologicalSentenceFor = (res: TruePlacementResult | null) => {
    if (!res) return '';

    // Determine a/an based on decan starting with vowel
    const getArticle = (word: string) => {
      const vowels = ['A', 'E', 'I', 'O', 'U'];
      return vowels.includes(word.charAt(0).toUpperCase()) ? 'an' : 'a';
    };

    const decanArticle = res.spark ? getArticle(res.spark.decan) : 'a';

    const sparkPart = res.spark
      ? `, has a <strong>${res.spark.spark}</strong> Spark with ${decanArticle} <strong>${res.spark.decan}</strong> Pulse,`
      : ',';

    if (res.hasDualBase && res.secondBaseSign) {
      return `My <strong>${res.planet}</strong> Focus, in the <strong>${res.sign}</strong> Field${sparkPart} expressing through <strong>${res.expressingSign}</strong> Tone with <strong>${res.baseSign}</strong> and <strong>${res.secondBaseSign}</strong> base.`;
    }

    return `My <strong>${res.planet}</strong> Focus, in the <strong>${res.sign}</strong> Field${sparkPart} expressing through <strong>${res.expressingSign}</strong> Tone with <strong>${res.baseSign}</strong> base.`;
  };

  // YoYo calculator validation
  const validateYoyo = () => {
    const newErrors: Record<string, string> = {};

    if (!yoyoPlanet) newErrors.yoyoPlanet = 'Please select a planet';
    if (!yoyoHouse) newErrors.yoyoHouse = 'Please select a house';
    if (!yoyoSign) newErrors.yoyoSign = 'Please select a sign';

    setYoyoErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // YoYo calculator submit
  const handleYoyoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateYoyo()) return;

    // Track calculation usage
    if (onCalculate) {
      const allowed = await onCalculate();
      if (!allowed) return;
    }

    // Reset keywords when new calculation is made
    setYoyoKeywords({
      planet1: '',
      house1: '',
      sign1: '',
      sign2: '',
      house2: '',
      planet2: '',
    });
    setYoyoSubmitted(true);

    requestAnimationFrame(() => {
      yoyoResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  // Get planet label from value
  const getYoyoPlanetLabel = () => {
    return PLANETS.find(p => p.value === yoyoPlanet)?.label || yoyoPlanet;
  };

  // PHS calculator validation
  const validatePhs = () => {
    const newErrors: Record<string, string> = {};

    if (!phsPlanet) newErrors.phsPlanet = 'Please select a planet';
    if (!phsSign) newErrors.phsSign = 'Please select a sign';
    if (!phsRising) newErrors.phsRising = 'Please select a rising sign';

    setPhsErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // PHS calculator submit
  const handlePhsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhs()) return;

    // Track calculation usage
    if (onCalculate) {
      const allowed = await onCalculate();
      if (!allowed) return;
    }

    // Calculate the planet placement
    const result = calculateTruePlacement(
      phsPlanet,
      phsSign,
      phsRising,
      null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    if (result) {
      setPhsResult(result);
      setPhsNotFound(false);
      // Reset words for new calculation
      setPhsWords({
        planetWord: '',
        houseWord: '',
        connector: '',
        signWord: '',
      });
    } else {
      setPhsResult(null);
      setPhsNotFound(true);
    }

    requestAnimationFrame(() => {
      phsResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  // Get planet label for PHS
  const getPhsPlanetLabel = () => {
    return PLANETS.find(p => p.value === phsPlanet)?.label || phsPlanet;
  };

  // PHSR calculator validation
  const validatePhsr = () => {
    const newErrors: Record<string, string> = {};

    if (!phsrPlanet) newErrors.phsrPlanet = 'Please select a planet';
    if (!phsrSign) newErrors.phsrSign = 'Please select a sign';
    if (!phsrRising) newErrors.phsrRising = 'Please select a rising sign';
    if (!phsrRulerSign) newErrors.phsrRulerSign = 'Please select the ruler planet sign';

    setPhsrErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // PHSR calculator submit
  const handlePhsrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePhsr()) return;

    // Track calculation usage
    if (onCalculate) {
      const allowed = await onCalculate();
      if (!allowed) return;
    }

    // Calculate the main planet placement
    const mainResult = calculateTruePlacement(
      phsrPlanet,
      phsrSign,
      phsrRising,
      null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    // Calculate the ruler planet placement
    const rulerPlacementResult = calculateTruePlacement(
      phsrDerivedRuler,
      phsrRulerSign,
      phsrRising,
      null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    if (mainResult) {
      setPhsrResult(mainResult);
      setPhsrRulerResult(rulerPlacementResult);
      setPhsrNotFound(false);
      // Reset words for new calculation
      setPhsrWords({
        planetWord: '',
        houseWord: '',
        connector1: '',
        signWord: '',
        rulerWord: '',
        rulerHouseWord: '',
        connector2: '',
        rulerSignWord: '',
      });
    } else {
      setPhsrResult(null);
      setPhsrRulerResult(null);
      setPhsrNotFound(true);
    }

    requestAnimationFrame(() => {
      phsrResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  // Get planet label for PHSR
  const getPhsrPlanetLabel = () => {
    return PLANETS.find(p => p.value === phsrPlanet)?.label || phsrPlanet;
  };

  // Mix & Match calculator validation
  const validateMix = () => {
    const newErrors: Record<string, string> = {};

    if (!mixPlanet) newErrors.mixPlanet = 'Please select a planet';
    if (!mixSign) newErrors.mixSign = 'Please select a sign';
    if (!mixRising) newErrors.mixRising = 'Please select a rising sign';
    if (!mixRulerSign) newErrors.mixRulerSign = 'Please select the ruler planet sign';

    setMixErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Mix & Match calculator submit
  const handleMixSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateMix()) return;

    // Track calculation usage
    if (onCalculate) {
      const allowed = await onCalculate();
      if (!allowed) return;
    }

    // Calculate the main planet placement
    const mainResult = calculateTruePlacement(
      mixPlanet,
      mixSign,
      mixRising,
      null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    // Calculate the ruler planet placement
    const rulerPlacementResult = calculateTruePlacement(
      mixDerivedRuler,
      mixRulerSign,
      mixRising,
      null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    if (mainResult) {
      setMixResult(mainResult);
      setMixRulerResult(rulerPlacementResult);
      setMixNotFound(false);
      // Reset words for new calculation
      setMixWords({
        planetWord: '',
        connector1: '',
        houseWord: '',
        biRulerWord: '',
        biRuler2Word: '',
        signWord: '',
        rulerWord: '',
        connector2: '',
        rulerHouseWord: '',
        rulerSignWord: '',
      });
    } else {
      setMixResult(null);
      setMixRulerResult(null);
      setMixNotFound(true);
    }

    requestAnimationFrame(() => {
      mixResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  return (
    <div className={`calculator-section ${isActive ? 'active' : ''}`}>
      <h2>True Placement Calculator</h2>
      <p className="description">
        Calculate house placements and interpretations based on planetary positions
      </p>

      {/* Sub-tabs */}
      <div className="sub-tabs">
        <button
          className={`sub-tab-button ${activeSubTab === 'basic' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('basic')}
        >
          Basic
        </button>
        <button
          className={`sub-tab-button ${activeSubTab === 'ruler' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('ruler')}
        >
          BPHDDS / R
        </button>
        <button
          className={`sub-tab-button ${activeSubTab === 'yoyo' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('yoyo')}
        >
          YoYo
        </button>
        <button
          className={`sub-tab-button ${activeSubTab === 'phs' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('phs')}
        >
          PHS
        </button>
        <button
          className={`sub-tab-button ${activeSubTab === 'phsr' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('phsr')}
        >
          PHSR
        </button>
        <button
          className={`sub-tab-button ${activeSubTab === 'mixmatch' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('mixmatch')}
        >
          Mix & Match
        </button>
      </div>

      {/* Basic Calculator */}
      {activeSubTab === 'basic' && (
        <>
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
        </>
      )}

      {/* Ruler Calculator */}
      {activeSubTab === 'ruler' && (
        <>
          <div className="phsr-inputs">
            {/* Left Input Panel */}
            <div className="phsr-input-panel">
              <form onSubmit={handleRulerSubmit} className="calculator-form" noValidate>
                <div className="form-group">
                  <label>Planet:</label>
                  <CosmicDropdown
                    options={PLANETS}
                    value={rulerPlanet}
                    onChange={(val) => {
                      setRulerPlanet(val);
                      setRulerErrors(prev => ({ ...prev, rulerPlanet: '' }));
                    }}
                    placeholder="Select a planet..."
                    error={rulerErrors.rulerPlanet}
                  />
                </div>

                <div className="form-group">
                  <label>Sign:</label>
                  <CosmicDropdown
                    options={SIGNS}
                    value={rulerSign}
                    onChange={(val) => {
                      setRulerSign(val);
                      setRulerErrors(prev => ({ ...prev, rulerSign: '' }));
                    }}
                    placeholder="Select a sign..."
                    error={rulerErrors.rulerSign}
                  />
                </div>

                <div className="form-group">
                  <label>Rising:</label>
                  <CosmicDropdown
                    options={SIGNS}
                    value={rulerRising}
                    onChange={(val) => {
                      setRulerRising(val);
                      setRulerErrors(prev => ({ ...prev, rulerRising: '' }));
                    }}
                    placeholder="Select rising sign..."
                    error={rulerErrors.rulerRising}
                  />
                </div>

                <div className="form-group">
                  <label>
                    Degree: <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="29"
                    value={rulerDegree}
                    onChange={e => {
                      setRulerDegree(e.target.value);
                      setRulerErrors(prev => ({ ...prev, rulerDegree: '' }));
                    }}
                    placeholder="0-29"
                    className={rulerErrors.rulerDegree ? 'has-error' : ''}
                  />
                  {rulerErrors.rulerDegree && <div className="validation-error show">{rulerErrors.rulerDegree}</div>}
                </div>
              </form>
            </div>

            {/* Ruler Input Panel */}
            {rulerSign && (
              <div className={`phsr-ruler-panel ${!rulerPanelEnabled ? 'disabled' : ''}`}>
                <div className="phsr-ruler-header">
                  <div className="ruler-header-left">
                    <span className="ruler-label">Ruler:</span>
                    <span className="ruler-planet-name">{rulerPlanetLabel}</span>
                  </div>
                  <button
                    type="button"
                    className={`ruler-toggle-btn ${rulerPanelEnabled ? 'active' : ''}`}
                    onClick={() => setRulerPanelEnabled(!rulerPanelEnabled)}
                    title={rulerPanelEnabled ? 'Disable ruler' : 'Enable ruler'}
                  >
                    {rulerPanelEnabled ? 'ON' : 'OFF'}
                  </button>
                </div>

                {rulerPanelEnabled && (
                  <>
                    <div className="form-group">
                      <label>Sign:</label>
                      <CosmicDropdown
                        options={SIGNS}
                        value={rulerPlanetSign}
                        onChange={(val) => {
                          setRulerPlanetSign(val);
                          setRulerErrors(prev => ({ ...prev, rulerPlanetSign: '' }));
                        }}
                        placeholder={`Select ${rulerPlanetLabel}'s sign...`}
                        error={rulerErrors.rulerPlanetSign}
                      />
                    </div>

                    <div className="form-group">
                      <label>
                        Degree: <span className="optional">(optional)</span>
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="29"
                        value={rulerPlanetDegree}
                        onChange={e => {
                          setRulerPlanetDegree(e.target.value);
                          setRulerErrors(prev => ({ ...prev, rulerPlanetDegree: '' }));
                        }}
                        placeholder="0-29"
                        className={rulerErrors.rulerPlanetDegree ? 'has-error' : ''}
                      />
                      {rulerErrors.rulerPlanetDegree && <div className="validation-error show">{rulerErrors.rulerPlanetDegree}</div>}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="phsr-calculate-wrapper">
            <button type="button" onClick={handleRulerSubmit} className="calculate-btn">
              Calculate
            </button>
          </div>

          {rulerResult && (
            <div ref={rulerResultRef} className="result-section show">
              <h3>Ruler Placement Result</h3>

              {/* Main Planet Result */}
              <div className="result-subsection">
                <h4>{rulerResult.planet} in {rulerResult.sign}</h4>
                <div className="result-item">
                  <strong>House:</strong>{' '}
                  <span>
                    ({rulerResult.isHouse}) {rulerResult.isSign}
                  </span>
                </div>
                <div className="result-item">
                  <strong>Expressing Through:</strong> <span>{rulerResult.expressingSign}</span>
                </div>
                {rulerResult.hasDualBase && rulerResult.secondBaseSign ? (
                  <>
                    <div className="result-item">
                      <strong>Base 1:</strong>{' '}
                      <span>
                        ({rulerResult.baseHouse}) {rulerResult.baseSign} through {rulerResult.throughSign}
                      </span>
                    </div>
                    <div className="result-item">
                      <strong>Base 2:</strong>{' '}
                      <span>
                        ({rulerResult.secondBaseHouse}) {rulerResult.secondBaseSign} through{' '}
                        {rulerResult.secondThroughSign}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="result-item">
                    <strong>Base:</strong>{' '}
                    <span>
                      ({rulerResult.baseHouse}) {rulerResult.baseSign} through {rulerResult.throughSign}
                    </span>
                  </div>
                )}

                <div
                  className="interpretation"
                  dangerouslySetInnerHTML={{ __html: buildInterpretationFor(rulerResult) }}
                />

                {/* Cosmological Sentence */}
                <div
                  className="interpretation cosmological-sentence"
                  dangerouslySetInnerHTML={{ __html: buildCosmologicalSentenceFor(rulerResult) }}
                />

                <SentenceBuilder
                  planet={rulerResult.planet}
                  planetKeywords={planetKeywords[rulerResult.planet] || []}
                  baseSign={rulerResult.baseSign}
                  baseKeywords={signKeywords[rulerResult.baseSign] || []}
                  base2Sign={rulerResult.secondBaseSign}
                  base2Keywords={rulerResult.secondBaseSign ? signKeywords[rulerResult.secondBaseSign] || [] : []}
                  throughSign={rulerResult.throughSign}
                  throughKeywords={signKeywords[rulerResult.throughSign] || []}
                  through2Sign={rulerResult.secondThroughSign}
                  through2Keywords={
                    rulerResult.secondThroughSign ? signKeywords[rulerResult.secondThroughSign] || [] : []
                  }
                  isSign={rulerResult.isSign}
                  isSignKeywords={signKeywords[rulerResult.isSign] || []}
                  inputSign={rulerResult.sign}
                  inputSignKeywords={signKeywords[rulerResult.sign] || []}
                  hasDualBase={rulerResult.hasDualBase}
                />
              </div>

              {/* Ruler Planet Result */}
              {(rulerResult as TruePlacementResult & { rulerPlacement?: TruePlacementResult }).rulerPlacement && (() => {
                const rp = (rulerResult as TruePlacementResult & { rulerPlacement: TruePlacementResult }).rulerPlacement;
                return (
                  <div className="result-subsection ruler-result">
                    <h4>Ruler: {rulerPlanetLabel} in {rulerPlanetSign}</h4>
                    <div className="result-item">
                      <strong>House:</strong>{' '}
                      <span>({rp.isHouse}) {rp.isSign}</span>
                    </div>
                    <div className="result-item">
                      <strong>Expressing Through:</strong>{' '}
                      <span>{rp.expressingSign}</span>
                    </div>
                    {rp.hasDualBase ? (
                      <>
                        <div className="result-item">
                          <strong>Base 1:</strong>{' '}
                          <span>({rp.baseHouse}) {rp.baseSign} through {rp.throughSign}</span>
                        </div>
                        <div className="result-item">
                          <strong>Base 2:</strong>{' '}
                          <span>({rp.secondBaseHouse}) {rp.secondBaseSign} through {rp.secondThroughSign}</span>
                        </div>
                      </>
                    ) : (
                      <div className="result-item">
                        <strong>Base:</strong>{' '}
                        <span>({rp.baseHouse}) {rp.baseSign} through {rp.throughSign}</span>
                      </div>
                    )}

                    <div
                      className="interpretation"
                      dangerouslySetInnerHTML={{ __html: buildInterpretationFor(rp) }}
                    />

                    {/* Cosmological Sentence */}
                    <div
                      className="interpretation cosmological-sentence"
                      dangerouslySetInnerHTML={{ __html: buildCosmologicalSentenceFor(rp) }}
                    />

                    <SentenceBuilder
                      planet={rp.planet}
                      planetKeywords={planetKeywords[rp.planet] || []}
                      baseSign={rp.baseSign}
                      baseKeywords={signKeywords[rp.baseSign] || []}
                      base2Sign={rp.secondBaseSign}
                      base2Keywords={rp.secondBaseSign ? signKeywords[rp.secondBaseSign] || [] : []}
                      throughSign={rp.throughSign}
                      throughKeywords={signKeywords[rp.throughSign] || []}
                      through2Sign={rp.secondThroughSign}
                      through2Keywords={rp.secondThroughSign ? signKeywords[rp.secondThroughSign] || [] : []}
                      isSign={rp.isSign}
                      isSignKeywords={signKeywords[rp.isSign] || []}
                      inputSign={rp.sign}
                      inputSignKeywords={signKeywords[rp.sign] || []}
                      hasDualBase={rp.hasDualBase}
                    />
                  </div>
                );
              })()}
            </div>
          )}

          {rulerNotFound && (
            <div className="result-section show">
              <div className="error-message">
                No matching data found. Please check your inputs.
              </div>
            </div>
          )}
        </>
      )}

      {/* YoYo Calculator */}
      {activeSubTab === 'yoyo' && (
        <>
          <form onSubmit={handleYoyoSubmit} className="calculator-form" noValidate>
            <div className="form-group">
              <label>Planet:</label>
              <CosmicDropdown
                options={PLANETS}
                value={yoyoPlanet}
                onChange={(val) => {
                  setYoyoPlanet(val);
                  setYoyoErrors(prev => ({ ...prev, yoyoPlanet: '' }));
                  setYoyoSubmitted(false);
                }}
                placeholder="Select a planet..."
                error={yoyoErrors.yoyoPlanet}
              />
            </div>

            <div className="form-group">
              <label>House:</label>
              <CosmicDropdown
                options={HOUSES}
                value={yoyoHouse}
                onChange={(val) => {
                  setYoyoHouse(val);
                  setYoyoErrors(prev => ({ ...prev, yoyoHouse: '' }));
                  setYoyoSubmitted(false);
                }}
                placeholder="Select a house..."
                error={yoyoErrors.yoyoHouse}
              />
            </div>

            <div className="form-group">
              <label>Sign:</label>
              <CosmicDropdown
                options={SIGNS}
                value={yoyoSign}
                onChange={(val) => {
                  setYoyoSign(val);
                  setYoyoErrors(prev => ({ ...prev, yoyoSign: '' }));
                  setYoyoSubmitted(false);
                }}
                placeholder="Select a sign..."
                error={yoyoErrors.yoyoSign}
              />
            </div>

            <button type="submit" className="calculate-btn">
              Generate YoYo
            </button>
          </form>

          {yoyoSubmitted && yoyoPlanet && yoyoHouse && yoyoSign && (
            <div className="yoyo-results-wrapper">
              <div ref={yoyoResultRef} className="result-section show">
                <h3>YoYo Result</h3>
                <div className="yoyo-table">
                  {/* Top half */}
                  <div className="yoyo-row">
                    <div className="yoyo-label">Planet:</div>
                    <div className="yoyo-value">{getYoyoPlanetLabel()}</div>
                    <div className="yoyo-keyword">
                      <select
                        value={yoyoKeywords.planet1}
                        onChange={(e) => setYoyoKeywords(prev => ({ ...prev, planet1: e.target.value, planet2: e.target.value }))}
                        className="yoyo-select"
                      >
                        <option value="">Select keyword...</option>
                        {(planetKeywords[yoyoPlanet] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="yoyo-row">
                    <div className="yoyo-label">House:</div>
                    <div className="yoyo-value">{SIGN_TO_HOUSE[yoyoHouse]} {yoyoHouse}</div>
                    <div className="yoyo-keyword">
                      <select
                        value={yoyoKeywords.house1}
                        onChange={(e) => setYoyoKeywords(prev => ({ ...prev, house1: e.target.value, house2: e.target.value }))}
                        className="yoyo-select"
                      >
                        <option value="">Select keyword...</option>
                        {(signKeywords[yoyoHouse] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="yoyo-row">
                    <div className="yoyo-label">Sign:</div>
                    <div className="yoyo-value">{yoyoSign}</div>
                    <div className="yoyo-keyword">
                      <select
                        value={yoyoKeywords.sign1}
                        onChange={(e) => setYoyoKeywords(prev => ({ ...prev, sign1: e.target.value, sign2: e.target.value }))}
                        className="yoyo-select"
                      >
                        <option value="">Select keyword...</option>
                        {(signKeywords[yoyoSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="yoyo-divider"></div>

                  {/* Bottom half (mirrored) */}
                  <div className="yoyo-row">
                    <div className="yoyo-label">Sign:</div>
                    <div className="yoyo-value">{yoyoSign}</div>
                    <div className="yoyo-keyword">
                      <select
                        value={yoyoKeywords.sign2}
                        onChange={(e) => setYoyoKeywords(prev => ({ ...prev, sign2: e.target.value }))}
                        className="yoyo-select"
                      >
                        <option value="">Select keyword...</option>
                        {(signKeywords[yoyoSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="yoyo-row">
                    <div className="yoyo-label">House:</div>
                    <div className="yoyo-value">{SIGN_TO_HOUSE[yoyoHouse]} {yoyoHouse}</div>
                    <div className="yoyo-keyword">
                      <select
                        value={yoyoKeywords.house2}
                        onChange={(e) => setYoyoKeywords(prev => ({ ...prev, house2: e.target.value }))}
                        className="yoyo-select"
                      >
                        <option value="">Select keyword...</option>
                        {(signKeywords[yoyoHouse] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="yoyo-row">
                    <div className="yoyo-label">Planet:</div>
                    <div className="yoyo-value">{getYoyoPlanetLabel()}</div>
                    <div className="yoyo-keyword">
                      <select
                        value={yoyoKeywords.planet2}
                        onChange={(e) => setYoyoKeywords(prev => ({ ...prev, planet2: e.target.value }))}
                        className="yoyo-select"
                      >
                        <option value="">Select keyword...</option>
                        {(planetKeywords[yoyoPlanet] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example Section */}
              <div className="yoyo-example">
                <div className="yoyo-example-header">Example: Moon in 7th house Aquarius</div>
                <div className="yoyo-example-rows">
                  <div className="yoyo-example-row">
                    <span className="yoyo-example-label">Moon:</span>
                    <span className="yoyo-example-text">"my family's"</span>
                  </div>
                  <div className="yoyo-example-row">
                    <span className="yoyo-example-label">7th house:</span>
                    <span className="yoyo-example-text">"sense of design"</span>
                  </div>
                  <div className="yoyo-example-row">
                    <span className="yoyo-example-label">Aquarius:</span>
                    <span className="yoyo-example-text">"is detached"</span>
                  </div>
                  <div className="yoyo-example-divider"></div>
                  <div className="yoyo-example-row">
                    <span className="yoyo-example-label">Aquarius:</span>
                    <span className="yoyo-example-text">"and that detachment"</span>
                  </div>
                  <div className="yoyo-example-row">
                    <span className="yoyo-example-label">7th house:</span>
                    <span className="yoyo-example-text">"by design"</span>
                  </div>
                  <div className="yoyo-example-row">
                    <span className="yoyo-example-label">Moon:</span>
                    <span className="yoyo-example-text">"because of my family"</span>
                  </div>
                </div>
                <div className="yoyo-example-sentence">
                  <strong>Result:</strong> "My family's sense of design is detached, and that detachment by design because of my family."
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* PHS Calculator */}
      {activeSubTab === 'phs' && (
        <>
          <form onSubmit={handlePhsSubmit} className="calculator-form" noValidate>
            <div className="form-group">
              <label>Planet:</label>
              <CosmicDropdown
                options={PLANETS}
                value={phsPlanet}
                onChange={(val) => {
                  setPhsPlanet(val);
                  setPhsErrors(prev => ({ ...prev, phsPlanet: '' }));
                }}
                placeholder="Select a planet..."
                error={phsErrors.phsPlanet}
              />
            </div>

            <div className="form-group">
              <label>Sign:</label>
              <CosmicDropdown
                options={SIGNS}
                value={phsSign}
                onChange={(val) => {
                  setPhsSign(val);
                  setPhsErrors(prev => ({ ...prev, phsSign: '' }));
                }}
                placeholder="Select a sign..."
                error={phsErrors.phsSign}
              />
            </div>

            <div className="form-group">
              <label>Rising:</label>
              <CosmicDropdown
                options={SIGNS}
                value={phsRising}
                onChange={(val) => {
                  setPhsRising(val);
                  setPhsErrors(prev => ({ ...prev, phsRising: '' }));
                }}
                placeholder="Select rising sign..."
                error={phsErrors.phsRising}
              />
            </div>

            <button type="submit" className="calculate-btn">
              Calculate
            </button>
          </form>

          {phsResult && (
            <div ref={phsResultRef} className="result-section show">
              {/* Calculation Results */}
              <div className="phs-results-row">
                <div className="phs-result-box">
                  <div className="phs-result-item">
                    <span className="phs-result-label">Planet:</span>
                    <span className="phs-result-value">{getPhsPlanetLabel()}</span>
                  </div>
                  <div className="phs-result-item">
                    <span className="phs-result-label">House:</span>
                    <span className="phs-result-value">{phsResult.isHouse}</span>
                    <span className="phs-result-extra">{phsResult.isSign}</span>
                  </div>
                </div>

                <div className="phs-summary-box">
                  <div className="phs-summary-item">
                    <span className="phs-summary-label">PLANET:</span>
                    <span className="phs-summary-value">{getPhsPlanetLabel()}</span>
                  </div>
                  <div className="phs-summary-item">
                    <span className="phs-summary-label">HOUSE:</span>
                    <span className="phs-summary-value">{phsResult.isHouse}</span>
                  </div>
                  <div className="phs-summary-item">
                    <span className="phs-summary-label">SIGN:</span>
                    <span className="phs-summary-value">{phsSign}</span>
                  </div>
                </div>
              </div>

              <h3 className="phsr-sentence-title">Make your sentence:</h3>

              {/* Live Sentence Preview */}
              <div className="phsr-sentence-preview">
                <span className={phsWords.planetWord ? 'word-filled' : 'word-empty'}>
                  {phsWords.planetWord || '[Planet]'}
                </span>
                {' '}
                <span className={phsWords.connector ? 'word-connector' : 'word-empty'}>
                  {phsWords.connector || 'expressed through'}
                </span>
                {' '}
                <span className={phsWords.houseWord ? 'word-filled' : 'word-empty'}>
                  {phsWords.houseWord || '[House]'}
                </span>
                {phsWords.signWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{phsWords.signWord}</span>
                  </>
                )}
              </div>

              {/* Step 1: Planet + Connector + House */}
              <div className="phsr-word-step">
                <div className="phsr-word-row three-col">
                  <div className="phsr-word-group">
                    <div className="phsr-word-label">PLANET:</div>
                    <div className="phsr-word-value">{getPhsPlanetLabel()}</div>
                    <select
                      value={phsWords.planetWord}
                      onChange={(e) => setPhsWords(prev => ({ ...prev, planetWord: e.target.value }))}
                      className="phsr-word-select"
                    >
                      <option value="">Select word...</option>
                      {(planetKeywords[phsPlanet] || []).map((kw, idx) => (
                        <option key={idx} value={kw}>{kw}</option>
                      ))}
                    </select>
                  </div>
                  <div className="phsr-word-group connector-group">
                    <div className="phsr-word-label">CONNECTOR:</div>
                    <select
                      value={phsWords.connector}
                      onChange={(e) => setPhsWords(prev => ({ ...prev, connector: e.target.value }))}
                      className="phsr-word-select connector-select"
                    >
                      <option value="">Select...</option>
                      {CONNECTOR_OPTIONS.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="phsr-word-group">
                    <div className="phsr-word-label">HOUSE:</div>
                    <div className="phsr-word-value">{phsResult.isSign}</div>
                    <select
                      value={phsWords.houseWord}
                      onChange={(e) => setPhsWords(prev => ({ ...prev, houseWord: e.target.value }))}
                      className="phsr-word-select"
                    >
                      <option value="">Select word...</option>
                      {(signKeywords[phsResult.isSign] || []).map((kw, idx) => (
                        <option key={idx} value={kw}>{kw}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Sign (unlocks after Planet + Connector + House selected) */}
              {phsWords.planetWord && phsWords.connector && phsWords.houseWord && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">Sign:</div>
                      <div className="phsr-word-value">{phsSign}</div>
                      <select
                        value={phsWords.signWord}
                        onChange={(e) => setPhsWords(prev => ({ ...prev, signWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[phsSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="phsr-description-hint">
                    <strong>(end of sentence)</strong>
                  </div>
                </div>
              )}

              {/* Bottom Sentence Preview */}
              <div className="phsr-sentence-preview bottom">
                <span className={phsWords.planetWord ? 'word-filled' : 'word-empty'}>
                  {phsWords.planetWord || '[Planet]'}
                </span>
                {' '}
                <span className={phsWords.connector ? 'word-connector' : 'word-empty'}>
                  {phsWords.connector || 'expressed through'}
                </span>
                {' '}
                <span className={phsWords.houseWord ? 'word-filled' : 'word-empty'}>
                  {phsWords.houseWord || '[House]'}
                </span>
                {phsWords.signWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{phsWords.signWord}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {phsNotFound && (
            <div className="result-section show">
              <div className="error-message">
                No matching data found. Please check your inputs.
              </div>
            </div>
          )}
        </>
      )}

      {/* PHSR Calculator */}
      {activeSubTab === 'phsr' && (
        <>
          <div className="phsr-inputs">
            {/* Left Input Panel */}
            <div className="phsr-input-panel">
              <form onSubmit={handlePhsrSubmit} className="calculator-form" noValidate>
                <div className="form-group">
                  <label>Planet:</label>
                  <CosmicDropdown
                    options={PLANETS}
                    value={phsrPlanet}
                    onChange={(val) => {
                      setPhsrPlanet(val);
                      setPhsrErrors(prev => ({ ...prev, phsrPlanet: '' }));
                    }}
                    placeholder="Select a planet..."
                    error={phsrErrors.phsrPlanet}
                  />
                </div>

                <div className="form-group">
                  <label>Sign:</label>
                  <CosmicDropdown
                    options={SIGNS}
                    value={phsrSign}
                    onChange={(val) => {
                      setPhsrSign(val);
                      setPhsrErrors(prev => ({ ...prev, phsrSign: '' }));
                    }}
                    placeholder="Select a sign..."
                    error={phsrErrors.phsrSign}
                  />
                </div>

                <div className="form-group">
                  <label>Rising:</label>
                  <CosmicDropdown
                    options={SIGNS}
                    value={phsrRising}
                    onChange={(val) => {
                      setPhsrRising(val);
                      setPhsrErrors(prev => ({ ...prev, phsrRising: '' }));
                    }}
                    placeholder="Select rising sign..."
                    error={phsrErrors.phsrRising}
                  />
                </div>
              </form>
            </div>

            {/* Ruler Input Panel */}
            {phsrSign && (
              <div className="phsr-ruler-panel">
                <div className="phsr-ruler-header">
                  <span className="ruler-label">Ruler:</span>
                  <span className="ruler-planet-name">{phsrRulerLabel}</span>
                </div>

                <div className="form-group">
                  <label>Sign:</label>
                  <CosmicDropdown
                    options={SIGNS}
                    value={phsrRulerSign}
                    onChange={(val) => {
                      setPhsrRulerSign(val);
                      setPhsrErrors(prev => ({ ...prev, phsrRulerSign: '' }));
                    }}
                    placeholder={`Select ${phsrRulerLabel}'s sign...`}
                    error={phsrErrors.phsrRulerSign}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="phsr-calculate-wrapper">
            <button type="button" onClick={handlePhsrSubmit} className="calculate-btn">
              Calculate
            </button>
          </div>

          {phsrResult && (
            <div ref={phsrResultRef} className="result-section show">
              <h3 className="phsr-sentence-title">Make your sentence:</h3>

              {/* Live Sentence Preview */}
              <div className="phsr-sentence-preview">
                <span className={phsrWords.planetWord ? 'word-filled' : 'word-empty'}>
                  {phsrWords.planetWord || '[Planet]'}
                </span>
                {' '}
                <span className={phsrWords.connector1 ? 'word-connector' : 'word-empty'}>
                  {phsrWords.connector1 || '[connector]'}
                </span>
                {' '}
                <span className={phsrWords.houseWord ? 'word-filled' : 'word-empty'}>
                  {phsrWords.houseWord || '[House]'}
                </span>
                {phsrWords.signWord && (
                  <>
                    {' '}
                    <span className="word-label">, expressed through</span>
                    {' '}
                    <span className="word-filled">{phsrWords.signWord}</span>
                  </>
                )}
                {phsrWords.rulerWord && (
                  <>
                    {' '}
                    <span className="word-label">going into</span>
                    {' '}
                    <span className="word-filled">{phsrWords.rulerWord}</span>
                  </>
                )}
                {phsrWords.rulerHouseWord && (
                  <>
                    {' '}
                    <span className={phsrWords.connector2 ? 'word-connector' : 'word-empty'}>
                      {phsrWords.connector2 || '[connector]'}
                    </span>
                    {' '}
                    <span className="word-filled">{phsrWords.rulerHouseWord}</span>
                  </>
                )}
                {phsrWords.rulerSignWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{phsrWords.rulerSignWord}</span>
                  </>
                )}
              </div>

              {/* Step 1: Planet + Connector + House */}
              <div className="phsr-word-step">
                <div className="phsr-word-row three-col">
                  <div className="phsr-word-group">
                    <div className="phsr-word-label">PLANET:</div>
                    <div className="phsr-word-value">{getPhsrPlanetLabel()}</div>
                    <select
                      value={phsrWords.planetWord}
                      onChange={(e) => setPhsrWords(prev => ({ ...prev, planetWord: e.target.value }))}
                      className="phsr-word-select"
                    >
                      <option value="">Select word...</option>
                      {(planetKeywords[phsrPlanet] || []).map((kw, idx) => (
                        <option key={idx} value={kw}>{kw}</option>
                      ))}
                    </select>
                  </div>
                  <div className="phsr-word-group connector-group">
                    <div className="phsr-word-label">CONNECTOR:</div>
                    <select
                      value={phsrWords.connector1}
                      onChange={(e) => setPhsrWords(prev => ({ ...prev, connector1: e.target.value }))}
                      className="phsr-word-select connector-select"
                    >
                      <option value="">Select...</option>
                      {CONNECTOR_OPTIONS.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="phsr-word-group">
                    <div className="phsr-word-label">HOUSE:</div>
                    <div className="phsr-word-value">{phsrResult.isSign}</div>
                    <select
                      value={phsrWords.houseWord}
                      onChange={(e) => setPhsrWords(prev => ({ ...prev, houseWord: e.target.value }))}
                      className="phsr-word-select"
                    >
                      <option value="">Select word...</option>
                      {(signKeywords[phsrResult.isSign] || []).map((kw, idx) => (
                        <option key={idx} value={kw}>{kw}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Sign (unlocks after Planet + Connector + House selected) */}
              {phsrWords.planetWord && phsrWords.connector1 && phsrWords.houseWord && (
                <div className="phsr-word-step">
                  <div className="phsr-description-hint">
                    <strong>, expressed through</strong> (connects to Ruler)
                  </div>
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">Sign:</div>
                      <div className="phsr-word-value">{phsrSign}</div>
                      <select
                        value={phsrWords.signWord}
                        onChange={(e) => setPhsrWords(prev => ({ ...prev, signWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[phsrSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Ruler + House (unlocks after Sign selected) */}
              {phsrWords.signWord && phsrRulerResult && (
                <div className="phsr-word-step ruler-step">
                  <div className="phsr-description-hint">
                    <strong>going into</strong>
                  </div>
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row three-col">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">Ruler:</div>
                      <div className="phsr-word-value">{phsrRulerLabel}</div>
                      <select
                        value={phsrWords.rulerWord}
                        onChange={(e) => setPhsrWords(prev => ({ ...prev, rulerWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(planetKeywords[phsrDerivedRuler] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                    <div className="phsr-word-group connector-group connector-blue">
                      <div className="phsr-word-label">CONNECTOR:</div>
                      <select
                        value={phsrWords.connector2}
                        onChange={(e) => setPhsrWords(prev => ({ ...prev, connector2: e.target.value }))}
                        className="phsr-word-select connector-select connector-select-blue"
                      >
                        <option value="">Select...</option>
                        {CONNECTOR_OPTIONS.map((opt, idx) => (
                          <option key={idx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">HOUSE:</div>
                      <div className="phsr-word-value">{phsrRulerResult.isSign}</div>
                      <select
                        value={phsrWords.rulerHouseWord}
                        onChange={(e) => setPhsrWords(prev => ({ ...prev, rulerHouseWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[phsrRulerResult.isSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Ruler Sign (unlocks after Ruler + Connector + House selected) */}
              {phsrWords.rulerWord && phsrWords.connector2 && phsrWords.rulerHouseWord && phsrRulerResult && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">Sign:</div>
                      <div className="phsr-word-value">{phsrRulerSign}</div>
                      <select
                        value={phsrWords.rulerSignWord}
                        onChange={(e) => setPhsrWords(prev => ({ ...prev, rulerSignWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[phsrRulerSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="phsr-description-hint">
                    <strong>(end of sentence)</strong>
                  </div>
                </div>
              )}

              {/* Bottom Sentence Preview */}
              <div className="phsr-sentence-preview bottom">
                <span className={phsrWords.planetWord ? 'word-filled' : 'word-empty'}>
                  {phsrWords.planetWord || '[Planet]'}
                </span>
                {' '}
                <span className={phsrWords.connector1 ? 'word-connector' : 'word-empty'}>
                  {phsrWords.connector1 || '[connector]'}
                </span>
                {' '}
                <span className={phsrWords.houseWord ? 'word-filled' : 'word-empty'}>
                  {phsrWords.houseWord || '[House]'}
                </span>
                {phsrWords.signWord && (
                  <>
                    {' '}
                    <span className="word-label">, expressed through</span>
                    {' '}
                    <span className="word-filled">{phsrWords.signWord}</span>
                  </>
                )}
                {phsrWords.rulerWord && (
                  <>
                    {' '}
                    <span className="word-label">going into</span>
                    {' '}
                    <span className="word-filled">{phsrWords.rulerWord}</span>
                  </>
                )}
                {phsrWords.rulerHouseWord && (
                  <>
                    {' '}
                    <span className={phsrWords.connector2 ? 'word-connector' : 'word-empty'}>
                      {phsrWords.connector2 || '[connector]'}
                    </span>
                    {' '}
                    <span className="word-filled">{phsrWords.rulerHouseWord}</span>
                  </>
                )}
                {phsrWords.rulerSignWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{phsrWords.rulerSignWord}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {phsrNotFound && (
            <div className="result-section show">
              <div className="error-message">
                No matching data found. Please check your inputs.
              </div>
            </div>
          )}
        </>
      )}


      {/* Mix & Match Calculator */}
      {activeSubTab === 'mixmatch' && (
        <>
          <div className="phsr-inputs">
            {/* Left Input Panel */}
            <div className="phsr-input-panel">
              <form onSubmit={handleMixSubmit} className="calculator-form" noValidate>
                <div className="form-group">
                  <label>Planet:</label>
                  <CosmicDropdown
                    options={PLANETS}
                    value={mixPlanet}
                    onChange={(val) => {
                      setMixPlanet(val);
                      setMixErrors(prev => ({ ...prev, mixPlanet: '' }));
                    }}
                    placeholder="Select a planet..."
                    error={mixErrors.mixPlanet}
                  />
                </div>

                <div className="form-group">
                  <label>Sign:</label>
                  <CosmicDropdown
                    options={SIGNS}
                    value={mixSign}
                    onChange={(val) => {
                      setMixSign(val);
                      setMixErrors(prev => ({ ...prev, mixSign: '' }));
                    }}
                    placeholder="Select a sign..."
                    error={mixErrors.mixSign}
                  />
                </div>

                <div className="form-group">
                  <label>Rising:</label>
                  <CosmicDropdown
                    options={SIGNS}
                    value={mixRising}
                    onChange={(val) => {
                      setMixRising(val);
                      setMixErrors(prev => ({ ...prev, mixRising: '' }));
                    }}
                    placeholder="Select rising sign..."
                    error={mixErrors.mixRising}
                  />
                </div>
              </form>
            </div>

            {/* Ruler Input Panel */}
            {mixSign && (
              <div className="phsr-ruler-panel">
                <div className="phsr-ruler-header">
                  <span className="ruler-label">Ruler:</span>
                  <span className="ruler-planet-name">{mixRulerLabel}</span>
                </div>

                <div className="form-group">
                  <label>Sign:</label>
                  <CosmicDropdown
                    options={SIGNS}
                    value={mixRulerSign}
                    onChange={(val) => {
                      setMixRulerSign(val);
                      setMixErrors(prev => ({ ...prev, mixRulerSign: '' }));
                    }}
                    placeholder={`Select ${mixRulerLabel}'s sign...`}
                    error={mixErrors.mixRulerSign}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="phsr-calculate-wrapper">
            <button type="button" onClick={handleMixSubmit} className="calculate-btn">
              Calculate
            </button>
          </div>

          {mixResult && (
            <div ref={mixResultRef} className="result-section show">
              <h3>Mix & Match Result</h3>

              <div className="phs-results-row">
                <div className="phs-result-box">
                  <div className="phs-result-item">
                    <span className="phs-result-label">Planet:</span>
                    <span className="phs-result-value">{getMixPlanetLabel()}</span>
                  </div>
                  <div className="phs-result-item">
                    <span className="phs-result-label">House:</span>
                    <span className="phs-result-value">{mixResult.isHouse}</span>
                    <span className="phs-result-extra">{mixResult.isSign}</span>
                  </div>
                </div>

                <div className="phs-summary-box">
                  <div className="phs-summary-item">
                    <span className="phs-summary-label">PLANET:</span>
                    <span className="phs-summary-value">{getMixPlanetLabel()}</span>
                  </div>
                  <div className="phs-summary-item">
                    <span className="phs-summary-label">HOUSE:</span>
                    <span className="phs-summary-value">{mixResult.isHouse}</span>
                  </div>
                  <div className="phs-summary-item">
                    <span className="phs-summary-label">SIGN:</span>
                    <span className="phs-summary-value">{mixSign}</span>
                  </div>
                </div>
              </div>

              <h3 className="phsr-sentence-title">Make your sentence:</h3>

              {/* Live Sentence Preview */}
              <div className="phsr-sentence-preview">
                <span className={mixWords.planetWord ? 'word-filled' : 'word-empty'}>
                  {mixWords.planetWord || '[Planet]'}
                </span>
                {' '}
                <span className={mixWords.connector1 ? 'word-connector' : 'word-empty'}>
                  {mixWords.connector1 || '[connector]'}
                </span>
                {' '}
                <span className={mixWords.houseWord ? 'word-filled' : 'word-empty'}>
                  {mixWords.houseWord || '[House]'}
                </span>
                {mixWords.biRulerWord && (
                  <>
                    {' '}
                    <span className="word-filled">{mixWords.biRulerWord}</span>
                  </>
                )}
                {mixWords.biRuler2Word && (
                  <>
                    {' '}
                    <span className="word-filled">{mixWords.biRuler2Word}</span>
                  </>
                )}
                {mixWords.signWord && (
                  <>
                    {' '}
                    <span className="word-label">, expressed through</span>
                    {' '}
                    <span className="word-filled">{mixWords.signWord}</span>
                  </>
                )}
                {mixWords.rulerWord && (
                  <>
                    {' '}
                    <span className="word-label">going into</span>
                    {' '}
                    <span className="word-filled">{mixWords.rulerWord}</span>
                  </>
                )}
                {mixWords.rulerHouseWord && (
                  <>
                    {' '}
                    <span className={mixWords.connector2 ? 'word-connector' : 'word-empty'}>
                      {mixWords.connector2 || '[connector]'}
                    </span>
                    {' '}
                    <span className="word-filled">{mixWords.rulerHouseWord}</span>
                  </>
                )}
                {mixWords.rulerSignWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{mixWords.rulerSignWord}</span>
                  </>
                )}
              </div>

              {/* Step 1: Planet + Connector + House */}
              <div className="phsr-word-step">
                <div className="phsr-word-row three-col">
                  <div className="phsr-word-group">
                    <div className="phsr-word-label">PLANET:</div>
                    <div className="phsr-word-value">{getMixPlanetLabel()}</div>
                    <select
                      value={mixWords.planetWord}
                      onChange={(e) => setMixWords(prev => ({ ...prev, planetWord: e.target.value }))}
                      className="phsr-word-select"
                    >
                      <option value="">Select word...</option>
                      {(planetKeywords[mixPlanet] || []).map((kw, idx) => (
                        <option key={idx} value={kw}>{kw}</option>
                      ))}
                    </select>
                  </div>
                  <div className="phsr-word-group connector-group">
                    <div className="phsr-word-label">CONNECTOR:</div>
                    <select
                      value={mixWords.connector1}
                      onChange={(e) => setMixWords(prev => ({ ...prev, connector1: e.target.value }))}
                      className="phsr-word-select connector-select"
                    >
                      <option value="">Select...</option>
                      {CONNECTOR_OPTIONS.map((opt, idx) => (
                        <option key={idx} value={opt}>{opt}</option>
                      ))}
                    </select>
                  </div>
                  <div className="phsr-word-group">
                    <div className="phsr-word-label">HOUSE:</div>
                    <div className="phsr-word-value">{mixResult.isSign}</div>
                    <select
                      value={mixWords.houseWord}
                      onChange={(e) => setMixWords(prev => ({ ...prev, houseWord: e.target.value }))}
                      className="phsr-word-select"
                    >
                      <option value="">Select word...</option>
                      {(signKeywords[mixResult.isSign] || []).map((kw, idx) => (
                        <option key={idx} value={kw}>{kw}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: Bi-Ruler + 2nd Bi-Ruler (unlocks after Planet + Connector + House) */}
              {mixWords.planetWord && mixWords.connector1 && mixWords.houseWord && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">Bi-Ruler:</div>
                      <div className="phsr-word-value">Who knows</div>
                      <select
                        value={mixWords.biRulerWord}
                        onChange={(e) => setMixWords(prev => ({ ...prev, biRulerWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        <option value="(placeholder)">(placeholder)</option>
                      </select>
                    </div>
                    <span className="phsr-word-plus">+</span>
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">2nd Bi-Ruler:</div>
                      <div className="phsr-word-value">Who knows</div>
                      <select
                        value={mixWords.biRuler2Word}
                        onChange={(e) => setMixWords(prev => ({ ...prev, biRuler2Word: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        <option value="(placeholder)">(placeholder)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Sign (unlocks after Bi-Rulers) */}
              {mixWords.biRulerWord && mixWords.biRuler2Word && (
                <div className="phsr-word-step">
                  <div className="phsr-description-hint">
                    <strong>, expressed through</strong> (connects to Ruler)
                  </div>
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">Sign:</div>
                      <div className="phsr-word-value">{mixSign}</div>
                      <select
                        value={mixWords.signWord}
                        onChange={(e) => setMixWords(prev => ({ ...prev, signWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[mixSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Ruler + Connector + House (unlocks after Sign selected) */}
              {mixWords.signWord && mixRulerResult && (
                <div className="phsr-word-step ruler-step">
                  <div className="phsr-description-hint">
                    <strong>going into</strong>
                  </div>
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row three-col">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">Ruler:</div>
                      <div className="phsr-word-value">{mixRulerLabel}</div>
                      <select
                        value={mixWords.rulerWord}
                        onChange={(e) => setMixWords(prev => ({ ...prev, rulerWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(planetKeywords[mixDerivedRuler] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                    <div className="phsr-word-group connector-group connector-blue">
                      <div className="phsr-word-label">CONNECTOR:</div>
                      <select
                        value={mixWords.connector2}
                        onChange={(e) => setMixWords(prev => ({ ...prev, connector2: e.target.value }))}
                        className="phsr-word-select connector-select connector-select-blue"
                      >
                        <option value="">Select...</option>
                        {CONNECTOR_OPTIONS.map((opt, idx) => (
                          <option key={idx} value={opt}>{opt}</option>
                        ))}
                      </select>
                    </div>
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">HOUSE:</div>
                      <div className="phsr-word-value">{mixRulerResult.isSign}</div>
                      <select
                        value={mixWords.rulerHouseWord}
                        onChange={(e) => setMixWords(prev => ({ ...prev, rulerHouseWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[mixRulerResult.isSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Ruler Sign (unlocks after Ruler + Connector + House selected) */}
              {mixWords.rulerWord && mixWords.connector2 && mixWords.rulerHouseWord && mixRulerResult && (
                <div className="phsr-word-step">
                  <div className="phsr-description-hint">
                    <strong>expressed through</strong>
                  </div>
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">Sign:</div>
                      <div className="phsr-word-value">{mixRulerSign}</div>
                      <select
                        value={mixWords.rulerSignWord}
                        onChange={(e) => setMixWords(prev => ({ ...prev, rulerSignWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[mixRulerSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Bottom Sentence Preview */}
              <div className="phsr-sentence-preview bottom">
                <span className={mixWords.planetWord ? 'word-filled' : 'word-empty'}>
                  {mixWords.planetWord || '[Planet]'}
                </span>
                {' '}
                <span className={mixWords.connector1 ? 'word-connector' : 'word-empty'}>
                  {mixWords.connector1 || '[connector]'}
                </span>
                {' '}
                <span className={mixWords.houseWord ? 'word-filled' : 'word-empty'}>
                  {mixWords.houseWord || '[House]'}
                </span>
                {mixWords.biRulerWord && (
                  <>
                    {' '}
                    <span className="word-filled">{mixWords.biRulerWord}</span>
                  </>
                )}
                {mixWords.biRuler2Word && (
                  <>
                    {' '}
                    <span className="word-filled">{mixWords.biRuler2Word}</span>
                  </>
                )}
                {mixWords.signWord && (
                  <>
                    {' '}
                    <span className="word-label">, expressed through</span>
                    {' '}
                    <span className="word-filled">{mixWords.signWord}</span>
                  </>
                )}
                {mixWords.rulerWord && (
                  <>
                    {' '}
                    <span className="word-label">going into</span>
                    {' '}
                    <span className="word-filled">{mixWords.rulerWord}</span>
                  </>
                )}
                {mixWords.rulerHouseWord && (
                  <>
                    {' '}
                    <span className={mixWords.connector2 ? 'word-connector' : 'word-empty'}>
                      {mixWords.connector2 || '[connector]'}
                    </span>
                    {' '}
                    <span className="word-filled">{mixWords.rulerHouseWord}</span>
                  </>
                )}
                {mixWords.rulerSignWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{mixWords.rulerSignWord}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {mixNotFound && (
            <div className="result-section show">
              <div className="error-message">
                No matching data found. Please check your inputs.
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
