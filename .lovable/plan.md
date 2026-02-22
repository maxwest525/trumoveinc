

# Add Charts to Agent and Manager Dashboards

## Agent Dashboard (`AgentDashboardContent.tsx`)

Add a new charts row between the stats and the Next Actions section, with two charts contextual to an agent's workflow:

1. **Weekly Leads bar chart** (2/3 width) -- shows leads received vs bookings closed per day of the week. Uses the same `BarChart` pattern from the Admin dashboard (recharts `ResponsiveContainer`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, `Bar`).

2. **Pipeline Breakdown donut chart** (1/3 width) -- shows how many deals are at each pipeline stage (New Lead, Inventory, Estimate, Booked). Uses `PieChart` + `Pie` + `Cell` with a legend below, matching the Admin "Users by Role" style.

Mock data arrays will be added at the top of the file for both charts.

## Manager Dashboard (`ManagerDashboard.tsx`)

Add a charts row between the stats and the Approvals/Alerts section, with two charts contextual to a manager's oversight:

1. **Team Revenue Trend line chart** (2/3 width) -- shows monthly revenue over the last 6 months. Uses `LineChart` with the same styling as Admin's "User Growth" chart.

2. **Bookings by Status donut chart** (1/3 width) -- shows bookings split by status (Completed, In Progress, Scheduled, Cancelled). Uses the same `PieChart` pattern.

Mock data arrays will be added at the top of the file for both charts.

## Technical Details

### Files modified:

- **`src/components/agent/AgentDashboardContent.tsx`**
  - Import `BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid` from `recharts`
  - Add `WEEKLY_LEADS` data: `[{ day: "Mon", leads: 3, booked: 1 }, ...]`
  - Add `PIPELINE_DATA`: `[{ stage: "New Lead", count: 12 }, { stage: "Inventory", count: 8 }, { stage: "Estimate", count: 7 }, { stage: "Booked", count: 4 }]`
  - Add `PIPELINE_COLORS` array using design tokens (`--primary`, `--chart-2`, `--chart-3`, `--chart-4`)
  - Insert a new `grid grid-cols-1 lg:grid-cols-3` section after stats with the bar chart (col-span-2) and pie chart (col-span-1)

- **`src/pages/ManagerDashboard.tsx`**
  - Import `LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid` from `recharts`
  - Add `REVENUE_TREND` data: `[{ month: "Sep", revenue: 98000 }, ... { month: "Feb", revenue: 156400 }]`
  - Add `BOOKINGS_STATUS` data: `[{ status: "Completed", count: 18 }, { status: "In Progress", count: 6 }, { status: "Scheduled", count: 4 }, { status: "Cancelled", count: 2 }]`
  - Add `BOOKING_COLORS` array using design tokens
  - Insert a new charts grid section after stats, before the Approvals/Alerts row

### Styling
All charts will use the exact same patterns as AdminDashboard:
- `ResponsiveContainer` with `height={180}` for bar/line, `height={140}` for pie
- Same `Tooltip contentStyle` with border radius, border, and card background
- Same `CartesianGrid` with dashed lines, no vertical grid
- Same axis font sizes and colors
- Same donut inner/outer radius and padding angle

