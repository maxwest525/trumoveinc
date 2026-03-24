

# Fix SMS: Shorten URL and Make Link Clickable

## Problem

The ClickSend logs confirm the issue. The SMS body sent is 232 characters, and ClickSend's trial account:
1. **Prepends "ClickSend:"** to every message (eating into the 160-char SMS limit)
2. **Truncates the URL** because the signing link includes long query parameters (`name=`, `email=`, `leadId=`)

The delivered message was: `ClickSend: TruMove: Hi max weinstein, your Estimate Authorization is ready to sign.` — the URL was completely stripped.

## Root Cause

The signing URL is too long because it passes all customer data as query params:
```
https://trumoveinc.lovable.app/esign/EST-2026-8657?type=estimate&name=max%20weinstein&email=maxwest525%40yahoo.com&leadId=55e1f2ac-5e6b-4435-821a-220b1b14fc47
```

This makes the total SMS body ~232 chars, well over SMS limits after ClickSend's prefix.

## Solution

### 1. Shorten the signing URL (edge function + frontend)

Instead of passing `name`, `email`, and `leadId` as query params, the `esign_documents` table already stores `lead_id` and `document_type`. The public e-sign page (`PublicESign.tsx`) should look up customer data from the DB using only the `refNumber`.

**New URL format:** `https://trumoveinc.lovable.app/esign/EST-2026-8657`

No query params needed. Total SMS body drops to ~120 chars.

**Changes:**
- `supabase/functions/send-esign-document/index.ts` — Remove query params from `signingUrl` construction (though the URL is currently built in `AgentESign.tsx`, the edge function just receives it)
- `src/pages/AgentESign.tsx` — Simplify `signingUrl` to just `${baseUrl}/esign/${refNumber}` (no query params)
- `src/pages/PublicESign.tsx` — Add a `useEffect` that fetches customer name, email, and lead data from the `esign_documents` table (joined with `leads`) using the URL's `refNumber`. Fall back to query params if present for backwards compatibility.

### 2. Customize the SMS template (edge function)

The SMS body in `send-esign-document/index.ts` line 52 is where you edit the text:

```typescript
const smsBody = `TruMove: Hi ${customerName}, your ${documentLabel} is ready to sign.\n\n${signingUrl}`;
```

This will be updated to a shorter, punchier message. For example:

```typescript
const smsBody = `TruMove: Hi ${customerName}, your ${documentLabel} is ready. Sign here: ${signingUrl}`;
```

### 3. ClickSend trial limitation note

Even after shortening, the ClickSend trial account will still prepend "ClickSend:" to messages. Upgrading to a paid ClickSend plan removes this prefix and ensures URLs are delivered intact. The URL shortening fix should make the link survive even with the trial prefix.

## Files to modify

| File | Change |
|------|--------|
| `src/pages/AgentESign.tsx` | Remove query params from `signingUrl` — just use `${baseUrl}/esign/${refNumber}` |
| `src/pages/PublicESign.tsx` | Add DB lookup: fetch `esign_documents` by `refNumber` to get `lead_id`, then fetch `leads` for name/email. Keep query param fallback. |
| `supabase/functions/send-esign-document/index.ts` | Shorten SMS body text |

