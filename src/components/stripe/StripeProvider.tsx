'use client';

import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { ReactNode } from 'react';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface StripeProviderProps {
  clientSecret: string;
  children: ReactNode;
}

export function StripeProvider({ clientSecret, children }: StripeProviderProps) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'night',
          variables: {
            colorPrimary: '#ffd800',
            colorBackground: 'rgba(15, 20, 35, 0.98)',
            colorText: '#ffffff',
            colorDanger: '#f87171',
            borderRadius: '8px',
            fontFamily: 'inherit',
          },
          rules: {
            '.Input': {
              backgroundColor: 'rgba(103, 232, 249, 0.05)',
              border: '1px solid rgba(103, 232, 249, 0.2)',
            },
            '.Input:focus': {
              border: '1px solid rgba(103, 232, 249, 0.5)',
              boxShadow: '0 0 0 2px rgba(103, 232, 249, 0.25)',
            },
          },
        },
      }}
    >
      {children}
    </Elements>
  );
}
