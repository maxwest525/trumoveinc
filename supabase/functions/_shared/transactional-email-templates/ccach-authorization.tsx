import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "TruMove"

interface CCACHProps {
  customerName?: string
  refNumber?: string
  amount?: string
  paymentMethod?: string
  signedDate?: string
}

const CCACHAuthorizationEmail = ({ customerName, refNumber, amount, paymentMethod, signedDate }: CCACHProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Payment Authorization Confirmed – {refNumber || ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Logo Header */}
        <div style={logoBar}>
          <Heading style={brandName}>{SITE_NAME}</Heading>
          <Text style={brandTagline}>Your Trusted Moving Partner</Text>
        </div>

        {/* Hero Banner */}
        <div style={heroBanner}>
          <Heading style={heroTitle}>Payment Authorization Confirmed</Heading>
          <Text style={heroSubtitle}>Reference: {refNumber || 'N/A'}</Text>
        </div>

        {/* Body */}
        <Text style={greeting}>Dear {customerName || 'Customer'},</Text>
        <Text style={bodyText}>
          Thank you for completing your payment authorization. A copy of your signed CC/ACH Authorization form is securely on file for your records.
        </Text>

        {/* Details Card */}
        <div style={detailsCard}>
          <Text style={detailsTitle}>Authorization Details</Text>
          <div style={detailRow}>
            <Text style={detailLabel}>Reference</Text>
            <Text style={detailValue}>{refNumber || 'N/A'}</Text>
          </div>
          <div style={divider} />
          <div style={detailRow}>
            <Text style={detailLabel}>Amount</Text>
            <Text style={detailValue}>${amount || '0'}</Text>
          </div>
          <div style={divider} />
          <div style={detailRow}>
            <Text style={detailLabel}>Payment Method</Text>
            <Text style={detailValue}>
              {paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'ach' ? 'ACH Bank Transfer' : paymentMethod || 'N/A'}
            </Text>
          </div>
          <div style={divider} />
          <div style={detailRow}>
            <Text style={detailLabel}>Date Signed</Text>
            <Text style={detailValue}>{signedDate || 'N/A'}</Text>
          </div>
        </div>

        <Text style={helpText}>
          If you have any questions about your authorization, please contact our team directly.
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
  component: CCACHAuthorizationEmail,
  subject: (data: Record<string, any>) => `Your CC/ACH Authorization – ${data.refNumber || ''}`,
  displayName: 'CC/ACH authorization confirmation',
  previewData: {
    customerName: 'Jane Smith',
    refNumber: 'CC-2026-1234',
    amount: '2,500',
    paymentMethod: 'card',
    signedDate: '2026-03-23',
  },
} satisfies TemplateEntry

/* ── Styles ── */
const main = { backgroundColor: '#f4f6f8', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" }
const container = { padding: '0', maxWidth: '600px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' as const, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }

const logoBar = { padding: '28px 32px 20px', textAlign: 'center' as const, borderBottom: '1px solid #f0f0f0' }
const logoImg = { display: 'inline-block' as const }

const heroBanner = { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)', padding: '40px 32px', textAlign: 'center' as const }
const iconCircle = { width: '56px', height: '56px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.2)', margin: '0 auto 16px', display: 'flex' as const, alignItems: 'center' as const, justifyContent: 'center' as const }
const iconText = { fontSize: '28px', margin: '0', lineHeight: '56px', textAlign: 'center' as const }
const heroTitle = { color: '#ffffff', fontSize: '24px', fontWeight: '700' as const, margin: '0 0 8px', letterSpacing: '-0.3px' }
const heroSubtitle = { color: 'rgba(255,255,255,0.85)', fontSize: '14px', margin: '0' }

const greeting = { fontSize: '15px', color: '#1e293b', margin: '32px 32px 8px', fontWeight: '500' as const }
const bodyText = { fontSize: '14px', color: '#64748b', lineHeight: '1.7', margin: '0 32px 24px' }

const detailsCard = { backgroundColor: '#f8faf9', border: '1px solid #e2e8f0', borderRadius: '10px', margin: '0 32px 28px', padding: '20px 24px', overflow: 'hidden' as const }
const detailsTitle = { fontSize: '11px', fontWeight: '600' as const, color: '#94a3b8', textTransform: 'uppercase' as const, letterSpacing: '0.8px', margin: '0 0 16px' }
const detailRow = { display: 'flex' as const, justifyContent: 'space-between' as const, padding: '0' }
const detailLabel = { fontSize: '13px', color: '#94a3b8', margin: '0' }
const detailValue = { fontSize: '13px', color: '#1e293b', fontWeight: '500' as const, margin: '0', textAlign: 'right' as const }
const divider = { height: '1px', backgroundColor: '#e2e8f0', margin: '12px 0' }

const helpText = { fontSize: '13px', color: '#94a3b8', margin: '0 32px 32px', lineHeight: '1.6' }

const hr = { border: 'none', borderTop: '1px solid #e2e8f0', margin: '0' }
const footerWrap = { padding: '24px 32px 28px', textAlign: 'center' as const, backgroundColor: '#fafbfc' }
const footerLogo = { display: 'inline-block' as const, opacity: 0.6, marginBottom: '12px' }
const footerText = { fontSize: '12px', color: '#94a3b8', margin: '0 0 4px' }
const footerMuted = { fontSize: '11px', color: '#c4cad4', margin: '0' }
