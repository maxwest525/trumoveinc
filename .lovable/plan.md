

## Plan: Secure the FMCSA API Key

**Problem**: The FMCSA API key is hardcoded in client-side code (`CarrierSearch.tsx`). You just updated the secret `FMCSA_WEB_KEY`, but it's not being used — the old key is still baked into the frontend.

**Solution**: Create a small edge function that returns the API key, fetch it once when the search component mounts, then use it for direct browser-to-FMCSA calls. This keeps the key out of source code while still making FMCSA requests from the browser (avoiding server IP blocking).

### Steps

1. **Create `get-fmcsa-key` edge function** — A minimal function that reads `FMCSA_WEB_KEY` from secrets and returns it. Only authenticated users can access it.

2. **Update `CarrierSearch.tsx`** — Remove the hardcoded key. On mount, call the edge function to get the key, store it in a ref, and use it for all FMCSA requests.

This way, whenever you update the secret, the app automatically uses the new key — no code changes needed.

