

## Testing Google Search Console Integration

Everything is already built and deployed. You just need to test the flow end-to-end.

### What to test (step by step)

1. **Navigate to** `/marketing/seo` and click the **Phase 2: Search Console** tab
2. **Click "Connect Google Search Console"** — this calls the `gsc-auth` edge function to generate an OAuth URL and redirects you to Google
3. **Sign in with Google** and grant the `webmasters.readonly` scope
4. **Google redirects back** to `/marketing/seo?code=...` — the component picks up the `code` param, exchanges it for tokens via the edge function, and stores them in `gsc_connections`
5. **Property selection** — after connect, your GSC properties should appear. Select `https://trumoveinc.com` (or the sc-domain variant)
6. **Fetch data** — once a property is selected, click "Fetch GSC Data" to pull per-URL metrics (clicks, impressions, CTR, position) and see Fix Priority scores

### Common issues to watch for

- **Redirect URI mismatch**: The redirect URI sent to Google must exactly match what you configured in Google Cloud Console. The code uses `${window.location.origin}/marketing/seo`. Make sure `https://trumoveinc.lovable.app/marketing/seo` (or whatever domain you're testing from) is in your Google OAuth client's authorized redirect URIs.
- **OAuth consent screen**: If still in "Testing" mode in Google Cloud, only test users you've added can authorize. Add your Google account as a test user if needed.
- **Missing refresh token**: Google only sends `refresh_token` on the first consent. If you re-authorize, you may not get one. The code uses `prompt: "consent"` which forces it, so this should be fine.

### No code changes needed

The integration is complete. This is purely a testing step.

