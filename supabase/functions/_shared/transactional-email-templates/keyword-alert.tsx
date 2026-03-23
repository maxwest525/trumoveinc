import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface KeywordAlertProps {
  keyword?: string
  matched?: string
  context?: string
  timestamp?: string
  agentName?: string
}

const KeywordAlertEmail = ({ keyword, matched, context, timestamp, agentName }: KeywordAlertProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>🚨 Keyword Alert: "{keyword || ''}" — Agent: {agentName || 'Unknown'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>🚨 Keyword Detected</Heading>
        <table style={table}>
          <tr><td style={labelCell}>Agent</td><td style={valueCell}><strong>{agentName || 'Unknown'}</strong></td></tr>
          <tr><td style={labelCell}>Keyword</td><td style={valueCell}>{keyword || 'N/A'}</td></tr>
          <tr><td style={labelCell}>Matched Text</td><td style={valueCell}><code>{matched || 'N/A'}</code></td></tr>
          <tr><td style={labelCell}>Time</td><td style={valueCell}>{timestamp || 'N/A'}</td></tr>
        </table>
        <div style={contextBox}>
          <Text style={contextLabel}>Context</Text>
          <Text style={contextText}>{context || 'No context available'}</Text>
        </div>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: KeywordAlertEmail,
  subject: (data: Record<string, any>) =>
    `🚨 Keyword Alert: "${data.keyword || ''}" — Agent: ${data.agentName || 'Unknown'}`,
  displayName: 'Pulse keyword alert',
  previewData: {
    keyword: 'guarantee',
    matched: 'I can guarantee delivery by Friday',
    context: 'Customer was asking about delivery timeline and agent made a guarantee.',
    timestamp: '2026-03-23 14:30:00',
    agentName: 'Mike Wilson',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "sans-serif" }
const container = { padding: '20px', maxWidth: '600px', margin: '0 auto' }
const h1 = { color: '#dc2626', fontSize: '22px', fontWeight: 'bold', margin: '0 0 16px' }
const table = { width: '100%', borderCollapse: 'collapse' as const, margin: '16px 0' }
const labelCell = { padding: '8px', fontWeight: 'bold', color: '#666', fontSize: '14px' }
const valueCell = { padding: '8px', fontWeight: 'bold', fontSize: '14px', color: '#333' }
const contextBox = { background: '#f4f4f5', padding: '12px', borderRadius: '8px', margin: '16px 0' }
const contextLabel = { margin: '0', fontSize: '13px', color: '#666' }
const contextText = { margin: '4px 0 0', fontSize: '14px', color: '#333' }
