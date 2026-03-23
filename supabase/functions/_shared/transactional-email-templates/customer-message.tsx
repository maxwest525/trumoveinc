/// <reference types="npm:@types/react@18.3.1" />
import * as React from 'npm:react@18.3.1'
import {
  Html, Head, Body, Container, Section, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface Props {
  customer_name: string
  subject: string
  message_body: string
}

function CustomerMessageEmail({ customer_name, subject, message_body }: Props) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#ffffff', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', margin: 0, padding: 0 }}>
        <Container style={{ maxWidth: '580px', margin: '0 auto', padding: '40px 20px' }}>
          <Section style={{ backgroundColor: '#0a2a3f', borderRadius: '12px 12px 0 0', padding: '24px 32px', textAlign: 'center' as const }}>
            <Text style={{ color: '#14b8a6', fontSize: '22px', fontWeight: 'bold', margin: 0 }}>TruMove</Text>
          </Section>
          <Section style={{ backgroundColor: '#f8fafc', borderRadius: '0 0 12px 12px', padding: '32px', border: '1px solid #e2e8f0', borderTop: 'none' }}>
            <Text style={{ fontSize: '16px', color: '#1e293b', marginBottom: '8px' }}>Hi {customer_name},</Text>
            <Text style={{ fontSize: '14px', color: '#475569', lineHeight: '1.7', whiteSpace: 'pre-wrap' as const }}>{message_body}</Text>
            <Hr style={{ borderColor: '#e2e8f0', margin: '24px 0' }} />
            <Text style={{ fontSize: '12px', color: '#94a3b8', textAlign: 'center' as const }}>
              TruMove Inc. — Professional Moving Solutions
            </Text>
            <Text style={{ fontSize: '11px', color: '#94a3b8', textAlign: 'center' as const }}>
              Reply directly to this email or call (800) 555-MOVE
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

export const template: TemplateEntry = {
  component: CustomerMessageEmail,
  subject: (data) => data.subject || 'Message from TruMove',
  displayName: 'Customer Message',
  previewData: {
    customer_name: 'John Doe',
    subject: 'Update on Your Move',
    message_body: 'Just wanted to let you know your move is on track!',
  },
}
