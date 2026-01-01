const fs = require('fs');
const path = require('path');

// Read the SVG file
const svgContent = fs.readFileSync(
  path.join(__dirname, '../Throw/vecteezy_golden-zodiac-signs-on-a-black-background_7633103.svg'),
  'utf-8'
);

// Extract clip paths with their path data
const clipPathRegex = /<clipPath id="clip-(\d+)">\s*<path[^>]*d="([^"]+)"/g;
const clipPaths = [];
let match;

while ((match = clipPathRegex.exec(svgContent)) !== null) {
  clipPaths.push({
    id: parseInt(match[1]),
    path: match[2]
  });
}

console.log(`Found ${clipPaths.length} clip paths\n`);

// Separate bounding boxes (rectangular) from symbol paths (complex)
const isRectangle = (path) => {
  // Rectangle paths have the form "M x y L x y L x y L x y Z"
  const parts = path.trim().split(/\s+/);
  return parts.length < 20 && path.includes(' L ') && !path.includes(' C ');
};

const bboxes = [];
const symbolPaths = [];

clipPaths.forEach(cp => {
  if (isRectangle(cp.path)) {
    bboxes.push(cp);
  } else {
    symbolPaths.push(cp);
  }
});

console.log(`Found ${bboxes.length} bounding boxes and ${symbolPaths.length} symbol paths\n`);

// Parse bounding boxes
const parsedBboxes = bboxes.map(bb => {
  const match = bb.path.match(/M\s+([\d.]+)\s+([\d.]+)\s+L\s+([\d.]+)\s+([\d.]+)\s+L\s+([\d.]+)\s+([\d.]+)/);
  if (match) {
    const x1 = parseFloat(match[1]);
    const y1 = parseFloat(match[2]);
    const x2 = parseFloat(match[5]);
    const y2 = parseFloat(match[6]);
    return { id: bb.id, x: x1, y: y1, width: x2 - x1, height: y2 - y1 };
  }
  return null;
}).filter(Boolean);

// Calculate bounding box for each symbol path
function getPathBounds(pathData) {
  const coords = pathData.match(/-?\d+\.?\d*/g).map(parseFloat);
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  for (let i = 0; i < coords.length; i += 2) {
    if (i + 1 < coords.length) {
      minX = Math.min(minX, coords[i]);
      maxX = Math.max(maxX, coords[i]);
      minY = Math.min(minY, coords[i + 1]);
      maxY = Math.max(maxY, coords[i + 1]);
    }
  }

  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

// Create symbols array with calculated bounds
const symbols = symbolPaths.map((sp, i) => {
  const bounds = getPathBounds(sp.path);
  return {
    index: i,
    symbolId: sp.id,
    ...bounds,
    path: sp.path
  };
}).filter(s => s.width > 100 && s.height > 100); // Filter out small artifacts

console.log(`Extracted ${symbols.length} symbols:\n`);

// Sort by position to determine zodiac order (left to right, top to bottom)
symbols.sort((a, b) => {
  // First by row (y position, roughly)
  const rowA = Math.floor(a.y / 500);
  const rowB = Math.floor(b.y / 500);
  if (rowA !== rowB) return rowA - rowB;
  // Then by column (x position)
  return a.x - b.x;
});

const ZODIAC_NAMES = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

symbols.forEach((s, i) => {
  console.log(`${i}: ${ZODIAC_NAMES[i] || 'Unknown'} - bbox(${s.x}, ${s.y}, ${s.width}x${s.height})`);
});

// Function to normalize a path to a 0-100 viewBox
function normalizePath(pathData, bbox) {
  const { x, y, width, height } = bbox;
  const scale = 100 / Math.max(width, height);
  const offsetX = (100 - width * scale) / 2;
  const offsetY = (100 - height * scale) / 2;

  // Replace all coordinate pairs
  return pathData.replace(
    /(-?\d+\.?\d*)\s+(-?\d+\.?\d*)/g,
    (match, xCoord, yCoord) => {
      const newX = ((parseFloat(xCoord) - x) * scale + offsetX).toFixed(2);
      const newY = ((parseFloat(yCoord) - y) * scale + offsetY).toFixed(2);
      return `${newX} ${newY}`;
    }
  );
}

console.log('\n\n// Normalized SVG paths for React:\n');
console.log('const ZODIAC_SVG_PATHS: Record<string, string> = {');

symbols.slice(0, 12).forEach((s, i) => {
  const name = ZODIAC_NAMES[i];
  const normalizedPath = normalizePath(s.path, s);
  console.log(`  ${name}: \`${normalizedPath}\`,\n`);
});

console.log('};');
