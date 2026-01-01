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
let keywordsCacheTime: number = 0;
const KEYWORDS_CACHE_TTL = 60000; // 1 minute TTL for keywords

// Fetch keywords from database API
async function fetchKeywordsFromDB(): Promise<{
  planetKeywords: Record<string, string[]>;
  signKeywords: Record<string, string[]>;
}> {
  try {
    const response = await fetch('/api/keywords');
    if (!response.ok) {
      throw new Error('Failed to fetch keywords from database');
    }
    const data = await response.json();

    const planetKeywords: Record<string, string[]> = {};
    const signKeywords: Record<string, string[]> = {};

    for (const item of data.keywords) {
      if (item.type === 'planet') {
        planetKeywords[item.name] = item.keywords;
      } else if (item.type === 'sign') {
        signKeywords[item.name] = item.keywords;
      }
    }

    return { planetKeywords, signKeywords };
  } catch (error) {
    console.error('Error fetching keywords from DB, falling back to static files:', error);
    // Fallback to static files
    const [planetKeywords, signKeywords] = await Promise.all([
      fetch('/data/planet_keywords.json').then(r => r.json()),
      fetch('/data/sign_keywords.json').then(r => r.json()),
    ]);
    return { planetKeywords, signKeywords };
  }
}

export async function loadAstrologyData(): Promise<AstrologyData> {
  const now = Date.now();
  const keywordsExpired = now - keywordsCacheTime > KEYWORDS_CACHE_TTL;

  // If we have cached data but keywords expired, just refresh keywords
  if (cachedData && keywordsExpired) {
    try {
      const keywordsData = await fetchKeywordsFromDB();
      cachedData.planetKeywords = keywordsData.planetKeywords;
      cachedData.signKeywords = keywordsData.signKeywords;
      keywordsCacheTime = now;
    } catch (error) {
      console.error('Error refreshing keywords:', error);
    }
    return cachedData;
  }

  // If we have valid cached data, return it
  if (cachedData && !keywordsExpired) {
    return cachedData;
  }

  // Load everything fresh
  const [
    sparkDatabase,
    truePlacementDB1,
    truePlacementDB2,
    planetMeanings,
    signMeanings,
    profectionData,
    keywordsData,
  ] = await Promise.all([
    fetch('/data/spark_database.json').then(r => r.json()),
    fetch('/data/true_placement_db1.json').then(r => r.json()),
    fetch('/data/true_placement_db2.json').then(r => r.json()),
    fetch('/data/planet_meanings.json').then(r => r.json()),
    fetch('/data/sign_meanings.json').then(r => r.json()),
    fetch('/data/profection_data.json').then(r => r.json()),
    fetchKeywordsFromDB(),
  ]);

  keywordsCacheTime = now;

  cachedData = {
    sparkDatabase,
    truePlacementDB1,
    truePlacementDB2,
    planetMeanings,
    signMeanings,
    profectionData,
    planetKeywords: keywordsData.planetKeywords,
    signKeywords: keywordsData.signKeywords,
  };

  return cachedData;
}

// Clear cached data to force refresh (e.g., after keywords are updated)
export function clearAstrologyDataCache(): void {
  cachedData = null;
}
