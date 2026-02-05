// Stripe configuration
// Update these after creating products in Stripe Dashboard

export const STRIPE_CONFIG = {
  // Product IDs (create these in Stripe Dashboard)
  products: {
    pro: process.env.STRIPE_PRODUCT_ID_PRO || 'prod_xxx',
  },

  // Price IDs (from Stripe Dashboard)
  prices: {
    proMonthly: process.env.STRIPE_PRICE_ID_PRO_MONTHLY || 'price_1Sjk8kPtcMkhnbKItuolh6hI',
    proAnnual: process.env.STRIPE_PRICE_ID_PRO_ANNUAL || 'price_1Sjk9dPtcMkhnbKITL3WMPVc',
  },

  // Pricing display info
  pricing: {
    proMonthly: {
      name: 'Astro Pro Monthly',
      price: 9,
      interval: 'month' as const,
      features: [
        'Unlimited calculations',
        'Priority support',
        'Access to all calculators',
        'No daily limits',
      ],
    },
    proAnnual: {
      name: 'Astro Pro Annual',
      price: 79,
      interval: 'year' as const,
      savings: '27% off',
      features: [
        'Unlimited calculations',
        'Priority support',
        'Access to all calculators',
        'No daily limits',
        '2 months free',
      ],
    },
  },

  // Consultation pricing (server-side source of truth)
  consultation: {
    prices: {
      30: { amount_cents: 3000, currency: 'usd', label: '30 min - $30' },
      60: { amount_cents: 4000, currency: 'usd', label: '60 min - $40' },
      90: { amount_cents: 5500, currency: 'usd', label: '90 min - $55' },
    } as Record<number, { amount_cents: number; currency: string; label: string }>,
  },

  // Free tier limits
  freeTier: {
    dailyCalculations: parseInt(process.env.FREE_TIER_DAILY_LIMIT || '10', 10),
    anonymousDailyCalculations: parseInt(process.env.ANONYMOUS_DAILY_LIMIT || '3', 10),
  },
};

export type PriceId = keyof typeof STRIPE_CONFIG.prices;
