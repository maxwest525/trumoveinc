

# Connect Admin Dashboard to Real Database Data

## Overview
Replace all hardcoded mock data in the Admin Dashboard with live queries to your backend. The dashboard will fetch real counts and activity from the `profiles`, `user_roles`, `deals`, `leads`, `activities`, and `support_tickets` tables.

## What Changes

### Stats Cards (top row)
| Card | Currently | Will Show |
|------|-----------|-----------|
| Total Users | Hardcoded "48" | Count from `profiles` table |
| Active Sessions | Hardcoded "23" | Count of users with `is_online = true` from `profiles` |
| Integrations | Hardcoded "0/4" | Keep static (no integrations table exists) |
| Automations | Hardcoded "3" | Count of open `support_tickets` (most relevant live metric) |

### Users by Role (pie chart)
Currently hardcoded role counts. Will query `user_roles` table grouped by `role` and map to display labels (owner -> Owners, admin -> Admins, manager -> Managers, agent -> Agents).

### Weekly Activity (bar chart)
Currently hardcoded daily logins/actions. Will query `activities` table for the last 7 days, grouped by day of week, counting total activities and completed activities (`is_done = true`).

### User Growth (line chart)
Currently hardcoded monthly user counts. Will query `profiles` table, grouping by `created_at` month for the last 6 months to show cumulative user growth.

## Technical Details

### File modified: `src/pages/AdminDashboard.tsx`

- Add imports: `useState`, `useEffect` from React, `supabase` from integrations
- Remove all hardcoded data constants (`STATS`, `USERS_BY_ROLE`, `ACTIVITY_DATA`, `GROWTH_DATA`)
- Add a `useEffect` that runs on mount and fetches in parallel:
  1. `supabase.from("profiles").select("id, created_at, is_online")` -- for total users, online count, and growth data
  2. `supabase.from("user_roles").select("role")` -- for role breakdown pie chart
  3. `supabase.from("activities").select("created_at, is_done").gte("created_at", sevenDaysAgo)` -- for weekly activity chart
  4. `supabase.from("support_tickets").select("id").eq("status", "open")` -- for open tickets count
- Compute derived data client-side:
  - **Role counts**: Group `user_roles` rows by `role`, count each
  - **Weekly activity**: Group `activities` by day-of-week, count total vs completed
  - **User growth**: For each of last 6 months, count profiles with `created_at` on or before that month's end (cumulative)
- Add a loading state that shows a spinner/skeleton while data loads
- Keep `QUICK_SETUP`, `INTEGRATIONS`, and `ROLE_COLORS` as static constants (no backing tables for those)

### No database changes needed
All required tables (`profiles`, `user_roles`, `activities`, `support_tickets`) already exist with appropriate RLS policies that allow owners/managers/admins to read the data.

