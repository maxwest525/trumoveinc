

## Plan: Fix E-Sign SMS Delivery

### Root Causes Found

**Issue 1: Phone numbers not in E.164 format**
The `leads` table stores phone numbers as raw digits or formatted strings (e.g. `2018208143`, `6092870002`, `(305) 555-8421`). Twilio requires E.164 format (`+12018208143`). The edge function passes these raw values directly — Twilio silently rejects them.

**Issue 2: Email failure blocks SMS**
When `deliveryMethod === "both"`, email is sent first via Resend. Since the domain `trumove.lovable.app` is unverified, Resend throws an error. Because both calls are sequential (not wrapped in try/catch individually), the email error causes the entire function to return 500 — SMS never executes.

### Changes

**1. Edge function (`send-esign-document/index.ts`)**
- Add a `normalizePhone` helper that strips non-digits and prepends `+1` if missing (assumes US numbers)
- Use it in `sendSms` before calling Twilio
- Wrap email and SMS sends independently so one failing doesn't block the other
- Return partial success when only one channel works (e.g. SMS sent, email failed)

**2. No frontend changes needed** — the phone format issue is purely server-side normalization.

### Steps
1. Update the edge function with phone normalization and independent error handling for each channel
2. Deploy the updated function

