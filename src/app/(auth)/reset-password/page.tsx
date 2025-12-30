'use client';

import { useState } from 'react';
import Link from 'next/link';
import { updateUserPassword, syncAuthState } from '@/lib/auth';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const result = await updateUserPassword(password);

    if (!result.success) {
      setError(result.error || 'Failed to update password');
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);

    // Force a full page reload to sync auth state
    setTimeout(() => {
      syncAuthState('/');
    }, 2000);
  };

  // Success state
  if (success) {
    return (
      <>
        <style>{`
          @keyframes cardFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          @keyframes iconPulse {
            0%, 100% { transform: scale(1); opacity: 0.9; }
            50% { transform: scale(1.05); opacity: 1; }
          }
        `}</style>

        <div
          className="relative rounded-2xl overflow-hidden backdrop-blur-xl"
          style={{
            background: 'linear-gradient(135deg, rgba(10, 14, 26, 0.95) 0%, rgba(15, 20, 35, 0.95) 100%)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(34, 197, 94, 0.1)',
            animation: 'cardFloat 6s ease-in-out infinite',
          }}
        >
          <div className="relative p-8 text-center">
            {/* Success icon */}
            <div
              className="mx-auto mb-6 w-20 h-20 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(34, 197, 94, 0.1) 100%)',
                border: '2px solid rgba(34, 197, 94, 0.4)',
                animation: 'iconPulse 2s ease-in-out infinite',
                boxShadow: '0 0 30px rgba(34, 197, 94, 0.3)',
              }}
            >
              <svg className="w-10 h-10 text-[#22c55e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h1
              className="font-cinzel text-2xl mb-3"
              style={{
                background: 'linear-gradient(135deg, #22c55e 0%, #67e8f9 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Password Updated!
            </h1>

            <p className="text-[#a1a1aa] mb-4">
              Your password has been successfully reset.
            </p>
            <p className="text-[#71717a] text-sm">
              Redirecting you to the app...
            </p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @keyframes cardFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes borderRotate {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes buttonGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(255, 216, 0, 0.3), 0 0 40px rgba(255, 216, 0, 0.1); }
          50% { box-shadow: 0 0 30px rgba(255, 216, 0, 0.5), 0 0 60px rgba(255, 216, 0, 0.2); }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }
      `}</style>

      <div
        className="relative rounded-2xl overflow-hidden backdrop-blur-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(10, 14, 26, 0.95) 0%, rgba(15, 20, 35, 0.95) 100%)',
          border: '1px solid rgba(103, 232, 249, 0.2)',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 40px rgba(103, 232, 249, 0.1)',
          animation: 'cardFloat 6s ease-in-out infinite',
        }}
      >
        {/* Animated gradient border */}
        <div
          className="absolute -inset-[1px] rounded-2xl pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, #67e8f9, #ffd800, #1e96fc, #67e8f9)',
            backgroundSize: '300% 100%',
            animation: 'borderRotate 4s linear infinite',
            opacity: 0.3,
          }}
        />

        {/* Inner content container */}
        <div className="relative rounded-2xl" style={{ background: 'linear-gradient(135deg, rgba(10, 14, 26, 0.98) 0%, rgba(15, 20, 35, 0.98) 100%)' }}>
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#67e8f9] to-transparent" />
            <div className="absolute top-0 left-0 h-full w-[2px] bg-gradient-to-b from-[#67e8f9] to-transparent" />
          </div>
          <div className="absolute top-0 right-0 w-16 h-16 pointer-events-none">
            <div className="absolute top-0 right-0 w-full h-[2px] bg-gradient-to-l from-[#ffd800] to-transparent" />
            <div className="absolute top-0 right-0 h-full w-[2px] bg-gradient-to-b from-[#ffd800] to-transparent" />
          </div>

          <div className="p-8">
            {/* Header */}
            <div className="text-center mb-8">
              {/* Lock icon */}
              <div
                className="mx-auto mb-4 w-16 h-16 rounded-full flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.2) 0%, rgba(103, 232, 249, 0.1) 100%)',
                  border: '2px solid rgba(103, 232, 249, 0.3)',
                  animation: 'iconPulse 2s ease-in-out infinite',
                  boxShadow: '0 0 30px rgba(103, 232, 249, 0.2)',
                }}
              >
                <svg className="w-8 h-8 text-[#67e8f9]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>

              <h1
                className="font-cinzel text-2xl mb-2"
                style={{
                  background: 'linear-gradient(135deg, #67e8f9 0%, #ffd800 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Set New Password
              </h1>
              <p className="text-[#a1a1aa] text-sm">
                Enter your new password below
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-5">
              {/* Error message */}
              {error && (
                <div
                  className="p-4 rounded-xl flex items-center gap-3"
                  style={{
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    animation: 'shake 0.5s ease-in-out',
                  }}
                >
                  <svg className="w-5 h-5 text-[#f87171] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-[#f87171] text-sm">{error}</span>
                </div>
              )}

              {/* New Password input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#67e8f9]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  New Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  required
                  minLength={6}
                  className="w-full h-12 px-4 rounded-xl text-white placeholder:text-[#52525b] outline-none transition-all duration-300 flex items-center"
                  style={{
                    background: 'rgba(10, 14, 26, 0.6)',
                    border: '1px solid rgba(103, 232, 249, 0.2)',
                  }}
                />
              </div>

              {/* Confirm Password input */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-medium text-[#67e8f9]">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  required
                  minLength={6}
                  className="w-full h-12 px-4 rounded-xl text-white placeholder:text-[#52525b] outline-none transition-all duration-300 flex items-center"
                  style={{
                    background: 'rgba(10, 14, 26, 0.6)',
                    border: '1px solid rgba(103, 232, 249, 0.2)',
                  }}
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                style={{
                  background: 'linear-gradient(135deg, #ffd800 0%, #ffe44d 100%)',
                  color: '#0a0e1a',
                  animation: 'buttonGlow 2s ease-in-out infinite',
                }}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Updating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Update Password
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-[#67e8f9] hover:text-[#ffd800] transition-colors"
              >
                <span className="text-[#71717a]">Changed your mind?</span>{' '}
                <span className="font-medium underline underline-offset-2">Back to Sign In</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
