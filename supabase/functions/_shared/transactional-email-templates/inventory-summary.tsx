import * as React from 'npm:react@18.3.1'
import {
  Body, Container, Head, Heading, Html, Preview, Text, Button, Hr, Section, Row, Column,
} from 'npm:@react-email/components@0.0.22'
import type { TemplateEntry } from './registry.ts'

const SITE_NAME = "TruMove"

interface InventoryItem {
  name: string
  room: string
  quantity: number
  cubicFeet: number
  weight: number
}

interface InventorySummaryProps {
  customerName?: string
  refNumber?: string
  totalItems?: number
  totalCuFt?: number
  totalWeight?: number
  estimatedTotal?: string
  pricePerCuFt?: string
  inventoryByRoom?: Record<string, InventoryItem[]>
  ctaUrl?: string
}

const InventorySummaryEmail = ({
  customerName,
  refNumber,
  totalItems = 0,
  totalCuFt = 0,
  totalWeight = 0,
  estimatedTotal,
  pricePerCuFt,
  inventoryByRoom = {},
  ctaUrl,
}: InventorySummaryProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Inventory Summary — {totalItems} items, {totalCuFt} cu ft — {refNumber || ''}</Preview>
    <Body style={main}>
      <Container style={container}>
        {/* Top accent */}
        <div style={topAccent} />

        {/* Logo */}
        <div style={logoBar}>
          <Heading style={brandName}>{SITE_NAME}</Heading>
          <Text style={brandTagline}>Your Trusted Moving Partner</Text>
        </div>

        {/* Hero */}
        <div style={heroBanner}>
          <Heading style={heroTitle}>Your Inventory Summary</Heading>
          <Text style={heroSubtitle}>Reference: {refNumber || 'N/A'}</Text>
        </div>

        {/* Greeting */}
        <Text style={greeting}>Hi {customerName || 'there'},</Text>
        <Text style={bodyText}>
          Here's a complete breakdown of the items we'll be moving for you. Please review and let us know if anything needs to be added or changed.
        </Text>

        {/* Stats Card */}
        <div style={statsCard}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <tr>
              <td style={statCell}>
                <Text style={statNumber}>{totalItems}</Text>
                <Text style={statLabel}>ITEMS</Text>
              </td>
              <td style={{ ...statCell, borderLeft: '1px solid #e5e7eb', borderRight: '1px solid #e5e7eb' }}>
                <Text style={statNumber}>{totalCuFt}</Text>
                <Text style={statLabel}>CU FT</Text>
              </td>
              <td style={statCell}>
                <Text style={statNumber}>{totalWeight.toLocaleString()}</Text>
                <Text style={statLabel}>LBS</Text>
              </td>
            </tr>
          </table>
        </div>

        {/* Estimated Total */}
        {estimatedTotal && (
          <div style={totalCard}>
            <Text style={totalLabel}>ESTIMATED TOTAL</Text>
            <Text style={totalAmount}>{estimatedTotal}</Text>
            {pricePerCuFt && <Text style={totalRate}>at {pricePerCuFt}/cu ft</Text>}
          </div>
        )}

        {/* Inventory by Room */}
        <div style={sectionWrap}>
          <Text style={sectionTitle}>Inventory by Room</Text>
          <div style={greenBar} />
        </div>

        {Object.entries(inventoryByRoom).map(([room, items]) => (
          <div key={room} style={roomBlock}>
            <Text style={roomName}>{room}</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
              <tr>
                <td style={tableHeader}>Item</td>
                <td style={{ ...tableHeader, textAlign: 'center' as const, width: '50px' }}>Qty</td>
                <td style={{ ...tableHeader, textAlign: 'right' as const, width: '60px' }}>Cu Ft</td>
                <td style={{ ...tableHeader, textAlign: 'right' as const, width: '60px' }}>Lbs</td>
              </tr>
              {(items as InventoryItem[]).map((item, i) => (
                <tr key={i}>
                  <td style={tableCell}>{item.name}</td>
                  <td style={{ ...tableCell, textAlign: 'center' as const }}>{item.quantity}</td>
                  <td style={{ ...tableCell, textAlign: 'right' as const }}>{item.cubicFeet * item.quantity}</td>
                  <td style={{ ...tableCell, textAlign: 'right' as const }}>{item.weight * item.quantity}</td>
                </tr>
              ))}
            </table>
          </div>
        ))}

        {/* CTA */}
        {ctaUrl && (
          <div style={ctaWrap}>
            <Button style={ctaButton} href={ctaUrl}>Confirm Your Move →</Button>
          </div>
        )}

        {/* Help text */}
        <Text style={helpText}>
          Questions about your inventory? Reply to this email or call <strong>(800) 555-MOVE</strong>.
        </Text>

        {/* Footer */}
        <Hr style={hr} />
        <div style={footerWrap}>
          <Text style={footerBrand}>{SITE_NAME}</Text>
          <Text style={footerText}>
            © {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </Text>
          <Text style={footerMuted}>
            Licensed & Insured · You're receiving this because you requested a quote.
          </Text>
        </div>

        {/* Bottom accent */}
        <div style={bottomAccent} />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: InventorySummaryEmail,
  subject: (data: Record<string, any>) =>
    `Your Inventory Summary — ${data.totalItems || 0} items — ${data.refNumber || ''}`,
  displayName: 'Inventory Summary',
  previewData: {
    customerName: 'Jane Smith',
    refNumber: 'TM-2026-1847',
    totalItems: 42,
    totalCuFt: 680,
    totalWeight: 5100,
    estimatedTotal: '$5,100',
    pricePerCuFt: '$7.50',
    inventoryByRoom: {
      'Living Room': [
        { name: '3-Seat Sofa', room: 'Living Room', quantity: 1, cubicFeet: 50, weight: 120 },
        { name: 'Coffee Table', room: 'Living Room', quantity: 1, cubicFeet: 15, weight: 40 },
      ],
      'Bedroom': [
        { name: 'Queen Bed Frame', room: 'Bedroom', quantity: 1, cubicFeet: 55, weight: 100 },
        { name: 'Dresser (Large)', room: 'Bedroom', quantity: 1, cubicFeet: 35, weight: 90 },
      ],
    },
    ctaUrl: 'https://trumoveinc.com',
  },
} satisfies TemplateEntry

/* ── Styles ── */
const main = { backgroundColor: '#f4f6f8', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif" }
const container = { padding: '0', maxWidth: '600px', margin: '40px auto', backgroundColor: '#ffffff', borderRadius: '12px', overflow: 'hidden' as const, boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }

const topAccent = { backgroundColor: '#22c55e', height: '4px' }
const bottomAccent = { backgroundColor: '#0a0a0a', height: '4px' }

const logoBar = { padding: '28px 32px 20px', textAlign: 'center' as const, borderBottom: '1px solid #f0f0f0' }
const brandName = { color: '#22c55e', fontSize: '28px', fontWeight: 'bold' as const, margin: '0', letterSpacing: '-0.5px' }
const brandTagline = { color: '#94a3b8', fontSize: '12px', margin: '4px 0 0' }

const heroBanner = { backgroundColor: '#0a0a0a', padding: '36px 32px', textAlign: 'center' as const }
const heroTitle = { color: '#ffffff', fontSize: '24px', fontWeight: '700' as const, margin: '0 0 8px', letterSpacing: '-0.3px' }
const heroSubtitle = { color: '#9ca3af', fontSize: '14px', margin: '0' }

const greeting = { fontSize: '15px', color: '#000000', margin: '32px 32px 8px', fontWeight: '500' as const }
const bodyText = { fontSize: '14px', color: '#000000', lineHeight: '1.7', margin: '0 32px 24px' }

const statsCard = { backgroundColor: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '10px', margin: '0 32px 20px', padding: '16px', overflow: 'hidden' as const }
const statCell = { padding: '8px 0', textAlign: 'center' as const }
const statNumber = { margin: '0', fontSize: '24px', fontWeight: '700' as const, color: '#0a0a0a' }
const statLabel = { margin: '4px 0 0', fontSize: '10px', color: '#6b7280', letterSpacing: '0.8px' }

const totalCard = { backgroundColor: '#0a0a0a', borderRadius: '10px', padding: '20px 24px', margin: '0 32px 24px', textAlign: 'center' as const }
const totalLabel = { margin: '0 0 4px', fontSize: '10px', color: '#9ca3af', letterSpacing: '1px' }
const totalAmount = { margin: '0', fontSize: '30px', fontWeight: '700' as const, color: '#22c55e' }
const totalRate = { margin: '6px 0 0', fontSize: '12px', color: '#6b7280' }

const sectionWrap = { margin: '0 32px 16px' }
const sectionTitle = { fontSize: '16px', fontWeight: '700' as const, color: '#0a0a0a', margin: '0 0 8px' }
const greenBar = { height: '2px', width: '40px', backgroundColor: '#22c55e' }

const roomBlock = { margin: '0 32px 16px', border: '1px solid #f0f0f0', borderRadius: '8px', overflow: 'hidden' as const }
const roomName = { fontSize: '12px', fontWeight: '600' as const, color: '#374151', margin: '0', padding: '10px 14px', backgroundColor: '#f8fafc', borderBottom: '1px solid #f0f0f0' }
const tableHeader = { fontSize: '10px', fontWeight: '600' as const, color: '#9ca3af', padding: '8px 14px', textTransform: 'uppercase' as const, letterSpacing: '0.5px', borderBottom: '1px solid #f0f0f0' }
const tableCell = { fontSize: '13px', color: '#374151', padding: '8px 14px', borderBottom: '1px solid #fafafa' }

const ctaWrap = { textAlign: 'center' as const, margin: '24px 32px 28px' }
const ctaButton = { display: 'inline-block' as const, background: '#22c55e', color: '#ffffff', padding: '14px 40px', borderRadius: '8px', textDecoration: 'none', fontWeight: '600' as const, fontSize: '15px', boxShadow: '0 2px 8px rgba(34,197,94,0.3)' }

const helpText = { fontSize: '13px', color: '#6b7280', margin: '0 32px 32px', lineHeight: '1.6', textAlign: 'center' as const }

const hr = { border: 'none', borderTop: '1px solid #e2e8f0', margin: '0' }
const footerWrap = { padding: '24px 32px 28px', textAlign: 'center' as const, backgroundColor: '#fafbfc' }
const footerBrand = { color: '#22c55e', fontSize: '18px', fontWeight: 'bold' as const, margin: '0 0 8px' }
const footerText = { fontSize: '12px', color: '#94a3b8', margin: '0 0 4px' }
const footerMuted = { fontSize: '11px', color: '#c4cad4', margin: '0' }
