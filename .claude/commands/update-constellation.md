# Update Constellation Command

Update a constellation in constellationData.js with new star positions and connections from the editor.

## Instructions

The user will provide:
1. **Constellation name** (e.g., "ORION", "CASSIOPEIA", "URSA_MAJOR")
2. **Stars array** - format: `[x, y, size]` where size is 1 (normal) or 2+ (brighter)
3. **Connections array** - format: `[starIndex1, starIndex2]`

## Your Task

1. Find the constellation in `background/constellationData.js` by searching for `"CONSTELLATION_NAME": {`
2. Replace the `"stars"` array with the new stars data
3. Replace the `"connections"` array with the new connections data
4. Keep the existing `"name"`, `"meaning"`, and `"sprite"` properties unchanged
5. Update the sprite anchor starIndex values if needed (use first and last star indices that make sense)
6. Confirm the update was successful

## Format Expected from User

```
Constellation: CONSTELLATION_NAME

Stars:
[x, y, size],
[x, y, size],
...

Connections:
[i, j],
[i, j],
...
```

## Important Notes

- Stars with size 2+ are brighter/larger stars
- Default size is 1 if not specified
- Connection indices are 0-based
- Preserve the sprite configuration but update anchor indices if star count changed significantly
- After updating, remind user to check `constellation-compare.html` to verify

Now process the user's constellation data:

$ARGUMENTS
