import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Section,
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
    <Preview>Payment Authorization Confirmed — {refNumber || ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoBar}>
          <Heading style={brandName}>{SITE_NAME}</Heading>
          <Text style={brandTagline}>Your Trusted Moving Partner</Text>
        </Section>

        <Section style={heroBanner}>
          <Heading style={heroTitle}>Payment Authorization Confirmed</Heading>
          <Text style={heroSubtitle}>Reference: {refNumber || 'N/A'}</Text>
        </Section>

        <Section style={bodySection}>
          <Text style={greeting}>Hello {customerName || 'there'},</Text>
          <Text style={bodyText}>
            Your payment authorization has been successfully recorded. Here are the details:
          </Text>
        </Section>

        <Section style={detailsCard}>
          <Text style={detailsTitle}>Authorization Details</Text>
          <Text style={detailLabel}>Reference:</Text>
          <Text style={detailValue}>{refNumber || 'N/A'}</Text>
          <Hr style={divider} />
          <Text style={detailLabel}>Amount:</Text>
          <Text style={detailValue}>${amount || '0'}</Text>
          <Hr style={divider} />
          <Text style={detailLabel}>Payment Method:</Text>
          <Text style={detailValue}>
            {paymentMethod === 'credit_card' ? 'Credit Card' : paymentMethod === 'ach' ? 'ACH / Bank Transfer' : paymentMethod || 'N/A'}
          </Text>
          <Hr style={divider} />
          <Text style={detailLabel}>Date Signed:</Text>
          <Text style={detailValue}>{signedDate || 'N/A'}</Text>
        </Section>

        <Text style={helpText}>
          If you have questions about this authorization, please contact your moving coordinator.
        </Text>

        <Hr style={hr} />
        <Section style={footerWrap}>
          <Text style={footerBrand}>{SITE_NAME}</Text>
          <Text style={footerText}>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </Text>
          <Text style={footerMuted}>
            This is an automated confirmation. Please do not reply directly.
          </Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CCACHAuthorizationEmail,
  subject: (data: Record<string, any>) =>
    `Payment Authorization Confirmed — ${data.refNumber || ''}`,
  displayName: 'CC/ACH Authorization Confirmation',
  previewData: {
    customerName: 'Jane Smith',
    refNumber: 'CC-2026-0042',
    amount: '3,450',
    paymentMethod: 'credit_card',
    signedDate: 'March 25, 2026',
  },
} satisfies TemplateEntry

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
