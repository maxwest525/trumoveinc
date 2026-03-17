

## Problem

The `defaultEntries` array in code has all 67 patterns, but the database still has the old 15. On page load, the DB patterns overwrite the code defaults (line 257). So users always see 15, not 67.

Two things need to happen:

### 1. Update DB with full 67 patterns (one-time sync)

Add logic so that when DB patterns are loaded and they have fewer entries than `defaultEntries`, automatically merge/replace with the full set. This ensures the DB gets the complete 67 without requiring users to manually click "Reset to defaults."

**In the `loadPatternsFromDb` effect (line 251-262):** After loading DB patterns, compare count. If `dbPatterns.length < defaultEntries.length`, use `defaultEntries` instead (the DB will auto-sync via the persist effect).

### 2. Add severity auto-assignment + import/export

While we're in the file, also implement the two features from earlier:

**Severity auto-assignment** — Add a `defaultSeverity` field to `CATEGORY_META` mapping:
- `legal`, `compliance`, `pii`, `safety` → `critical`
- `escalation`, `anger` → `high`  
- `rebuttal` → `medium`

This gets used when flagging keywords in `PulseAgent.tsx` — the `checkMatch` function currently assigns severity based on match type. Instead, look up the pattern's category and use the category's default severity.

**Import/Export** — Add two buttons to the settings UI:
- **Export**: Download current `entries` as a JSON file
- **Import**: File input that reads a JSON file and merges/replaces entries

### Files to Change

- `src/pages/pulse/PulseManager.tsx` — Fix DB-overwrite logic, add severity map to `CATEGORY_META`, add import/export buttons
- `src/pages/pulse/PulseAgent.tsx` — Use category-based severity lookup instead of match-type-based

