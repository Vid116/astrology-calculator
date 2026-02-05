'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type CookiePreferences = {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
};

const DEFAULT_PREFERENCES: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

export function getCookieConsent(): CookiePreferences | null {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('cookie-consent');
  if (!stored) return null;
  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Small delay so it doesn't flash immediately on load
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Allow re-opening from footer "Cookie Preferences" button
  useEffect(() => {
    const handler = () => {
      setShowDetails(true);
      setVisible(true);
      const existing = getCookieConsent();
      if (existing) setPreferences(existing);
    };
    window.addEventListener('show-cookie-consent', handler);
    return () => window.removeEventListener('show-cookie-consent', handler);
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    localStorage.setItem('cookie-consent', JSON.stringify(prefs));
    localStorage.setItem('cookie-consent-date', new Date().toISOString());
    setVisible(false);
  };

  const acceptAll = () => {
    savePreferences({ essential: true, analytics: true, marketing: true });
  };

  const rejectAll = () => {
    savePreferences({ essential: true, analytics: false, marketing: false });
  };

  const saveCustom = () => {
    savePreferences({ ...preferences, essential: true });
  };

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-[9999] p-4 sm:p-6"
      style={{
        background: 'linear-gradient(180deg, rgba(10, 14, 26, 0.95) 0%, rgba(10, 14, 26, 0.99) 100%)',
        borderTop: '1px solid rgba(103, 232, 249, 0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col gap-4">
          {/* Main message */}
          <div>
            <h3
              className="text-base font-semibold mb-1"
              style={{ color: '#67e8f9', fontFamily: 'var(--font-cinzel)' }}
            >
              Cookie Preferences
            </h3>
            <p className="text-sm" style={{ color: 'rgba(232, 232, 232, 0.7)' }}>
              We use essential cookies to keep the site working (authentication, payments).
              You can also allow optional cookies for analytics.
              Read our{' '}
              <Link href="/cookies" className="underline" style={{ color: '#67e8f9' }}>
                Cookie Policy
              </Link>{' '}
              for details.
            </p>
          </div>

          {/* Expandable details */}
          {showDetails && (
            <div
              className="rounded-lg p-4 space-y-3"
              style={{
                background: 'rgba(103, 232, 249, 0.03)',
                border: '1px solid rgba(103, 232, 249, 0.1)',
              }}
            >
              {/* Essential */}
              <label className="flex items-center justify-between">
                <div>
                  <span className="text-sm font-medium" style={{ color: '#e8e8e8' }}>
                    Essential Cookies
                  </span>
                  <p className="text-xs" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>
                    Required for authentication and payments. Cannot be disabled.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="w-4 h-4 accent-cyan-400 opacity-50"
                />
              </label>

              {/* Analytics */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium" style={{ color: '#e8e8e8' }}>
                    Analytics Cookies
                  </span>
                  <p className="text-xs" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>
                    Help us understand how visitors use the site.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, analytics: e.target.checked }))
                  }
                  className="w-4 h-4 accent-cyan-400"
                />
              </label>

              {/* Marketing */}
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-sm font-medium" style={{ color: '#e8e8e8' }}>
                    Marketing Cookies
                  </span>
                  <p className="text-xs" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>
                    Used for targeted advertising and promotions.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={(e) =>
                    setPreferences((p) => ({ ...p, marketing: e.target.checked }))
                  }
                  className="w-4 h-4 accent-cyan-400"
                />
              </label>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-wrap gap-4 items-center">
            <button
              onClick={acceptAll}
              className="rounded-lg text-sm font-semibold transition-all hover:scale-105"
              style={{
                padding: '14px 40px',
                letterSpacing: '0.05em',
                background: 'linear-gradient(135deg, #ffd800, #ffb800)',
                color: '#0a0e1a',
                boxShadow: '0 2px 8px rgba(255, 216, 0, 0.3)',
              }}
            >
              Accept All
            </button>
            <button
              onClick={rejectAll}
              className="rounded-lg text-sm font-semibold transition-all hover:scale-105"
              style={{
                padding: '14px 40px',
                letterSpacing: '0.05em',
                background: 'rgba(103, 232, 249, 0.1)',
                color: '#67e8f9',
                border: '1px solid rgba(103, 232, 249, 0.3)',
              }}
            >
              Reject All
            </button>
            {!showDetails ? (
              <button
                onClick={() => setShowDetails(true)}
                className="text-sm transition-colors hover:underline"
                style={{ padding: '14px 40px', letterSpacing: '0.05em', color: 'rgba(232, 232, 232, 0.6)' }}
              >
                Customize
              </button>
            ) : (
              <button
                onClick={saveCustom}
                className="rounded-lg text-sm font-semibold transition-all hover:scale-105"
                style={{
                  padding: '14px 40px',
                  letterSpacing: '0.05em',
                  background: 'rgba(103, 232, 249, 0.1)',
                  color: '#67e8f9',
                  border: '1px solid rgba(103, 232, 249, 0.3)',
                }}
              >
                Save Preferences
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
