/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName} — set up your account now</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Text style={logoText}>TruMove</Text>
        </Section>

        <Heading style={h1}>Welcome to the Team</Heading>

        <Text style={text}>
          You've been invited to join{' '}
          <Link href={siteUrl} style={link}>
            <strong>{siteName}</strong>
          </Link>
          . To get started, you'll need to set up your username and password.
        </Text>

        <Text style={text}>
          Click the button below to create your login credentials and access
          the platform.
        </Text>

        <Section style={buttonSection}>
          <Button style={button} href={confirmationUrl}>
            Set Up Your Account
          </Button>
        </Section>

        <Hr style={hr} />

        <Section style={stepsSection}>
          <Text style={stepsTitle}>What to expect:</Text>
          <Text style={stepItem}>1. Click the button above to open the setup page</Text>
          <Text style={stepItem}>2. Create your password</Text>
          <Text style={stepItem}>3. You're in — start using the platform right away</Text>
        </Section>

        <Hr style={hr} />

        <Text style={footer}>
          If you weren't expecting this invitation, you can safely ignore this
          email. This link will expire in 24 hours.
        </Text>

        <Text style={footerBrand}>
          © {new Date().getFullYear()} TruMove Inc. All rights reserved.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', Arial, sans-serif",
}
const container = {
  padding: '40px 25px 30px',
  maxWidth: '520px',
  margin: '0 auto',
}
const logoSection = {
  textAlign: 'center' as const,
  marginBottom: '30px',
}
const logoText = {
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#22c55e',
  margin: '0',
  letterSpacing: '-0.5px',
}
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#020817',
  margin: '0 0 16px',
  textAlign: 'center' as const,
}
const text = {
  fontSize: '15px',
  color: '#64748b',
  lineHeight: '1.6',
  margin: '0 0 16px',
}
const link = { color: '#22c55e', textDecoration: 'underline' }
const buttonSection = {
  textAlign: 'center' as const,
  margin: '28px 0',
}
const button = {
  backgroundColor: '#22c55e',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: '600' as const,
  borderRadius: '8px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const hr = {
  borderColor: '#e2e8f0',
  borderWidth: '1px',
  margin: '24px 0',
}
const stepsSection = {
  padding: '0',
}
const stepsTitle = {
  fontSize: '14px',
  fontWeight: '600' as const,
  color: '#020817',
  margin: '0 0 10px',
}
const stepItem = {
  fontSize: '14px',
  color: '#64748b',
  lineHeight: '1.5',
  margin: '0 0 6px',
  paddingLeft: '4px',
}
const footer = {
  fontSize: '12px',
  color: '#94a3b8',
  margin: '0 0 8px',
  lineHeight: '1.5',
}
const footerBrand = {
  fontSize: '12px',
  color: '#cbd5e1',
  margin: '0',
  textAlign: 'center' as const,
}
