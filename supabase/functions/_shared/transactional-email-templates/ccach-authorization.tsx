import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

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
    <Preview>Payment Authorization Confirmed - {refNumber || ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Payment Authorization Confirmed</Heading>
        <Text style={text}>Dear {customerName || 'Customer'},</Text>
        <Text style={text}>
          Thank you for completing your payment authorization. A copy of your signed CC/ACH Authorization form is on file for your records.
        </Text>
        <div style={detailsBox}>
          <Heading style={h3}>Authorization Details</Heading>
          <Text style={detailText}><strong>Reference:</strong> {refNumber || 'N/A'}</Text>
          <Text style={detailText}><strong>Amount:</strong> ${amount || '0'}</Text>
          <Text style={detailText}><strong>Payment Method:</strong> {paymentMethod === 'card' ? 'Credit/Debit Card' : paymentMethod === 'ach' ? 'ACH Bank Transfer' : paymentMethod || 'N/A'}</Text>
          <Text style={detailText}><strong>Date Signed:</strong> {signedDate || 'N/A'}</Text>
        </div>
        <Text style={text}>If you have any questions about your authorization, please contact our team.</Text>
        <Hr style={hr} />
        <Text style={footer}>This is an automated message from TruMove.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: CCACHAuthorizationEmail,
  subject: (data: Record<string, any>) => `Your CC/ACH Authorization - ${data.refNumber || ''}`,
  displayName: 'CC/ACH authorization confirmation',
  previewData: {
    customerName: 'Jane Smith',
    refNumber: 'CC-2026-1234',
    amount: '2,500',
    paymentMethod: 'card',
    signedDate: '2026-03-23',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '600px', margin: '0 auto' }
const h1 = { color: '#333', fontSize: '24px', fontWeight: 'bold', margin: '0 0 20px' }
const h3 = { marginTop: '0', color: '#333', fontSize: '16px', fontWeight: 'bold' }
const text = { fontSize: '14px', color: '#333', lineHeight: '1.6', margin: '0 0 16px' }
const detailsBox = { background: '#f5f5f5', padding: '20px', borderRadius: '8px', margin: '20px 0' }
const detailText = { fontSize: '14px', color: '#333', margin: '0 0 8px' }
const hr = { border: 'none', borderTop: '1px solid #eee', margin: '30px 0' }
const footer = { color: '#666', fontSize: '12px', margin: '0' }
