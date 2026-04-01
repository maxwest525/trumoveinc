import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Hr,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

interface DailyDigestProps {
  agentName?: string
  staleDealsHtml?: string
  upcomingMovesHtml?: string
  staleCount?: number
  upcomingCount?: number
}

const DailyDigestEmail = ({ agentName, staleDealsHtml, upcomingMovesHtml, staleCount, upcomingCount }: DailyDigestProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Pipeline Digest: ${staleCount || 0} stale deals, ${upcomingCount || 0} upcoming moves`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Daily Pipeline Digest</Heading>
        <Text style={text}>Hi {agentName || 'Agent'},</Text>
        {staleDealsHtml && (
          <div dangerouslySetInnerHTML={{ __html: staleDealsHtml }} />
        )}
        {upcomingMovesHtml && (
          <div dangerouslySetInnerHTML={{ __html: upcomingMovesHtml }} />
        )}
        <Hr style={hr} />
        <Text style={footer}>— TruMove Pipeline</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: DailyDigestEmail,
  subject: (data: Record<string, any>) =>
    `Pipeline Digest: ${data.staleCount || 0} stale deal${(data.staleCount || 0) !== 1 ? 's' : ''}, ${data.upcomingCount || 0} upcoming move${(data.upcomingCount || 0) !== 1 ? 's' : ''}`,
  displayName: 'Daily pipeline digest',
  previewData: {
    agentName: 'Sarah',
    staleCount: 2,
    upcomingCount: 3,
    staleDealsHtml: '<h3 style="color:#ef4444;">⚠️ 2 Stale Deals</h3><p>You have deals that need attention.</p>',
    upcomingMovesHtml: '<h3 style="color:#3b82f6;">📅 3 Upcoming Moves (Next 7 Days)</h3><p>Several moves coming up soon.</p>',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: "Arial, sans-serif" }
const container = { padding: '20px 25px', maxWidth: '600px', margin: '0 auto' }
const h1 = { color: '#1a1a2e', fontSize: '22px', fontWeight: 'bold', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#333', lineHeight: '1.6', margin: '0 0 16px' }
const hr = { border: 'none', borderTop: '1px solid #eee', margin: '30px 0' }
const footer = { color: '#666', fontSize: '12px', margin: '0' }
