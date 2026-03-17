

## Add Compliance Regex Patterns

Expand the default watch patterns from 15 to ~35 by adding new categories and patterns for HIPAA, financial disclosures, and profanity detection.

### Changes

**1. Add new categories** to the `Category` type and `CATEGORY_META` in `PulseManager.tsx`:
- `hipaa` — HIPAA / health data terms
- `financial` — Financial disclosures and unauthorized promises
- `profanity` — Profane language detection

**2. Add ~20 new default patterns** across all types:

**HIPAA / Health Data:**
- keyword: `diagnosis`, `prescription`, `hipaa`
- phrase: `medical record`, `health information`, `patient data`
- regex: `\\b(diagnosis|prognosis|treatment plan|medical history|PHI|protected health)\\b` (catch-all)

**Financial Disclosures:**
- keyword: `guaranteed returns`, `no risk`
- phrase: `not financial advice`, `past performance`
- regex: `\\b(guaranteed|no[- ]risk|risk[- ]free)\\s+(return|profit|income)` (unauthorized promises)
- regex: `\\b(insider|non[- ]public)\\s+(information|trading|knowledge)` (insider trading language)
- phrase: `wire transfer`, `routing number`, `account number`

**Profanity:**
- regex: `\\b(damn|hell|crap|ass|bastard)\\b` (mild)
- regex: `\\b(f[u*][c*]k|sh[i*]t|b[i*]tch)\\b` (strong, with common obfuscation)
- regex: `\\b(stupid|idiot|moron|dumb)\\b` (agent insults toward customer)

**Additional compliance/safety:**
- phrase: `off the record`
- regex: `\\b\\d{4}[- ]?\\d{4}[- ]?\\d{4}[- ]?\\d{4}\\b` (credit card number pattern)
- regex: `\\bDOB\\b|\\bdate of birth\\b` (date of birth PII)

### Files to Change
- `src/pages/pulse/PulseManager.tsx` — Add 3 new categories to `Category` type and `CATEGORY_META`, add ~20 new entries to `defaultEntries`

### Notes
- Existing users with saved patterns in localStorage won't be affected (they keep their customized set)
- The "Reset to defaults" button will load the expanded set
- New database saves will include the full set

