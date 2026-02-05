import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Cookie Policy - Astrology Calculator',
};

export default function CookiePolicyPage() {
  return (
    <article className="legal-content space-y-8">
      <header>
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: '#ffd800', fontFamily: 'var(--font-cinzel)' }}
        >
          Cookie Policy
        </h1>
        <p className="text-sm" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>
          Last updated: [Date]
        </p>
      </header>

      <Section title="1. What Are Cookies?">
        <p>
          Cookies are small text files stored on your device when you visit a website.
          They help the site function properly, remember your preferences, and improve
          your experience.
        </p>
      </Section>

      <Section title="2. How We Use Cookies">
        <p>
          We use cookies in the following categories:
        </p>
      </Section>

      {/* Cookie Table */}
      <section>
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: '#67e8f9', fontFamily: 'var(--font-cinzel)' }}
        >
          3. Cookies We Use
        </h2>

        {/* Essential Cookies */}
        <div className="mb-6">
          <h3
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: '#e8e8e8' }}
          >
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{ background: 'rgba(103, 232, 249, 0.15)', color: '#67e8f9' }}
            >
              Essential
            </span>
            Always Active
          </h3>
          <CookieTable
            cookies={[
              {
                name: 'sb-*-auth-token',
                provider: 'Supabase',
                purpose: 'Stores your authentication session so you stay logged in.',
                duration: 'Session / 1 year',
              },
              {
                name: '__stripe_mid / __stripe_sid',
                provider: 'Stripe',
                purpose: 'Required for secure payment processing and fraud prevention.',
                duration: 'Session / 1 year',
              },
              {
                name: 'cookie-consent',
                provider: 'This site',
                purpose: 'Stores your cookie preference choices.',
                duration: 'Persistent (1 year)',
              },
              {
                name: 'cookie-consent-date',
                provider: 'This site',
                purpose: 'Records when you gave/updated your cookie consent.',
                duration: 'Persistent (1 year)',
              },
            ]}
          />
        </div>

        {/* Analytics Cookies */}
        <div className="mb-6">
          <h3
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: '#e8e8e8' }}
          >
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{ background: 'rgba(255, 216, 0, 0.15)', color: '#ffd800' }}
            >
              Analytics
            </span>
            Requires Consent
          </h3>
          <CookieTable
            cookies={[
              {
                name: '[No analytics cookies currently in use]',
                provider: '—',
                purpose:
                  'We do not currently use analytics cookies. If we add analytics in the future, this section will be updated and consent will be required.',
                duration: '—',
              },
            ]}
          />
        </div>

        {/* Marketing Cookies */}
        <div className="mb-6">
          <h3
            className="text-sm font-semibold mb-3 flex items-center gap-2"
            style={{ color: '#e8e8e8' }}
          >
            <span
              className="px-2 py-0.5 rounded text-xs"
              style={{ background: 'rgba(255, 100, 100, 0.15)', color: '#ff8080' }}
            >
              Marketing
            </span>
            Requires Consent
          </h3>
          <CookieTable
            cookies={[
              {
                name: '[No marketing cookies currently in use]',
                provider: '—',
                purpose:
                  'We do not currently use marketing cookies. If we add them in the future, this section will be updated and consent will be required.',
                duration: '—',
              },
            ]}
          />
        </div>
      </section>

      <Section title="4. Managing Cookies">
        <p>
          You can manage your cookie preferences at any time by clicking the
          &quot;Cookie Preferences&quot; link in the footer of any page. You can also
          delete cookies through your browser settings.
        </p>
        <p>
          Note that disabling essential cookies may prevent the site from functioning
          correctly (e.g., you may not be able to log in or make payments).
        </p>
      </Section>

      <Section title="5. Local Storage">
        <p>
          In addition to cookies, we use browser local storage to store:
        </p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Your cookie consent preferences</li>
          <li>Authentication session tokens (managed by Supabase)</li>
        </ul>
        <p>
          Local storage data persists until you clear your browser data or we
          programmatically remove it.
        </p>
      </Section>

      <Section title="6. Third-Party Cookies">
        <p>
          Our payment processor (Stripe) may set cookies on your device during
          the payment process. These are essential for secure transaction processing.
          For details, see{' '}
          <a
            href="https://stripe.com/cookies-policy/legal"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
            style={{ color: '#67e8f9' }}
          >
            Stripe&apos;s Cookie Policy
          </a>
          .
        </p>
      </Section>

      <Section title="7. Updates to This Policy">
        <p>
          We may update this Cookie Policy from time to time. Changes will be posted
          on this page with an updated &quot;last updated&quot; date.
        </p>
      </Section>

      <Section title="8. Contact">
        <p>
          For questions about our use of cookies, contact us at{' '}
          <Placeholder>contact@example.com</Placeholder> or see our{' '}
          <Link href="/privacy" className="underline" style={{ color: '#67e8f9' }}>
            Privacy Policy
          </Link>
          .
        </p>
      </Section>
    </article>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2
        className="text-lg font-semibold"
        style={{ color: '#67e8f9', fontFamily: 'var(--font-cinzel)' }}
      >
        {title}
      </h2>
      <div
        className="space-y-2 text-sm leading-relaxed"
        style={{ color: 'rgba(232, 232, 232, 0.75)' }}
      >
        {children}
      </div>
    </section>
  );
}

function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded text-xs font-mono"
      style={{
        background: 'rgba(255, 216, 0, 0.1)',
        color: '#ffd800',
        border: '1px dashed rgba(255, 216, 0, 0.3)',
      }}
    >
      {children}
    </span>
  );
}

type CookieInfo = {
  name: string;
  provider: string;
  purpose: string;
  duration: string;
};

function CookieTable({ cookies }: { cookies: CookieInfo[] }) {
  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        border: '1px solid rgba(103, 232, 249, 0.1)',
      }}
    >
      <table className="w-full text-sm">
        <thead>
          <tr style={{ background: 'rgba(103, 232, 249, 0.05)' }}>
            <th
              className="text-left px-4 py-2 text-xs font-semibold"
              style={{ color: 'rgba(232, 232, 232, 0.6)' }}
            >
              Cookie
            </th>
            <th
              className="text-left px-4 py-2 text-xs font-semibold hidden sm:table-cell"
              style={{ color: 'rgba(232, 232, 232, 0.6)' }}
            >
              Provider
            </th>
            <th
              className="text-left px-4 py-2 text-xs font-semibold"
              style={{ color: 'rgba(232, 232, 232, 0.6)' }}
            >
              Purpose
            </th>
            <th
              className="text-left px-4 py-2 text-xs font-semibold hidden sm:table-cell"
              style={{ color: 'rgba(232, 232, 232, 0.6)' }}
            >
              Duration
            </th>
          </tr>
        </thead>
        <tbody>
          {cookies.map((cookie, i) => (
            <tr
              key={i}
              style={{
                borderTop: '1px solid rgba(103, 232, 249, 0.06)',
              }}
            >
              <td
                className="px-4 py-2 font-mono text-xs"
                style={{ color: '#67e8f9' }}
              >
                {cookie.name}
              </td>
              <td
                className="px-4 py-2 text-xs hidden sm:table-cell"
                style={{ color: 'rgba(232, 232, 232, 0.6)' }}
              >
                {cookie.provider}
              </td>
              <td
                className="px-4 py-2 text-xs"
                style={{ color: 'rgba(232, 232, 232, 0.6)' }}
              >
                {cookie.purpose}
              </td>
              <td
                className="px-4 py-2 text-xs hidden sm:table-cell"
                style={{ color: 'rgba(232, 232, 232, 0.6)' }}
              >
                {cookie.duration}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
