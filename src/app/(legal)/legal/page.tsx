import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Notice - Astrology Calculator',
};

export default function LegalNoticePage() {
  return (
    <article className="legal-content space-y-8">
      <header>
        <h1
          className="text-2xl sm:text-3xl font-bold mb-2"
          style={{ color: '#ffd800', fontFamily: 'var(--font-cinzel)' }}
        >
          Legal Notice (Imprint)
        </h1>
        <p className="text-sm" style={{ color: 'rgba(232, 232, 232, 0.5)' }}>
          Information in accordance with the EU eCommerce Directive (2000/31/EC)
        </p>
      </header>

      <Section title="Service Provider">
        <InfoRow label="Business Name" value="Business Name" />
        <InfoRow label="Legal Form" value="e.g., Sole Proprietor (s.p.) / d.o.o." />
        <InfoRow label="Address" value="Street, City, Postal Code, Country" />
        <InfoRow label="Email" value="contact@example.com" />
        <InfoRow label="Phone" value="+386 XX XXX XXX (optional)" />
      </Section>

      <Section title="Business Registration">
        <InfoRow label="Registration Number" value="Registration Number" />
        <InfoRow label="Register" value="e.g., AJPES / Court Register" />
        <InfoRow label="VAT Number" value="SI12345678 (if VAT registered)" />
      </Section>

      <Section title="Responsible for Content">
        <InfoRow label="Name" value="Full Name of Responsible Person" />
        <InfoRow label="Address" value="Same as above or different address" />
      </Section>

      <Section title="Dispute Resolution">
        <div
          className="space-y-2 text-sm leading-relaxed"
          style={{ color: 'rgba(232, 232, 232, 0.75)' }}
        >
          <p>
            The European Commission provides an Online Dispute Resolution (ODR)
            platform:{' '}
            <a
              href="https://consumer-redress.ec.europa.eu/index_en"
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
              style={{ color: '#67e8f9' }}
            >
              https://consumer-redress.ec.europa.eu/index_en
            </a>
          </p>
          <p>
            We are <Placeholder>willing / not obligated</Placeholder> to participate
            in dispute resolution proceedings before a consumer arbitration body.
          </p>
        </div>
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
    <section className="space-y-4">
      <h2
        className="text-lg font-semibold"
        style={{ color: '#67e8f9', fontFamily: 'var(--font-cinzel)' }}
      >
        {title}
      </h2>
      <div>{children}</div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center py-2"
      style={{
        borderBottom: '1px solid rgba(103, 232, 249, 0.06)',
      }}
    >
      <span
        className="text-sm font-medium w-48 shrink-0"
        style={{ color: 'rgba(232, 232, 232, 0.5)' }}
      >
        {label}
      </span>
      <span
        className="px-1.5 py-0.5 rounded text-xs font-mono"
        style={{
          background: 'rgba(255, 216, 0, 0.1)',
          color: '#ffd800',
          border: '1px dashed rgba(255, 216, 0, 0.3)',
        }}
      >
        {value}
      </span>
    </div>
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
