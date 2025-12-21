# Spark Converter - Complete Logic Documentation

## Overview
This document contains all the logic, databases, and formulas needed to convert the Excel-based astrological "Spark Converter" into a web application.

## Input Fields (User Provides)
1. **Planet** - One of: MOON, SUN, VENUS, MERCURY, MARS, PLUTO, JUPITER, SATURN, URANUS, NEPTUNE
2. **Sign** - The zodiac sign the planet is in (Aries, Taurus, Gemini, Cancer, Leo, Virgo, Libra, Scorpio, Sagittarius, Capricorn, Aquarius, Pisces)
3. **Degree** - 0° to 29° (the degree within the sign)
4. **Rising Sign** - The ascendant sign (same 12 options as Sign)

## Output Fields (Calculated)
The app generates sentences like:
- `"SUN is Aries, with Sagittarius spark in Leo decan, expressed through Sagittarius with Sagittarius base (through Leo)"`

Components:
- **Planet** - input
- **IS (sign)** - looked up from TruePlacement_DataBase1
- **Spark** - looked up from Spark_DataBase based on Degree + Sign
- **Decan** - looked up from Spark_DataBase based on Degree + Sign
- **Expressed Through** - looked up from TruePlacement_DataBase1
- **Base (house/sign)** - looked up from TruePlacement_DataBase1
- **Second Base** (for VENUS/MERCURY) - looked up from TruePlacement_DataBase2

---

## Database 1: Spark_DataBase (Degree_Spark_DataBase)

**Purpose**: Maps Degree + Sign → Spark, Decan, Decan Planet

**Structure** (360 records - 30 degrees × 12 signs):
```
Helper: "{Degree}-{Sign}"  (e.g., "20°-Sagittarius")
Spark: zodiac sign
Decan: zodiac sign  
Decan_Planets: planet name
```

**Lookup**:
- Key: `"{Degree}°-{Sign}"` (e.g., "20°-Sagittarius")
- Returns: Spark, Decan, Decan_Planets

**Formula in Excel**:
```
Spark = VLOOKUP(Degree & "-" & Sign, Degree_Spark_DataBase, 2, 0)
Decan = VLOOKUP(Degree & "-" & Sign, Degree_Spark_DataBase, 3, 0)
```

**Sample Data**:
| Degree | Sign | Helper | Spark | Decan | Decan_Planets |
|--------|------|--------|-------|-------|---------------|
| 0° | Aries | 0°-Aries | Aries | Aries | MARS |
| 0° | Taurus | 0°-Taurus | Libra | Taurus | VENUS (Taurus) |
| 10° | Aries | 10°-Aries | Aquarius | Leo | SUN |
| 20° | Sagittarius | 20°-Sagittarius | Sagittarius | Leo | SUN |

---

## Database 2: TruePlacement_DataBase1

**Purpose**: Maps Planet + Sign + Rising → House positions and expressions

**Structure** (1440 records - 10 planets × 12 signs × 12 rising signs):
```
Helper: "{Planet}-{Sign}-{Rising}"  (e.g., "SUN-Sagittarius-Sagittarius")
```

**Columns**:
| Column | Description |
|--------|-------------|
| Planet | The planet being calculated |
| Sign | The sign the planet is in |
| Rising | The rising/ascendant sign |
| Helper | Lookup key: Planet-Sign-Rising |
| IS_house | House number (1st, 2nd, etc.) |
| IS_sign | Sign for "is" clause |
| Sign2 | Sign for "expressing through" |
| BASE_house | House number for base |
| BASE_sign | Sign for base |
| Sign3 | Additional sign |
| Sign5 | For "through" clause |
| Sign6 | Second base sign |

**Lookup Formulas** (from Excel):
```javascript
// IS sign (column 3 from Helper)
IS_sign = VLOOKUP(Planet + "-" + Sign + "-" + Rising, TruePlacement_DataBase1, 3, 0)

// Expressed Through (column 4)
expressedThrough = VLOOKUP(Planet + "-" + Sign + "-" + Rising, TruePlacement_DataBase1, 4, 0)

// Base sign (column 6)
baseSign = VLOOKUP(Planet + "-" + Sign + "-" + Rising, TruePlacement_DataBase1, 6, 0)

// Through sign (column 7)
throughSign = VLOOKUP(Planet + "-" + Sign + "-" + Rising, TruePlacement_DataBase1, 7, 0)

// Second base (column 9)
secondBase = VLOOKUP(Planet + "-" + Sign + "-" + Rising, TruePlacement_DataBase1, 9, 0)
```

**Sample Data**:
| Planet | Sign | Rising | Helper | IS_house | IS_sign | Sign2 | BASE_house | BASE_sign | Sign3 |
|--------|------|--------|--------|----------|---------|-------|------------|-----------|-------|
| MOON | Aries | Aries | MOON-Aries-Aries | 1st | Aries | Aries | 4th | Cancer | Cancer |
| SUN | Sagittarius | Sagittarius | SUN-Sagittarius-Sagittarius | 1st | Sagittarius | Sagittarius | 5th | Leo | Leo |

---

## Database 3: TruePlacement_DataBase2

**Purpose**: Additional lookups for planets with dual rulership (VENUS and MERCURY only)

### Why Venus and Mercury are Special

These two planets each rule TWO zodiac signs:
- **VENUS** rules both **Taurus** AND **Libra**
- **MERCURY** rules both **Gemini** AND **Virgo**

Because of this dual rulership, they have TWO base positions instead of one.

### Structure (288 records - 2 planets × 12 signs × 12 rising signs)

| Column | Description |
|--------|-------------|
| Planet | VENUS or MERCURY only |
| Sign | Sign the planet is in |
| Rising | Rising/ascendant sign |
| Helper | Lookup key: "{Planet}-{Sign}-{Rising}" |
| IS_house | House number |
| IS_sign | Sign |
| Sign_original | Original sign |
| BASE_house_1 | First base house (Taurus for Venus, Gemini for Mercury) |
| BASE_sign_1 | First base sign |
| Sign_ruler_1 | First rulership sign (Taurus/Gemini) |
| BASE_house_2 | **Second base house** (Libra for Venus, Virgo for Mercury) |
| BASE_sign_2 | **Second base sign** |
| Sign_ruler_2 | Second rulership sign (Libra/Virgo) |

### Example Data

**VENUS in Aries with Aries Rising:**
```json
{
  "Planet": "VENUS",
  "Sign": "Aries",
  "Rising": "Aries",
  "Helper": "VENUS-Aries-Aries",
  "BASE_house_1": "2nd",
  "BASE_sign_1": "Taurus",
  "Sign_ruler_1": "Taurus",
  "BASE_house_2": "7th",
  "BASE_sign_2": "Libra",
  "Sign_ruler_2": "Libra"
}
```

**MERCURY in Aries with Aries Rising:**
```json
{
  "Planet": "MERCURY",
  "Sign": "Aries",
  "Rising": "Aries",
  "Helper": "MERCURY-Aries-Aries",
  "BASE_house_1": "3rd",
  "BASE_sign_1": "Gemini",
  "Sign_ruler_1": "Gemini",
  "BASE_house_2": "6th",
  "BASE_sign_2": "Virgo",
  "Sign_ruler_2": "Virgo"
}
```

### Sentence Format for Venus/Mercury

When generating sentences for VENUS or MERCURY, include BOTH bases:

```
"{PLANET} is {IS_sign}, with {Spark} spark in {Decan} decan, 
expressed through {expressedThrough} with {baseSign1} and {baseSign2} base 
(through {throughSign1} and {throughSign2})"
```

**Example Output:**
```
"VENUS is Aries, with Sagittarius spark in Leo decan, 
expressed through Sagittarius with Taurus and Libra base 
(through Gemini and Capricorn)"
```

### Implementation Logic

```javascript
function calculateReading(planet, sign, degree, rising) {
  // ... get spark, decan from Spark_DataBase ...
  
  // Get base data from TruePlacement_DataBase1
  const tp1Key = `${planet}-${sign}-${rising}`;
  const tp1Data = truePlacementDB1.find(r => r.Helper === tp1Key);
  
  // Check if Venus or Mercury (dual rulers)
  if (planet === 'VENUS' || planet === 'MERCURY') {
    // Get SECOND base from TruePlacement_DataBase2
    const tp2Data = truePlacementDB2.find(r => r.Helper === tp1Key);
    
    return {
      baseSign1: tp1Data.BASE_sign,      // Taurus for Venus, Gemini for Mercury
      baseSign2: tp2Data.BASE_sign4,     // Libra for Venus, Virgo for Mercury
      throughSign1: tp1Data.Sign3,
      throughSign2: tp2Data.Sign5,
      hasDualBase: true
    };
  } else {
    // Single base for all other planets
    return {
      baseSign1: tp1Data.BASE_sign,
      baseSign2: null,
      throughSign1: tp1Data.Sign3,
      throughSign2: null,
      hasDualBase: false
    };
  }
}
```

### Quick Reference: Dual Rulership

| Planet | First Rules | Second Rules |
|--------|-------------|--------------|
| VENUS | Taurus (2nd house natural) | Libra (7th house natural) |
| MERCURY | Gemini (3rd house natural) | Virgo (6th house natural) |
| All others | Single sign | N/A |

---

## Sign → Ruler Mapping

```javascript
const SIGN_RULERS = {
  "Aries": "MARS",
  "Taurus": "VENUS",
  "Gemini": "MERCURY", 
  "Cancer": "MOON",
  "Leo": "SUN",
  "Virgo": "MERCURY",
  "Libra": "VENUS",
  "Scorpio": "PLUTO",
  "Sagittarius": "JUPITER",
  "Capricorn": "SATURN",
  "Aquarius": "URANUS",
  "Pisces": "NEPTUNE"
};
```

---

## Sentence Generation Logic

### For Regular Planets (MOON, SUN, MARS, PLUTO, JUPITER, SATURN, URANUS, NEPTUNE)

Single base format:
```
"{PLANET} is {IS_sign}, with {Spark} spark in {Decan} decan, expressed through {expressedThrough} with {baseSign} base (through {throughSign})"
```

**Example:**
```
"SUN is Aries, with Sagittarius spark in Leo decan, expressed through Sagittarius with Leo base (through Cancer)"
```

### For VENUS and MERCURY (Dual Rulers - SPECIAL CASE)

Double base format - these planets ALWAYS have two bases:
```
"{PLANET} is {IS_sign}, with {Spark} spark in {Decan} decan, expressed through {expressedThrough} with {baseSign1} and {baseSign2} base (through {throughSign1} and {throughSign2})"
```

**Example for VENUS:**
```
"VENUS is Aries, with Sagittarius spark in Leo decan, expressed through Sagittarius with Taurus and Libra base (through Gemini and Capricorn)"
```

**Example for MERCURY:**
```
"MERCURY is Pisces, with Scorpio spark in Cancer decan, expressed through Aquarius with Gemini and Virgo base (through Cancer and Sagittarius)"
```

### Ruler Sentence
When the planet has a ruler, generate a second sentence for the ruler:
```
"{RULER} in {rulerSign}, with {rulerSpark} spark in {rulerDecan} decan, expressed through {rulerExpressed} with {rulerBase} base (through {rulerThrough})"
```

### Combined Full Sentence (Sentence2 format)
```
"{PLANET} {existencePhrase} based on {basePhrase} through {throughPhrase} directed into {directedInto} expressed through {expressedThrough}, going into {goingInto} (with {withPhrase} and {andPhrase}), expressed through {finalExpression}."
```

---

## Word/Meaning Lookups (ListOption tables)

Each planet and sign has associated keywords/meanings:

### Planet Keywords (ListOption_PLANET)
Each planet has a list of associated concepts:
- MOON: Agriculture, Ancestry, Bedroom, Caring, Domestication, Emotional Attachment...
- SUN: Amusement, Appreciation, Celebration, Character, Children, Confidence...
- VENUS: Art, Beauty, Books, Comfort, Dairy, Finance, Food...
- etc.

### Sign Keywords (ListOption_SIGN)
Each sign has associated concepts:
- Aries: Action, Aggression, Assertion, Beginnings, Blood, Bravery...
- Taurus: Art, Beauty, Book, Comfort, Dairy, Finance...
- etc.

---

## Implementation Pseudocode

```javascript
function calculateSparkReading(planet, sign, degree, rising) {
  // 1. Get Spark and Decan from degree/sign
  const degreeKey = `${degree}°-${sign}`;
  const sparkData = sparkDatabase.find(r => r.Helper === degreeKey);
  const spark = sparkData.Spark;
  const decan = sparkData.Decan;
  const decanPlanet = sparkData.Decan_Planets;
  
  // 2. Get TruePlacement data from DB1
  const tpKey = `${planet}-${sign}-${rising}`;
  const tpData = truePlacementDB1.find(r => r.Helper === tpKey);
  const isSign = tpData.IS_sign;
  const expressedThrough = tpData.Sign2;
  const baseHouse1 = tpData.BASE_house;
  const baseSign1 = tpData.BASE_sign;
  const throughSign1 = tpData.Sign3;
  
  // 3. SPECIAL CASE: Venus and Mercury have dual rulership
  let baseSign2 = null;
  let throughSign2 = null;
  let hasDualBase = false;
  
  if (planet === 'VENUS' || planet === 'MERCURY') {
    hasDualBase = true;
    const tp2Data = truePlacementDB2.find(r => r.Helper === tpKey);
    if (tp2Data) {
      baseSign2 = tp2Data.BASE_sign_2;    // Second base (Libra for Venus, Virgo for Mercury)
      throughSign2 = tp2Data.Sign_ruler_2; // Second through sign
    }
  }
  
  // 4. Generate sentence based on planet type
  let sentence;
  if (hasDualBase && baseSign2) {
    // VENUS or MERCURY - dual base format
    sentence = `${planet} is ${isSign}, with ${spark} spark in ${decan} decan, ` +
               `expressed through ${expressedThrough} with ${baseSign1} and ${baseSign2} base ` +
               `(through ${throughSign1} and ${throughSign2})`;
  } else {
    // All other planets - single base format
    sentence = `${planet} is ${isSign}, with ${spark} spark in ${decan} decan, ` +
               `expressed through ${expressedThrough} with ${baseSign1} base ` +
               `(through ${throughSign1})`;
  }
  
  // 5. Get ruler of the sign and generate ruler sentence if needed
  const ruler = SIGN_RULERS[sign];
  // ... similar lookup for ruler ...
  
  return {
    planet,
    isSign,
    spark,
    decan,
    expressedThrough,
    baseSign1,
    baseSign2,       // null for non-Venus/Mercury
    throughSign1,
    throughSign2,    // null for non-Venus/Mercury
    hasDualBase,
    sentence,
  };
}
```

---

## Constants

### All Planets
```javascript
const PLANETS = ['MOON', 'SUN', 'VENUS', 'MERCURY', 'MARS', 'PLUTO', 'JUPITER', 'SATURN', 'URANUS', 'NEPTUNE'];
```

### All Signs
```javascript
const SIGNS = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
```

### Degrees
```javascript
const DEGREES = Array.from({length: 30}, (_, i) => `${i}°`);
// ["0°", "1°", "2°", ... "29°"]
```

### Houses
```javascript
const HOUSES = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
```

---

## Database Files
The following JSON files contain the complete databases:
- `spark_database.json` - 360 records for Degree+Sign → Spark/Decan lookup
- `trueplacement_db1.json` - 1440 records for Planet+Sign+Rising → placements
- `trueplacement_db2.json` - 288 records for VENUS/MERCURY second ruler data

---

## Additional Notes

1. **Decan Calculation**: Each sign is divided into 3 decans of 10° each:
   - 0°-9°: First decan (same sign)
   - 10°-19°: Second decan
   - 20°-29°: Third decan

2. **House Calculation**: Houses are calculated based on the relationship between planet sign and rising sign.

3. **Error Handling**: When lookups fail, display "Not Found" as seen in the Excel formulas using IFERROR.

4. **Ruler Chain**: Some implementations track the ruler of the sign the planet is in, creating a chain of planetary influences.
