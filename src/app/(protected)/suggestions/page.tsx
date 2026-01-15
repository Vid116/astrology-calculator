'use client';

import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { toast } from 'sonner';

type Category = 'feature' | 'bug' | 'improvement' | 'other';

const CATEGORIES: { value: Category; label: string; icon: JSX.Element }[] = [
  {
    value: 'feature',
    label: 'New Feature',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
    ),
  },
  {
    value: 'bug',
    label: 'Bug Report',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
  },
  {
    value: 'improvement',
    label: 'Improvement',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
  },
  {
    value: 'other',
    label: 'Other',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
];

export default function SuggestionsPage() {
  const { user, isLoading } = useAuth();
  const [category, setCategory] = useState<Category>('feature');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          subject: subject.trim(),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSubmitted(true);
        toast.success('Thank you for your feedback!');
      } else {
        toast.error(data.error || 'Failed to submit. Please try again.');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setCategory('feature');
    setSubject('');
    setMessage('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-2 border-[#67e8f9]/20" />
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ffd800] animate-spin" />
            <div className="absolute inset-2 rounded-full border border-[#67e8f9]/10" />
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: 'radial-gradient(circle, rgba(255,216,0,0.1) 0%, transparent 70%)',
              }}
            />
          </div>
          <p className="text-[#67e8f9] text-sm tracking-wider animate-pulse">
            Loading...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16" style={{ paddingLeft: '5px', paddingRight: '5px' }}>
      {/* Header */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          marginTop: '25px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.15)',
          boxShadow: `
            0 4px 6px rgba(0, 0, 0, 0.1),
            0 10px 40px rgba(0, 0, 0, 0.4),
            0 0 60px rgba(103, 232, 249, 0.08),
            inset 0 1px 0 rgba(255, 255, 255, 0.05)
          `,
        }}
      >
        {/* Decorative Background */}
        <div
          className="absolute inset-0 opacity-30 rounded-2xl overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse 80% 50% at 50% 0%, rgba(103, 232, 249, 0.15) 0%, transparent 50%),
              radial-gradient(ellipse 60% 40% at 70% 100%, rgba(255, 216, 0, 0.08) 0%, transparent 50%)
            `,
          }}
        />

        <div className="relative p-8 md:p-12">
          <div className="flex items-center gap-5 mb-4">
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.15) 0%, rgba(30, 150, 252, 0.1) 100%)',
                boxShadow: '0 0 20px rgba(103, 232, 249, 0.2)',
              }}
            >
              <svg className="w-7 h-7 text-[#67e8f9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
            </div>
            <div>
              <h1 className="font-cinzel text-2xl md:text-3xl text-white tracking-wide">
                Suggestions & Feedback
              </h1>
              <p className="text-[#6b7a90] text-sm mt-2">
                Help us improve your cosmic experience
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Form or Success Card */}
      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          marginTop: '7px',
          background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.95) 0%, rgba(10, 14, 26, 0.95) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.15)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
        }}
      >
        {submitted ? (
          /* Success State */
          <div className="p-10 md:p-14 text-center">
            <div
              className="w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6"
              style={{
                background: 'linear-gradient(135deg, rgba(117, 142, 79, 0.2) 0%, rgba(117, 142, 79, 0.1) 100%)',
                boxShadow: '0 0 30px rgba(117, 142, 79, 0.3)',
              }}
            >
              <svg className="w-10 h-10 text-[#758e4f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-4">Thank You!</h2>
            <p className="text-[#a1a1aa] mb-10 max-w-md mx-auto leading-relaxed">
              Your feedback has been received. We appreciate you taking the time to help us improve.
            </p>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.15) 0%, rgba(30, 150, 252, 0.1) 100%)',
                border: '1px solid rgba(103, 232, 249, 0.3)',
                color: '#67e8f9',
              }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Submit Another
            </button>
          </div>
        ) : (
          /* Form */
          <form onSubmit={handleSubmit} style={{ padding: '20px', paddingLeft: '7px', paddingRight: '7px' }}>
            {/* Category Selection */}
            <div className="mb-10">
              <label className="block text-[#67e8f9] text-sm font-medium mb-5" style={{ marginLeft: '5px' }}>
                Category
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {CATEGORIES.map((cat) => {
                  const isSelected = category === cat.value;
                  const colors = {
                    feature: { text: '#ffd800', bg: 'rgba(255, 216, 0, 0.15)', border: 'rgba(255, 216, 0, 0.4)', shadow: 'rgba(255, 216, 0, 0.15)' },
                    bug: { text: '#f87171', bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.4)', shadow: 'rgba(248, 113, 113, 0.15)' },
                    improvement: { text: '#67e8f9', bg: 'rgba(103, 232, 249, 0.15)', border: 'rgba(103, 232, 249, 0.4)', shadow: 'rgba(103, 232, 249, 0.15)' },
                    other: { text: '#a855f7', bg: 'rgba(168, 85, 247, 0.15)', border: 'rgba(168, 85, 247, 0.4)', shadow: 'rgba(168, 85, 247, 0.15)' },
                  }[cat.value];

                  return (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => setCategory(cat.value)}
                      className="flex items-center justify-center gap-2.5 rounded-xl text-sm font-medium transition-all duration-300"
                      style={{
                        padding: '18px 20px',
                        color: isSelected ? colors.text : '#a1a1aa',
                        background: isSelected ? colors.bg : 'rgba(103, 232, 249, 0.05)',
                        border: isSelected ? `1px solid ${colors.border}` : '1px solid rgba(103, 232, 249, 0.15)',
                        boxShadow: isSelected ? `0 0 15px ${colors.shadow}` : 'none',
                        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      {cat.icon}
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subject */}
            <div className="mb-8" style={{ marginTop: '10px' }}>
              <label htmlFor="subject" className="block text-[#67e8f9] text-sm font-medium mb-4" style={{ marginLeft: '5px' }}>
                Subject
              </label>
              <input
                type="text"
                id="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief summary of your suggestion"
                maxLength={100}
                className="w-full rounded-xl text-white placeholder-[#4a5568] outline-none transition-all duration-300 focus:ring-2 focus:ring-[#67e8f9]/50"
                style={{
                  background: 'rgba(103, 232, 249, 0.05)',
                  border: '1px solid rgba(103, 232, 249, 0.2)',
                  padding: '18px 20px',
                }}
              />
              <p className="text-[#4a5568] text-xs mt-3 text-right">
                {subject.length}/100
              </p>
            </div>

            {/* Message */}
            <div className="mb-10">
              <label htmlFor="message" className="block text-[#67e8f9] text-sm font-medium mb-4" style={{ marginLeft: '5px' }}>
                Message
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Describe your suggestion or feedback in detail..."
                rows={7}
                maxLength={2000}
                className="w-full rounded-xl text-white placeholder-[#4a5568] outline-none transition-all duration-300 focus:ring-2 focus:ring-[#67e8f9]/50 resize-none"
                style={{
                  background: 'rgba(103, 232, 249, 0.05)',
                  border: '1px solid rgba(103, 232, 249, 0.2)',
                  padding: '18px 20px',
                }}
              />
              <p className="text-[#4a5568] text-xs mt-3 text-right">
                {message.length}/2000
              </p>
            </div>

            {/* User Info Display */}
            <div
              className="mb-10 rounded-xl flex items-center gap-4"
              style={{
                marginTop: '5px',
                marginBottom: '5px',
                padding: '2px 20px',
                background: 'rgba(103, 232, 249, 0.03)',
                border: '1px solid rgba(103, 232, 249, 0.1)',
              }}
            >
              <svg className="w-5 h-5 text-[#67e8f9] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-[#6b7a90] text-sm">
                Submitting as <span className="text-[#67e8f9]">{user?.email}</span>
              </p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !subject.trim() || !message.trim()}
              className="w-full py-6 rounded-xl text-base font-semibold transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_30px_rgba(255,216,0,0.3)] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
              style={{
                marginTop: '5px',
                background: 'linear-gradient(135deg, #ffd800 0%, #ffb800 100%)',
                color: '#0a0e1a',
                boxShadow: '0 0 20px rgba(255, 216, 0, 0.2)',
              }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Sending...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Send Feedback
                </span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
