

# Fix "View" Button: Open E-Sign Document in a Modal (Not New Tab)

## Problem
The "View" button navigates to `/esign/{refNumber}` in a new tab, but that route doesn't exist in the app -- only `/auth` exists as the signing page. This causes a 404 error.

## Solution
Replace the `window.open` behavior with a **Dialog modal** that renders the actual e-sign document inline, with full signing/initials functionality.

---

## Changes

### 1. Create `ESignViewModal` component
**New file:** `src/components/esign/ESignViewModal.tsx`

- A Dialog modal that receives the document type (`estimate` | `ccach`) and customer info
- Renders the appropriate document component inside:
  - `EstimateAuthDocument` for estimate type
  - `CCACHDocumentWrapper` for CC/ACH type
- Includes all the signing state (typed name, initials, signature fields) so the agent can see the full interactive document
- Modal will be large (max-w-4xl or similar) to show the document at a readable size
- Read-only or interactive depending on preference -- the agent sees exactly what the customer sees

### 2. Update `AgentESign.tsx`
- Remove the `viewDocument` function that calls `window.open`
- Add state for the modal: `viewingDoc: DocumentRecord | null`
- "View" button sets `viewingDoc` to open the modal
- Render `ESignViewModal` with the selected document's type and customer info
- Apply the same fix to both the Track tab and Completed tab "View" buttons

### 3. Also fix `BOLSendTrack.tsx` (if it has the same pattern)
- Check and fix any other `window.open` calls to `/esign/` routes

---

## Technical Notes
- Reuses existing `EstimateAuthDocument` and `CCACHDocumentWrapper` components -- no duplication
- Uses the existing `Dialog` component from `@radix-ui/react-dialog`
- The modal will include a `ScrollArea` for documents that exceed viewport height
- Document state (signatures, name) is local to the modal -- closing and reopening resets it

