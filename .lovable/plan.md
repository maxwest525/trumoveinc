

## Plan: Simple New-Tab Launch

**Change**: Update `handleLaunchAll` to use simple `window.open(url, '_blank')` calls instead of trying to position/size windows. This opens each tool in a regular new browser tab, letting agents arrange them on their second monitor however they like.

**File**: `src/components/agent/AgentToolLauncherModal.tsx` (lines 130-145)

Replace the current `handleLaunchAll` with:
- `window.open(tool.url, '_blank')` for each tool
- Close the modal after

Also update the tool URLs to use homepages (`https://granot.co` and `https://convoso.com`) instead of login pages, since the user wants the homepage for now.

Single file, ~5 lines changed.

