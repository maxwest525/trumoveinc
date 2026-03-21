

## Plan: Wire Up Real Twilio SMS for E-Sign Document Delivery

### What Changes

**1. Update the `send-esign-document` edge function** to replace the simulated SMS block with real Twilio SMS via the connector gateway.

- When `deliveryMethod === "sms"`, send an SMS using the Twilio gateway at `https://connector-gateway.lovable.dev/twilio/Messages.json`
- Use `LOVABLE_API_KEY` and `TWILIO_API_KEY` environment variables (both already available)
- The SMS body will include the customer name, document type, and signing URL
- Need a `From` phone number — will store it as a secret (`TWILIO_PHONE_NUMBER`) so it can be changed without code edits

**2. Add `TWILIO_PHONE_NUMBER` secret** — the Twilio phone number to send SMS from (e.g., `+18005551234`). Will prompt you to enter it.

### Technical Details

The edge function SMS block (lines 124-137) will be replaced with:
- Validate `customerPhone` is provided
- POST to `https://connector-gateway.lovable.dev/twilio/Messages.json` with `Content-Type: application/x-www-form-urlencoded`
- Body params: `To` (customer phone), `From` (TWILIO_PHONE_NUMBER secret), `Body` (signing message with link)
- Return the Twilio message SID on success

No frontend changes needed — the existing UI already supports choosing email vs SMS delivery and passes `customerPhone`.

### Steps
1. Request the `TWILIO_PHONE_NUMBER` secret from you
2. Update the `send-esign-document` edge function with real Twilio gateway call

