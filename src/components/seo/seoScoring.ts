/**
 * Weighted SEO issue scoring engine
 * Produces per-page weighted_score, issue_count, and detailed breakdown
 */

export type IssueSeverity = "critical" | "high" | "medium" | "low";

export interface ScoredIssue {
  label: string;
  severity: IssueSeverity;
  points: number;
}

export interface PageScore {
  weighted_score: number;
  issue_count: number;
  issues: ScoredIssue[];
  opportunity_bonus: number;
  final_priority: number;
}

const SEVERITY_POINTS: Record<IssueSeverity, number> = {
  critical: 40,
  high: 20,
  medium: 10,
  low: 5,
};

const CTA_PHRASES = ["quote", "estimate", "call", "book", "contact", "schedule", "get started", "free"];

function slugTerms(url: string): string[] {
  try {
    const path = new URL(url).pathname;
    return path
      .split("/")
      .filter(Boolean)
      .flatMap((seg) => seg.split("-"))
      .filter((t) => t.length > 2)
      .map((t) => t.toLowerCase());
  } catch {
    return [];
  }
}

export interface AuditPageInput {
  url: string;
  fetchedTitle: string | null;
  fetchedDescription: string | null;
  fetchedH1: string | null;
  fetchedCanonical: string | null;
}

/**
 * Score a single page. `allPages` is needed for duplicate detection.
 */
export function scorePage(
  page: AuditPageInput,
  allPages: AuditPageInput[]
): PageScore {
  const issues: ScoredIssue[] = [];

  // --- Critical (40 pts each) ---
  if (!page.fetchedTitle?.trim()) {
    issues.push({ label: "Missing title", severity: "critical", points: SEVERITY_POINTS.critical });
  }
  if (!page.fetchedDescription?.trim()) {
    issues.push({ label: "Missing meta description", severity: "critical", points: SEVERITY_POINTS.critical });
  }
  if (!page.fetchedH1?.trim()) {
    issues.push({ label: "No H1 tag", severity: "critical", points: SEVERITY_POINTS.critical });
  }

  // --- High (20 pts each) ---
  if (page.fetchedTitle?.trim()) {
    const dupes = allPages.filter(
      (p) =>
        p.url !== page.url &&
        p.fetchedTitle?.trim().toLowerCase() === page.fetchedTitle!.trim().toLowerCase()
    );
    if (dupes.length > 0) {
      issues.push({ label: "Duplicate title", severity: "high", points: SEVERITY_POINTS.high });
    }

    const len = page.fetchedTitle.trim().length;
    if (len < 30) {
      issues.push({ label: `Title too short (${len} chars, min 30)`, severity: "high", points: SEVERITY_POINTS.high });
    } else if (len > 65) {
      issues.push({ label: `Title too long (${len} chars, max 65)`, severity: "high", points: SEVERITY_POINTS.high });
    }
  }

  if (page.fetchedDescription?.trim()) {
    const dupes = allPages.filter(
      (p) =>
        p.url !== page.url &&
        p.fetchedDescription?.trim().toLowerCase() === page.fetchedDescription!.trim().toLowerCase()
    );
    if (dupes.length > 0) {
      issues.push({ label: "Duplicate meta description", severity: "high", points: SEVERITY_POINTS.high });
    }

    const len = page.fetchedDescription.trim().length;
    if (len < 70) {
      issues.push({ label: `Description too short (${len} chars, min 70)`, severity: "high", points: SEVERITY_POINTS.high });
    } else if (len > 170) {
      issues.push({ label: `Description too long (${len} chars, max 170)`, severity: "high", points: SEVERITY_POINTS.high });
    }
  }

  // --- Medium (10 pts each) ---
  // Multiple H1s — we only have one H1 field from the scraper, so skip this check
  // (would need raw HTML). Instead, check canonical issues:
  if (!page.fetchedCanonical?.trim()) {
    issues.push({ label: "Missing canonical tag", severity: "medium", points: SEVERITY_POINTS.medium });
  } else {
    try {
      const canonicalNorm = new URL(page.fetchedCanonical.trim()).href.replace(/\/$/, "");
      const pageNorm = new URL(page.url).href.replace(/\/$/, "");
      if (canonicalNorm !== pageNorm) {
        issues.push({ label: "Canonical points elsewhere", severity: "medium", points: SEVERITY_POINTS.medium });
      }
    } catch {
      // invalid canonical URL
      issues.push({ label: "Invalid canonical URL", severity: "medium", points: SEVERITY_POINTS.medium });
    }
  }

  // --- Low (5 pts each) ---
  if (page.fetchedTitle?.trim()) {
    const terms = slugTerms(page.url);
    if (terms.length > 0) {
      const titleLower = page.fetchedTitle.toLowerCase();
      const hasSlugTerm = terms.some((t) => titleLower.includes(t));
      if (!hasSlugTerm) {
        issues.push({ label: "Title missing topic from URL slug", severity: "low", points: SEVERITY_POINTS.low });
      }
    }
  }

  if (page.fetchedDescription?.trim()) {
    const descLower = page.fetchedDescription.toLowerCase();
    const hasCta = CTA_PHRASES.some((p) => descLower.includes(p));
    if (!hasCta) {
      issues.push({ label: "Description has no CTA phrase", severity: "low", points: SEVERITY_POINTS.low });
    }
  }

  const weighted_score = issues.reduce((sum, i) => sum + i.points, 0);

  return {
    weighted_score,
    issue_count: issues.length,
    issues,
    opportunity_bonus: 0,
    final_priority: weighted_score,
  };
}

/**
 * Apply GSC opportunity bonus to an existing PageScore
 */
export function applyOpportunityBonus(
  score: PageScore,
  gscData?: { impressions: number; ctr: number; position: number }
): PageScore {
  let bonus = 0;
  if (gscData) {
    if (gscData.impressions > 100 && gscData.ctr < 2) bonus += 20;
    if (gscData.position >= 5 && gscData.position <= 20) bonus += 15;
  }
  return {
    ...score,
    opportunity_bonus: bonus,
    final_priority: score.weighted_score + bonus,
  };
}

/** Color for severity badge */
export function severityColor(s: IssueSeverity): "destructive" | "secondary" | "outline" | "default" {
  if (s === "critical") return "destructive";
  if (s === "high") return "secondary";
  if (s === "medium") return "outline";
  return "default";
}
