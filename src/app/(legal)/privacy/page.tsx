import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy - Astrology Calculator',
};

export default function PrivacyPolicyPage() {
  return (
    <article className="legal-content space-y-8">
      <header>
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: '#ffd800', fontFamily: 'var(--font-cinzel)' }}
        >
          Privacy Policy
        </h1>
        <p className="text-sm" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>
          Last updated: [Date]
        </p>
      </header>

      <Section title="1. Who We Are">
        <p>
          This website is operated by <Placeholder>Business Name</Placeholder>,
          located at <Placeholder>Business Address</Placeholder> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;).
        </p>
        <p>
          We are the data controller responsible for your personal data.
          If you have questions about this policy or your data, contact us at{' '}
          <Placeholder>contact@example.com</Placeholder>.
        </p>
      </Section>

      <Section title="2. What Data We Collect">
        <p>We collect the following personal data:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong>Account information:</strong> Email address and authentication credentials
            when you create an account (via Supabase Auth).
          </li>
          <li>
            <strong>Booking information:</strong> Consultation dates, times, duration,
            and any notes you provide when booking a session.
          </li>
          <li>
            <strong>Payment information:</strong> Payment processing is handled by Stripe.
            We do not store your full credit card number. Stripe may store payment details
            in accordance with their{' '}
            <a
              href="https://stripe.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: '#67e8f9' }}
            >
              privacy policy
            </a>
            .
          </li>
          <li>
            <strong>Usage data:</strong> Browser type, IP address, pages visited, and
            timestamps (only if you consent to analytics cookies).
          </li>
        </ul>
      </Section>

      <Section title="3. Legal Basis for Processing">
        <p>We process your data based on:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong>Contract performance:</strong> To provide consultation booking services
            you have requested.
          </li>
          <li>
            <strong>Consent:</strong> For optional analytics and marketing cookies.
          </li>
          <li>
            <strong>Legitimate interest:</strong> To maintain site security and prevent fraud.
          </li>
          <li>
            <strong>Legal obligation:</strong> To comply with tax and accounting requirements.
          </li>
        </ul>
      </Section>

      <Section title="4. How We Use Your Data">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>To create and manage your account</li>
          <li>To process and manage consultation bookings</li>
          <li>To process payments via Stripe</li>
          <li>To send booking confirmations and reminders</li>
          <li>To respond to your inquiries</li>
          <li>To improve our services (with anonymized/aggregated data)</li>
        </ul>
      </Section>

      <Section title="5. Data Sharing">
        <p>We share your data with the following third-party processors:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong>Supabase</strong> (database and authentication hosting) &mdash; EU region
          </li>
          <li>
            <strong>Stripe</strong> (payment processing)
          </li>
          <li>
            <strong>Vercel</strong> (website hosting)
          </li>
        </ul>
        <p>
          We do not sell your personal data to third parties. Data is only shared as
          necessary to provide our services.
        </p>
      </Section>

      <Section title="6. Data Retention">
        <p>We retain your data for the following periods:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong>Account data:</strong> Until you delete your account or request deletion.
          </li>
          <li>
            <strong>Booking records:</strong> For <Placeholder>X years</Placeholder> after
            the consultation, as required for business and tax records.
          </li>
          <li>
            <strong>Payment records:</strong> As required by applicable tax and accounting
            laws (typically 5&ndash;10 years).
          </li>
        </ul>
      </Section>

      <Section title="7. Your Rights (GDPR)">
        <p>Under the GDPR, you have the right to:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            <strong>Access</strong> your personal data
          </li>
          <li>
            <strong>Rectify</strong> inaccurate data
          </li>
          <li>
            <strong>Erase</strong> your data (&quot;right to be forgotten&quot;)
          </li>
          <li>
            <strong>Restrict</strong> processing
          </li>
          <li>
            <strong>Data portability</strong> &mdash; receive your data in a structured format
          </li>
          <li>
            <strong>Object</strong> to processing based on legitimate interest
          </li>
          <li>
            <strong>Withdraw consent</strong> at any time for consent-based processing
          </li>
        </ul>
        <p>
          To exercise any of these rights, contact us at{' '}
          <Placeholder>contact@example.com</Placeholder>. We will respond within 30 days.
        </p>
      </Section>

      <Section title="8. Cookies">
        <p>
          We use cookies for essential functionality (authentication and payments).
          Optional cookies require your consent. See our{' '}
          <Link href="/cookies" className="underline" style={{ color: '#67e8f9' }}>
            Cookie Policy
          </Link>{' '}
          for full details.
        </p>
      </Section>

      <Section title="9. Data Security">
        <p>
          We implement appropriate technical and organizational measures to protect
          your data, including encrypted connections (HTTPS/TLS), secure authentication,
          and access controls. Our database is hosted in the EU (Supabase, eu-central-1).
        </p>
      </Section>

      <Section title="10. International Transfers">
        <p>
          Some of our processors (Stripe, Vercel) may process data outside the EEA.
          Where this occurs, appropriate safeguards are in place, including Standard
          Contractual Clauses (SCCs) approved by the European Commission.
        </p>
      </Section>

      <Section title="11. Supervisory Authority">
        <p>
          If you believe your data protection rights have been violated, you have the
          right to lodge a complaint with your local data protection authority. In
          Slovenia, this is the{' '}
          <Placeholder>
            Information Commissioner (Informacijski poobla&scaron;&#269;enec)
          </Placeholder>
          .
        </p>
      </Section>

      <Section title="12. Changes to This Policy">
        <p>
          We may update this policy from time to time. We will notify you of significant
          changes by posting a notice on the site. The &quot;last updated&quot; date at the top
          reflects the most recent revision.
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
