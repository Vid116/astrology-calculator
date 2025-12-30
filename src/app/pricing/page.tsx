'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth/AuthProvider';
import { STRIPE_CONFIG } from '@/lib/stripe/config';
import '@/app/tailwind.css';

export default function PricingPage() {
  const { user, isPremium } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handleCheckout = async (priceKey: 'proMonthly' | 'proAnnual') => {
    if (!user) {
      router.push('/signup?redirect_to=/pricing');
      return;
    }

    setLoading(priceKey);

    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: STRIPE_CONFIG.prices[priceKey],
        }),
      });

      const { url, error, details } = await response.json();

      if (error) {
        console.error('Checkout error:', error, details);
        alert(`Checkout failed: ${details || error}`);
        return;
      }

      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-12 md:space-y-16">
      {/* Header */}
      <header className="text-center">
        <div className="relative inline-block">
          <h1
            className="font-cinzel text-4xl md:text-5xl lg:text-6xl text-[#ffd800] tracking-wider"
            style={{
              textShadow: '0 0 40px rgba(255, 216, 0, 0.3)',
            }}
          >
            Unlock the Stars
          </h1>
          <div
            className="absolute -inset-4 -z-10 opacity-40"
            style={{
              background: 'radial-gradient(ellipse 50% 80% at 50% 50%, rgba(255, 216, 0, 0.15) 0%, transparent 70%)',
            }}
          />
        </div>

        <p className="text-[#a1a1aa] text-lg max-w-2xl mx-auto mt-4">
          Choose your path to unlimited celestial insights
        </p>
      </header>

      {/* Pricing Cards */}
      <section className="grid md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
        {/* Free Tier */}
        <div
          className="relative rounded-2xl overflow-hidden group flex flex-col"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
            border: '1px solid rgba(103, 232, 249, 0.12)',
            boxShadow: `
              0 4px 6px rgba(0, 0, 0, 0.1),
              0 10px 40px rgba(0, 0, 0, 0.3),
              inset 0 1px 0 rgba(255, 255, 255, 0.03)
            `,
          }}
        >
          {/* Badge Area - empty for alignment */}
          <div className="h-10" />

          {/* Card Content */}
          <div className="p-6 lg:p-8 pt-4 flex flex-col flex-1">
            {/* Header */}
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-[#67e8f9]/10 text-[#67e8f9]"
              >
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="font-cinzel text-2xl text-white tracking-wide">Free</h3>
              <p className="text-[#6b7a90] text-sm mt-1">Start exploring</p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-white">$0</span>
                <span className="text-[#6b7a90] text-lg">/forever</span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8 flex-1">
              <li className="flex items-center gap-3 text-[#d0d0d0]">
                <span className="w-6 h-6 rounded-full bg-[#67e8f9]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#67e8f9]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>{STRIPE_CONFIG.freeTier.dailyCalculations} calculations per day</span>
              </li>
              <li className="flex items-center gap-3 text-[#d0d0d0]">
                <span className="w-6 h-6 rounded-full bg-[#67e8f9]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#67e8f9]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>All calculator types</span>
              </li>
              <li className="flex items-center gap-3 text-[#d0d0d0]">
                <span className="w-6 h-6 rounded-full bg-[#67e8f9]/10 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3.5 h-3.5 text-[#67e8f9]" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </span>
                <span>Basic interpretations</span>
              </li>
            </ul>

            {/* Button */}
            <button
              onClick={() => router.push('/')}
              className="w-full py-3.5 rounded-xl text-sm font-medium text-[#67e8f9] transition-all duration-300 hover:bg-[#67e8f9]/10 mt-auto"
              style={{
                background: 'rgba(103, 232, 249, 0.05)',
                border: '1px solid rgba(103, 232, 249, 0.2)',
              }}
            >
              Current Plan
            </button>
          </div>
        </div>

        {/* Pro Monthly - Featured */}
        <div
          className="relative rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.98) 0%, rgba(10, 14, 26, 0.98) 100%)',
            border: '2px solid rgba(255, 216, 0, 0.5)',
            boxShadow: `
              0 4px 6px rgba(0, 0, 0, 0.1),
              0 20px 50px rgba(0, 0, 0, 0.4),
              0 0 80px rgba(255, 216, 0, 0.12),
              inset 0 1px 0 rgba(255, 255, 255, 0.05)
            `,
          }}
        >
          {/* Popular Badge */}
          <div
            className="absolute -top-px left-0 right-0 h-1"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, #ffd800 50%, transparent 100%)',
            }}
          />
          <div className="h-10 flex items-center justify-center">
            <span
              className="px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#ffd800] to-[#ff9500] text-[#0a0e1a] shadow-[0_0_20px_rgba(255,216,0,0.4)]"
            >
              Most Popular
            </span>
          </div>

          {/* Decorative Glow */}
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(255, 216, 0, 0.15) 0%, transparent 60%)',
            }}
          />

          {/* Card Content */}
          <div className="relative p-6 lg:p-8 pt-4 flex flex-col flex-1">
            {/* Header */}
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-[#ffd800]/15 text-[#ffd800] shadow-[0_0_20px_rgba(255,216,0,0.2)]"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <h3
                className="font-cinzel text-2xl text-[#ffd800] tracking-wide"
                style={{ textShadow: '0 0 20px rgba(255, 216, 0, 0.3)' }}
              >
                {STRIPE_CONFIG.pricing.proMonthly.name.replace('Astro ', '')}
              </h3>
              <p className="text-[#a1a1aa] text-sm mt-1">Full cosmic access</p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-1">
                <span
                  className="text-5xl font-bold text-[#ffd800]"
                  style={{ textShadow: '0 0 30px rgba(255, 216, 0, 0.3)' }}
                >
                  ${STRIPE_CONFIG.pricing.proMonthly.price}
                </span>
                <span className="text-[#a1a1aa] text-lg">/month</span>
              </div>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8 flex-1">
              {STRIPE_CONFIG.pricing.proMonthly.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-[#e8e8e8]">
                  <span
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 bg-[#ffd800]/15 text-[#ffd800] shadow-[0_0_8px_rgba(255,216,0,0.2)]"
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Button */}
            {isPremium ? (
              <button
                disabled
                className="w-full py-4 rounded-xl text-sm font-semibold text-[#ffd800] cursor-not-allowed mt-auto"
                style={{
                  background: 'rgba(255, 216, 0, 0.1)',
                  border: '1px solid rgba(255, 216, 0, 0.3)',
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Active
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleCheckout('proMonthly')}
                disabled={loading !== null}
                className="w-full py-4 rounded-xl text-sm font-semibold text-[#0a0e1a] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-auto"
                style={{
                  background: 'linear-gradient(135deg, #ffd800 0%, #ffb800 100%)',
                  boxShadow: '0 0 30px rgba(255, 216, 0, 0.3)',
                }}
              >
                {loading === 'proMonthly' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Subscribe Monthly'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Pro Annual */}
        <div
          className="relative rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
            border: '1px solid rgba(30, 150, 252, 0.25)',
            boxShadow: `
              0 4px 6px rgba(0, 0, 0, 0.1),
              0 10px 40px rgba(0, 0, 0, 0.3),
              0 0 40px rgba(30, 150, 252, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.03)
            `,
          }}
        >
          {/* Savings Badge */}
          <div className="h-10 flex items-center justify-center">
            <span
              className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#758e4f] to-[#5a7340] text-white shadow-[0_0_15px_rgba(117,142,79,0.3)]"
            >
              {STRIPE_CONFIG.pricing.proAnnual.savings}
            </span>
          </div>

          {/* Card Content */}
          <div className="p-6 lg:p-8 pt-4 flex flex-col flex-1">
            {/* Header */}
            <div className="text-center mb-6">
              <div
                className="w-14 h-14 mx-auto mb-4 rounded-2xl flex items-center justify-center bg-[#1e96fc]/10 text-[#1e96fc]"
              >
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
              </div>
              <h3 className="font-cinzel text-2xl text-[#1e96fc] tracking-wide">
                {STRIPE_CONFIG.pricing.proAnnual.name.replace('Astro ', '')}
              </h3>
              <p className="text-[#6b7a90] text-sm mt-1">Best value</p>
            </div>

            {/* Price */}
            <div className="text-center mb-8">
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-5xl font-bold text-[#1e96fc]">
                  ${STRIPE_CONFIG.pricing.proAnnual.price}
                </span>
                <span className="text-[#6b7a90] text-lg">/year</span>
              </div>
              <p className="text-[#758e4f] text-sm mt-2">
                ${Math.round(STRIPE_CONFIG.pricing.proAnnual.price / 12)}/mo billed annually
              </p>
            </div>

            {/* Features */}
            <ul className="space-y-4 mb-8 flex-1">
              {STRIPE_CONFIG.pricing.proAnnual.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-[#d0d0d0]">
                  <span className="w-6 h-6 rounded-full bg-[#1e96fc]/10 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#1e96fc]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* Button */}
            {isPremium ? (
              <button
                disabled
                className="w-full py-3.5 rounded-xl text-sm font-medium text-[#1e96fc] cursor-not-allowed mt-auto"
                style={{
                  background: 'rgba(30, 150, 252, 0.08)',
                  border: '1px solid rgba(30, 150, 252, 0.25)',
                }}
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Active
                </span>
              </button>
            ) : (
              <button
                onClick={() => handleCheckout('proAnnual')}
                disabled={loading !== null}
                className="w-full py-3.5 rounded-xl text-sm font-medium text-[#1e96fc] transition-all duration-300 hover:bg-[#1e96fc]/15 hover:border-[#67e8f9] hover:shadow-[0_0_25px_rgba(30,150,252,0.2)] disabled:opacity-50 disabled:cursor-not-allowed mt-auto"
                style={{
                  background: 'rgba(30, 150, 252, 0.08)',
                  border: '1px solid rgba(30, 150, 252, 0.25)',
                }}
              >
                {loading === 'proAnnual' ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Subscribe Annual'
                )}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Features Comparison */}
      <section
        className="rounded-2xl overflow-hidden max-w-4xl mx-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.9) 0%, rgba(10, 14, 26, 0.9) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.08)',
          boxShadow: '0 4px 30px rgba(0, 0, 0, 0.2)',
        }}
      >
        <div
          className="px-6 py-5"
          style={{
            background: 'linear-gradient(180deg, rgba(103, 232, 249, 0.03) 0%, transparent 100%)',
            borderBottom: '1px solid rgba(103, 232, 249, 0.08)',
          }}
        >
          <h3 className="text-white font-semibold text-lg text-center">Why Choose Astro Pro?</h3>
        </div>
        <div className="p-6">
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                ),
                title: 'Unlimited Power',
                description: 'No daily limits. Calculate as much as your cosmic curiosity desires.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                ),
                title: 'Priority Support',
                description: 'Get dedicated assistance when you need help with your readings.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                ),
                title: 'All Calculators',
                description: 'Access every calculation tool in our celestial arsenal.',
              },
              {
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                ),
                title: 'Instant Results',
                description: 'No waiting. Get your cosmic insights immediately.',
              },
            ].map((feature, i) => (
              <div key={i} className="flex gap-4">
                <div
                  className="w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center bg-[#67e8f9]/10 text-[#67e8f9]"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {feature.icon}
                  </svg>
                </div>
                <div className="min-w-0">
                  <h4 className="text-white font-medium mb-1">{feature.title}</h4>
                  <p className="text-[#6b7a90] text-sm">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <footer className="text-center pb-8">
        <div
          className="inline-flex flex-wrap items-center justify-center gap-4 sm:gap-6 px-6 sm:px-8 py-4 rounded-2xl sm:rounded-full"
          style={{
            background: 'rgba(103, 232, 249, 0.03)',
            border: '1px solid rgba(103, 232, 249, 0.08)',
          }}
        >
          <div className="flex items-center gap-2 text-[#6b7a90] text-sm">
            <svg className="w-4 h-4 text-[#758e4f] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Cancel anytime</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-[#67e8f9]/20" />
          <div className="flex items-center gap-2 text-[#6b7a90] text-sm">
            <svg className="w-4 h-4 text-[#758e4f] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Secure payment</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-[#67e8f9]/20" />
          <div className="flex items-center gap-2 text-[#6b7a90] text-sm">
            <svg className="w-4 h-4 text-[#758e4f] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Money-back guarantee</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
