import type {
  SparkEntry,
  TruePlacementEntry,
  ProfectionData,
  SparkResult,
  TruePlacementResult,
  ProfectionResult,
  ProfectionCycle,
} from '@/types/astrology';

export function calculateSpark(
  planet: string,
  sign: string,
  degree: string,
  sparkDatabase: SparkEntry[]
): SparkResult | null {
  const result = sparkDatabase.find(entry => {
    const entryDegree = String(entry.Degree).replace('°', '').trim();
    return entryDegree === degree && entry.Sign === sign;
  });

  if (!result) return null;

  return {
    planet,
    degree,
    sign,
    spark: result.Spark,
    decan: result.Decan,
    decanPlanets: result.Decan_Planets,
  };
}

export function calculateTruePlacement(
  planet: string,
  sign: string,
  rising: string,
  degree: string | null,
  truePlacementDB1: TruePlacementEntry[],
  truePlacementDB2: TruePlacementEntry[],
  sparkDatabase: SparkEntry[]
): TruePlacementResult | null {
  let result = truePlacementDB1.find(
    entry => entry.Planet === planet && entry.Sign === sign && entry.Rising === rising
  );

  if (!result && planet === 'VENUS') {
    result = truePlacementDB2.find(
      entry => entry.Planet === planet && entry.Sign === sign && entry.Rising === rising
    );
  }

  if (!result) return null;

  const hasDualBase = (planet === 'VENUS' || planet === 'MERCURY') && !!result.Sign5;

  let spark: SparkResult | undefined;
  if (degree) {
    const sparkResult = calculateSpark(planet, sign, degree, sparkDatabase);
    if (sparkResult) spark = sparkResult;
  }

  return {
    planet,
    sign,
    rising,
    isHouse: result.IS_house || 'N/A',
    isSign: result.IS_sign || 'N/A',
    expressingSign: result.Sign2 || 'N/A',
    baseHouse: result.BASE_house || 'N/A',
    baseSign: result.BASE_sign || 'N/A',
    throughSign: result.Sign3 || 'N/A',
    hasDualBase,
    secondBaseSign: result.Sign5 || undefined,
    secondThroughSign: result.Sign6 || undefined,
    secondBaseHouse: result.Sign4 || undefined,
    spark,
  };
}

export function calculateProfection(
  birthDate: string,
  rising: string,
  profectionData: ProfectionData
): ProfectionResult | null {
  const birth = new Date(birthDate);
  const birthYear = birth.getFullYear();
  const birthMonth = birth.getMonth() + 1;
  const birthDay = birth.getDate();

  const today = new Date();
  let age = today.getFullYear() - birthYear;
  const monthDiff = today.getMonth() + 1 - birthMonth;
  const dayDiff = today.getDate() - birthDay;

  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  let firstActivation = birthYear;
  if (birthMonth <= 2 || (birthMonth === 3 && birthDay <= 15)) {
    firstActivation = birthYear;
  } else {
    firstActivation = birthYear + 1;
  }

  const houseMappings = profectionData.house_mappings[rising];
  const houseOrder = profectionData.house_order;

  if (!houseMappings) return null;

  const currentHouseIndex = age % 12;
  const currentHouse = houseOrder[currentHouseIndex];
  const currentSign = houseMappings[currentHouse];

  const cycles: ProfectionCycle[] = [];
  for (let i = 0; i <= 23; i++) {
    const houseIndex = i % 12;
    const house = houseOrder[houseIndex];
    const sign = houseMappings[house];
    const year = firstActivation + i;

    cycles.push({
      age: i,
      year,
      house,
      sign,
      isCurrent: i === age,
    });
  }

  return {
    birthDate,
    rising,
    age,
    currentHouse,
    currentSign,
    firstActivation,
    cycles,
  };
}
