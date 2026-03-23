

# Set Up Auth Emails with TruMove Branding + E-Sign Email Fix

## Current State
- Domain `notify.crm.trumoveinc.com` is **verified and ready**
- Auth email hook has been re-scaffolded with the correct queue-based pattern
- Templates exist but have default black styling — need TruMove green branding
- E-sign emails already route through the built-in transactional system
- SMS via Twilio is already working in `send-esign-document`

## What I'll Do

### Step 1: Brand all 6 auth email templates
Apply TruMove's visual identity to every template:
- **Button color**: `#22c55e` (TruMove green) with white text
- **Heading color**: `#020817` (dark foreground)
- **Body text**: `#64748b` (muted foreground)
- **Footer text**: `#94a3b8`
- **Font**: `'Inter', Arial, sans-serif`
- **Border radius**: `8px`
- **OTP code color** (reauthentication): `#22c55e`

Templates: signup, recovery, magic-link, invite, email-change, reauthentication

### Step 2: Deploy auth-email-hook
Deploy the edge function so the branded templates go live. Auth emails will activate automatically once the system wires up the hook.

### Step 3: Verify e-sign + transactional email pipeline
Confirm that `send-esign-document` and `send-transactional-email` are deployed and functional. Redeploy if needed.

## What's Already Done (No Changes Needed)
- SMS sending via Twilio in `send-esign-document` — already working
- Transactional email templates (esign-request, deal-email, etc.) — already created
- Email queue infrastructure (pgmq, cron job) — already set up

## Result
- Auth emails (signup, password reset, etc.) send branded from `noreply@notify.crm.trumoveinc.com`
- E-sign document emails send through the same verified domain
- SMS continues working via Twilio for e-sign delivery

