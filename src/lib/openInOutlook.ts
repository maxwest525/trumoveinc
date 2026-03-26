/**
 * Opens an email in the user's default mail client (Outlook) via mailto: link.
 * Supports plain text body. HTML is stripped to plain text for mailto compatibility.
 */
export function openInOutlook({
  to,
  subject,
  body,
}: {
  to: string;
  subject: string;
  body: string;
}) {
  // Strip HTML tags for mailto body (plain text only)
  const plainBody = body
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .trim();

  const mailtoUrl = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(plainBody)}`;
  window.location.href = mailtoUrl;
}
