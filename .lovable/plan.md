

## Better Utilize White Space on Meet Trudy Page

The page currently has a narrow, vertically stacked layout with constrained max-widths (`max-w-3xl` hero, `max-w-lg` chat, `max-w-5xl` grid) that leaves significant unused space on desktop. The fix is to widen the layout and use a two-section horizontal arrangement where it makes sense.

### Changes in `src/pages/CustomerService.tsx`

**1. Hero section — side-by-side on desktop (lines 298-381)**

Instead of everything stacked in a narrow `max-w-3xl` column, use a two-column layout at `lg:` breakpoint:
- **Left column**: Headline, subtitle, action buttons, stats — left-aligned on desktop
- **Right column**: Chat box at full available width (no `max-w-lg` constraint)
- Container widens to `max-w-6xl`
- On mobile, stacks vertically as before

```
<section className="pt-8 pb-6 px-4">
  <div className="mx-auto max-w-6xl">
    <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-center">
      {/* Left — text content, left-aligned on lg */}
      <div className="text-center lg:text-left space-y-5">
        <h1>Meet Trudy</h1>
        <p>subtitle</p>
        <action buttons — justify-center lg:justify-start>
        <stats row — justify-center lg:justify-start>
      </div>
      {/* Right — chat box, no max-w constraint */}
      <div className="w-full max-w-lg mx-auto lg:max-w-none">
        {chat component}
      </div>
    </div>
  </div>
</section>
```

This fixes the original gap problem by using `items-center` (vertically centers the shorter left column against the taller chat) instead of the old `items-start`.

**2. Capabilities grid — increase gap and use full width (lines 384-416)**

- Widen from `max-w-5xl` to `max-w-6xl` to match hero
- Increase grid gap from `gap-3` to `gap-4`
- Increase section top padding from `pt-10` to `pt-12`

**3. FAQ + Contact section — widen to match (lines 418-518)**

- Widen from `max-w-4xl` to `max-w-6xl`
- Increase vertical padding from `py-5` to `py-10`
- Increase grid gap from `gap-6` to `gap-10`

All three sections will share the same `max-w-6xl` container width, creating a consistent, spacious layout that fills the viewport better.

