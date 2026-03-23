import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr, Link,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface SupportTicketProps {
  name?: string
  email?: string
  subject?: string
  message?: string
}

const SupportTicketNotificationEmail = ({ name, email, subject, message }: SupportTicketProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>New Support Ticket from {name || 'a customer'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <div style={headerBar}>
          <Heading style={headerTitle}>🎫 New Support Ticket</Heading>
        </div>
        <div style={contentBox}>
          <table style={table}>
            <tr>
              <td style={labelCell}>Name:</td>
              <td style={valueCell}>{name || 'N/A'}</td>
            </tr>
            <tr>
              <td style={labelCell}>Email:</td>
              <td style={valueCell}><Link href={`mailto:${email}`} style={linkStyle}>{email || 'N/A'}</Link></td>
            </tr>
            {subject && (
              <tr>
                <td style={labelCell}>Subject:</td>
                <td style={valueCell}>{subject}</td>
              </tr>
            )}
          </table>
          <Hr style={hr} />
          <Heading style={msgHeading}>Message</Heading>
          <div style={msgBox}>
            <Text style={msgText}>{message || ''}</Text>
          </div>
          <Text style={footer}>This ticket was submitted via the TruMove Customer Service page.</Text>
        </div>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: SupportTicketNotificationEmail,
  subject: (data: Record<string, any>) =>
    data.subject ? `New Support Ticket: ${data.subject}` : `New Support Ticket from ${data.name || 'Customer'}`,
  displayName: 'Support ticket notification',
  to: 'support@trumove.com',
  previewData: {
    name: 'Alice Johnson',
    email: 'alice@example.com',
    subject: 'Question about my move',
    message: 'I would like to know the status of my upcoming move scheduled for next week.',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "Arial, sans-serif" }
const container = { padding: '0', maxWidth: '600px', margin: '0 auto' }
const headerBar = { background: '#22c55e', color: 'white', padding: '20px', borderRadius: '8px 8px 0 0' }
const headerTitle = { margin: '0', color: 'white', fontSize: '20px' }
const contentBox = { border: '1px solid #e5e7eb', borderTop: 'none', padding: '24px', borderRadius: '0 0 8px 8px' }
const table = { width: '100%', borderCollapse: 'collapse' as const }
const labelCell = { padding: '8px 0', fontWeight: 'bold', color: '#374151', width: '100px', fontSize: '14px' }
const valueCell = { padding: '8px 0', color: '#111827', fontSize: '14px' }
const linkStyle = { color: '#22c55e' }
const hr = { border: 'none', borderTop: '1px solid #e5e7eb', margin: '16px 0' }
const msgHeading = { color: '#374151', fontSize: '16px', marginBottom: '8px' }
const msgBox = { background: '#f9fafb', padding: '16px', borderRadius: '8px' }
const msgText = { color: '#111827', whiteSpace: 'pre-wrap' as const, margin: '0', fontSize: '14px' }
const footer = { marginTop: '20px', fontSize: '12px', color: '#9ca3af' }
