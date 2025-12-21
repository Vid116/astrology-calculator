# Spark Converter Calculator - How It Works

This document explains the logic and calculations behind each calculator in the Spark Converter application.

---

## Overview

The application has three calculators:
1. **Spark Calculator** - Calculates the Spark sign and Decan for a planet at a specific degree
2. **True Placement Calculator** - Calculates the full astrological placement including house, bases, and expressions
3. **Profection Years Calculator** - Calculates annual profections based on age and rising sign

---

## 1. Spark Calculator

### Purpose
Determines the "Spark" (sub-sign influence) and "Decan" for any planet at a specific degree of a zodiac sign.

### Inputs
| Field | Description | Options |
|-------|-------------|---------|
| Planet | The celestial body | MOON, SUN, VENUS, MERCURY, MARS, PLUTO, JUPITER, SATURN, URANUS, NEPTUNE, or custom |
| Sign | The zodiac sign | Aries through Pisces |
| Degree | Position within the sign | 0 to 29 |

### How It Works

1. **Decan System**: Each zodiac sign (30 degrees) is divided into three decans of 10 degrees each:
   - **1st Decan (0-9 degrees)**: Ruled by the sign itself
   - **2nd Decan (10-19 degrees)**: Ruled by the next sign of the same element
   - **3rd Decan (20-29 degrees)**: Ruled by the third sign of the same element

2. **Spark Lookup**: The spark is a secondary zodiac influence based on the exact degree. It's pre-computed in `spark_database.json` for all 360 degree positions (30 degrees x 12 signs).

3. **Database Lookup**:
   ```
   Key: "{Degree}-{Sign}" (e.g., "15-Leo")
   Returns: Spark sign, Decan sign, Decan ruling planet
   ```

### Output
- **Spark Sign**: The secondary zodiac influence at that degree
- **Decan**: Which decan (zodiac sign) rules this portion
- **Decan Planets**: The planetary ruler(s) of the decan

### Example
```
Input: SUN at 15 degrees Leo
Output:
- Spark: Sagittarius
- Decan: Sagittarius (2nd decan of Leo)
- Decan Planet: JUPITER
```

---

## 2. True Placement Calculator

### Purpose
Calculates the complete "True Placement" of a planet - showing which house and sign the planet truly operates through based on the rising sign (ascendant).

### Inputs
| Field | Description | Options |
|-------|-------------|---------|
| Planet | The celestial body | MOON, SUN, VENUS, MERCURY, MARS, PLUTO, JUPITER, SATURN, URANUS, NEPTUNE |
| Sign | The sign the planet is in | Aries through Pisces |
| Degree | Position within the sign | 0 to 29 |
| Rising Sign | The ascendant sign | Aries through Pisces |

### How It Works

1. **House Calculation**: Uses whole sign house system where the rising sign equals the 1st house. The planet's sign position relative to the rising sign determines its house.

2. **Database Lookup**: Searches `true_placement_db1.json` using a composite key:
   ```
   Key: "{Planet}-{Sign}-{Rising}" (e.g., "MARS-Aries-Scorpio")
   ```

3. **Fields Retrieved**:
   | Field | Description |
   |-------|-------------|
   | IS_house | House number where planet resides (1st-12th) |
   | IS_sign | The sign associated with that house position |
   | Sign2 | "Expressed Through" - how the energy manifests |
   | BASE_house | The foundational house influence |
   | BASE_sign | The foundational sign influence |
   | Sign3 | "Through" - the pathway of expression |

4. **Spark Integration**: Also looks up spark and decan from `spark_database.json` using degree + sign.

### Special Case: Venus and Mercury (Dual Rulership)

Venus and Mercury each rule TWO zodiac signs:
- **VENUS** rules **Taurus** AND **Libra**
- **MERCURY** rules **Gemini** AND **Virgo**

Because of this dual rulership, they have TWO base positions:

| Field | Description |
|-------|-------------|
| BASE_sign | First base (Taurus for Venus, Gemini for Mercury) |
| Sign3 | First "through" sign |
| Sign5 | Second base (Libra for Venus, Virgo for Mercury) |
| Sign6 | Second "through" sign |

### Output Sentence Format

**For Regular Planets (MOON, SUN, MARS, etc.):**
```
"{PLANET} is {IS_sign}, with {Spark} spark in {Decan} decan,
expressed through {Sign2} with {BASE_sign} base (through {Sign3})"
```

**For Venus/Mercury (Dual Rulers):**
```
"{PLANET} is {IS_sign}, with {Spark} spark in {Decan} decan,
expressed through {Sign2} with {BASE_sign} and {Sign5} base
(through {Sign3} and {Sign6})"
```

### Example

**Input:**
- Planet: VENUS
- Sign: Aries
- Degree: 20
- Rising: Aries

**Output:**
```
VENUS is Aries, with Sagittarius spark in Leo decan,
expressed through Aries with Taurus and Libra base
(through Taurus and Libra)
```

---

## 3. Profection Years Calculator

### Purpose
Calculates Annual Profections - an ancient timing technique that activates different houses/signs each year of life in a 12-year cycle.

### Inputs
| Field | Description |
|-------|-------------|
| Birth Date | Your date of birth |
| Rising Sign | The ascendant sign |

### How It Works

1. **Age Calculation**: Determines current age from birth date, adjusting if birthday hasn't occurred yet this year.

2. **The Profection Cycle**: Each year activates a different house:
   | Age | House | Notes |
   |-----|-------|-------|
   | 0 | 1st | Birth year - Rising sign activated |
   | 1 | 2nd | |
   | 2 | 3rd | |
   | ... | ... | |
   | 11 | 12th | |
   | 12 | 1st | Cycle repeats |
   | 13 | 2nd | |

3. **Formula**:
   ```
   Current House Index = Age % 12
   (0 = 1st house, 1 = 2nd house, etc.)
   ```

4. **Sign Activation**: The activated sign depends on the rising sign:
   - If Rising = Aries: 1st house = Aries, 2nd = Taurus, 3rd = Gemini...
   - If Rising = Leo: 1st house = Leo, 2nd = Virgo, 3rd = Libra...

### Output
- Current age
- Current profection house (1st through 12th)
- Activated sign for this year
- Full 24-year profection table

### Example
```
Input: Born January 15, 1990, Rising Sign = Scorpio
Current Age: 34

Calculation: 34 % 12 = 10 (index 10 = 11th house)
11th house from Scorpio = Virgo

Output: "You are 34 years old, in your 11th house profection year,
activated through the sign of Virgo"
```

---

## Database Files

| File | Records | Purpose |
|------|---------|---------|
| `spark_database.json` | 360 | Degree + Sign to Spark/Decan lookup |
| `true_placement_db1.json` | 1440 | Planet + Sign + Rising to placements |
| `true_placement_db2.json` | 288 | Venus/Mercury extended dual base data |
| `profection_data.json` | - | House-to-sign mappings for each rising |
| `planet_meanings.json` | - | Keywords for each planet |
| `sign_meanings.json` | - | Keywords for each zodiac sign |

---

## Sign Rulers Reference

| Sign | Ruling Planet |
|------|---------------|
| Aries | MARS |
| Taurus | VENUS |
| Gemini | MERCURY |
| Cancer | MOON |
| Leo | SUN |
| Virgo | MERCURY |
| Libra | VENUS |
| Scorpio | PLUTO |
| Sagittarius | JUPITER |
| Capricorn | SATURN |
| Aquarius | URANUS |
| Pisces | NEPTUNE |

---

## Technical Implementation

The calculator is implemented in `calculator.js` with the following structure:

1. **Data Loading** (lines 292-317): Loads all JSON databases on page load
2. **Spark Calculator** (lines 358-432): Form handler and database lookup
3. **True Placement Calculator** (lines 462-600): Form handler with dual base detection
4. **Profection Calculator** (lines 614-758): Age calculation and table generation

All form submissions include validation for required fields and proper value ranges.
