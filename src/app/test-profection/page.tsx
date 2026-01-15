'use client';

import { ProfectionWheel } from '@/components/Calculator/ProfectionWheel';
import type { ProfectionResult } from '@/types/astrology';

// Test data - hardcoded for quick preview
const TEST_BIRTH_DATE = '1995-06-15'; // June 15, 1995
const TEST_RISING = 'Leo';

// Calculate age from birth date
const birthDate = new Date(TEST_BIRTH_DATE);
const today = new Date();
let age = today.getFullYear() - birthDate.getFullYear();
const monthDiff = today.getMonth() - birthDate.getMonth();
if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
  age--;
}

// Calculate profection data
const houseNum = (age % 12) + 1;
const houses = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th', '10th', '11th', '12th'];
const signs = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'];
const risingIndex = signs.indexOf(TEST_RISING);
const currentSignIndex = (risingIndex + (houseNum - 1)) % 12;

const TEST_FIRST_ACTIVATION = 1995;

const testResult: ProfectionResult = {
  birthDate: TEST_BIRTH_DATE,
  age,
  currentHouse: houses[houseNum - 1],
  currentSign: signs[currentSignIndex] as ProfectionResult['currentSign'],
  rising: TEST_RISING,
  firstActivation: TEST_FIRST_ACTIVATION,
  cycles: [], // Empty for test - wheel doesn't use this
};

export default function TestProfectionPage() {
  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0e1a',
      padding: '2rem',
      color: 'white'
    }}>
      <h1 style={{ marginBottom: '1rem' }}>Profection Wheel Test Page</h1>

      <div style={{
        background: 'rgba(255,255,255,0.1)',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '2rem',
        maxWidth: '400px'
      }}>
        <h3 style={{ marginBottom: '0.5rem' }}>Test Data:</h3>
        <p><strong>Birth Date:</strong> {TEST_BIRTH_DATE}</p>
        <p><strong>Rising Sign:</strong> {TEST_RISING}</p>
        <p><strong>Current Age:</strong> {age}</p>
        <p><strong>Current House:</strong> {testResult.currentHouse}</p>
        <p><strong>Current Sign:</strong> {testResult.currentSign}</p>
        <p><strong>First Activation:</strong> {testResult.firstActivation}</p>
      </div>

      <div style={{ maxWidth: '600px' }}>
        <ProfectionWheel result={testResult} />
      </div>
    </div>
  );
}
