export type Planet =
  | 'SUN' | 'MOON' | 'MERCURY' | 'VENUS' | 'MARS'
  | 'JUPITER' | 'SATURN' | 'URANUS' | 'NEPTUNE' | 'PLUTO' | 'OTHER';

export type ZodiacSign =
  | 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo'
  | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';

export interface SparkEntry {
  Degree: string;
  Sign: string;
  Spark: string;
  Decan: string;
  Decan_Planets: string;
}

export interface TruePlacementEntry {
  Planet: string;
  Sign: string;
  Rising: string;
  IS_house: string;
  IS_sign: string;
  Sign2: string;
  BASE_house: string;
  BASE_sign: string;
  Sign3: string;
  Sign4?: string;
  Sign5?: string;
  Sign6?: string;
}

export interface ProfectionData {
  house_order: string[];
  house_mappings: Record<string, Record<string, string>>;
}

export interface SparkResult {
  planet: string;
  degree: string;
  sign: string;
  spark: string;
  decan: string;
  decanPlanets: string;
}

export interface TruePlacementResult {
  planet: string;
  sign: string;
  rising: string;
  isHouse: string;
  isSign: string;
  expressingSign: string;
  baseHouse: string;
  baseSign: string;
  throughSign: string;
  hasDualBase: boolean;
  secondBaseSign?: string;
  secondThroughSign?: string;
  secondBaseHouse?: string;
  spark?: SparkResult;
}

export interface ProfectionResult {
  birthDate: string;
  rising: string;
  age: number;
  currentHouse: string;
  currentSign: string;
  firstActivation: number;
  cycles: ProfectionCycle[];
}

export interface ProfectionCycle {
  age: number;
  year: number;
  house: string;
  sign: string;
  isCurrent: boolean;
}
