

# Fix Email Delivery: Migrate to Built-In Email System

## Problem

The domain `notify.crm.trumoveinc.com` is delegated to Lovable's nameservers via NS records. This means Resend **cannot** verify DNS for this domain — the verification will keep failing. Meanwhile, Lovable's built-in email system already shows this domain as **verified and ready**.

## Solution

Migrate all email-sending edge functions from Resend to Lovable's built-in email infrastructure on `notify.crm.trumoveinc.com`. Keep Resend credentials available for a different domain later if needed.

## Affected Edge Functions (5 total)

| Function | Current Sender | Issue |
|---|---|---|
| `send-esign-document` | `noreply@notify.crm.trumoveinc.com` via Resend | Resend can't verify domain |
| `send-deal-email` | `onboarding@resend.dev` via Resend | Sandbox/test address |
| `send-ccach-pdf` | `onboarding@resend.dev` via Resend | Sandbox/test address |
| `notify-support-ticket` | `onboarding@resend.dev` via Resend | Sandbox/test address |
| `pulse-send-keyword-alert` | `onboarding@resend.dev` via Resend | Sandbox/test address |
| `daily-digest` | `onboarding@resend.dev` via Resend | Sandbox/test address |

## Plan

### Step 1: Scaffold transactional email infrastructure
Set up the built-in email system (templates, queue, unsubscribe handling) on the already-verified `notify.crm.trumoveinc.com` domain.

### Step 2: Create email templates
Create React Email templates for each email type:
- **esign-request** — E-sign document signing request
- **deal-email** — Pipeline deal follow-up/communication
- **ccach-authorization** — CC/ACH authorization with PDF
- **support-ticket-notification** — Internal support ticket alert
- **keyword-alert** — Pulse compliance keyword alert
- **daily-digest** — Pipeline daily digest summary

### Step 3: Update calling code
Replace `supabase.functions.invoke('send-esign-document', ...)` and similar calls across 5+ components to use `supabase.functions.invoke('send-transactional-email', ...)` with the appropriate template name and data.

### Step 4: Deploy and test
Deploy all updated edge functions. Test e-sign email delivery end-to-end.

## What stays the same
- Twilio SMS sending in `send-esign-document` — unchanged
- Resend API key stays configured for potential future use on a different domain
- All UI components keep the same user-facing behavior

## Result
All emails send from `noreply@notify.crm.trumoveinc.com` via the built-in system, which is already DNS-verified and operational. No more Resend domain verification issues.

