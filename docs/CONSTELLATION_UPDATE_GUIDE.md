# Constellation Data Update Guide

## File Location
`background/constellationData.js`

## Task
Update constellation star positions and connections to match reference images from `Throw/constellation-simple/*.jpg`

---

## Constellation Entry Structure

```javascript
"CONSTELLATION_NAME": {
    "name": "Display Name",
    "meaning": "Meaning",
    "stars": [
        [x, y, size],  // size: 1=normal, 2=bright, 3+=brighter
        [x, y, size],
        ...
    ],
    "connections": [
        [starIndex1, starIndex2],  // 0-based indices
        ...
    ],
    "sprite": {
        // KEEP THIS SECTION - just update starIndex values if needed
    }
},
```

---

## How to Update a Constellation

### 1. User provides data like:
```
Constellation: AQUILA

Stars:
[28, 43],
[33, 33],
[33, 33],
[38, 25]

Connections:
[0, 1],
[1, 3]
```

### 2. Identify duplicates (= bright stars)
Duplicate coordinates mean the star should be bright (size 2).
- `[33, 33]` appears twice → bright star

### 3. Convert to final format
Remove duplicates, add sizes, update indices:

**Stars:**
- Remove duplicate entries
- Add `, 2` to stars that were duplicated (bright)
- Add `, 1` to stars that weren't duplicated (normal)

**Connections:**
- When you remove a star at index N, all indices > N shift down by 1
- Apply this shift to ALL connection indices

### 4. Find and replace in file
```bash
# Search for the constellation
grep -n '"CONSTELLATION_NAME":' background/constellationData.js
```

### 5. Edit the entry
Replace the `stars` and `connections` arrays. Keep `name`, `meaning`, and `sprite` sections.

Update `sprite.anchors[*].starIndex` values if star count changed significantly.

---

## Index Mapping Example

Original (with duplicates at indices 2, 5, 7):
```
0: [28, 43]
1: [33, 33]
2: [33, 33]  ← REMOVE
3: [38, 25]
4: [58, 56]
5: [58, 56]  ← REMOVE
6: [78, 13]
7: [78, 13]  ← REMOVE
8: [85, 7]
```

New mapping:
```
Old → New
0   → 0
1   → 1
2   → REMOVED
3   → 2  (shifted -1)
4   → 3  (shifted -1)
5   → REMOVED
6   → 4  (shifted -2)
7   → REMOVED
8   → 5  (shifted -3)
```

Apply to connections:
- `[3, 4]` → `[2, 3]`
- `[6, 8]` → `[4, 5]`

---

## If User Provides Sizes Directly

```
Stars:
[7, 16, 2],
[48, 12, 2],
[83, 38, 1]

Connections:
[0, 1],
[1, 2]
```

**No conversion needed!** Just paste directly into the file.

---

## Step-by-Step Commands

```javascript
// 1. Search for constellation
Grep: pattern='"AQUILA":' path='background/constellationData.js' -A 100

// 2. Edit the stars and connections arrays
Edit: file_path='background/constellationData.js'
      old_string='[old stars and connections]'
      new_string='[new stars and connections with sizes]'
```

---

## Quick Checklist

- [ ] Identify duplicate coordinates → these are bright stars (size 2)
- [ ] Remove duplicate entries from stars array
- [ ] Add size value to each star: `[x, y, 1]` or `[x, y, 2]`
- [ ] Recalculate connection indices after removing duplicates
- [ ] Update the constellation in `background/constellationData.js`
- [ ] Keep the sprite section, update anchor starIndex if needed

---

## Reference Image Location
`Throw/constellation-simple/{constellation-name}.jpg`

Example: `Throw/constellation-simple/aquila.jpg`

Key format: lowercase, hyphens for spaces/underscores
- URSA_MAJOR → ursa-major.jpg
- CORONA_BOREALIS → corona-borealis.jpg
