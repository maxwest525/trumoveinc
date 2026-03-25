import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "TruMove"

interface ESignRequestProps {
  customerName?: string
  documentLabel?: string
  refNumber?: string
  signingUrl?: string
}

const ESignRequestEmail = ({ customerName, documentLabel, refNumber, signingUrl }: ESignRequestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Action Required: Sign Your {documentLabel || 'Document'} – {refNumber || ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Logo Header */}
        <Section style={logoBar}>
          <Heading style={brandName}>{SITE_NAME}</Heading>
          <Text style={brandTagline}>Your Trusted Moving Partner</Text>
        </Section>

        {/* Hero Banner */}
        <Section style={heroBanner}>
          <Heading style={heroTitle}>Document Ready for Signature</Heading>
          <Text style={heroSubtitle}>{documentLabel || 'Document'} • {refNumber || 'N/A'}</Text>
        </Section>

        {/* Greeting */}
        <Section style={bodySection}>
          <Text style={greeting}>Hello {customerName || 'there'},</Text>
          <Text style={bodyText}>
            Your <strong>{documentLabel || 'document'}</strong> is ready for your review and signature. Please sign at your earliest convenience to keep your move on track.
          </Text>
        </Section>

        {/* CTA Button */}
        {signingUrl && (
          <Section style={ctaWrap}>
            <Button style={ctaButton} href={signingUrl}>Review & Sign Document</Button>
          </Section>
        )}

        {/* Details Card */}
        <Section style={detailsCard}>
          <Text style={detailsTitle}>Document Details</Text>
          <Text style={detailLabel}>Document Type:</Text>
          <Text style={detailValue}>{documentLabel || 'N/A'}</Text>
          <Hr style={divider} />
          <Text style={detailLabel}>Reference:</Text>
          <Text style={detailValue}>{refNumber || 'N/A'}</Text>
          <Hr style={divider} />
          <Text style={detailLabel}>Recipient:</Text>
          <Text style={detailValue}>{customerName || 'N/A'}</Text>
        </Section>

        {/* Help text */}
        <Text style={helpText}>
          If you have questions about this document, please contact your moving coordinator directly.
        </Text>

        {/* Footer */}
        <Hr style={hr} />
        <Section style={footerWrap}>
          <Text style={footerBrand}>{SITE_NAME}</Text>
          <Text style={footerText}>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </Text>
          <Text style={footerMuted}>
            This is an automated message. Please do not reply directly to this email.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ESignRequestEmail,
  subject: (data: Record<string, any>) =>
    `Action Required: Sign Your ${data.documentLabel || 'Document'} – ${data.refNumber || ''}`,
  displayName: 'E-Sign document request',
  previewData: {
    customerName: 'Jane Smith',
    documentLabel: 'Estimate Authorization',
    refNumber: 'EST-2026-0042',
    signingUrl: 'https://trumoveinc.lovable.app/esign/EST-2026-0042',
  },
} satisfies TemplateEntry

/* ── Styles ── */
const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto', backgroundColor: '#ffffff' }

const logoBar = { padding: '28px 32px 20px', textAlign: 'center' as const, borderBottom: '1px solid #f0f0f0' }
const brandName = { color: '#22c55e', fontSize: '28px', fontWeight: 'bold' as const, margin: '0', letterSpacing: '-0.5px' }
const brandTagline = { color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }

const heroBanner = { backgroundColor: '#22c55e', padding: '40px 32px', textAlign: 'center' as const }
const heroTitle = { color: '#000000', fontSize: '24px', fontWeight: '700' as const, margin: '0 0 8px', letterSpacing: '-0.3px' }
const heroSubtitle = { color: '#1e293b', fontSize: '14px', margin: '0' }

const bodySection = { padding: '0 32px' }
const greeting = { fontSize: '15px', color: '#000000', margin: '32px 0 8px', fontWeight: '500' as const }
const bodyText = { fontSize: '14px', color: '#000000', lineHeight: '1.7', margin: '0 0 24px' }

const ctaWrap = { textAlign: 'center' as const, padding: '8px 32px 32px' }
const ctaButton = { display: 'inline-block' as const, background: '#22c55e', color: '#ffffff', padding: '14px 48px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' as const, fontSize: '15px', letterSpacing: '0.2px', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }

const detailsCard = { backgroundColor: '#f8faf9', border: '1px solid #e2e8f0', borderRadius: '10px', margin: '0 32px 28px', padding: '20px 24px' }
const detailsTitle = { fontSize: '11px', fontWeight: '600' as const, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.8px', margin: '0 0 16px' }
const detailLabel = { fontSize: '13px', color: '#94a3b8', margin: '0 0 2px' }
const detailValue = { fontSize: '13px', color: '#1e293b', fontWeight: '500' as const, margin: '0' }
const divider = { border: 'none', borderTop: '1px solid #e2e8f0', margin: '12px 0' }

const helpText = { fontSize: '13px', color: '#94a3b8', margin: '0 32px 32px', lineHeight: '1.6' }

const hr = { border: 'none', borderTop: '1px solid #e2e8f0', margin: '0' }
const footerWrap = { padding: '24px 32px 28px', textAlign: 'center' as const, backgroundColor: '#fafbfc' }
const footerBrand = { color: '#22c55e', fontSize: '18px', fontWeight: 'bold' as const, margin: '0 0 8px' }
const footerText = { fontSize: '12px', color: '#94a3b8', margin: '0 0 4px' }
const footerMuted = { fontSize: '11px', color: '#c4cad4', margin: '0' }
