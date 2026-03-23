import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface DealEmailProps {
  customerName?: string
  subject?: string
  bodyText?: string
  htmlBody?: string
}

const DealEmail = ({ customerName, bodyText, htmlBody }: DealEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{bodyText ? bodyText.slice(0, 80) : 'Message from TruMove'}</Preview>
    <Body style={main}>
      <Container style={container}>
        {htmlBody ? (
          <div dangerouslySetInnerHTML={{ __html: htmlBody }} />
        ) : (
          <>
            {customerName && <Text style={text}>Hi {customerName},</Text>}
            <Text style={text}>{bodyText || ''}</Text>
          </>
        )}
        <Hr style={hr} />
        <Text style={footer}>Sent via TruMove CRM</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: DealEmail,
  subject: (data: Record<string, any>) => data.subject || 'Message from TruMove',
  displayName: 'Deal email',
  previewData: {
    customerName: 'John Doe',
    subject: 'Your Move Update',
    bodyText: 'We wanted to follow up on your upcoming move. Please let us know if you have any questions.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '600px', margin: '0 auto' }
const text = { fontSize: '14px', color: '#333', lineHeight: '1.6', margin: '0 0 16px' }
const hr = { border: 'none', borderTop: '1px solid #eee', margin: '20px 0' }
const footer = { color: '#888', fontSize: '11px', margin: '0' }
