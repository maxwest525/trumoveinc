

## Plan: Redesign E-Sign Workflow — "Send to Client" with Documents Tab

### What You Described
1. Create lead → Move details → Inventory → E-Sign Hub
2. At E-Sign Hub, hit "Send to Client" which sends ALL docs (Estimate Auth, CC/ACH Auth, Merchant Payment) via both SMS (Twilio) and email (Resend) simultaneously
3. After sending, auto-redirect to that customer's profile in My Customers
4. Customer profile gets a new **Documents** tab showing each document's status (Sent, Delivered, Opened, In Progress, Completed) with a manual Refresh button

### Changes

**1. Rework the E-Sign page (`AgentESign.tsx`)**
- Remove demo data and individual doc-type picker
- Replace with a single "Send to Client" button that sends all 3 document types at once (Estimate, CC/ACH, Merchant Payment)
- On send: call the edge function for each doc type via both email AND SMS simultaneously
- Persist all 3 docs to `esign_documents` table
- After successful send, navigate to `/agent/customers/{leadId}`

**2. Update `send-esign-document` edge function**
- Support sending both email (Resend) AND SMS (Twilio) in a single call when `deliveryMethod: "both"` is passed
- This avoids needing 6 separate calls (3 docs × 2 channels)

**3. Add "Documents" tab to Customer Detail (`AgentCustomerDetail.tsx`)**
- New tab alongside Overview and E-Sign
- Fetches from `esign_documents` table filtered by `lead_id`
- Shows each document as a row with: Document Type, Ref Number, Delivery Method, Status badge (color-coded: Sent=blue, Delivered=amber, Opened=purple, In Progress=orange, Completed=green), Sent timestamp
- Add inventory list row (links to editable inventory for that lead)
- Add a Refresh button at top that re-fetches the data

**4. Update Inventory page navigation (`AgentInventory.tsx`)**
- "Save & Continue" navigates to `/agent/esign?leadId={id}` (already does this — no change needed)

**5. Add `merchant_payment` as a new document type**
- Add to the `esign_documents` table as a valid `document_type` value
- Add to the edge function's `DOCUMENT_LABELS` map
- No schema migration needed since `document_type` is a text column

### Technical Details

- **Edge function change**: Add `deliveryMethod: "both"` option that sends via Resend AND Twilio in the same invocation
- **Bulk send**: Frontend loops through 3 doc types (estimate, ccach, merchant_payment), calling the edge function for each with `deliveryMethod: "both"`
- **Documents tab**: Simple read from `esign_documents` + manual refresh — no realtime subscription needed
- **Status tracking**: Uses existing `status` column values in `esign_documents` (sent, delivered, opened, completed)
- **Inventory row**: Shown as a static link to `/agent/inventory/{leadId}` with edit capability

### Steps
1. Update the edge function to support `deliveryMethod: "both"`
2. Rework `AgentESign.tsx` with the bulk "Send to Client" flow + redirect
3. Build the Documents tab component for Customer Detail
4. Add the Documents tab to `AgentCustomerDetail.tsx`
5. Deploy the updated edge function

