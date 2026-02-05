'use client';

import Link from 'next/link';

const legalLinks = [
  { href: '/privacy', label: 'Privacy Policy' },
  { href: '/terms', label: 'Terms of Service' },
  { href: '/cookies', label: 'Cookie Policy' },
  { href: '/legal', label: 'Legal Notice' },
];

export default function Footer() {
  const openCookiePreferences = () => {
    window.dispatchEvent(new Event('show-cookie-consent'));
  };

  return (
    <footer
      className="relative z-20 w-full py-6 px-4"
      style={{
        borderTop: '1px solid rgba(103, 232, 249, 0.08)',
        background: 'rgba(10, 14, 26, 0.5)',
      }}
    >
      <div className="w-full px-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
          {legalLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs transition-colors hover:underline"
              style={{ color: 'rgba(232, 232, 232, 0.45)' }}
            >
              {link.label}
            </Link>
          ))}
          <button
            onClick={openCookiePreferences}
            className="text-xs transition-colors hover:underline"
            style={{ color: 'rgba(232, 232, 232, 0.45)' }}
          >
            Cookie Preferences
          </button>
        </div>
        <span className="text-xs sm:ml-auto shrink-0" style={{ color: 'rgba(232, 232, 232, 0.3)' }}>
          &copy; {new Date().getFullYear()} [Business Name]
        </span>
      </div>
    </footer>
  );
}
