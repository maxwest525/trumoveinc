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
        <div style={headerBanner}>
          <Heading style={headerTitle}>{SITE_NAME}</Heading>
          <Text style={headerSub}>Your Trusted Moving Partner</Text>
        </div>
        <div style={greenBanner}>
          <Heading style={bannerTitle}>{documentLabel || 'Document'}</Heading>
          <Text style={bannerRef}>Reference: {refNumber || 'N/A'}</Text>
        </div>
        <Text style={text}>Hello {customerName || 'there'},</Text>
        <Text style={text}>
          Your <strong>{documentLabel || 'document'}</strong> is ready for your signature. Please review and sign the document at your earliest convenience to proceed with your move.
        </Text>
        {signingUrl && (
          <div style={ctaWrap}>
            <Button style={button} href={signingUrl}>Review & Sign Document</Button>
          </div>
        )}
        <Text style={detailsLabel}><strong>Document Details:</strong></Text>
        <Text style={detailsText}>
          • Type: {documentLabel || 'N/A'}<br />
          • Reference: {refNumber || 'N/A'}<br />
          • Recipient: {customerName || 'N/A'}
        </Text>
        <Hr style={hr} />
        <Text style={footer}>
          This is an automated message from {SITE_NAME}. If you have questions about this document, please contact your moving coordinator.
        </Text>
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

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerBanner = { textAlign: 'center' as const, marginBottom: '0', padding: '24px 20px 8px' }
const headerTitle = { color: '#22c55e', fontSize: '28px', fontWeight: 'bold' as const, margin: '0' }
const headerSub = { color: '#64748b', fontSize: '14px', margin: '4px 0 0' }
const greenBanner = { background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center' as const, margin: '20px 25px 30px' }
const bannerTitle = { margin: '0 0 10px', fontSize: '24px', color: 'white', fontWeight: 'bold' as const }
const bannerRef = { margin: '0', opacity: 0.9, fontSize: '14px', color: 'white' }
const text = { fontSize: '14px', color: '#64748b', lineHeight: '1.6', margin: '0 25px 16px' }
const ctaWrap = { textAlign: 'center' as const, margin: '30px 0' }
const button = { display: 'inline-block' as const, background: '#22c55e', color: '#ffffff', padding: '14px 40px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' as const, fontSize: '16px' }
const detailsLabel = { fontSize: '14px', color: '#020817', margin: '0 25px 4px', fontWeight: 'bold' as const }
const detailsText = { fontSize: '14px', color: '#64748b', margin: '0 25px 25px', lineHeight: '1.8' }
const hr = { border: 'none', borderTop: '1px solid #e2e8f0', margin: '30px 25px' }
const footer = { fontSize: '12px', color: '#94a3b8', textAlign: 'center' as const, margin: '0 25px 20px' }
