import type { SparkEntry, TruePlacementEntry, ProfectionData } from '@/types/astrology';

export interface AstrologyData {
  sparkDatabase: SparkEntry[];
  truePlacementDB1: TruePlacementEntry[];
  truePlacementDB2: TruePlacementEntry[];
  planetMeanings: Record<string, string[]>;
  signMeanings: Record<string, string[]>;
  profectionData: ProfectionData;
  planetKeywords: Record<string, string[]>;
  signKeywords: Record<string, string[]>;
}

let cachedData: AstrologyData | null = null;

export async function loadAstrologyData(): Promise<AstrologyData> {
  if (cachedData) return cachedData;

  const [
    sparkDatabase,
    truePlacementDB1,
    truePlacementDB2,
    planetMeanings,
    signMeanings,
    profectionData,
    planetKeywords,
    signKeywords,
  ] = await Promise.all([
    fetch('/data/spark_database.json').then(r => r.json()),
    fetch('/data/true_placement_db1.json').then(r => r.json()),
    fetch('/data/true_placement_db2.json').then(r => r.json()),
    fetch('/data/planet_meanings.json').then(r => r.json()),
    fetch('/data/sign_meanings.json').then(r => r.json()),
    fetch('/data/profection_data.json').then(r => r.json()),
    fetch('/data/planet_keywords.json').then(r => r.json()),
    fetch('/data/sign_keywords.json').then(r => r.json()),
  ]);

  cachedData = {
    sparkDatabase,
    truePlacementDB1,
    truePlacementDB2,
    planetMeanings,
    signMeanings,
    profectionData,
    planetKeywords,
    signKeywords,
  };

  return cachedData;
}
