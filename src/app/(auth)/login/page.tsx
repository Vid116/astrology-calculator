'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

// Celestial input component with glow effects
function CelestialInput({
  id,
  type,
  placeholder,
  value,
  onChange,
  required,
  icon,
  label,
}: {
  id: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="text-sm font-medium flex items-center gap-2 transition-colors duration-300"
        style={{ color: isFocused ? '#67e8f9' : '#a1a1aa' }}
      >
        <span className="transition-all duration-300" style={{ opacity: isFocused ? 1 : 0.7 }}>
          {icon}
        </span>
        {label}
      </label>
      <div className="relative group">
        {/* Glow effect on focus */}
        <div
          className="absolute -inset-0.5 rounded-xl transition-all duration-500 opacity-0 group-focus-within:opacity-100"
          style={{
            background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.3), rgba(255, 216, 0, 0.2))',
            filter: 'blur(8px)',
          }}
        />
        <input
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="relative w-full h-12 rounded-xl text-white placeholder:text-[#52525b] transition-all duration-300 outline-none flex items-center"
          style={{
            paddingLeft: '18px',
            paddingRight: '16px',
            background: isFocused
              ? 'rgba(10, 14, 26, 0.8)'
              : 'rgba(10, 14, 26, 0.6)',
            border: isFocused
              ? '1px solid rgba(103, 232, 249, 0.5)'
              : '1px solid rgba(103, 232, 249, 0.15)',
            boxShadow: isFocused
              ? '0 0 30px rgba(103, 232, 249, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
              : 'inset 0 1px 0 rgba(255, 255, 255, 0.02)',
          }}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push('/');
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <>
      <style>{`
        @keyframes cardFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
        }

        @keyframes shimmerGold {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes buttonGlow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(255, 216, 0, 0.3), 0 0 40px rgba(255, 216, 0, 0.15);
          }
          50% {
            box-shadow: 0 0 35px rgba(255, 216, 0, 0.5), 0 0 60px rgba(255, 216, 0, 0.25);
          }
        }

        @keyframes iconPulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 0 20px rgba(255, 216, 0, 0.3);
          }
          50% {
            transform: scale(1.05);
            box-shadow: 0 0 35px rgba(255, 216, 0, 0.5);
          }
        }

        @keyframes borderRotate {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-4px); }
          20%, 40%, 60%, 80% { transform: translateX(4px); }
        }

        @keyframes spinLoader {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div
        className="relative rounded-2xl overflow-hidden"
        style={{
          animation: 'cardFloat 6s ease-in-out infinite',
        }}
      >
        {/* Animated gradient border */}
        <div
          className="absolute -inset-[1px] rounded-2xl"
          style={{
            background: 'linear-gradient(90deg, rgba(103, 232, 249, 0.4), rgba(255, 216, 0, 0.3), rgba(30, 150, 252, 0.4), rgba(255, 216, 0, 0.3), rgba(103, 232, 249, 0.4))',
            backgroundSize: '300% 100%',
            animation: 'borderRotate 8s linear infinite',
          }}
        />

        {/* Glassmorphism card */}
        <div
          className="relative rounded-2xl"
          style={{
            padding: '24px 24px',
            background: 'linear-gradient(135deg, rgba(10, 14, 26, 0.95) 0%, rgba(15, 20, 35, 0.9) 50%, rgba(10, 14, 26, 0.95) 100%)',
            backdropFilter: 'blur(24px)',
            boxShadow: '0 25px 80px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05), inset 0 -1px 0 rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Inner glow effect */}
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{
              background: 'radial-gradient(ellipse at top, rgba(103, 232, 249, 0.05) 0%, transparent 50%), radial-gradient(ellipse at bottom, rgba(255, 216, 0, 0.03) 0%, transparent 50%)',
            }}
          />

          {/* Header section */}
          <div className="relative text-center" style={{ marginBottom: '16px' }}>
            <h1
              className="font-cinzel text-3xl tracking-wider mb-2"
              style={{
                background: 'linear-gradient(135deg, #ffd800 0%, #ffe44d 50%, #ffd800 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(255, 216, 0, 0.3)',
              }}
            >
              Welcome Back
            </h1>
            <p className="text-[#71717a] text-sm">
              Sign in to continue your celestial journey
            </p>
          </div>

          <form onSubmit={handleLogin} className="relative" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Error message */}
            {error && (
              <div
                className="p-4 rounded-xl flex items-center gap-3 text-sm"
                style={{
                  background: 'linear-gradient(135deg, rgba(227, 23, 10, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#fca5a5',
                  animation: 'shake 0.5s ease-in-out',
                }}
              >
                <svg className="w-5 h-5 flex-shrink-0 text-[#ef4444]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            {/* Email input */}
            <CelestialInput
              id="email"
              type="email"
              placeholder="celestial@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              label="Email"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              }
            />

            {/* Password input */}
            <CelestialInput
              id="password"
              type="password"
              placeholder="Enter your cosmic key"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              label="Password"
              icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              }
            />

            {/* Forgot password link */}
            <div className="text-right">
              <Link
                href="/forgot-password"
                className="text-sm text-[#67e8f9] hover:text-[#ffd800] transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full h-12 rounded-xl font-semibold text-base overflow-hidden transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed group flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #ffd800 0%, #ffe44d 50%, #ffd800 100%)',
                color: '#0a0e1a',
                animation: !loading ? 'buttonGlow 2s ease-in-out infinite' : 'none',
                transform: isHovered && !loading ? 'scale(1.02)' : 'scale(1)',
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {/* Shimmer effect */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmerGold 1.5s ease-in-out infinite',
                }}
              />

              <span className="relative z-10 flex items-center justify-center gap-2">
                {loading ? (
                  <>
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 24 24"
                      style={{ animation: 'spinLoader 1s linear infinite' }}
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Aligning stars...
                  </>
                ) : (
                  <>
                    Enter the Cosmos
                    <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center" style={{ margin: '14px 0' }}>
              <div
                className="flex-1 h-px"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(103, 232, 249, 0.25))',
                }}
              />
              <div
                className="flex items-center gap-3"
                style={{ padding: '0 16px' }}
              >
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="rgba(255, 216, 0, 0.5)">
                  <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
                </svg>
                <span
                  className="text-xs uppercase tracking-widest"
                  style={{ color: '#67e8f9' }}
                >
                  or
                </span>
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="rgba(255, 216, 0, 0.5)">
                  <path d="M12 2L13.5 8.5L20 10L13.5 11.5L12 18L10.5 11.5L4 10L10.5 8.5L12 2Z" />
                </svg>
              </div>
              <div
                className="flex-1 h-px"
                style={{
                  background: 'linear-gradient(90deg, rgba(103, 232, 249, 0.25), transparent)',
                }}
              />
            </div>

            {/* Google button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="relative w-full h-12 rounded-xl font-medium text-sm overflow-hidden transition-all duration-300 group flex items-center justify-center"
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(103, 232, 249, 0.2)',
                color: '#e8e8e8',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(103, 232, 249, 0.08)';
                e.currentTarget.style.borderColor = 'rgba(103, 232, 249, 0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                e.currentTarget.style.borderColor = 'rgba(103, 232, 249, 0.2)';
              }}
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Continue with Google
              </span>
            </button>
          </form>

          {/* Footer link */}
          <div className="relative text-center" style={{ marginTop: '16px' }}>
            <p className="text-[#71717a] text-sm">
              New to the cosmos?{' '}
              <Link
                href="/signup"
                className="font-medium transition-all duration-300 relative group"
                style={{ color: '#67e8f9' }}
              >
                <span className="relative z-10 group-hover:text-[#ffd800]">Create an account</span>
                <span
                  className="absolute bottom-0 left-0 w-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                  style={{
                    height: '1px',
                    background: '#67e8f9',
                  }}
                />
              </Link>
            </p>
          </div>

        </div>
      </div>
    </>
  );
}
