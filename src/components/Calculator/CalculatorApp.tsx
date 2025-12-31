'use client';

import { useState, useEffect, useCallback } from 'react';
import { SparkCalculator } from './SparkCalculator';
import { TruePlacementCalculator } from './TruePlacementCalculator';
import { ProfectionCalculator } from './ProfectionCalculator';
import { loadAstrologyData, type AstrologyData } from '@/lib/data';
import { UserMenu } from '@/components/auth/UserMenu';
import { UsageLimitBanner } from '@/components/subscription/UsageLimitBanner';
import { useUsageLimit } from '@/lib/hooks/useUsageLimit';
import { useCalculator } from './CalculatorContext';

type Tab = 'spark' | 'true-placement' | 'profection-years';

export function CalculatorApp() {
  const { isOpen, setIsOpen } = useCalculator();
  const [activeTab, setActiveTab] = useState<Tab>('spark');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [data, setData] = useState<AstrologyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { remaining, limit, isPremium, trackCalculation, canCalculate } = useUsageLimit();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || 'light';
    setTheme(initialTheme);
    document.documentElement.setAttribute('data-theme', initialTheme);
  }, []);

  useEffect(() => {
    loadAstrologyData()
      .then(setData)
      .catch(err => {
        console.error('Error loading data:', err);
        setError('Error loading calculator data. Please refresh the page.');
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  // Wrapper to track calculations before executing
  const onCalculate = useCallback(async (): Promise<boolean> => {
    return await trackCalculation();
  }, [trackCalculation]);

  if (loading) {
    return (
      <button className="launch-btn">
        <span className="launch-icon">...</span>
        <span className="launch-text">Loading...</span>
      </button>
    );
  }

  if (error) {
    return (
      <div className="error-message" style={{ padding: '2rem', textAlign: 'center' }}>
        {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <>
      <button
        className={`launch-btn ${isOpen ? 'hidden' : ''}`}
        onClick={() => setIsOpen(true)}
      >
        <span className="launch-icon">&#9803;</span>
        <span className="launch-text">Open Calculator</span>
      </button>

      <div className={`container ${isOpen ? 'visible' : 'hidden'}`}>
        <button className="close-btn" onClick={() => setIsOpen(false)}>
          &#10005;
        </button>

        <header>
          <div className="header-content">
            <div className="header-text">
              <h1>Astrology Calculator</h1>
              <p className="subtitle">
                Discover your Spark, True Placement, and Profection Years
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Usage counter for free users */}
              {!isPremium && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[rgba(103,232,249,0.1)] rounded-lg border border-[rgba(103,232,249,0.2)]">
                  <span className="text-[#67e8f9] text-xs">
                    {remaining >= 0 ? `${remaining}/${limit}` : '∞'}
                  </span>
                </div>
              )}
              {isPremium && (
                <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-[rgba(255,216,0,0.1)] rounded-lg border border-[rgba(255,216,0,0.3)]">
                  <span className="text-[#ffd800] text-xs font-semibold">PRO ★</span>
                </div>
              )}
              <button className="theme-toggle" onClick={toggleTheme}>
                <span>{theme === 'dark' ? '🌙' : '☀️'}</span>
              </button>
              <UserMenu />
            </div>
          </div>
        </header>

        <div className="calculator-tabs">
          <button
            className={`tab-button ${activeTab === 'spark' ? 'active' : ''}`}
            onClick={() => setActiveTab('spark')}
          >
            Spark Calculator
          </button>
          <button
            className={`tab-button ${activeTab === 'true-placement' ? 'active' : ''}`}
            onClick={() => setActiveTab('true-placement')}
          >
            True Placement Calculator
          </button>
          <button
            className={`tab-button ${activeTab === 'profection-years' ? 'active' : ''}`}
            onClick={() => setActiveTab('profection-years')}
          >
            Profection Years
          </button>
        </div>

        <SparkCalculator
          sparkDatabase={data.sparkDatabase}
          isActive={activeTab === 'spark'}
          onCalculate={onCalculate}
          canCalculate={canCalculate}
        />

        <TruePlacementCalculator
          truePlacementDB1={data.truePlacementDB1}
          truePlacementDB2={data.truePlacementDB2}
          sparkDatabase={data.sparkDatabase}
          planetKeywords={data.planetKeywords}
          signKeywords={data.signKeywords}
          isActive={activeTab === 'true-placement'}
          onCalculate={onCalculate}
          canCalculate={canCalculate}
        />

        <ProfectionCalculator
          profectionData={data.profectionData}
          isActive={activeTab === 'profection-years'}
          onCalculate={onCalculate}
          canCalculate={canCalculate}
        />
      </div>

      {/* Usage limit overlay/banner */}
      <UsageLimitBanner />
    </>
  );
}
