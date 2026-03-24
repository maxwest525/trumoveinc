import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr,
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
        <div style={logoBar}>
          <Heading style={brandName}>{SITE_NAME}</Heading>
          <Text style={brandTagline}>Your Trusted Moving Partner</Text>
        </div>

        {/* Hero Banner */}
        <div style={heroBanner}>
          <Heading style={heroTitle}>Document Ready for Signature</Heading>
          <Text style={heroSubtitle}>{documentLabel || 'Document'} • {refNumber || 'N/A'}</Text>
        </div>

        {/* Greeting */}
        <Text style={greeting}>Hello {customerName || 'there'},</Text>
        <Text style={bodyText}>
          Your <strong>{documentLabel || 'document'}</strong> is ready for your review and signature. Please sign at your earliest convenience to keep your move on track.
        </Text>

        {/* CTA Button */}
        {signingUrl && (
          <div style={ctaWrap}>
            <Button style={ctaButton} href={signingUrl}>Review & Sign Document</Button>
          </div>
        )}

        {/* Details Card */}
        <div style={detailsCard}>
          <Text style={detailsTitle}>Document Details</Text>
          <div style={detailRow}>
            <Text style={detailLabel}>Document Type</Text>
            <Text style={detailValue}>{documentLabel || 'N/A'}</Text>
          </div>
          <div style={divider} />
          <div style={detailRow}>
            <Text style={detailLabel}>Reference</Text>
            <Text style={detailValue}>{refNumber || 'N/A'}</Text>
          </div>
          <div style={divider} />
          <div style={detailRow}>
            <Text style={detailLabel}>Recipient</Text>
            <Text style={detailValue}>{customerName || 'N/A'}</Text>
          </div>
        </div>

        {/* Help text */}
        <Text style={helpText}>
          If you have questions about this document, please contact your moving coordinator directly.
        </Text>

        {/* Footer */}
        <Hr style={hr} />
        <div style={footerWrap}>
          <Text style={footerBrand}>{SITE_NAME}</Text>
          <Text style={footerText}>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </Text>
          <Text style={footerMuted}>
            This is an automated message. Please do not reply directly to this email.
          </Text>
        </div>
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
const main = { backgroundColor: '#f4f6f8', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" }
const container = { padding: '0', maxWidth: '600px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' as const, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }

const logoBar = { padding: '28px 32px 20px', textAlign: 'center' as const, borderBottom: '1px solid #f0f0f0' }
const brandName = { color: '#22c55e', fontSize: '28px', fontWeight: 'bold' as const, margin: '0', letterSpacing: '-0.5px' }
const brandTagline = { color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }

const heroBanner = { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)', padding: '40px 32px', textAlign: 'center' as const }
const heroTitle = { color: '#ffffff', fontSize: '24px', fontWeight: '700' as const, margin: '0 0 8px', letterSpacing: '-0.3px' }
const heroSubtitle = { color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: '0' }

const greeting = { fontSize: '15px', color: '#000000', margin: '32px 32px 8px', fontWeight: '500' as const }
const bodyText = { fontSize: '14px', color: '#000000', lineHeight: '1.7', margin: '0 32px 24px' }

const ctaWrap = { textAlign: 'center' as const, margin: '8px 32px 32px' }
const ctaButton = { display: 'inline-block' as const, background: '#22c55e', color: '#ffffff', padding: '14px 48px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' as const, fontSize: '15px', letterSpacing: '0.2px', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }

const detailsCard = { backgroundColor: '#f8faf9', border: '1px solid #e2e8f0', borderRadius: '10px', margin: '0 32px 28px', padding: '20px 24px', overflow: 'hidden' as const }
const detailsTitle = { fontSize: '11px', fontWeight: '600' as const, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.8px', margin: '0 0 16px' }
const detailRow = { display: 'flex' as const, justifyContent: 'space-between' as const, padding: '0' }
const detailLabel = { fontSize: '13px', color: '#94a3b8', margin: '0' }
const detailValue = { fontSize: '13px', color: '#1e293b', fontWeight: '500' as const, margin: '0', textAlign: 'right' as const }
const divider = { height: '1px', backgroundColor: '#e2e8f0', margin: '12px 0' }

const helpText = { fontSize: '13px', color: '#94a3b8', margin: '0 32px 32px', lineHeight: '1.6' }

const hr = { border: 'none', borderTop: '1px solid #e2e8f0', margin: '0' }
const footerWrap = { padding: '24px 32px 28px', textAlign: 'center' as const, backgroundColor: '#fafbfc' }
const footerBrand = { color: '#22c55e', fontSize: '18px', fontWeight: 'bold' as const, margin: '0 0 8px' }
const footerText = { fontSize: '12px', color: '#94a3b8', margin: '0 0 4px' }
const footerMuted = { fontSize: '11px', color: '#c4cad4', margin: '0' }
