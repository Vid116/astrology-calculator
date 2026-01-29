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

type SubTab = 'basic' | 'ruler' | 'yoyo' | 'phs' | 'phsr' | 'bphdds' | 'bphddsr';

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
  const [phsrDegree, setPhsrDegree] = useState('');
  const [phsrRulerSign, setPhsrRulerSign] = useState('');
  const [phsrRulerDegree, setPhsrRulerDegree] = useState('');
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
  const [phsDegree, setPhsDegree] = useState('');
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

  // BPHDDS calculator state
  const [bphddsPlanet, setBphddsPlanet] = useState('');
  const [bphddsSign, setBphddsSign] = useState('');
  const [bphddsRising, setBphddsRising] = useState('');
  const [bphddsDegree, setBphddsDegree] = useState('');
  const [bphddsResult, setBphddsResult] = useState<TruePlacementResult | null>(null);
  const [bphddsNotFound, setBphddsNotFound] = useState(false);
  const [bphddsErrors, setBphddsErrors] = useState<Record<string, string>>({});
  const bphddsResultRef = useRef<HTMLDivElement>(null);

  // BPHDDS word selection state
  const [bphddsWords, setBphddsWords] = useState({
    baseWord: '',
    planetWord: '',
    connector1: '',
    houseWord: '',
    connector2: '',
    decanWord: '',
    degreeWord: '',
    signWord: '',
  });

  // BPHDDSR calculator state
  const [bphddsrPlanet, setBphddsrPlanet] = useState('');
  const [bphddsrSign, setBphddsrSign] = useState('');
  const [bphddsrRising, setBphddsrRising] = useState('');
  const [bphddsrDegree, setBphddsrDegree] = useState('');
  const [bphddsrRulerSign, setBphddsrRulerSign] = useState('');
  const [bphddsrRulerDegree, setBphddsrRulerDegree] = useState('');
  const [bphddsrResult, setBphddsrResult] = useState<TruePlacementResult | null>(null);
  const [bphddsrRulerResult, setBphddsrRulerResult] = useState<TruePlacementResult | null>(null);
  const [bphddsrNotFound, setBphddsrNotFound] = useState(false);
  const [bphddsrErrors, setBphddsrErrors] = useState<Record<string, string>>({});
  const bphddsrResultRef = useRef<HTMLDivElement>(null);

  // BPHDDSR word selection state
  const [bphddsrWords, setBphddsrWords] = useState({
    baseWord: '',
    planetWord: '',
    connector1: '',
    houseWord: '',
    connector2: '',
    decanWord: '',
    degreeWord: '',
    signWord: '',
    rulerWord: '',
    rulerHouseWord: '',
    connector3: '',
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

  // Get the ruler planet based on the selected sign (for BPHDDSR tab)
  const bphddsrDerivedRuler = bphddsrSign ? SIGN_RULERS[bphddsrSign] : '';
  const bphddsrRulerLabel = bphddsrDerivedRuler
    ? PLANETS.find(p => p.value === bphddsrDerivedRuler)?.label || ''
    : '';

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
    if (!rulerPlanetSign) newErrors.rulerPlanetSign = 'Please select the ruler planet sign';

    if (rulerDegree) {
      const degreeNum = parseInt(rulerDegree);
      if (isNaN(degreeNum) || degreeNum < 0 || degreeNum > 29) {
        newErrors.rulerDegree = 'Degree must be between 0 and 29';
      }
    }

    if (rulerPlanetDegree) {
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

    // Calculate the ruler planet placement
    const rulerPlacementResult = calculateTruePlacement(
      derivedRulerPlanet,
      rulerPlanetSign,
      rulerRising,
      rulerPlanetDegree || null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    if (mainResult && rulerPlacementResult) {
      // Combine results - add ruler info to main result
      const combinedResult = {
        ...mainResult,
        rulerPlanet: rulerPlanetLabel,
        rulerPlanetSign: rulerPlanetSign,
        rulerPlanetDegree: rulerPlanetDegree || null,
        rulerPlacement: rulerPlacementResult,
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
      ? `, with <strong>${res.spark.spark}</strong> spark in <strong>${res.spark.decan}</strong> decan,`
      : ',';

    if (res.hasDualBase && res.secondBaseSign && res.secondThroughSign) {
      return `<strong>${res.planet}</strong> in <strong>${res.sign}</strong>${sparkPart} expressed through <strong>${res.expressingSign}</strong> with <strong>${res.baseSign}</strong> and <strong>${res.secondBaseSign}</strong> base (through <strong>${res.throughSign}</strong> and <strong>${res.secondThroughSign}</strong>).`;
    }

    return `<strong>${res.planet}</strong> in <strong>${res.sign}</strong>${sparkPart} expressed through <strong>${res.expressingSign}</strong> with <strong>${res.baseSign}</strong> base (through <strong>${res.throughSign}</strong>).`;
  };

  const buildInterpretation = () => buildInterpretationFor(result);

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

    if (phsDegree) {
      const degreeNum = parseInt(phsDegree);
      if (isNaN(degreeNum) || degreeNum < 0 || degreeNum > 29) {
        newErrors.phsDegree = 'Degree must be between 0 and 29';
      }
    }

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
      phsDegree || null,
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

    if (phsrDegree) {
      const degreeNum = parseInt(phsrDegree);
      if (isNaN(degreeNum) || degreeNum < 0 || degreeNum > 29) {
        newErrors.phsrDegree = 'Degree must be between 0 and 29';
      }
    }

    if (phsrRulerDegree) {
      const degreeNum = parseInt(phsrRulerDegree);
      if (isNaN(degreeNum) || degreeNum < 0 || degreeNum > 29) {
        newErrors.phsrRulerDegree = 'Degree must be between 0 and 29';
      }
    }

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
      phsrDegree || null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    // Calculate the ruler planet placement
    const rulerPlacementResult = calculateTruePlacement(
      phsrDerivedRuler,
      phsrRulerSign,
      phsrRising,
      phsrRulerDegree || null,
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

  // BPHDDS calculator validation
  const validateBphdds = () => {
    const newErrors: Record<string, string> = {};

    if (!bphddsPlanet) newErrors.bphddsPlanet = 'Please select a planet';
    if (!bphddsSign) newErrors.bphddsSign = 'Please select a sign';
    if (!bphddsRising) newErrors.bphddsRising = 'Please select a rising sign';

    if (bphddsDegree) {
      const degreeNum = parseInt(bphddsDegree);
      if (isNaN(degreeNum) || degreeNum < 0 || degreeNum > 29) {
        newErrors.bphddsDegree = 'Degree must be between 0 and 29';
      }
    }

    setBphddsErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // BPHDDS calculator submit
  const handleBphddsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBphdds()) return;

    // Track calculation usage
    if (onCalculate) {
      const allowed = await onCalculate();
      if (!allowed) return;
    }

    // Calculate the planet placement
    const result = calculateTruePlacement(
      bphddsPlanet,
      bphddsSign,
      bphddsRising,
      bphddsDegree || null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    if (result) {
      setBphddsResult(result);
      setBphddsNotFound(false);
      // Reset words for new calculation
      setBphddsWords({
        baseWord: '',
        planetWord: '',
        connector1: '',
        houseWord: '',
        connector2: '',
        decanWord: '',
        degreeWord: '',
        signWord: '',
      });
    } else {
      setBphddsResult(null);
      setBphddsNotFound(true);
    }

    requestAnimationFrame(() => {
      bphddsResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  // Get planet label for BPHDDS
  const getBphddsPlanetLabel = () => {
    return PLANETS.find(p => p.value === bphddsPlanet)?.label || bphddsPlanet;
  };

  // BPHDDSR calculator validation
  const validateBphddsr = () => {
    const newErrors: Record<string, string> = {};

    if (!bphddsrPlanet) newErrors.bphddsrPlanet = 'Please select a planet';
    if (!bphddsrSign) newErrors.bphddsrSign = 'Please select a sign';
    if (!bphddsrRising) newErrors.bphddsrRising = 'Please select a rising sign';
    if (!bphddsrRulerSign) newErrors.bphddsrRulerSign = 'Please select the ruler planet sign';

    if (bphddsrDegree) {
      const degreeNum = parseInt(bphddsrDegree);
      if (isNaN(degreeNum) || degreeNum < 0 || degreeNum > 29) {
        newErrors.bphddsrDegree = 'Degree must be between 0 and 29';
      }
    }

    if (bphddsrRulerDegree) {
      const degreeNum = parseInt(bphddsrRulerDegree);
      if (isNaN(degreeNum) || degreeNum < 0 || degreeNum > 29) {
        newErrors.bphddsrRulerDegree = 'Degree must be between 0 and 29';
      }
    }

    setBphddsrErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // BPHDDSR calculator submit
  const handleBphddsrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBphddsr()) return;

    // Track calculation usage
    if (onCalculate) {
      const allowed = await onCalculate();
      if (!allowed) return;
    }

    // Calculate the main planet placement
    const mainResult = calculateTruePlacement(
      bphddsrPlanet,
      bphddsrSign,
      bphddsrRising,
      bphddsrDegree || null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    // Calculate the ruler planet placement
    const rulerPlacementResult = calculateTruePlacement(
      bphddsrDerivedRuler,
      bphddsrRulerSign,
      bphddsrRising,
      bphddsrRulerDegree || null,
      truePlacementDB1,
      truePlacementDB2,
      sparkDatabase
    );

    if (mainResult) {
      setBphddsrResult(mainResult);
      setBphddsrRulerResult(rulerPlacementResult);
      setBphddsrNotFound(false);
      // Reset words for new calculation
      setBphddsrWords({
        baseWord: '',
        planetWord: '',
        connector1: '',
        houseWord: '',
        connector2: '',
        decanWord: '',
        degreeWord: '',
        signWord: '',
        rulerWord: '',
        rulerHouseWord: '',
        connector3: '',
        rulerSignWord: '',
      });
    } else {
      setBphddsrResult(null);
      setBphddsrRulerResult(null);
      setBphddsrNotFound(true);
    }

    requestAnimationFrame(() => {
      bphddsrResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  // Get planet label for BPHDDSR
  const getBphddsrPlanetLabel = () => {
    return PLANETS.find(p => p.value === bphddsrPlanet)?.label || bphddsrPlanet;
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
          Ruler
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
          className={`sub-tab-button ${activeSubTab === 'bphdds' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('bphdds')}
        >
          BPHDDS
        </button>
        <button
          className={`sub-tab-button ${activeSubTab === 'bphddsr' ? 'active' : ''}`}
          onClick={() => setActiveSubTab('bphddsr')}
        >
          BPHDDSR
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
              <label>Planet Sign:</label>
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
              <label>
                Degree (0-29): <span className="optional">(optional)</span>
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
                placeholder="Enter degree (0-29)"
                className={rulerErrors.rulerDegree ? 'has-error' : ''}
              />
              {rulerErrors.rulerDegree && <div className="validation-error show">{rulerErrors.rulerDegree}</div>}
            </div>

            <div className="form-group">
              <label>Rising Sign (Ascendant):</label>
              <CosmicDropdown
                options={SIGNS}
                value={rulerRising}
                onChange={(val) => {
                  setRulerRising(val);
                  setRulerErrors(prev => ({ ...prev, rulerRising: '' }));
                }}
                placeholder="Select a sign..."
                error={rulerErrors.rulerRising}
              />
            </div>

            {/* Ruler Planet Section */}
            {rulerSign && (
              <div className="ruler-planet-section">
                <div className="ruler-planet-header">
                  <span className="ruler-label">Ruler of {rulerSign}:</span>
                  <span className="ruler-planet-name">{rulerPlanetLabel}</span>
                </div>

                <div className="form-group">
                  <label>{rulerPlanetLabel} Sign:</label>
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
                    {rulerPlanetLabel} Degree (0-29): <span className="optional">(optional)</span>
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
                    placeholder="Enter degree (0-29)"
                    className={rulerErrors.rulerPlanetDegree ? 'has-error' : ''}
                  />
                  {rulerErrors.rulerPlanetDegree && <div className="validation-error show">{rulerErrors.rulerPlanetDegree}</div>}
                </div>
              </div>
            )}

            <button type="submit" className="calculate-btn">
              Calculate Ruler Placement
            </button>
          </form>

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

            <div className="form-group">
              <label>
                Degree: <span className="optional">(optional)</span>
              </label>
              <input
                type="number"
                min="0"
                max="29"
                value={phsDegree}
                onChange={e => {
                  setPhsDegree(e.target.value);
                  setPhsErrors(prev => ({ ...prev, phsDegree: '' }));
                }}
                placeholder="0-29"
                className={phsErrors.phsDegree ? 'has-error' : ''}
              />
              {phsErrors.phsDegree && <div className="validation-error show">{phsErrors.phsDegree}</div>}
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

                <div className="form-group">
                  <label>
                    Degree: <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="29"
                    value={phsrDegree}
                    onChange={e => {
                      setPhsrDegree(e.target.value);
                      setPhsrErrors(prev => ({ ...prev, phsrDegree: '' }));
                    }}
                    placeholder="0-29"
                    className={phsrErrors.phsrDegree ? 'has-error' : ''}
                  />
                  {phsrErrors.phsrDegree && <div className="validation-error show">{phsrErrors.phsrDegree}</div>}
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

                <div className="form-group">
                  <label>
                    Degree: <span className="optional">(optional)</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="29"
                    value={phsrRulerDegree}
                    onChange={e => {
                      setPhsrRulerDegree(e.target.value);
                      setPhsrErrors(prev => ({ ...prev, phsrRulerDegree: '' }));
                    }}
                    placeholder="0-29"
                    className={phsrErrors.phsrRulerDegree ? 'has-error' : ''}
                  />
                  {phsrErrors.phsrRulerDegree && <div className="validation-error show">{phsrErrors.phsrRulerDegree}</div>}
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

      {/* BPHDDS Calculator */}
      {activeSubTab === 'bphdds' && (
        <>
          <form onSubmit={handleBphddsSubmit} className="calculator-form" noValidate>
            <div className="form-group">
              <label>Planet:</label>
              <CosmicDropdown
                options={PLANETS}
                value={bphddsPlanet}
                onChange={(val) => {
                  setBphddsPlanet(val);
                  setBphddsErrors(prev => ({ ...prev, bphddsPlanet: '' }));
                }}
                placeholder="Select a planet..."
                error={bphddsErrors.bphddsPlanet}
              />
            </div>

            <div className="form-group">
              <label>Sign:</label>
              <CosmicDropdown
                options={SIGNS}
                value={bphddsSign}
                onChange={(val) => {
                  setBphddsSign(val);
                  setBphddsErrors(prev => ({ ...prev, bphddsSign: '' }));
                }}
                placeholder="Select a sign..."
                error={bphddsErrors.bphddsSign}
              />
            </div>

            <div className="form-group">
              <label>Rising:</label>
              <CosmicDropdown
                options={SIGNS}
                value={bphddsRising}
                onChange={(val) => {
                  setBphddsRising(val);
                  setBphddsErrors(prev => ({ ...prev, bphddsRising: '' }));
                }}
                placeholder="Select rising sign..."
                error={bphddsErrors.bphddsRising}
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
                value={bphddsDegree}
                onChange={e => {
                  setBphddsDegree(e.target.value);
                  setBphddsErrors(prev => ({ ...prev, bphddsDegree: '' }));
                }}
                placeholder="0-29"
                className={bphddsErrors.bphddsDegree ? 'has-error' : ''}
              />
              {bphddsErrors.bphddsDegree && <div className="validation-error show">{bphddsErrors.bphddsDegree}</div>}
            </div>

            <button type="submit" className="calculate-btn">
              Calculate
            </button>
          </form>

          {bphddsResult && (
            <div ref={bphddsResultRef} className="result-section show">
              {/* Calculation Results */}
              <div className="phs-results-row">
                <div className="phs-result-box">
                  <div className="phs-result-item">
                    <span className="phs-result-label">Planet:</span>
                    <span className="phs-result-value">{getBphddsPlanetLabel()}</span>
                  </div>
                  <div className="phs-result-item">
                    <span className="phs-result-label">House:</span>
                    <span className="phs-result-value">{bphddsResult.isHouse}</span>
                    <span className="phs-result-extra">{bphddsResult.isSign}</span>
                  </div>
                  <div className="phs-result-item">
                    <span className="phs-result-label">Base:</span>
                    <span className="phs-result-value">{bphddsResult.baseSign}</span>
                  </div>
                  {bphddsResult.spark && (
                    <div className="phs-result-item">
                      <span className="phs-result-label">Decan:</span>
                      <span className="phs-result-value">{bphddsResult.spark.decan}</span>
                    </div>
                  )}
                </div>

                <div className="phs-summary-box">
                  <div className="phs-summary-item">
                    <span className="phs-summary-label">BASE:</span>
                    <span className="phs-summary-value">{bphddsResult.baseSign}</span>
                  </div>
                  <div className="phs-summary-item">
                    <span className="phs-summary-label">PLANET:</span>
                    <span className="phs-summary-value">{getBphddsPlanetLabel()}</span>
                  </div>
                  <div className="phs-summary-item">
                    <span className="phs-summary-label">HOUSE:</span>
                    <span className="phs-summary-value">{bphddsResult.isHouse}</span>
                  </div>
                  {bphddsResult.spark && (
                    <>
                      <div className="phs-summary-item">
                        <span className="phs-summary-label">DECAN:</span>
                        <span className="phs-summary-value">{bphddsResult.spark.decan}</span>
                      </div>
                      <div className="phs-summary-item">
                        <span className="phs-summary-label">DEGREE:</span>
                        <span className="phs-summary-value">{bphddsDegree || 'N/A'}</span>
                      </div>
                    </>
                  )}
                  <div className="phs-summary-item">
                    <span className="phs-summary-label">SIGN:</span>
                    <span className="phs-summary-value">{bphddsSign}</span>
                  </div>
                </div>
              </div>

              <h3 className="phsr-sentence-title">Make your sentence:</h3>

              {/* Live Sentence Preview */}
              <div className="phsr-sentence-preview">
                <span className={bphddsWords.baseWord ? 'word-filled' : 'word-empty'}>
                  {bphddsWords.baseWord || '[Base]'}
                </span>
                {' '}
                <span className={bphddsWords.planetWord ? 'word-filled' : 'word-empty'}>
                  {bphddsWords.planetWord || '[Planet]'}
                </span>
                {' '}
                <span className={bphddsWords.connector1 ? 'word-connector' : 'word-empty'}>
                  {bphddsWords.connector1 || '[connector]'}
                </span>
                {' '}
                <span className={bphddsWords.houseWord ? 'word-filled' : 'word-empty'}>
                  {bphddsWords.houseWord || '[House]'}
                </span>
                {bphddsWords.decanWord && (
                  <>
                    {' '}
                    <span className={bphddsWords.connector2 ? 'word-connector' : 'word-empty'}>
                      {bphddsWords.connector2 || '[connector]'}
                    </span>
                    {' '}
                    <span className="word-filled">{bphddsWords.decanWord}</span>
                  </>
                )}
                {bphddsWords.degreeWord && (
                  <>
                    {' '}
                    <span className="word-label">at</span>
                    {' '}
                    <span className="word-filled">{bphddsWords.degreeWord}</span>
                  </>
                )}
                {bphddsWords.signWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{bphddsWords.signWord}</span>
                  </>
                )}
              </div>

              {/* Step 1: Base + Planet */}
              <div className="phsr-word-step">
                <div className="phsr-word-row">
                  <div className="phsr-word-group">
                    <div className="phsr-word-label">BASE:</div>
                    <div className="phsr-word-value">{bphddsResult.baseSign}</div>
                    <select
                      value={bphddsWords.baseWord}
                      onChange={(e) => setBphddsWords(prev => ({ ...prev, baseWord: e.target.value }))}
                      className="phsr-word-select"
                    >
                      <option value="">Select word...</option>
                      {(signKeywords[bphddsResult.baseSign] || []).map((kw, idx) => (
                        <option key={idx} value={kw}>{kw}</option>
                      ))}
                    </select>
                  </div>
                  <span className="phsr-word-plus">+</span>
                  <div className="phsr-word-group">
                    <div className="phsr-word-label">PLANET:</div>
                    <div className="phsr-word-value">{getBphddsPlanetLabel()}</div>
                    <select
                      value={bphddsWords.planetWord}
                      onChange={(e) => setBphddsWords(prev => ({ ...prev, planetWord: e.target.value }))}
                      className="phsr-word-select"
                    >
                      <option value="">Select word...</option>
                      {(planetKeywords[bphddsPlanet] || []).map((kw, idx) => (
                        <option key={idx} value={kw}>{kw}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: House (unlocks after Base + Planet selected) */}
              {bphddsWords.baseWord && bphddsWords.planetWord && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">HOUSE:</div>
                      <div className="phsr-word-value">{bphddsResult.isSign}</div>
                      <select
                        value={bphddsWords.houseWord}
                        onChange={(e) => setBphddsWords(prev => ({ ...prev, houseWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[bphddsResult.isSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Connector options */}
                  <div className="phsr-connector-options">
                    <span className="phsr-connector-label">Connector:</span>
                    {CONNECTOR_OPTIONS.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`phsr-connector-btn ${bphddsWords.connector1 === opt ? 'active' : ''}`}
                        onClick={() => setBphddsWords(prev => ({ ...prev, connector1: opt }))}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Decan (unlocks after House selected) */}
              {bphddsWords.houseWord && bphddsResult.spark && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">DECAN:</div>
                      <div className="phsr-word-value">{bphddsResult.spark.decan}</div>
                      <select
                        value={bphddsWords.decanWord}
                        onChange={(e) => setBphddsWords(prev => ({ ...prev, decanWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[bphddsResult.spark.decan] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Connector options for decan */}
                  <div className="phsr-connector-options">
                    <span className="phsr-connector-label">Connector:</span>
                    {CONNECTOR_OPTIONS.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`phsr-connector-btn ${bphddsWords.connector2 === opt ? 'active' : ''}`}
                        onClick={() => setBphddsWords(prev => ({ ...prev, connector2: opt }))}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Degree (unlocks after Decan selected) */}
              {bphddsWords.decanWord && bphddsDegree && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">DEGREE:</div>
                      <div className="phsr-word-value">{bphddsDegree}°</div>
                      <input
                        type="text"
                        value={bphddsWords.degreeWord}
                        onChange={(e) => setBphddsWords(prev => ({ ...prev, degreeWord: e.target.value }))}
                        className="phsr-word-select"
                        placeholder="Enter degree meaning..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Sign (unlocks after House or Decan selected) */}
              {(bphddsWords.houseWord && (!bphddsResult.spark || bphddsWords.decanWord)) && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">SIGN:</div>
                      <div className="phsr-word-value">{bphddsSign}</div>
                      <select
                        value={bphddsWords.signWord}
                        onChange={(e) => setBphddsWords(prev => ({ ...prev, signWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[bphddsSign] || []).map((kw, idx) => (
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
                <span className={bphddsWords.baseWord ? 'word-filled' : 'word-empty'}>
                  {bphddsWords.baseWord || '[Base]'}
                </span>
                {' '}
                <span className={bphddsWords.planetWord ? 'word-filled' : 'word-empty'}>
                  {bphddsWords.planetWord || '[Planet]'}
                </span>
                {' '}
                <span className={bphddsWords.connector1 ? 'word-connector' : 'word-empty'}>
                  {bphddsWords.connector1 || '[connector]'}
                </span>
                {' '}
                <span className={bphddsWords.houseWord ? 'word-filled' : 'word-empty'}>
                  {bphddsWords.houseWord || '[House]'}
                </span>
                {bphddsWords.decanWord && (
                  <>
                    {' '}
                    <span className={bphddsWords.connector2 ? 'word-connector' : 'word-empty'}>
                      {bphddsWords.connector2 || '[connector]'}
                    </span>
                    {' '}
                    <span className="word-filled">{bphddsWords.decanWord}</span>
                  </>
                )}
                {bphddsWords.degreeWord && (
                  <>
                    {' '}
                    <span className="word-label">at</span>
                    {' '}
                    <span className="word-filled">{bphddsWords.degreeWord}</span>
                  </>
                )}
                {bphddsWords.signWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{bphddsWords.signWord}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {bphddsNotFound && (
            <div className="result-section show">
              <div className="error-message">
                No matching data found. Please check your inputs.
              </div>
            </div>
          )}
        </>
      )}

      {/* BPHDDSR Calculator */}
      {activeSubTab === 'bphddsr' && (
        <>
          <div className="phsr-inputs">
            {/* Left Input Panel */}
            <div className="phsr-input-panel">
              <form onSubmit={handleBphddsrSubmit} className="calculator-form" noValidate>
                <div className="form-group">
                  <label>Planet:</label>
                  <CosmicDropdown
                    options={PLANETS}
                    value={bphddsrPlanet}
                    onChange={(val) => {
                      setBphddsrPlanet(val);
                      setBphddsrErrors(prev => ({ ...prev, bphddsrPlanet: '' }));
                    }}
                    placeholder="Select a planet..."
                    error={bphddsrErrors.bphddsrPlanet}
                  />
                </div>

                <div className="form-group">
                  <label>Sign:</label>
                  <CosmicDropdown
                    options={SIGNS}
                    value={bphddsrSign}
                    onChange={(val) => {
                      setBphddsrSign(val);
                      setBphddsrErrors(prev => ({ ...prev, bphddsrSign: '' }));
                    }}
                    placeholder="Select a sign..."
                    error={bphddsrErrors.bphddsrSign}
                  />
                </div>

                <div className="form-group">
                  <label>Rising:</label>
                  <CosmicDropdown
                    options={SIGNS}
                    value={bphddsrRising}
                    onChange={(val) => {
                      setBphddsrRising(val);
                      setBphddsrErrors(prev => ({ ...prev, bphddsrRising: '' }));
                    }}
                    placeholder="Select rising sign..."
                    error={bphddsrErrors.bphddsrRising}
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
                    value={bphddsrDegree}
                    onChange={e => {
                      setBphddsrDegree(e.target.value);
                      setBphddsrErrors(prev => ({ ...prev, bphddsrDegree: '' }));
                    }}
                    placeholder="0-29"
                    className={bphddsrErrors.bphddsrDegree ? 'has-error' : ''}
                  />
                  {bphddsrErrors.bphddsrDegree && <div className="validation-error show">{bphddsrErrors.bphddsrDegree}</div>}
                </div>
              </form>
            </div>

            {/* Ruler Input Panel */}
            {bphddsrSign && (
              <div className="phsr-ruler-panel">
                <div className="phsr-ruler-header">
                  <span className="ruler-label">Ruler:</span>
                  <span className="ruler-planet-name">{bphddsrRulerLabel}</span>
                </div>

                <div className="form-group">
                  <label>Sign:</label>
                  <CosmicDropdown
                    options={SIGNS}
                    value={bphddsrRulerSign}
                    onChange={(val) => {
                      setBphddsrRulerSign(val);
                      setBphddsrErrors(prev => ({ ...prev, bphddsrRulerSign: '' }));
                    }}
                    placeholder={`Select ${bphddsrRulerLabel}'s sign...`}
                    error={bphddsrErrors.bphddsrRulerSign}
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
                    value={bphddsrRulerDegree}
                    onChange={e => {
                      setBphddsrRulerDegree(e.target.value);
                      setBphddsrErrors(prev => ({ ...prev, bphddsrRulerDegree: '' }));
                    }}
                    placeholder="0-29"
                    className={bphddsrErrors.bphddsrRulerDegree ? 'has-error' : ''}
                  />
                  {bphddsrErrors.bphddsrRulerDegree && <div className="validation-error show">{bphddsrErrors.bphddsrRulerDegree}</div>}
                </div>
              </div>
            )}
          </div>

          <div className="phsr-calculate-wrapper">
            <button type="button" onClick={handleBphddsrSubmit} className="calculate-btn">
              Calculate
            </button>
          </div>

          {bphddsrResult && (
            <div ref={bphddsrResultRef} className="result-section show">
              <h3 className="phsr-sentence-title">Make your sentence:</h3>

              {/* Live Sentence Preview */}
              <div className="phsr-sentence-preview">
                <span className={bphddsrWords.baseWord ? 'word-filled' : 'word-empty'}>
                  {bphddsrWords.baseWord || '[Base]'}
                </span>
                {' '}
                <span className={bphddsrWords.planetWord ? 'word-filled' : 'word-empty'}>
                  {bphddsrWords.planetWord || '[Planet]'}
                </span>
                {' '}
                <span className={bphddsrWords.connector1 ? 'word-connector' : 'word-empty'}>
                  {bphddsrWords.connector1 || '[connector]'}
                </span>
                {' '}
                <span className={bphddsrWords.houseWord ? 'word-filled' : 'word-empty'}>
                  {bphddsrWords.houseWord || '[House]'}
                </span>
                {bphddsrWords.decanWord && (
                  <>
                    {' '}
                    <span className={bphddsrWords.connector2 ? 'word-connector' : 'word-empty'}>
                      {bphddsrWords.connector2 || '[connector]'}
                    </span>
                    {' '}
                    <span className="word-filled">{bphddsrWords.decanWord}</span>
                  </>
                )}
                {bphddsrWords.degreeWord && (
                  <>
                    {' '}
                    <span className="word-label">at</span>
                    {' '}
                    <span className="word-filled">{bphddsrWords.degreeWord}</span>
                  </>
                )}
                {bphddsrWords.signWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{bphddsrWords.signWord}</span>
                    <span className="word-label">, ruled by</span>
                  </>
                )}
                {bphddsrWords.rulerWord && (
                  <>
                    {' '}
                    <span className="word-filled">{bphddsrWords.rulerWord}</span>
                  </>
                )}
                {bphddsrWords.rulerHouseWord && (
                  <>
                    {' '}
                    <span className={bphddsrWords.connector3 ? 'word-connector' : 'word-empty'}>
                      {bphddsrWords.connector3 || '[connector]'}
                    </span>
                    {' '}
                    <span className="word-filled">{bphddsrWords.rulerHouseWord}</span>
                  </>
                )}
                {bphddsrWords.rulerSignWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{bphddsrWords.rulerSignWord}</span>
                  </>
                )}
              </div>

              {/* Step 1: Base + Planet */}
              <div className="phsr-word-step">
                <div className="phsr-word-row">
                  <div className="phsr-word-group">
                    <div className="phsr-word-label">BASE:</div>
                    <div className="phsr-word-value">{bphddsrResult.baseSign}</div>
                    <select
                      value={bphddsrWords.baseWord}
                      onChange={(e) => setBphddsrWords(prev => ({ ...prev, baseWord: e.target.value }))}
                      className="phsr-word-select"
                    >
                      <option value="">Select word...</option>
                      {(signKeywords[bphddsrResult.baseSign] || []).map((kw, idx) => (
                        <option key={idx} value={kw}>{kw}</option>
                      ))}
                    </select>
                  </div>
                  <span className="phsr-word-plus">+</span>
                  <div className="phsr-word-group">
                    <div className="phsr-word-label">PLANET:</div>
                    <div className="phsr-word-value">{getBphddsrPlanetLabel()}</div>
                    <select
                      value={bphddsrWords.planetWord}
                      onChange={(e) => setBphddsrWords(prev => ({ ...prev, planetWord: e.target.value }))}
                      className="phsr-word-select"
                    >
                      <option value="">Select word...</option>
                      {(planetKeywords[bphddsrPlanet] || []).map((kw, idx) => (
                        <option key={idx} value={kw}>{kw}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: House (unlocks after Base + Planet selected) */}
              {bphddsrWords.baseWord && bphddsrWords.planetWord && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">HOUSE:</div>
                      <div className="phsr-word-value">{bphddsrResult.isSign}</div>
                      <select
                        value={bphddsrWords.houseWord}
                        onChange={(e) => setBphddsrWords(prev => ({ ...prev, houseWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[bphddsrResult.isSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Connector options */}
                  <div className="phsr-connector-options">
                    <span className="phsr-connector-label">Connector:</span>
                    {CONNECTOR_OPTIONS.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`phsr-connector-btn ${bphddsrWords.connector1 === opt ? 'active' : ''}`}
                        onClick={() => setBphddsrWords(prev => ({ ...prev, connector1: opt }))}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 3: Decan (unlocks after House selected) */}
              {bphddsrWords.houseWord && bphddsrResult.spark && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">DECAN:</div>
                      <div className="phsr-word-value">{bphddsrResult.spark.decan}</div>
                      <select
                        value={bphddsrWords.decanWord}
                        onChange={(e) => setBphddsrWords(prev => ({ ...prev, decanWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[bphddsrResult.spark.decan] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Connector options for decan */}
                  <div className="phsr-connector-options">
                    <span className="phsr-connector-label">Connector:</span>
                    {CONNECTOR_OPTIONS.map((opt, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`phsr-connector-btn ${bphddsrWords.connector2 === opt ? 'active' : ''}`}
                        onClick={() => setBphddsrWords(prev => ({ ...prev, connector2: opt }))}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 4: Degree (unlocks after Decan selected) */}
              {bphddsrWords.decanWord && bphddsrDegree && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">DEGREE:</div>
                      <div className="phsr-word-value">{bphddsrDegree}°</div>
                      <input
                        type="text"
                        value={bphddsrWords.degreeWord}
                        onChange={(e) => setBphddsrWords(prev => ({ ...prev, degreeWord: e.target.value }))}
                        className="phsr-word-select"
                        placeholder="Enter degree meaning..."
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 5: Sign (unlocks after House or Decan selected) */}
              {(bphddsrWords.houseWord && (!bphddsrResult.spark || bphddsrWords.decanWord)) && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">SIGN:</div>
                      <div className="phsr-word-value">{bphddsrSign}</div>
                      <select
                        value={bphddsrWords.signWord}
                        onChange={(e) => setBphddsrWords(prev => ({ ...prev, signWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[bphddsrSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="phsr-description-hint">
                    <strong>, ruled by</strong> (connects to Ruler)
                  </div>
                </div>
              )}

              {/* Step 6: Ruler + House (unlocks after Sign selected) */}
              {bphddsrWords.signWord && bphddsrRulerResult && (
                <div className="phsr-word-step ruler-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">Ruler:</div>
                      <div className="phsr-word-value">{bphddsrRulerLabel}</div>
                      <select
                        value={bphddsrWords.rulerWord}
                        onChange={(e) => setBphddsrWords(prev => ({ ...prev, rulerWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(planetKeywords[bphddsrDerivedRuler] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                    <span className="phsr-word-plus">+</span>
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">HOUSE:</div>
                      <div className="phsr-word-value">{bphddsrRulerResult.isSign}</div>
                      <select
                        value={bphddsrWords.rulerHouseWord}
                        onChange={(e) => setBphddsrWords(prev => ({ ...prev, rulerHouseWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[bphddsrRulerResult.isSign] || []).map((kw, idx) => (
                          <option key={idx} value={kw}>{kw}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Connector options for ruler */}
                  {bphddsrWords.rulerWord && bphddsrWords.rulerHouseWord && (
                    <div className="phsr-connector-options">
                      <span className="phsr-connector-label">Connector:</span>
                      {CONNECTOR_OPTIONS.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className={`phsr-connector-btn ${bphddsrWords.connector3 === opt ? 'active' : ''}`}
                          onClick={() => setBphddsrWords(prev => ({ ...prev, connector3: opt }))}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Step 7: Ruler Sign (unlocks after Ruler + House selected) */}
              {bphddsrWords.rulerWord && bphddsrWords.rulerHouseWord && bphddsrRulerResult && (
                <div className="phsr-word-step">
                  <div className="phsr-word-arrow">↓</div>
                  <div className="phsr-word-row single">
                    <div className="phsr-word-group">
                      <div className="phsr-word-label">Sign:</div>
                      <div className="phsr-word-value">{bphddsrRulerSign}</div>
                      <select
                        value={bphddsrWords.rulerSignWord}
                        onChange={(e) => setBphddsrWords(prev => ({ ...prev, rulerSignWord: e.target.value }))}
                        className="phsr-word-select"
                      >
                        <option value="">Select word...</option>
                        {(signKeywords[bphddsrRulerSign] || []).map((kw, idx) => (
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
                <span className={bphddsrWords.baseWord ? 'word-filled' : 'word-empty'}>
                  {bphddsrWords.baseWord || '[Base]'}
                </span>
                {' '}
                <span className={bphddsrWords.planetWord ? 'word-filled' : 'word-empty'}>
                  {bphddsrWords.planetWord || '[Planet]'}
                </span>
                {' '}
                <span className={bphddsrWords.connector1 ? 'word-connector' : 'word-empty'}>
                  {bphddsrWords.connector1 || '[connector]'}
                </span>
                {' '}
                <span className={bphddsrWords.houseWord ? 'word-filled' : 'word-empty'}>
                  {bphddsrWords.houseWord || '[House]'}
                </span>
                {bphddsrWords.decanWord && (
                  <>
                    {' '}
                    <span className={bphddsrWords.connector2 ? 'word-connector' : 'word-empty'}>
                      {bphddsrWords.connector2 || '[connector]'}
                    </span>
                    {' '}
                    <span className="word-filled">{bphddsrWords.decanWord}</span>
                  </>
                )}
                {bphddsrWords.degreeWord && (
                  <>
                    {' '}
                    <span className="word-label">at</span>
                    {' '}
                    <span className="word-filled">{bphddsrWords.degreeWord}</span>
                  </>
                )}
                {bphddsrWords.signWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{bphddsrWords.signWord}</span>
                    <span className="word-label">, ruled by</span>
                  </>
                )}
                {bphddsrWords.rulerWord && (
                  <>
                    {' '}
                    <span className="word-filled">{bphddsrWords.rulerWord}</span>
                  </>
                )}
                {bphddsrWords.rulerHouseWord && (
                  <>
                    {' '}
                    <span className={bphddsrWords.connector3 ? 'word-connector' : 'word-empty'}>
                      {bphddsrWords.connector3 || '[connector]'}
                    </span>
                    {' '}
                    <span className="word-filled">{bphddsrWords.rulerHouseWord}</span>
                  </>
                )}
                {bphddsrWords.rulerSignWord && (
                  <>
                    {' '}
                    <span className="word-label">expressed through</span>
                    {' '}
                    <span className="word-filled">{bphddsrWords.rulerSignWord}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {bphddsrNotFound && (
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
