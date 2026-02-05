import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service - Astrology Calculator',
};

export default function TermsOfServicePage() {
  return (
    <article className="legal-content space-y-8">
      <header>
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: '#ffd800', fontFamily: 'var(--font-cinzel)' }}
        >
          Terms of Service
        </h1>
        <p className="text-sm" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>
          Last updated: [Date]
        </p>
      </header>

      <Section title="1. Introduction">
        <p>
          These Terms of Service (&quot;Terms&quot;) govern your use of the website
          operated by <Placeholder>Business Name</Placeholder> (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;),
          located at <Placeholder>https://your-domain.com</Placeholder>.
        </p>
        <p>
          By accessing or using our services, you agree to be bound by these Terms.
          If you do not agree, please do not use the site.
        </p>
      </Section>

      <Section title="2. Services">
        <p>
          We provide an astrology calculator tool and consultation booking services.
          Consultations are provided by <Placeholder>Consultant Name / Business Name</Placeholder> and
          may be conducted via video call (Zoom) or other agreed means.
        </p>
      </Section>

      <Section title="3. Account Registration">
        <p>
          To book consultations, you must create an account with a valid email address.
          You are responsible for maintaining the confidentiality of your account
          credentials and for all activity under your account.
        </p>
      </Section>

      <Section title="4. Bookings and Scheduling">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Consultation slots are subject to availability.</li>
          <li>
            By booking a consultation, you agree to attend at the scheduled time.
          </li>
          <li>
            All times displayed are automatically converted to your local timezone.
          </li>
          <li>
            A booking is confirmed only after successful payment authorization.
          </li>
        </ul>
      </Section>

      <Section title="5. Payments">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            Payments are processed securely through Stripe. We do not store your
            payment card details.
          </li>
          <li>
            A payment hold (authorization) is placed at the time of booking.
            The charge is captured upon confirmation of the consultation.
          </li>
          <li>
            Prices are displayed in <Placeholder>EUR / USD / currency</Placeholder> and
            include applicable taxes unless otherwise stated.
          </li>
        </ul>
      </Section>

      <Section title="6. Cancellation and Refunds">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>
            You may cancel a booking up to{' '}
            <Placeholder>24 / 48 hours</Placeholder> before the scheduled
            consultation for a full refund.
          </li>
          <li>
            Cancellations made less than{' '}
            <Placeholder>24 / 48 hours</Placeholder> before the consultation
            may not be eligible for a refund.
          </li>
          <li>
            If we cancel a consultation, you will receive a full refund.
          </li>
          <li>
            No-shows without prior notice are not eligible for a refund.
          </li>
        </ul>
        <p>
          Under EU consumer protection law, the right of withdrawal does not apply
          to services that have been fully performed with your prior express consent.
        </p>
      </Section>

      <Section title="7. Intellectual Property">
        <p>
          All content on this website, including text, graphics, logos, and software,
          is the property of <Placeholder>Business Name</Placeholder> and is protected
          by applicable intellectual property laws. You may not reproduce, distribute,
          or create derivative works without our written permission.
        </p>
      </Section>

      <Section title="8. Disclaimer">
        <p>
          Astrology consultations and calculator results are provided for
          entertainment and personal insight purposes only. They do not constitute
          professional advice (medical, legal, financial, or otherwise). We make no
          guarantees regarding the accuracy or completeness of astrological
          interpretations.
        </p>
      </Section>

      <Section title="9. Limitation of Liability">
        <p>
          To the maximum extent permitted by law, <Placeholder>Business Name</Placeholder> shall
          not be liable for any indirect, incidental, special, or consequential damages
          arising from your use of the services. Our total liability shall not exceed
          the amount you paid for the specific service giving rise to the claim.
        </p>
      </Section>

      <Section title="10. User Conduct">
        <p>You agree not to:</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>Use the service for any unlawful purpose</li>
          <li>Attempt to gain unauthorized access to any part of the service</li>
          <li>Interfere with or disrupt the service</li>
          <li>Impersonate any person or entity</li>
        </ul>
      </Section>

      <Section title="11. Privacy">
        <p>
          Your use of the service is also governed by our{' '}
          <Link href="/privacy" className="underline" style={{ color: '#67e8f9' }}>
            Privacy Policy
          </Link>
          , which describes how we collect and use your personal data.
        </p>
      </Section>

      <Section title="12. Governing Law">
        <p>
          These Terms are governed by the laws of{' '}
          <Placeholder>Republic of Slovenia / your jurisdiction</Placeholder>.
          Any disputes shall be resolved by the competent courts in{' '}
          <Placeholder>City, Country</Placeholder>.
        </p>
      </Section>

      <Section title="13. Changes to These Terms">
        <p>
          We reserve the right to modify these Terms at any time. We will notify
          users of material changes by posting a notice on the site. Continued use
          after changes constitutes acceptance of the updated Terms.
        </p>
      </Section>

      <Section title="14. Contact">
        <p>
          For questions about these Terms, contact us at{' '}
          <Placeholder>contact@example.com</Placeholder>.
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
