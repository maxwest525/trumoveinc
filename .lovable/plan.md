

## Plan: Remove Print and Download PDF from CC/ACH Form Footer

**What**: Remove the Print and Download PDF buttons from the CC/ACH Authorization form's action footer, since these actions are already available in the sidebar.

**Changes in `src/components/agent/CCACHAuthorizationForm.tsx`**:
- Remove the `<div>` containing the Print and Download PDF buttons (lines 720-729)
- Update the footer flex container to use `justify-end` instead of `justify-between` since only the Submit button remains
- Remove unused `Download` and `Printer` imports from lucide-react

