'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from './AuthProvider';

export function UserMenu() {
  const { user, isPremium, isAdmin, isSuperuser, signOut, isLoading, avatarUrl } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hasFlashed, setHasFlashed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
    // End flash animation after it completes
    const timer = setTimeout(() => setHasFlashed(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  const closeMenu = useCallback(() => {
    if (isOpen && !isClosing) {
      setIsClosing(true);
      setTimeout(() => {
        setIsOpen(false);
        setIsClosing(false);
      }, 150);
    }
  }, [isOpen, isClosing]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        closeMenu();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeMenu();
        buttonRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, closeMenu]);

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      setIsOpen(true);
    }
  };

  // Show skeleton while mounting, loading auth state, or waiting for avatar
  if (!mounted || isLoading || (user && !avatarUrl)) {
    return (
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-full animate-pulse"
          style={{
            background: 'linear-gradient(135deg, rgba(103, 232, 249, 0.15) 0%, rgba(30, 150, 252, 0.1) 100%)',
            border: '2px solid rgba(103, 232, 249, 0.3)',
          }}
        />
      </div>
    );
  }

  // Show auth buttons when not logged in
  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="
            py-3 text-sm font-medium text-[#a8b4c4]
            hover:text-white transition-all duration-300
            relative group rounded-lg
          "
          style={{ paddingLeft: '10px', paddingRight: '10px' }}
        >
          <span className="relative z-10">Sign In</span>
          <span
            className="
              absolute inset-0 rounded-lg opacity-0
              group-hover:opacity-100 transition-opacity duration-300
              bg-gradient-to-r from-[#67e8f9]/5 to-[#67e8f9]/10
            "
          />
        </Link>
        <Link
          href="/signup"
          className="
            relative py-3 text-sm font-semibold rounded-lg
            bg-gradient-to-r from-[#ffd800] to-[#ffb800]
            text-[#0a0e1a]
            transition-all duration-300
            hover:shadow-[0_0_20px_rgba(255,216,0,0.4)]
            hover:scale-[1.02]
            active:scale-[0.98]
          "
          style={{ paddingLeft: '10px', paddingRight: '10px' }}
        >
          <span className="relative z-10">Get Started</span>
        </Link>
      </div>
    );
  }

  const initials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user.email?.slice(0, 2).toUpperCase() || '??';

  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

  return (
    <div className="relative" ref={menuRef}>
      {/* Avatar Button */}
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="User menu"
        className={`
          flex items-center gap-2.5 p-1.5 rounded-full
          transition-all duration-300 ease-out
          hover:bg-white/5
          focus:outline-none focus-visible:ring-2 focus-visible:ring-[#67e8f9]/50
          ${isOpen ? 'bg-white/5' : ''}
        `}
      >
        {/* Avatar */}
        <div
          className={`
            relative w-10 h-10 rounded-full
            flex items-center justify-center text-sm font-bold
            transition-all duration-300
            ${isPremium
              ? 'shadow-[0_0_15px_rgba(255,216,0,0.3)]'
              : 'shadow-[0_0_12px_rgba(103,232,249,0.25)]'
            }
          `}
          style={{
            background: isPremium
              ? 'linear-gradient(135deg, rgba(255, 216, 0, 0.15) 0%, rgba(255, 184, 0, 0.1) 100%)'
              : 'linear-gradient(135deg, rgba(103, 232, 249, 0.15) 0%, rgba(30, 150, 252, 0.1) 100%)',
          }}
        >
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName}
              width={52}
              height={52}
              className="object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          ) : (
            <span
              className={`
                relative z-10 font-semibold tracking-wide
                ${isPremium ? 'text-[#ffd800]' : 'text-[#67e8f9]'}
              `}
            >
              {initials}
            </span>
          )}

          {/* Premium indicator dot */}
          {isPremium && (
            <span
              className="
                absolute -top-0.5 -right-0.5 w-3 h-3
                bg-gradient-to-br from-[#ffd800] to-[#ff9500]
                rounded-full border-2 border-[#0a0e1a]
                shadow-[0_0_8px_rgba(255,216,0,0.6)]
              "
            />
          )}
        </div>

        {/* Chevron */}
        <div
          className="relative flex items-center justify-center w-5 h-5 rounded-full bg-[#67e8f9]/15 transition-all duration-300 ease-out"
          style={{
            boxShadow: isOpen ? 'none' : '0 0 6px rgba(103, 232, 249, 0.3)',
          }}
        >
          {/* Flash ring - only shows once on load */}
          {!hasFlashed && !isOpen && (
            <span
              className="absolute inset-0 rounded-full animate-[chevron-flash_1s_ease-out_forwards]"
              style={{
                background: 'rgba(103, 232, 249, 0.8)',
              }}
            />
          )}
          <svg
            className={`
              relative z-10 w-3 h-3 text-[#67e8f9]
              transition-transform duration-300 ease-out
              ${isOpen ? 'rotate-180' : ''}
            `}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          aria-orientation="vertical"
          className={`
            absolute right-0 top-full mt-2 w-72
            rounded-xl overflow-hidden z-50
            transform origin-top-right
            ${isClosing ? 'animate-menu-close' : 'animate-menu-open'}
          `}
          style={{
            background: 'linear-gradient(180deg, rgba(15, 20, 35, 0.98) 0%, rgba(10, 14, 26, 0.98) 100%)',
            border: '1px solid rgba(103, 232, 249, 0.12)',
            boxShadow: `
              0 4px 6px rgba(0, 0, 0, 0.1),
              0 10px 30px rgba(0, 0, 0, 0.4),
              0 0 40px rgba(103, 232, 249, 0.08),
              inset 0 1px 0 rgba(255, 255, 255, 0.03)
            `,
            backdropFilter: 'blur(20px)',
          }}
        >
          {/* User Info Header */}
          <div
            style={{
              padding: '20px 24px',
              background: 'linear-gradient(180deg, rgba(103, 232, 249, 0.03) 0%, transparent 100%)',
              borderBottom: '1px solid rgba(103, 232, 249, 0.08)',
            }}
          >
            <div className="flex items-start gap-3">
              {/* Mini Avatar */}
              <div
                className="relative w-11 h-11 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold"
                style={{
                  background: isPremium
                    ? 'linear-gradient(135deg, rgba(255, 216, 0, 0.12) 0%, rgba(255, 184, 0, 0.08) 100%)'
                    : 'linear-gradient(135deg, rgba(103, 232, 249, 0.12) 0%, rgba(30, 150, 252, 0.08) 100%)',
                }}
              >
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt={displayName}
                    width={56}
                    height={56}
                    className="object-contain absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                  />
                ) : (
                  <span className={isPremium ? 'text-[#ffd800]' : 'text-[#67e8f9]'}>
                    {initials}
                  </span>
                )}
              </div>

              {/* Name and Email */}
              <div className="flex-1 min-w-0 pt-0.5">
                <p className="text-white font-medium truncate text-[15px]">
                  {displayName}
                </p>
                <p className="text-[#6b7a90] text-sm truncate mt-0.5">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Premium Badge */}
            {isPremium && (
              <div
                className="
                  inline-flex items-center gap-2
                  py-2 rounded-full text-xs font-semibold
                  bg-gradient-to-r from-[#ffd800]/15 to-[#ff9500]/10
                  text-[#ffd800] border border-[#ffd800]/25
                "
                style={{ marginTop: '16px', paddingLeft: '10px', paddingRight: '10px' }}
              >
                <svg
                  className="w-3.5 h-3.5"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
                Pro Member
              </div>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1.5">
            <Link
              href="/account"
              role="menuitem"
              onClick={() => closeMenu()}
              className="
                flex items-center gap-3 px-5 py-3
                text-sm text-[#b8c4d4]
                transition-all duration-200
                hover:text-white hover:bg-white/[0.04]
                focus:outline-none focus-visible:bg-white/[0.04]
                group
              "
            >
              <span
                className="
                  w-8 h-8 rounded-lg flex items-center justify-center
                  bg-[#67e8f9]/10 text-[#67e8f9]
                  transition-all duration-200
                  group-hover:bg-[#67e8f9]/15
                  group-hover:shadow-[0_0_12px_rgba(103,232,249,0.2)]
                "
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <span>My Account</span>
            </Link>

            <Link
              href="/suggestions"
              role="menuitem"
              onClick={() => closeMenu()}
              className="
                flex items-center gap-3 px-5 py-3
                text-sm text-[#b8c4d4]
                transition-all duration-200
                hover:text-white hover:bg-white/[0.04]
                focus:outline-none focus-visible:bg-white/[0.04]
                group
              "
            >
              <span
                className="
                  w-8 h-8 rounded-lg flex items-center justify-center
                  bg-[#67e8f9]/10 text-[#67e8f9]
                  transition-all duration-200
                  group-hover:bg-[#67e8f9]/15
                  group-hover:shadow-[0_0_12px_rgba(103,232,249,0.2)]
                "
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </span>
              <span>Suggestions</span>
            </Link>

            <Link
              href="/notes"
              role="menuitem"
              onClick={() => closeMenu()}
              className={`
                flex items-center gap-3 px-5 py-3
                text-sm transition-all duration-200
                focus:outline-none group
                ${isPremium
                  ? 'text-[#b8c4d4] hover:text-white hover:bg-white/[0.04] focus-visible:bg-white/[0.04]'
                  : 'text-[#b8c4d4] hover:text-white hover:bg-[#ffd800]/[0.04] focus-visible:bg-[#ffd800]/[0.04]'
                }
              `}
            >
              <span
                className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  transition-all duration-200
                  ${isPremium
                    ? 'bg-[#67e8f9]/10 text-[#67e8f9] group-hover:bg-[#67e8f9]/15 group-hover:shadow-[0_0_12px_rgba(103,232,249,0.2)]'
                    : 'bg-[#ffd800]/10 text-[#ffd800] group-hover:bg-[#ffd800]/15 group-hover:shadow-[0_0_12px_rgba(255,216,0,0.2)]'
                  }
                `}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </span>
              <span className="flex-1">Study Notes</span>
              {!isPremium && (
                <span
                  className="
                    px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide
                    rounded bg-[#ffd800]/15 text-[#ffd800]
                    border border-[#ffd800]/25
                  "
                >
                  Pro
                </span>
              )}
            </Link>

            {isAdmin && (
              <Link
                href="/admin"
                role="menuitem"
                onClick={() => closeMenu()}
                className="
                  flex items-center gap-3 px-5 py-3
                  text-sm text-[#b8c4d4]
                  transition-all duration-200
                  hover:text-white hover:bg-white/[0.04]
                  focus:outline-none focus-visible:bg-white/[0.04]
                  group
                "
              >
                <span
                  className="
                    w-8 h-8 rounded-lg flex items-center justify-center
                    bg-[#ffd800]/10 text-[#ffd800]
                    transition-all duration-200
                    group-hover:bg-[#ffd800]/15
                    group-hover:shadow-[0_0_12px_rgba(255,216,0,0.2)]
                  "
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                    />
                  </svg>
                </span>
                <span>Admin Panel</span>
              </Link>
            )}

            {isSuperuser && (
              <Link
                href="/superuser"
                role="menuitem"
                onClick={() => closeMenu()}
                className="
                  flex items-center gap-3 px-5 py-3
                  text-sm text-[#b8c4d4]
                  transition-all duration-200
                  hover:text-white hover:bg-white/[0.04]
                  focus:outline-none focus-visible:bg-white/[0.04]
                  group
                "
              >
                <span
                  className="
                    w-8 h-8 rounded-lg flex items-center justify-center
                    bg-[#a855f7]/10 text-[#a855f7]
                    transition-all duration-200
                    group-hover:bg-[#a855f7]/15
                    group-hover:shadow-[0_0_12px_rgba(168,85,247,0.2)]
                  "
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </span>
                <span>Keywords Editor</span>
              </Link>
            )}

            {!isPremium && (
              <Link
                href="/pricing"
                role="menuitem"
                onClick={() => closeMenu()}
                className="
                  flex items-center gap-3 px-5 py-3
                  text-sm transition-all duration-200
                  hover:bg-[#ffd800]/[0.06]
                  focus:outline-none focus-visible:bg-[#ffd800]/[0.06]
                  group
                "
              >
                <span
                  className="
                    w-8 h-8 rounded-lg flex items-center justify-center
                    bg-[#ffd800]/10 text-[#ffd800]
                    transition-all duration-200
                    group-hover:bg-[#ffd800]/15
                    group-hover:shadow-[0_0_12px_rgba(255,216,0,0.25)]
                  "
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                  </svg>
                </span>
                <span className="flex-1 text-[#ffd800]">Upgrade to Pro</span>
                <span
                  className="
                    py-0.5 text-[10px] font-bold uppercase tracking-wide
                    rounded bg-gradient-to-r from-[#ffd800] to-[#ff9500]
                    text-[#0a0e1a]
                    shadow-[0_0_8px_rgba(255,216,0,0.3)]
                  "
                  style={{ paddingLeft: '10px', paddingRight: '10px' }}
                >
                  Save 20%
                </span>
              </Link>
            )}
          </div>

          {/* Divider */}
          <div
            className="mx-4 h-px"
            style={{
              background: 'linear-gradient(90deg, transparent 0%, rgba(103, 232, 249, 0.1) 50%, transparent 100%)',
            }}
          />

          {/* Sign Out */}
          <div className="py-1.5">
            <button
              role="menuitem"
              onClick={() => {
                closeMenu();
                signOut();
              }}
              className="
                flex items-center gap-3 w-full px-5 py-3
                text-sm text-[#f87171]
                transition-all duration-200
                hover:text-[#fca5a5] hover:bg-[#f87171]/[0.06]
                focus:outline-none focus-visible:bg-[#f87171]/[0.06]
                group
              "
            >
              <span
                className="
                  w-8 h-8 rounded-lg flex items-center justify-center
                  bg-[#f87171]/10 text-[#f87171]
                  transition-all duration-200
                  group-hover:bg-[#f87171]/15
                "
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.75}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
              </span>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
