'use client';

import { useState, useRef, useEffect } from 'react';
import type { ProfectionResult } from '@/types/astrology';

interface ProfectionWheelProps {
  result: ProfectionResult;
}

// SVG paths for zodiac symbols extracted from vecteezy vector file
// ViewBox is 0 0 100 100, paths are filled
const ZODIAC_SVG_PATHS: Record<string, React.ReactNode> = {
  Aries: (
    <path
      fill="currentColor"
      d="M 50 52.76 C 51.54 42.62 51.67 29.65 55.65 19.64 C 57.96 14.12 61.04 9.76 65.79 7.06 C 78.11 0 97.24 7.7 94.93 23.23 C 93.9 30.04 85.3 34.28 79.27 30.81 C 78.24 30.17 77.21 29.27 76.32 28.37 C 77.86 28.24 79.4 28.24 80.81 27.98 C 86.46 26.57 85.3 17.59 79.65 16.82 C 67.46 15.02 65.4 31.71 63.35 40.18 C 58.22 59.95 54.36 79.97 50 100 C 45.64 79.97 41.78 59.95 36.65 40.18 C 34.47 31.71 32.54 15.02 20.35 16.82 C 14.7 17.59 13.41 26.57 19.19 27.98 C 20.6 28.24 22.14 28.24 23.68 28.37 C 22.79 29.27 21.76 30.17 20.6 30.81 C 14.57 34.28 6.1 30.04 5.07 23.23 C 2.76 7.7 21.76 0 34.08 7.06 C 38.96 9.76 42.04 14.12 44.22 19.64 C 48.33 29.65 48.46 42.62 50 52.76"
    />
  ),
  Taurus: (
    <path
      fill="currentColor"
      d="M 26.34 91.22 C 10.98 77.68 12.68 52.44 34.76 43.66 C 35.73 43.29 36.71 42.93 37.8 42.56 C 32.2 40.85 27.07 39.39 21.95 36.71 C 16.83 33.9 12.93 30.12 10.37 24.76 C 9.39 22.68 8.9 20.73 8.78 18.78 L 8.78 16.59 C 9.39 8.66 16.34 2.32 24.63 0 C 23.41 1.83 22.07 3.41 20.85 5.12 C 16.95 10.85 15.85 16.83 19.51 22.68 C 22.93 28.41 28.05 30.85 34.27 32.68 C 36.59 33.29 39.02 33.9 41.22 34.63 C 44.27 35.61 47.07 36.83 50 37.8 L 50 46.71 C 48.29 47.32 46.71 47.93 45 48.54 C 40.98 50.12 37.07 51.83 33.9 54.39 C 29.39 58.05 26.71 63.78 26.71 69.51 C 26.71 75.73 30 81.46 34.88 85.24 C 39.15 88.41 44.51 90 50 90 L 50 100 C 41.46 100 32.93 97.07 26.34 91.22 Z M 50 37.8 C 52.93 36.83 55.85 35.61 58.78 34.63 C 61.1 33.9 63.41 33.29 65.73 32.68 C 72.07 30.85 77.07 28.41 80.61 22.68 C 84.27 16.83 83.17 10.85 79.15 5.12 C 77.93 3.41 76.59 1.83 75.49 0 C 83.66 2.32 90.73 8.66 91.22 16.59 L 91.22 18.78 C 91.1 20.73 90.61 22.68 89.63 24.76 C 87.2 30.12 83.29 33.9 78.05 36.71 C 73.05 39.39 67.8 40.85 62.32 42.56 C 63.29 42.93 64.27 43.29 65.37 43.66 C 86.1 51.95 88.78 74.88 76.1 88.78 C 69.39 96.34 59.76 100 50 100 L 50 90 C 61.71 89.88 73.42 82.68 73.29 69.51 C 73.29 63.78 70.73 58.05 66.1 54.39 C 62.93 51.83 59.15 50.12 55.12 48.54 C 53.41 47.93 51.71 47.32 50 46.71 L 50 37.8"
    />
  ),
  Gemini: (
    <g transform="translate(2, 0) scale(3)">
      <path
        fill="currentColor"
        d="M21.653,23.901V8.266c2.225-0.496,3.968-1.356,5.188-2.591c1.69-1.711,1.757-3.476,1.753-3.812c-0.013-1.007-0.814-1.777-1.821-1.813c-1.017-0.028-1.862,0.778-1.941,1.781c-0.085,1.099-1.918,3.171-8.234,3.171c-6.448,0-8.56-2.188-8.778-3.354c-0.13-1.003-1.024-1.754-2.046-1.635c-1.035,0.097-1.795,1.014-1.698,2.05c0.021,0.209,0.482,4.043,6.009,5.814v16.055c-6.151,1.666-6.646,5.791-6.667,6.01c-0.095,1.004,0.625,1.863,1.625,1.998c0.997,0.135,1.936-0.58,2.114-1.572c0.208-1.165,2.313-3.365,8.78-3.365c6.316,0,8.149,2.073,8.234,3.097c-0.013,1.038,0.82,1.892,1.859,1.902c0.007,0,0.016,0,0.021,0c1.028,0,1.87-0.829,1.882-1.859c0.003-0.336-0.062-2.102-1.753-3.812C25.086,25.221,23.562,24.415,21.653,23.901z M13.847,23.311V8.619c0.849,0.087,1.744,0.147,2.747,0.147c0.446,0,0.87-0.02,1.294-0.037v14.577c-0.626-0.043-1.272-0.07-1.952-0.07C15.197,23.235,14.501,23.262,13.847,23.311z"
      />
    </g>
  ),
  Cancer: (
    <>
      <path
        fill="currentColor"
        d="M 20 35 C 12 40 8 50 12 60 C 16 70 28 75 40 70 C 35 65 32 58 35 50 C 38 42 48 38 58 42 C 52 35 42 32 32 35 C 28 36 24 38 20 42"
      />
      <path
        fill="currentColor"
        d="M 80 65 C 88 60 92 50 88 40 C 84 30 72 25 60 30 C 65 35 68 42 65 50 C 62 58 52 62 42 58 C 48 65 58 68 68 65 C 72 64 76 62 80 58"
      />
    </>
  ),
  Leo: (
    <path
      fill="currentColor"
      d="M 29.90 12.33 C 24.22 17.36 20.36 24.44 20.15 33.23 C 20.04 40.09 22.29 47.70 25.72 53.48 C 26.26 54.45 26.80 55.31 27.44 56.27 C 28.19 57.23 28.72 58.63 27.12 59.06 C 23.37 59.91 20.36 60.66 17.36 63.45 C 13.93 66.67 12.33 71.92 13.50 76.53 C 15.11 82.96 20.26 87.78 26.80 88.64 C 27.87 88.85 28.83 88.85 29.90 88.85 L 29.90 77.49 C 26.58 77.49 24.22 74.60 24.22 71.28 C 24.22 69.99 24.54 68.81 25.62 67.74 C 26.69 66.67 28.08 66.02 29.47 65.92 C 29.69 65.81 29.80 65.81 29.90 65.81 Z M 63.24 17.36 C 67.52 19.62 70.95 23.15 72.56 27.76 C 74.71 33.98 73.85 40.84 71.92 47.05 C 68.49 57.34 63.24 67.10 61.74 78.14 C 61.20 82.10 61.31 86.60 62.70 90.46 C 64.74 95.93 69.56 99.68 75.46 99.79 C 83.28 100.00 86.50 95.61 86.28 88.75 C 86.28 86.39 83.92 85.32 83.92 88.21 C 83.82 89.39 83.71 90.57 83.39 91.75 C 81.99 95.61 77.49 94.86 75.24 92.28 C 73.53 90.46 72.78 87.78 72.67 85.42 C 72.35 79.53 74.49 73.31 76.53 67.85 C 79.31 60.24 81.99 52.63 84.24 44.91 C 87.67 33.01 84.46 21.01 76.85 13.08 C 64.42 0.00 42.55 1.07 29.90 12.33 L 29.90 65.81 C 34.94 65.60 37.62 72.24 34.08 75.67 C 33.01 76.74 31.94 77.39 30.76 77.49 C 30.44 77.49 30.22 77.49 29.90 77.49 L 29.90 88.85 C 34.62 88.64 39.34 86.49 42.44 82.74 C 44.69 80.06 45.77 76.53 45.66 72.13 C 45.55 66.45 42.98 61.31 40.09 56.48 C 37.94 52.84 35.91 50.16 34.41 46.20 C 32.05 39.66 30.87 30.33 34.62 24.01 C 40.09 15.22 53.38 12.22 63.24 17.36"
    />
  ),
  Virgo: (
    <path
      fill="currentColor"
      d="M 0.00 11.37 L 10.42 11.37 L 10.42 18.49 L 12.83 16.78 L 13.73 16.08 C 17.84 13.38 21.94 10.77 27.05 10.87 C 30.36 10.97 33.17 12.48 35.27 14.68 C 38.38 18.09 41.68 17.38 45.29 14.98 C 48.80 12.67 52.50 10.77 56.91 10.87 C 60.22 10.97 63.03 12.48 65.13 14.68 C 68.54 18.39 71.94 17.08 75.75 14.58 C 77.05 13.78 78.46 12.98 79.86 12.37 L 79.86 19.69 C 72.44 20.79 70.14 28.71 70.14 35.42 L 70.14 69.49 C 71.34 69.69 72.54 69.89 73.85 70.09 C 75.35 70.29 77.55 70.69 79.86 70.79 L 79.86 79.41 C 76.65 79.41 73.35 79.21 70.14 79.01 L 70.14 89.23 L 59.72 89.23 L 59.72 78.71 C 58.22 78.71 56.61 78.91 55.11 79.21 C 52.10 79.81 50.00 81.11 48.00 83.42 C 47.59 83.92 46.79 84.62 46.09 84.42 C 45.39 84.32 45.29 83.32 45.49 82.51 C 46.19 80.51 48.20 78.11 49.50 76.50 C 52.30 73.40 55.81 70.79 59.72 69.59 L 59.72 32.41 C 59.72 25.40 59.82 18.99 51.00 19.59 C 42.79 20.09 40.28 28.41 40.28 35.42 L 40.28 77.81 L 29.86 77.81 L 29.86 32.41 C 29.86 25.40 29.96 18.99 21.14 19.59 C 13.33 20.09 10.42 27.91 10.42 34.82 L 10.42 77.81 L 0.00 77.81"
    />
  ),
  Libra: (
    <>
      {/* Bottom horizontal line */}
      <path
        fill="currentColor"
        d="M 10 75 L 90 75 L 90 82 L 10 82 Z"
      />
      {/* Top line with semicircle bump */}
      <path
        fill="currentColor"
        d="M 10 55 L 35 55 C 35 40 45 30 50 30 C 55 30 65 40 65 55 L 90 55 L 90 62 L 62 62 C 60 50 55 42 50 42 C 45 42 40 50 38 62 L 10 62 Z"
      />
    </>
  ),
  Scorpio: (
    <path
      fill="currentColor"
      d="M 0 7.9 L 11.18 7.9 L 11.18 15.11 C 12.26 14.78 13.33 14.25 14.19 13.71 C 18.06 11.13 22.15 8.87 26.99 9.09 C 30.11 9.09 33.01 10.38 35.27 12.53 C 35.59 12.96 36.02 13.28 36.34 13.71 C 38.49 16.4 42.15 15.32 44.73 13.6 C 48.49 11.02 52.58 8.87 57.31 9.09 C 63.33 9.19 67.74 13.39 69.57 18.98 C 71.08 23.39 71.5 27.47 71.5 32.1 L 71.5 75.86 C 71.5 78.33 71.4 80.05 73.23 81.99 C 74.52 83.28 76.13 83.82 78.28 83.06 C 81.29 82.1 84.3 78.01 86.56 75.86 L 83.44 75.97 C 82.15 76.08 80.11 76.29 79.14 75.32 C 78.06 74.25 78.82 73.17 80 72.96 C 83.33 72.2 86.24 71.13 89.25 69.62 C 91.61 68.44 93.76 67.37 95.81 65.75 C 98.71 63.71 100 64.57 98.49 67.8 C 97.74 69.52 97.1 71.13 96.56 72.96 C 95.7 75.75 95.16 78.66 94.41 81.56 C 94.19 82.85 93.87 84.25 93.33 85.54 C 92.26 88.23 90.11 85.11 89.79 83.6 C 89.46 81.88 89.46 80.16 89.46 78.44 C 87.1 81.45 84.84 84.57 82.26 87.37 C 77.74 92.1 70 91.99 64.95 87.9 C 60 83.93 60.43 78.33 60.43 72.74 L 60.43 32.1 C 60.43 24.57 60.43 17.8 50.97 18.33 C 41.51 18.98 41.18 24.57 41.18 32.1 L 41.18 79.19 L 30 79.19 L 30 32.1 C 30 24.57 30.11 17.8 20.64 18.33 C 11.72 18.87 11.18 23.49 11.18 30.59 L 11.18 79.19 L 0 79.19 L 0 7.9"
    />
  ),
  Sagittarius: (
    <path
      fill="currentColor"
      d="M 61.21 24.83 L 32.95 69.22 L 21.51 62.01 L 16.7 69.57 L 28.03 76.89 L 17.05 94.16 L 26.2 100 L 37.19 82.72 L 48.63 89.93 L 53.43 82.38 L 41.99 75.06 L 70.48 30.32 C 70.94 33.07 71.62 35.35 72.88 37.99 C 73.8 39.7 75.86 40.62 75.63 37.99 C 75.63 37.41 75.51 36.73 75.51 36.16 C 75.4 24.71 78.15 12.81 82.38 2.29 C 83.3 0 81.69 0 80.21 1.37 C 79.06 2.4 77.92 3.55 76.89 4.69 C 73 8.58 69.11 12.47 64.87 15.9 C 61.1 18.99 57.44 21.28 52.98 23.23 C 52.06 23.68 51.26 23.91 50.57 24.71 C 49.54 25.86 50.69 26.66 51.83 26.77 C 54.81 27.12 58.12 25.74 61.21 24.83"
    />
  ),
  Capricorn: (
    <path
      fill="currentColor"
      d="M 60.65 32.31 C 59.62 33.48 58.44 34.65 57.41 35.83 C 55.65 37.89 56.09 37.74 57.71 37.59 C 58.59 37.59 59.62 37.44 60.65 37.59 L 60.65 47.14 C 57.12 45.81 53.74 45.37 49.63 45.23 C 48.9 46.55 48.31 47.87 47.72 49.19 C 45.67 53.16 44.35 57.86 44.05 62.41 C 43.91 68.14 45.52 74.01 48.75 78.71 C 51.84 82.97 55.65 85.17 60.65 85.76 L 60.65 100 C 54.33 100 47.87 98.24 42.44 94.27 C 32.31 86.78 28.78 71.81 31.28 59.47 C 31.86 56.09 33.04 52.86 35.09 49.78 C 37.88 45.23 33.33 46.4 30.69 46.99 C 24.08 48.31 17.18 50.81 11.89 55.21 C 9.25 57.27 6.9 54.63 8.81 51.98 C 9.55 51.1 10.43 50.51 11.45 49.78 C 19.82 43.46 28.78 41.41 38.91 39.35 C 41.56 38.77 42.73 38.91 44.49 36.86 C 47.43 33.04 51.25 29.81 54.77 26.73 C 56.68 24.96 58.74 23.35 60.65 21.59 Z M 27.75 1.62 C 28.63 1.62 29.37 1.62 30.1 1.76 C 36.56 2.2 43.17 2.2 49.63 2.2 C 53.3 2.2 56.97 2.2 60.65 2.2 L 60.65 12.63 C 54.04 13.22 47.28 13.66 40.53 13.95 C 36.27 14.1 32.16 14.24 27.9 14.24 C 25.7 14.24 25.4 13.95 25.26 11.75 C 25.26 9.1 25.26 6.46 25.26 3.82 C 25.26 1.47 25.7 1.47 27.75 1.62 Z M 60.65 37.59 C 61.97 37.59 63.14 37.59 64.46 37.74 C 79.59 39.5 91.92 52.57 92.95 67.55 L 92.95 71.66 C 92.95 72.39 92.8 72.98 92.66 73.72 C 90.45 89.28 75.62 99.71 60.65 100 L 60.65 85.76 C 60.94 85.76 61.23 85.76 61.53 85.76 C 76.21 86.64 80.91 70.63 74.6 59.32 C 72.1 54.92 68.58 51.39 64.17 48.75 C 62.99 48.16 61.82 47.58 60.65 47.14 Z M 60.65 2.2 C 70.04 2.2 79.44 2.06 88.69 0.44 C 91.48 0 93.1 1.32 91.34 3.52 C 86.93 9.1 79.74 14.24 74.45 18.94 C 69.6 23.35 65.05 27.61 60.65 32.31 L 60.65 21.59 C 63.44 19.38 66.23 17.18 69.16 15.13 C 69.9 14.54 70.78 13.8 70.04 12.78 C 69.31 11.75 66.67 12.33 65.64 12.33 C 64.02 12.48 62.41 12.63 60.65 12.63 L 60.65 2.2"
    />
  ),
  Aquarius: (
    <>
      {/* Top wave - curves outward */}
      <path
        fill="currentColor"
        d="M 0 30 Q 12 20 25 30 Q 38 40 50 30 Q 62 20 75 30 Q 88 40 100 30 L 100 38 Q 88 48 75 38 Q 62 28 50 38 Q 38 48 25 38 Q 12 28 0 38 Z"
      />
      {/* Bottom wave - curves outward */}
      <path
        fill="currentColor"
        d="M 0 55 Q 12 45 25 55 Q 38 65 50 55 Q 62 45 75 55 Q 88 65 100 55 L 100 63 Q 88 73 75 63 Q 62 53 50 63 Q 38 73 25 63 Q 12 53 0 63 Z"
      />
    </>
  ),
  Pisces: (
    <g transform="translate(3, 3) scale(5.9)">
      <path
        fill="currentColor"
        d="M4.94517 8.99997H2V6.99997H4.94517C4.71828 4.94564 3.80038 3.10059 2.42738 1.70002L3.85558 0.299927C5.58105 2.06004 6.72069 4.40009 6.95516 6.99997H9.04493C9.2794 4.40009 10.419 2.06004 12.1445 0.299927L13.5727 1.70002C12.1997 3.10059 11.2818 4.94564 11.0549 6.99997H14V8.99997H11.0549C11.2818 11.0543 12.1997 12.8994 13.5727 14.2999L12.1445 15.7C10.419 13.9399 9.2794 11.5999 9.04493 8.99997H6.95516C6.72069 11.5999 5.58105 13.9399 3.85558 15.7L2.42738 14.2999C3.80038 12.8994 4.71828 11.0543 4.94517 8.99997Z"
      />
    </g>
  ),
};

const ZODIAC_ORDER = [
  'Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo',
  'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'
];

const HOUSE_ORDER = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];

export function ProfectionWheel({ result }: ProfectionWheelProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const fullscreenWheelRef = useRef<SVGSVGElement>(null);

  // Auto-scroll to wheel when fullscreen opens
  useEffect(() => {
    if (isFullscreen && fullscreenWheelRef.current) {
      setTimeout(() => {
        fullscreenWheelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
    }
  }, [isFullscreen]);

  const centerX = 250;
  const centerY = 250;
  const houseRingInner = 25;
  const houseRingOuter = 50;

  // Calculate current year position based on actual year
  const currentYear = new Date().getFullYear();
  const yearsFromStart = currentYear - result.firstActivation;
  const currentRing = Math.floor(yearsFromStart / 12);
  const currentSegment = yearsFromStart % 12;

  // Calculate rings needed: show complete cycles up to and including current year
  const numYearRings = Math.max(1, currentRing + 1);

  // Adjust ring width based on number of rings to keep wheel balanced (compact spacing)
  const baseYearRingWidth = numYearRings <= 3 ? 28 : numYearRings <= 5 ? 22 : 18;
  const yearRingWidth = baseYearRingWidth;
  const yearRingsOuter = houseRingOuter + (numYearRings * yearRingWidth);
  const zodiacRingInner = yearRingsOuter; // Zodiac ring starts where years end
  const zodiacRingOuter = zodiacRingInner + 30; // Zodiac ring is 30px wide
  const outerRadius = zodiacRingOuter;
  const zodiacRadius = (zodiacRingInner + zodiacRingOuter) / 2; // Center of zodiac ring

  // Find the starting index based on rising sign
  const risingIndex = ZODIAC_ORDER.indexOf(result.rising);

  // Generate year data for each ring and segment
  // Birth year (age 0) should be at House 12 (beside House 1), not House 1
  const getYearForRingSegment = (ring: number, segment: number) => {
    // Shift so House 12 (segment 11) gets age 0, House 1 gets age 1, etc.
    const shiftedSegment = (segment + 1) % 12;
    const age = ring * 12 + shiftedSegment;
    return result.firstActivation + age;
  };

  // Get sign for a given house position (0-11)
  const getSignForHouse = (houseIndex: number) => {
    const signIndex = (risingIndex + houseIndex) % 12;
    return ZODIAC_ORDER[signIndex];
  };

  // Convert polar to cartesian coordinates
  const polarToCartesian = (cx: number, cy: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180;
    return {
      x: cx + radius * Math.cos(angleInRadians),
      y: cy + radius * Math.sin(angleInRadians),
    };
  };

  // Create arc path
  const describeArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(cx, cy, radius, endAngle);
    const end = polarToCartesian(cx, cy, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  };

  // Create segment path (pie slice)
  const describeSegment = (cx: number, cy: number, innerRadius: number, outerRadius: number, startAngle: number, endAngle: number) => {
    const outerStart = polarToCartesian(cx, cy, outerRadius, startAngle);
    const outerEnd = polarToCartesian(cx, cy, outerRadius, endAngle);
    const innerStart = polarToCartesian(cx, cy, innerRadius, startAngle);
    const innerEnd = polarToCartesian(cx, cy, innerRadius, endAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

    return `M ${outerStart.x} ${outerStart.y}
            A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${outerEnd.x} ${outerEnd.y}
            L ${innerEnd.x} ${innerEnd.y}
            A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerStart.x} ${innerStart.y}
            Z`;
  };

  // Each segment is 30 degrees (360/12)
  const segmentAngle = 30;

  return (
    <>
      {/* Fullscreen overlay */}
      {isFullscreen && (
        <div className="profection-fullscreen-overlay" onClick={() => setIsFullscreen(false)}>
          <div className="profection-fullscreen-content" onClick={e => e.stopPropagation()}>
            <button className="profection-fullscreen-close" onClick={() => setIsFullscreen(false)}>
              &#10005;
            </button>
            <svg ref={fullscreenWheelRef} viewBox="0 0 500 500" className="profection-wheel fullscreen">
              {/* Draw segments */}
              {Array.from({ length: 12 }).map((_, i) => {
                // Counterclockwise from left: subtract angles so House 1 is at 9 o'clock, House 2 above it, etc.
                const startAngle = 270 - (i + 1) * segmentAngle;
                const endAngle = 270 - i * segmentAngle;
                const midAngle = startAngle + segmentAngle / 2;
                const sign = getSignForHouse(i);
                const houseNum = i + 1;
                const isCurrentHouse = i === currentSegment && currentRing < numYearRings;

                return (
                  <g key={i}>
                    {/* Segment divider lines - skip i=11 (House 1/12 boundary) here, draw it last */}
                    {i !== 11 && (
                      <line
                        x1={polarToCartesian(centerX, centerY, houseRingInner, startAngle).x}
                        y1={polarToCartesian(centerX, centerY, houseRingInner, startAngle).y}
                        x2={polarToCartesian(centerX, centerY, zodiacRingInner, startAngle).x}
                        y2={polarToCartesian(centerX, centerY, zodiacRingInner, startAngle).y}
                        stroke="var(--cyan-400)"
                        strokeWidth="2"
                        opacity="1"
                      />
                    )}
                    <path
                      d={describeSegment(centerX, centerY, houseRingInner, houseRingOuter, startAngle, endAngle)}
                      fill={isCurrentHouse ? 'var(--gold-400)' : '#1a1a2e'}
                      stroke="none"
                    />
                    <text
                      x={polarToCartesian(centerX, centerY, (houseRingInner + houseRingOuter) / 2, midAngle).x}
                      y={polarToCartesian(centerX, centerY, (houseRingInner + houseRingOuter) / 2, midAngle).y}
                      fill={isCurrentHouse ? '#1a1a2e' : '#ffffff'}
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {houseNum}
                    </text>
                    {Array.from({ length: numYearRings }).map((_, ring) => {
                      const ringInner = houseRingOuter + ring * yearRingWidth;
                      const ringOuter = ringInner + yearRingWidth;
                      const year = getYearForRingSegment(ring, i);
                      const isCurrentYear = year === currentYear;
                      const isFutureYear = year > currentYear;
                      return (
                        <g key={`ring-${ring}`}>
                          <path
                            d={describeSegment(centerX, centerY, ringInner, ringOuter, startAngle, endAngle)}
                            fill={isCurrentYear ? 'var(--gold-400)' : 'transparent'}
                            stroke="none"
                            opacity={isFutureYear ? 0.4 : 0.8}
                          />
                          <text
                            x={polarToCartesian(centerX, centerY, (ringInner + ringOuter) / 2, midAngle).x}
                            y={polarToCartesian(centerX, centerY, (ringInner + ringOuter) / 2, midAngle).y}
                            fill={isCurrentYear ? '#1a1a2e' : '#ffffff'}
                            fontSize="10"
                            fontWeight={isCurrentYear ? 'bold' : 'normal'}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            opacity={isFutureYear ? 0.5 : 1}
                          >
                            {year}
                          </text>
                        </g>
                      );
                    })}
                    <g
                      transform={`translate(${polarToCartesian(centerX, centerY, zodiacRadius, midAngle).x - 10}, ${polarToCartesian(centerX, centerY, zodiacRadius, midAngle).y - 10}) scale(0.2)`}
                      style={{ color: isCurrentHouse ? 'var(--gold-400)' : '#ffffff' }}
                    >
                      {ZODIAC_SVG_PATHS[sign]}
                    </g>
                  </g>
                );
              })}
              <circle cx={centerX} cy={centerY} r={houseRingInner} fill="#0a0e1a" stroke="var(--cyan-400)" strokeWidth="1" />
              <circle cx={centerX} cy={centerY} r={houseRingOuter} fill="none" stroke="var(--cyan-400)" strokeWidth="1" />
              {Array.from({ length: numYearRings + 1 }).map((_, ring) => (
                <circle
                  key={`ring-circle-${ring}`}
                  cx={centerX}
                  cy={centerY}
                  r={houseRingOuter + ring * yearRingWidth}
                  fill="none"
                  stroke="var(--cyan-400)"
                  strokeWidth="1"
                  opacity="1"
                />
              ))}
              <circle cx={centerX} cy={centerY} r={zodiacRingInner} fill="none" stroke="var(--cyan-400)" strokeWidth="1" opacity="0.8" />
              <circle cx={centerX} cy={centerY} r={zodiacRingOuter} fill="none" stroke="var(--cyan-400)" strokeWidth="2" />

              {/* House 1/12 boundary line - drawn last for consistent thickness on top of circles */}
              <line
                x1={polarToCartesian(centerX, centerY, houseRingInner, 270 - 12 * segmentAngle).x}
                y1={polarToCartesian(centerX, centerY, houseRingInner, 270 - 12 * segmentAngle).y}
                x2={polarToCartesian(centerX, centerY, zodiacRingInner, 270 - 12 * segmentAngle).x}
                y2={polarToCartesian(centerX, centerY, zodiacRingInner, 270 - 12 * segmentAngle).y}
                stroke="#ffffff"
                strokeWidth="2"
                opacity="1"
              />
            </svg>
          </div>
        </div>
      )}

      <div className="profection-wheel-container">
        <button className="profection-expand-btn" onClick={() => setIsFullscreen(true)} title="View fullscreen">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
          </svg>
        </button>
        <svg viewBox="0 0 500 500" className="profection-wheel">
        {/* Draw segments */}
        {Array.from({ length: 12 }).map((_, i) => {
          // Counterclockwise from left: subtract angles so House 1 is at 9 o'clock, House 2 above it, etc.
          const startAngle = 270 - (i + 1) * segmentAngle;
          const endAngle = 270 - i * segmentAngle;
          const midAngle = startAngle + segmentAngle / 2;
          const sign = getSignForHouse(i);
          const houseNum = i + 1;
          const isCurrentHouse = i === currentSegment && currentRing < numYearRings;

          return (
            <g key={i}>
              {/* Segment divider lines - skip i=11 (House 1/12 boundary) here, draw it last */}
              {i !== 11 && (
                <line
                  x1={polarToCartesian(centerX, centerY, houseRingInner, startAngle).x}
                  y1={polarToCartesian(centerX, centerY, houseRingInner, startAngle).y}
                  x2={polarToCartesian(centerX, centerY, zodiacRingInner, startAngle).x}
                  y2={polarToCartesian(centerX, centerY, zodiacRingInner, startAngle).y}
                  stroke="var(--cyan-400)"
                  strokeWidth="2"
                  opacity="1"
                />
              )}

              {/* House number ring (inner dark ring) */}
              <path
                d={describeSegment(centerX, centerY, houseRingInner, houseRingOuter, startAngle, endAngle)}
                fill={isCurrentHouse ? 'var(--gold-400)' : '#1a1a2e'}
                stroke="none"
              />

              {/* House number text */}
              <text
                x={polarToCartesian(centerX, centerY, (houseRingInner + houseRingOuter) / 2, midAngle).x}
                y={polarToCartesian(centerX, centerY, (houseRingInner + houseRingOuter) / 2, midAngle).y}
                fill={isCurrentHouse ? '#1a1a2e' : '#ffffff'}
                fontSize="9"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {houseNum}
              </text>

              {/* Year rings */}
              {Array.from({ length: numYearRings }).map((_, ring) => {
                const ringInner = houseRingOuter + ring * yearRingWidth;
                const ringOuter = ringInner + yearRingWidth;
                const year = getYearForRingSegment(ring, i);
                const isCurrentYear = year === currentYear;
                const isFutureYear = year > currentYear;

                return (
                  <g key={`ring-${ring}`}>
                    <path
                      d={describeSegment(centerX, centerY, ringInner, ringOuter, startAngle, endAngle)}
                      fill={isCurrentYear ? 'var(--gold-400)' : 'transparent'}
                      stroke="none"
                      opacity={isFutureYear ? 0.4 : 0.8}
                    />
                    <text
                      x={polarToCartesian(centerX, centerY, (ringInner + ringOuter) / 2, midAngle).x}
                      y={polarToCartesian(centerX, centerY, (ringInner + ringOuter) / 2, midAngle).y}
                      fill={isCurrentYear ? '#1a1a2e' : '#ffffff'}
                      fontSize="10"
                      fontWeight={isCurrentYear ? 'bold' : 'normal'}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      opacity={isFutureYear ? 0.5 : 1}
                    >
                      {year}
                    </text>
                  </g>
                );
              })}


              {/* Zodiac symbol on outer edge - SVG icons */}
              <g
                transform={`translate(${polarToCartesian(centerX, centerY, zodiacRadius, midAngle).x - 10}, ${polarToCartesian(centerX, centerY, zodiacRadius, midAngle).y - 10}) scale(0.2)`}
                style={{ color: isCurrentHouse ? 'var(--gold-400)' : '#ffffff' }}
              >
                {ZODIAC_SVG_PATHS[sign]}
              </g>
            </g>
          );
        })}

        {/* Center circle */}
        <circle cx={centerX} cy={centerY} r={houseRingInner} fill="#0a0e1a" stroke="var(--cyan-400)" strokeWidth="1" />

        {/* House ring outer boundary */}
        <circle cx={centerX} cy={centerY} r={houseRingOuter} fill="none" stroke="var(--cyan-400)" strokeWidth="1" />

        {/* Year ring boundary circles */}
        {Array.from({ length: numYearRings + 1 }).map((_, ring) => (
          <circle
            key={`ring-circle-${ring}`}
            cx={centerX}
            cy={centerY}
            r={houseRingOuter + ring * yearRingWidth}
            fill="none"
            stroke="var(--cyan-400)"
            strokeWidth="0.5"
            opacity="0.5"
          />
        ))}

        {/* Zodiac ring boundaries - inner and outer circles only */}
        <circle cx={centerX} cy={centerY} r={zodiacRingInner} fill="none" stroke="var(--cyan-400)" strokeWidth="1" opacity="0.8" />
        <circle cx={centerX} cy={centerY} r={zodiacRingOuter} fill="none" stroke="var(--cyan-400)" strokeWidth="2" />

        {/* House 1/12 boundary line - drawn last for consistent thickness on top of circles */}
        <line
          x1={polarToCartesian(centerX, centerY, houseRingInner, 270 - 12 * segmentAngle).x}
          y1={polarToCartesian(centerX, centerY, houseRingInner, 270 - 12 * segmentAngle).y}
          x2={polarToCartesian(centerX, centerY, zodiacRingInner, 270 - 12 * segmentAngle).x}
          y2={polarToCartesian(centerX, centerY, zodiacRingInner, 270 - 12 * segmentAngle).y}
          stroke="#ffffff"
          strokeWidth="2"
          opacity="1"
        />
      </svg>
    </div>
    </>
  );
}
