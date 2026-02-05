'use client';

import { useState } from 'react';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';

interface PaymentFormProps {
  amount_cents: number;
  currency: string;
  onSuccess: (paymentIntentId: string) => void;
  onError: (error: string) => void;
  isSubmitting: boolean;
}

function formatAmount(cents: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(cents / 100);
}

export function PaymentForm({
  amount_cents,
  currency,
  onSuccess,
  onError,
  isSubmitting,
}: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);

    try {
      // Required for Stripe.js v8+: validate and collect payment details first
      const { error: submitError } = await elements.submit();
      if (submitError) {
        onError(submitError.message || 'Payment validation failed');
        setIsProcessing(false);
        return;
      }

      const result = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      });

      if (result.error) {
        onError(result.error.message || 'Payment failed');
      } else if (result.paymentIntent?.status === 'requires_capture') {
        onSuccess(result.paymentIntent.id);
      } else {
        onError(`Unexpected payment status: ${result.paymentIntent?.status || 'unknown'}`);
      }
    } catch (err) {
      console.error('Payment confirmation error:', err);
      onError(err instanceof Error ? err.message : 'Payment failed unexpectedly');
    } finally {
      setIsProcessing(false);
    }
  };

  const busy = isProcessing || isSubmitting;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div
        className="p-4 rounded-lg"
        style={{
          background: 'rgba(255, 216, 0, 0.05)',
          border: '1px solid rgba(255, 216, 0, 0.2)',
        }}
      >
        <div className="flex items-center justify-between">
          <span className="text-[#a1a1aa] text-sm">Authorization hold</span>
          <span className="text-[#ffd800] font-semibold text-lg">
            {formatAmount(amount_cents, currency)}
          </span>
        </div>
        <p className="text-[#6b7a90] text-xs mt-2">
          Your card will be authorized but not charged until the consultation is approved.
        </p>
      </div>

      <PaymentElement />

      <button
        type="submit"
        disabled={!stripe || busy}
        className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200 hover:shadow-[0_0_20px_rgba(255,216,0,0.3)] disabled:opacity-50"
        style={{
          background: 'linear-gradient(135deg, #ffd800 0%, #ffb800 100%)',
          color: '#0a0e1a',
        }}
      >
        {busy ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Authorizing...
          </span>
        ) : (
          `Authorize ${formatAmount(amount_cents, currency)}`
        )}
      </button>
    </form>
  );
}
