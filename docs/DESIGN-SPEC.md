# Design Specification — Stryde (Jobs & Leads Search Demo)

**Project:** Jobs & Sales Leads Search UI + n8n Workflow  
**Brand name:** Stryde  
**Gate:** G4 — Design refresh  
**Date:** 2026-10-20  
**Author:** UI/UX Designer subagent  
**Audience:** Solo frontend developer + stakeholder  

> **Scope lock reminder:** This refresh supports only the MVP features documented in `docs/PRD.md`, `docs/API-CONTRACT.md`, and `docs/PROJECT-CONTEXT.md`: three search modes (`jobs` / `clients` / `both`), a 10–1000 character natural-language query, up to 15 batch results, and the locked n8n output schema. No auth, payments, CRM, streaming, native apps, or dark mode.

---

## 1. Design direction

Stryde should feel like a focused, premium command center: one confident brand, one clear action, and results that look curated rather than scraped. The previous design was competent but anonymous; this refresh gives the interface a distinct identity, depth, and polish while keeping the UX single-threaded and fast.

### Personality
- **Confident but friendly:** No corporate heaviness, no playful excess.
- **Calm motion:** Transitions are short (150–250 ms) and directional; nothing bounces or flashes.
- **Trustworthy transparency:** Sources, assumptions, and data quality are visible, not buried.
- **Modern craft:** Subtle gradients, layered surfaces, crisp shadows, and a single signature brand accent (indigo/violet) that ties everything together.

### Big changes from the previous spec
1. Added a **sticky brand header** with the Stryde wordmark and an About link.
2. Replaced the flat white page with a **subtle tinted gradient + dot-grid texture** for depth.
3. Introduced a **signature brand color** (indigo) and richer semantic palette for jobs, leads, and both.
4. Redesigned the **hero** to lead with the Stryde name, a sharper tagline, and a clear CTA.
5. Elevated result cards with **lift-on-hover, stronger shadows, clearer hierarchy, and consistent iconography**.
6. Added a **footer** with attribution, stack credits, and About link.
7. Specified **micro-interactions** for buttons, cards, mode selector, and loading shimmer.

---

## 2. Color palette

All colors use Tailwind v3 default scale tokens. Do not use arbitrary hex values outside the token table. Semantic colors are reserved for their specific meaning; brand indigo is used for Stryde identity and primary actions.

### Brand & neutrals

| Token | Tailwind class | Hex | Usage |
|-------|----------------|-----|-------|
| `brand` | `indigo-600` | `#4F46E5` | Wordmark, primary icon accents, active focus rings, key links |
| `brand-hover` | `indigo-700` | `#4338CA` | Brand hover states |
| `brand-active` | `indigo-800` | `#3730A3` | Brand active / pressed |
| `brand-subtle` | `indigo-50` | `#EEF2FF` | Hero tint, context card background, subtle brand washes |
| `brand-glow` | `indigo-100` | `#E0E7FF` | Soft borders, mode-selector pill borders |
| `cta` | `indigo-700` | `#4338CA` | Primary CTA button background (contrast-safe) |
| `cta-hover` | `indigo-800` | `#3730A3` | CTA hover |
| `cta-active` | `indigo-900` | `#312E81` | CTA active / pressed |
| `page-bg-top` | `slate-50` | `#F8FAFC` | Page background gradient start |
| `page-bg-mid` | `white` | `#FFFFFF` | Page background midpoint |
| `page-bg-bottom` | `indigo-50/40` | `#EEF2FF66` | Very subtle indigo wash at page bottom |
| `surface` | `white` | `#FFFFFF` | Cards, header, footer, input backgrounds |
| `surface-elevated` | `white` | `#FFFFFF` | Cards on textured background (same token, shadow provides elevation) |
| `border` | `slate-200` | `#E2E8F0` | Default borders, dividers |
| `border-strong` | `slate-300` | `#CBD5E1` | Hover borders |
| `text-primary` | `slate-900` | `#0F172A` | Headings, body text |
| `text-secondary` | `slate-600` | `#475569` | Labels, meta text, assumptions |
| `text-muted` | `slate-500` | `#64748B` | Placeholders, captions, footer text |
| `text-on-primary` | `white` | `#FFFFFF` | Text on CTA buttons |
| `ring-focus` | `indigo-500` | `#6366F1` | Focus rings |

### Semantic accents

| Token | Tailwind class | Hex | Usage |
|-------|----------------|-----|-------|
| `jobs` | `blue-600` | `#2563EB` | Jobs mode badge, jobs-themed icon |
| `jobs-bg` | `blue-50` | `#EFF6FF` | Jobs badge background |
| `leads` | `violet-600` | `#7C3AED` | Leads mode badge, leads-themed icon |
| `leads-bg` | `violet-50` | `#F5F3FF` | Leads badge background |
| `both` | `emerald-600` | `#059669` | Both mode badge |
| `both-bg` | `emerald-50` | `#ECFDF5` | Both badge background |
| `success` | `green-600` | `#16A34A` | Valid email, success states |
| `success-bg` | `green-50` | `#F0FDF4` | Valid email badge background |
| `warning` | `amber-600` | `#D97706` | Partial failure, medium priority |
| `warning-bg` | `amber-50` | `#FFFBEB` | Warning banner background |
| `error` | `red-600` | `#DC2626` | Errors, invalid email |
| `error-bg` | `red-50` | `#FEF2F2` | Error banner background |
| `info` | `indigo-600` | `#4F46E5` | Info notes |
| `info-bg` | `indigo-50` | `#EEF2FF` | Info banner background |

### Priority badge colors

| Priority | Background | Text / border | Usage |
|----------|------------|---------------|-------|
| High | `rose-50` | `rose-700` / `rose-200` | High-priority results |
| Medium | `amber-50` | `amber-700` / `amber-200` | Medium priority |
| Low | `slate-100` | `slate-700` / `slate-200` | Low priority |

### Email status badge colors

| `email_status` | Background | Text / border |
|----------------|------------|---------------|
| `valid` | `green-50` | `green-700` / `green-200` |
| `invalid` | `red-50` | `red-700` / `red-200` |
| missing / other | `slate-100` | `slate-700` / `slate-200` |

### Gradient usage

| Name | Tailwind | Usage |
|------|----------|-------|
| `hero-text-gradient` | `bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent` | Stryde wordmark in hero |
| `page-background` | `bg-gradient-to-b from-slate-50 via-white to-indigo-50/40` | Page backdrop |
| `cta-gradient` | `bg-gradient-to-r from-indigo-700 to-violet-700 hover:from-indigo-800 hover:to-violet-800` | Optional CTA gradient hover |
| `shimmer` | `bg-gradient-to-r from-transparent via-white/60 to-transparent` | Skeleton shimmer overlay |

---

## 3. Typography

| Level | Size | Line height | Weight | Letter spacing | Tailwind example | Usage |
|-------|------|-------------|--------|----------------|------------------|-------|
| Brand wordmark | `1.5rem` (24px) | 1.2 | 800 | -0.03em | `text-2xl font-extrabold tracking-tighter` | Header logo text |
| Hero title | `2.25rem` (36px) mobile → `3rem` (48px) desktop | 1.1 | 800 | -0.03em | `text-4xl lg:text-5xl font-extrabold tracking-tighter` | “Stryde” hero |
| Hero tagline | `1.125rem` (18px) mobile → `1.25rem` (20px) desktop | 1.5 | 400 | 0 | `text-lg lg:text-xl text-slate-600` | One-line value prop |
| Section title | `1.25rem` (20px) | 1.4 | 600 | -0.01em | `text-xl font-semibold` | “Results”, “Assumptions” |
| Card title | `1.125rem` (18px) | 1.4 | 600 | 0 | `text-lg font-semibold` | Opportunity / role title |
| Body | `1rem` (16px) | 1.6 | 400 | 0 | `text-base` | Primary readable text |
| Small | `0.875rem` (14px) | 1.5 | 400 | 0 | `text-sm` | Meta labels, contacts |
| Caption | `0.75rem` (12px) | 1.4 | 500 | 0.01em | `text-xs font-medium` | Badges, counter, footer |

**Font family:** `Inter`, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif. Use `font-extrabold` only for the brand wordmark and hero title; everything else uses `font-semibold` or `font-medium` at most.

---

## 4. Layout grid and responsive breakpoints

### Breakpoints

| Name | Min width | Tailwind prefix | Layout behavior |
|------|-----------|-----------------|-----------------|
| Mobile | 320px | default | Single column, full-width controls, stacked cards |
| Tablet | 640px | `sm:` | Horizontal mode selector, wider hero |
| Desktop | 1024px | `lg:` | Centered hero, max-width results |
| Large desktop | 1280px | `xl:` | More whitespace, same structure |

### Page canvas

- **Background:** `bg-gradient-to-b from-slate-50 via-white to-indigo-50/40` with a fixed, subtle dot-grid overlay.
- **Texture overlay:** `bg-[radial-gradient(#4F46E5_0.5px,transparent_0.5px)] [background-size:24px_24px] opacity-[0.025] pointer-events-none fixed inset-0`. This gives the page a faint, intentional grain without competing with content.
- **Container max-width:** `max-w-4xl` (56rem / 896px) for the main content column.
- **Hero max-width:** `max-w-2xl` (42rem / 672px) on first visit; after results appear the whole column stays `max-w-4xl` and the hero compacts.
- **Horizontal padding:** `px-4` mobile, `px-6` tablet, `px-8` desktop.
- **Vertical rhythm:** `py-12` mobile → `py-20` desktop on first-visit hero; `gap-8` between major sections.

### Grid

- Single-column flex stack (`flex flex-col gap-4` for cards, `gap-8` for sections).
- Result card internals are stacked on mobile; on `sm:`+ the header can use a flex row for badges and source link.
- Center everything with `mx-auto` inside the max-width container.

---

## 5. Component specifications

### 5.1 Header / navigation

**Purpose:** Make the Stryde brand visible on every screen and provide a path to the About page.

**Structure:**
- Sticky top header (`sticky top-0 z-50`) with a frosted-glass effect.
- Left: **Stryde** wordmark as a text logo, linked to `/`.
- Right: subtle nav link `"About"` linking to `/about`.

**Wordmark styling:**
- Text: `"Stryde"` in `text-2xl font-extrabold tracking-tighter`.
- Color: gradient text `from-indigo-600 via-violet-600 to-indigo-600 bg-clip-text text-transparent`.
- Optionally prepend a small geometric “S” mark: a rotated square / diamond (CSS-only) in `indigo-600` with a white diagonal, but the text mark alone is acceptable.

**Header shell:**
- `bg-white/80 backdrop-blur-md border-b border-slate-200/70`.
- Height: `h-16`.
- Inner container: `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between`.

**States:**
| State | Visual |
|-------|--------|
| Default | Frosted white bar, gradient wordmark, muted About link |
| Hover (About) | `text-indigo-700` with underline offset |
| Focus (About) | `ring-2 ring-indigo-500 ring-offset-2 rounded-md` |
| Scroll | Same; optionally add a slightly stronger bottom shadow (`shadow-sm`) when `scrollY > 0` |

**Accessibility:**
- Wordmark link has `aria-label="Stryde home"`.
- About link is a real `<a>` or Next.js `<Link>` with visible focus ring.

---

### 5.2 Hero section

**Purpose:** Immediately communicate brand, value, and the one action to take.

**Structure:**
- Centered block at top of main content.
- Eyebrow (optional): `"Jobs & leads search"` in `text-xs font-semibold tracking-wide uppercase text-indigo-600`.
- Headline: `"Stryde"` with gradient text.
- Tagline: `"Type what you want. Find your next role or prospect in seconds."`
- Sub-tagline (one line): `"One search. Curated jobs, sales leads, and verified contacts."`

**States:**
| State | Visual |
|-------|--------|
| First visit / empty | Hero is tall and airy (`py-16 lg:py-24`), form below |
| Results loaded | Hero compacts (`py-8 lg:py-10`), tagline hidden or truncated, form stays visible sticky below header |

**Responsive:**
- Mobile: eyebrow + headline + tagline stacked, text center.
- Desktop: same centered column; headline scales to `text-5xl`.

---

### 5.3 Mode selector (Jobs / Leads / Both)

**Purpose:** Let the user declare intent before typing.

**Structure:**
- A pill-shaped segmented control with a sliding active background.
- Each option shows an icon + label:
  - Jobs: `Briefcase` icon, label `"Jobs"`
  - Leads: `Target` or `Users` icon, label `"Leads"`
  - Both: `Layers` icon, label `"Both"`
- Container: `bg-slate-100/80 backdrop-blur-sm p-1 rounded-full inline-flex`.
- Active option: white pill with `shadow-sm`, text in mode semantic color.

**States:**
| State | Visual |
|-------|--------|
| Default (unselected) | `bg-transparent`, `text-slate-600` |
| Hover (unselected) | `text-slate-900`, `bg-slate-200/50` |
| Focus | `ring-2 ring-indigo-500 ring-offset-2` on the option button |
| Active / selected | `bg-white`, `shadow-sm`, mode-colored text (`text-blue-600` / `text-violet-600` / `text-emerald-600`), `font-semibold` |
| Disabled | `opacity-50`, `cursor-not-allowed` |

**Behavior:**
- Only one mode selected at a time.
- Default selection: `jobs`.
- Changing mode updates the textarea placeholder immediately with a 150 ms cross-fade.
- Submit sends the API enum value (`jobs`, `clients`, `both`).

**Accessibility:**
- Use `<fieldset>` with `<legend class="sr-only">Search mode</legend>`.
- Each option is a `<button>` with `aria-pressed={isSelected}`.
- Keyboard: Tab into group; arrow keys move selection (or Tab + Space/Enter).

---

### 5.4 Search input

**Purpose:** Capture the natural-language request.

**Structure:**
- `<textarea>` with `rows={3}` min, auto-resize up to `rows={6}` optional.
- Label: `"What are you looking for?"` in `text-sm font-medium text-slate-700`.
- Placeholder changes per mode:
  - Jobs: `"Senior React engineer roles in Berlin, remote-first…"`
  - Leads: `"SaaS fintech startups in Europe hiring sales reps…"`
  - Both: `"n8n workflow automation opportunities in Berlin…"`
- Character counter bottom-right: `"42 / 1000"`.
- Validation hint bottom-left when invalid.

**States:**
| State | Visual |
|-------|--------|
| Default | `bg-white`, `border-slate-200`, `rounded-xl`, `shadow-sm`, `placeholder:text-slate-400` |
| Hover | `border-slate-300` |
| Focus | `border-indigo-500`, `ring-2 ring-indigo-500 ring-offset-2` |
| Error | `border-red-500`, `ring-2 ring-red-500 ring-offset-2` |
| Disabled | `bg-slate-100`, `text-slate-500`, `cursor-not-allowed` |

**Validation:**
- Real-time character count; do not block typing past 1000, but turn counter `text-red-600` and show error hint if over.
- Minimum 10 characters: show error hint and disable submit until satisfied.
- Sanitize on render: never use `dangerouslySetInnerHTML` for query text.

**Accessibility:**
- `<label for="query">` linked by `id`.
- `aria-describedby` points to counter + validation hint.
- `aria-invalid="true"` when invalid.

---

### 5.5 Submit button

**Purpose:** Trigger search; communicate system status.

**Structure:**
- Full-width on mobile, `w-auto min-w-[160px]` on `sm:`+.
- Label: `"Search with Stryde"` when idle (or simply `"Search"` if space-constrained).
- Loading label: `"Searching…"` with a left-aligned `Loader2` spinner.
- Optional gradient: `bg-gradient-to-r from-indigo-700 to-violet-700`.

**States:**
| State | Visual |
|-------|--------|
| Default | `bg-indigo-700`, `text-white`, `rounded-xl`, `px-8 py-3.5`, `font-semibold`, `shadow-md shadow-indigo-500/20` |
| Hover | `bg-indigo-800`, `shadow-lg shadow-indigo-500/25`, `translate-y-[-1px]` |
| Focus | `ring-2 ring-indigo-500 ring-offset-2` |
| Active / pressed | `bg-indigo-900`, `translate-y-[1px]`, `shadow-sm` |
| Disabled / loading | `bg-indigo-400`, `cursor-not-allowed`, spinner visible, no lift |

**Behavior:**
- Disabled while request is in flight and while textarea is invalid.
- On click, scrolls gently to the results region.
- Loading state replaces button text; no separate floating spinner.

---

### 5.6 Loading / progress state

**Purpose:** Set expectation during the 3–15 second n8n batch wait.

**Structure:**
- Centered status card below the search form.
- Indeterminate shimmer progress bar.
- Status text cycles:
  - 0–5 s: `"Searching across sources…"`
  - 5–10 s: `"Curating results…"`
  - 10+ s: `"Still searching, this can take a moment."`
- Subtext: `"You can leave this tab open; results will appear here."`

**Progress bar:**
- Track: `h-1.5 bg-slate-200 rounded-full overflow-hidden`.
- Shimmer bar: `h-full w-1/3 bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-500 animate-[shimmer_1.5s_infinite]` moving horizontally.

**Skeleton cards:**
- Render 3 placeholder result cards.
- Each skeleton: white rounded card with subtle border, pulse animation, and lines for title, company, meta, and a short paragraph.
- Use `overflow-hidden relative` with a `shimmer` overlay sweeping across for extra polish.

**Reduced motion:**
- If `prefers-reduced-motion: reduce`, disable shimmer and pulse; show static placeholder lines and a plain indeterminate bar.

---

### 5.7 Result card

**Purpose:** Display one lead from the `leads[]` array with premium, scannable hierarchy.

**Structure (top to bottom):**
1. **Card header row**
   - Left: type badge (`job` / `client` / `both`) + priority badge (`High` / `Medium` / `Low`).
   - Right: `ExternalLink` icon button linking to `source_url` when present.
2. **Opportunity title** — `text-lg font-semibold text-slate-900`.
3. **Company + domain line**
   - `"Example Co · example.com"` — use `·` separator.
   - If domain missing, show company only; if both missing, omit line.
4. **Meta row** — inline flex wrap with icons and `text-sm text-slate-600`:
   - `MapPin` + location
   - `Monitor` or `Globe` + remote_status
   - `Calendar` + posted_date
   - `Clock` + `"X days old"`
   - Hide missing meta gracefully.
5. **Why it fits** — short paragraph under a `"Why it fits"` label in `text-sm text-slate-700`.
6. **Contacts section** — list of contact rows (see 5.8).

**Card shell:**
- `bg-white`, `border border-slate-200`, `rounded-2xl`, `shadow-sm`, `p-5`.
- Hover: `shadow-lg`, `border-indigo-100`, `-translate-y-1`, `transition-all duration-200 ease-out`.
- Focus (if focusable): `ring-2 ring-indigo-500 ring-offset-2`.

**Empty / missing fields:**
- Omit the line entirely; never show `"N/A"` or `"—"`.
- If `source_url` is missing, hide the external-link button rather than disabling it.

**Priority badge mapping:**
| Priority | Badge text | Colors |
|----------|------------|--------|
| High | "High" | `rose-50` / `rose-700` |
| Medium | "Medium" | `amber-50` / `amber-700` |
| Low | "Low" | `slate-100` / `slate-700` |

**Type badge mapping:**
| `type` | Badge text | Colors |
|--------|------------|--------|
| `job` | "Job" | `blue-50` / `blue-700` |
| `client` / `lead` | "Lead" | `violet-50` / `violet-700` |
| `both` | "Both" | `emerald-50` / `emerald-700` |

---

### 5.8 Contact row

**Purpose:** Show verified contacts when `contacts[]` is provided.

**Structure:**
- Section label: `"Contacts"` (only if at least one contact exists) in `text-sm font-semibold text-slate-900`.
- Each contact is a rounded sub-card inside the result card: `bg-slate-50`, `rounded-xl`, `p-3.5`, `border border-slate-100`.
- Content:
  - Name + title: `"Jane Doe, Head of Operations"`.
  - Email: clickable `mailto:` link with `Mail` icon. Show email_status badge beside it.
  - LinkedIn: clickable external link with `Linkedin` icon when `linkedin_url` is present and valid.

**Email status badge mapping:**
| `email_status` | Badge text | Colors |
|----------------|------------|--------|
| `valid` | "Verified" | `green-50` / `green-700` |
| `invalid` | "Invalid" | `red-50` / `red-700` |
| missing / other | "Unverified" | `slate-100` / `slate-700` |

**States:**
- Email link hover: `text-indigo-700`, underline.
- LinkedIn link hover: `text-indigo-700`, underline.
- Invalid email: render as plain text (not `mailto:`), badge says "Invalid".

---

### 5.9 Context / assumptions / notes display

**Purpose:** Make the backend’s reasoning transparent and build trust.

**Structure:**
- Displayed as a compact "Context" card directly below the submit form and above result cards.
- `intent_summary` as a sentence: `"We understood: Remote AI automation roles at US companies"`.
- `assumptions` as a bulleted list with label `"Assumptions"`.
- `notes` as a warning/info banner if non-empty (especially partial-failure notes).

**Styling:**
- Context card: `bg-indigo-50/70`, `border border-indigo-100`, `rounded-2xl`, `p-4`.
- Assumptions list: `list-disc list-inside`, `text-sm text-slate-700`.
- Notes banner: `warning-bg` / `warning` if it looks like a failure note; otherwise `info-bg` / `info`.

**Behavior:**
- Always render when present, even for empty results.
- If `intent_summary` is empty but `assumptions` exist, show assumptions only.

---

### 5.10 Result count + sort bar

**Purpose:** Orient the user and let them reorder results.

**Structure:**
- Left: `"12 results for \"Remote AI automation roles…\""` in `text-sm text-slate-600`.
- Right: sort select (priority / recency) if implemented.

**Sort control:**
- Label `"Sort by"` + `<select>` or custom dropdown.
- Options: `"Relevance (priority)"`, `"Newest first"`, `"Oldest first"`.
- Styling: `bg-white`, `border-slate-200`, `rounded-lg`, `text-sm`.

**States:**
- Default select border `slate-200`, hover `slate-300`, focus `ring-indigo-500`.

---

### 5.11 Error state

**Purpose:** Turn failures into recoverable moments.

**Structure:**
- Full-width banner/card below the form.
- Icon: `AlertCircle` (`red-600`, 24×24).
- Title: friendly one-liner.
- Body: 1–2 sentences + action.
- Action: `"Try again"` button that resubmits the same query.

**Copy mapping:**
| Code | Title | Body | Action |
|------|-------|------|--------|
| `VALIDATION_ERROR` | "Check your search" | Use server message. | Focus input |
| `RATE_LIMITED` | "Too many searches" | "Please wait a minute before trying again." | Disabled retry with countdown |
| `BACKEND_ERROR` | "Search didn’t complete" | "The backend returned an error. Please try again." | Try again |
| `TIMEOUT_ERROR` | "Search timed out" | "This took too long. Try a shorter or more specific query." | Try again |
| `UNKNOWN_ERROR` / network | "Something went wrong" | "We couldn’t complete your search. Please check your connection and try again." | Try again |

**Styling:**
- `bg-red-50`, `border border-red-200`, `rounded-2xl`, `p-5`.
- Icon 24×24, `text-red-600`.
- Title `font-semibold text-slate-900`; body `text-sm text-slate-700`.

---

### 5.12 Empty-results state

**Purpose:** Guide the user when the backend returns `leads: []`.

**Structure:**
- Centered block with icon + text inside a soft container.
- Icon: `SearchX` or `Inbox` (`text-slate-400`, 48×48).
- Title: `"No matches found"`.
- Body: `"Try broadening your location, simplifying your request, or switching modes."`
- Quick suggestion chips (clickable auto-fill in MVP):
  - Jobs: `"Remote React jobs"`
  - Leads: `"SaaS fintech startups"`
  - Both: `"AI automation opportunities"`

**Styling:**
- `bg-white`, `border border-slate-200`, `rounded-2xl`, `p-8`, `text-center`.
- Title `font-semibold text-slate-900`; body `text-slate-600`.

---

### 5.13 Footer

**Purpose:** Build trust, disclose public-data sources, credit the stack, and link to About.

**Structure:**
- Appears at bottom of content.
- Three-part layout on desktop, stacked on mobile:
  - Left: Stryde wordmark (small, gradient text).
  - Center: `"Results are sourced from public web data via Firecrawl and Hunter."`
  - Right: `"Built with Next.js, shadcn/ui, and n8n"` + `"About"` link.

**Styling:**
- `bg-white/80 backdrop-blur-sm border-t border-slate-200/70`.
- `py-8`, `text-sm text-slate-500`.
- Links: `text-slate-600 hover:text-indigo-700 hover:underline`.

**Accessibility:**
- About link is a real link with visible focus ring.

---

## 6. Interaction states summary table

| Element | Default | Hover | Focus | Active | Disabled | Error |
|---------|---------|-------|-------|--------|----------|-------|
| CTA button | `bg-indigo-700 text-white shadow-md` | `bg-indigo-800 shadow-lg -translate-y-px` | `ring-2 ring-indigo-500 ring-offset-2` | `bg-indigo-900 translate-y-px shadow-sm` | `bg-indigo-400 cursor-not-allowed` | — |
| Header wordmark | gradient text | `opacity-80` | `ring-2 ring-indigo-500 ring-offset-2 rounded-md` | — | — | — |
| Mode option | `bg-transparent text-slate-600` | `bg-slate-200/50 text-slate-900` | `ring-2 ring-indigo-500 ring-offset-2` | white pill + mode color | `opacity-50` | — |
| Textarea | `border-slate-200 bg-white shadow-sm` | `border-slate-300` | `border-indigo-500 ring-2 ring-indigo-500` | — | `bg-slate-100 text-slate-500` | `border-red-500 ring-red-500` |
| Result card | `bg-white border-slate-200 shadow-sm` | `shadow-lg border-indigo-100 -translate-y-1` | `ring-2 ring-indigo-500 ring-offset-2` | — | — | — |
| Link | `text-indigo-600` | `text-indigo-700 underline` | `outline-2 outline-indigo-500 outline-offset-2` | — | `text-slate-400 no-underline` | — |
| Badge | per semantic table | slightly darker text | `ring-1 ring-current` | — | `opacity-60` | — |

---

## 7. Motion specifications

Use Tailwind transition utilities. Prefer `transform` and `opacity` for GPU-friendly animation. Respect `prefers-reduced-motion`.

| Interaction | Duration | Easing | Tailwind utility | Notes |
|-------------|----------|--------|------------------|-------|
| Button hover | 150ms | ease-out | `transition-all duration-150` | Lift + shadow + color |
| Button active | 100ms | ease-in | `active:translate-y-px active:duration-100` | Pressed state |
| Mode option hover/selection | 200ms | ease-out | `transition-all duration-200` | Background + color + pill slide |
| Input focus ring | 150ms | ease-out | `transition-shadow duration-150` | Ring appears |
| Result card hover | 200ms | ease-out | `transition-all duration-200` | Lift + shadow + border tint |
| Result list enter | 250ms | ease-out | `animate-in fade-in slide-in-from-bottom-2` (tailwindcss-animate) | Stagger optional: 50ms per card |
| Skeleton pulse | 2s | ease-in-out | `animate-pulse` | Built-in |
| Shimmer sweep | 1.5s | ease-in-out | Custom `animate-[shimmer_1.5s_infinite]` | Linear gradient sweep |
| Spinner | 1s | linear | `animate-spin` | Built-in |
| Placeholder cross-fade | 150ms | ease-in-out | `transition-opacity duration-150` | When mode changes |
| Hero compact | 250ms | ease-out | `transition-all duration-250` | Padding + tagline opacity |

**Reduced motion:**
- Wrap shimmer/pulse/list-enter in `motion-safe:` or use `@media (prefers-reduced-motion: reduce)` to disable transforms and opacity transitions.

---

## 8. User flows

### Flow 1: First visit → submit → results
1. User lands on `/`.
2. Sticky header with Stryde wordmark is visible.
3. Hero shows gradient "Stryde" title, tagline, mode selector, and search input.
4. User reads placeholder, selects mode if needed, types query.
5. Character counter updates; submit enables once ≥ 10 chars.
6. User clicks "Search" (or presses `Ctrl/Cmd + Enter`).
7. Button switches to loading state; progress card + 3 skeleton cards appear.
8. Request returns `200`; context card (intent_summary, assumptions) renders.
9. Result cards render below context card; hero compacts.
10. User scrolls, clicks source links (new tab), clicks email/LinkedIn.

### Flow 2: Submit → validation error
1. User types < 10 characters or leaves field empty.
2. Clicks "Search".
3. Client validation blocks submit; textarea shows error state + hint.
4. Focus remains in textarea.

### Flow 3: Submit → backend error
1. User submits valid query.
2. Loading state appears.
3. API returns `502`, `504`, `429`, or network error.
4. Loading state replaced by error card with mapped copy.
5. "Try again" button resubmits; client auto-retries once on network/5xx per `ARCHITECTURE.md`.

### Flow 4: Submit → empty results
1. User submits valid query.
2. Loading state appears.
3. API returns `200` with `leads: []`.
4. Context card still renders if intent_summary/assumptions present.
5. Empty-results block renders with refinement tips and clickable suggestion chips.

### Flow 5: Submit → partial failure
1. User submits valid query.
2. API returns `200` with results and non-empty `notes` warning.
3. Context card renders; `notes` displayed as warning banner.
4. Available results render normally.

### Flow 6: Visit About page
1. User clicks About in header or footer.
2. Navigates to `/about`.
3. Lightweight page explains the demo, data sources, no-accounts policy, and stack credits.
4. Link back to `/`.

---

## 9. Responsive rules

| Viewport | Layout adjustments |
|----------|--------------------|
| 320–639px | Header: wordmark left, About right. Hero full-width, `text-4xl` headline. Mode selector horizontal scroll if needed. Textarea full width. Button full width. Cards full width with `p-5`. Footer stacked and centered. |
| 640–1023px | Hero centered, `text-4xl`. Mode selector horizontal row. Button auto-width. Footer side-by-side or stacked depending on content. |
| 1024px+ | Hero `text-5xl`, max-width centered. Results container `max-w-4xl`. Generous vertical whitespace. Footer three-column layout. |
| 1440px+ | Same as 1024px; do not widen text lines beyond `max-w-prose` for readability. |

### Touch targets
- All buttons and tappable badges minimum 44×44 px.
- Mode selector options minimum 44px height.
- Textarea padding `p-3.5` minimum.
- External-link icon button 40×40 px.

---

## 10. Accessibility notes (WCAG 2.1 AA targets)

### Contrast
- `text-slate-900` on `white`: ~15.3:1 — passes AA/AAA.
- `text-slate-600` on `white`: ~6.0:1 — passes AA.
- `text-white` on `indigo-700` (#4338CA): ~5.6:1 — passes AA for normal text.
- `text-indigo-600` (#4F46E5) on `white`: ~7.2:1 — passes AA.
- All semantic badge text/background pairs use 50/700 combinations (≥4.5:1).
- Verify gradient text only on decorative headline, never on body text.

### Keyboard navigation
- Tab order: Header wordmark → About → Mode selector → textarea → submit button → results region.
- Mode selector options are individually focusable buttons; arrow-key navigation is a nice-to-have.
- Result cards themselves are not focusable unless they contain interactive children.
- Source link, email link, LinkedIn link are focusable and show visible focus rings.

### Focus indicators
- All interactive elements use a 2px `ring-indigo-500 ring-offset-2` focus style.
- Error textarea uses `ring-red-500`.
- Do not rely on browser default outlines.

### Screen readers
- Mode selector: `<fieldset>` + `<legend>`; `aria-pressed` on each button.
- Textarea: associated `<label>`, `aria-describedby` pointing to counter + validation, `aria-invalid` when invalid.
- Loading region: `aria-live="polite"` with `aria-busy="true"` while loading.
- Results region: `aria-live="polite"`, labelled "Search results".
- Error card: `role="alert"` or `aria-live="assertive"`.
- Empty results: heading + paragraph, no decorative-only icons without `aria-hidden`.

### Motion
- Respect `prefers-reduced-motion`: disable shimmer/pulse/list-enter animations when active.

---

## 11. Light / dark mode

**Ship light mode only for the MVP.**

Reasoning:
- No user accounts or persistent preferences; dark mode would require a full contrast recheck across every badge, gradient, and state.
- The indigo/slate palette photographs well for a portfolio demo in light mode.
- Dark mode is a low-effort post-MVP polish item once the core UI is validated.

---

## 12. Screen map

### 12.1 Landing / search page (`/`)

The application is effectively a single-page app with five states rendered on `/`.

#### State A — Empty (first visit)
- Sticky header with Stryde wordmark + About link.
- Full hero with gradient "Stryde" title, tagline, mode selector, empty textarea, CTA.
- Footer.

#### State B — Loading
- Same header + compact hero.
- Submit button in loading state.
- Progress card with shimmer bar + cycling status text.
- 3 skeleton result cards.
- Footer.

#### State C — Results
- Header + compact hero (`py-8`).
- Context card: intent_summary, assumptions, notes (if any).
- Result count + optional sort bar.
- Result cards stack.
- Footer.

#### State D — Error
- Header + hero.
- Error card with icon, title, body, and "Try again" button.
- Footer.

#### State E — Empty results
- Header + hero.
- Context card if backend returned context.
- Empty-results block with icon + tips + suggestion chips.
- Footer.

### 12.2 About page (`/about`)

- Same sticky header.
- Centered content column (`max-w-2xl`).
- Sections:
  - "What is Stryde?"
  - "How it works" (query → n8n → Firecrawl + Hunter → results).
  - "Data & privacy" (public data, attribution, no accounts, no storage).
  - "Stack credits" (Next.js, shadcn/ui, n8n, Vercel, Tailwind).
- Link back to `/`.
- Same footer.

---

## 13. Copy/content quick reference

### Header
- Wordmark: `"Stryde"`
- Nav: `"About"`

### Hero
- Eyebrow: `"JOBS & LEADS SEARCH"`
- Title: `"Stryde"`
- Tagline: `"Type what you want. Find your next role or prospect in seconds."`
- Sub-tagline: `"One search. Curated jobs, sales leads, and verified contacts."`

### Mode selector labels
- `"Jobs"`, `"Leads"`, `"Both"`

### Placeholders
- Jobs: `"Senior React engineer roles in Berlin, remote-first…"`
- Leads: `"SaaS fintech startups in Europe hiring sales reps…"`
- Both: `"n8n workflow automation opportunities in Berlin…"`

### Button
- Idle: `"Search with Stryde"` (or `"Search"`)
- Loading: `"Searching…"`

### Validation hints
- Too short: `"Please enter at least 10 characters."`
- Too long: `"Please keep your request under 1000 characters."`
- Missing mode: `"Please select a search mode."` (should be impossible in UI).

### Loading messages
- `"Searching across sources…"`
- `"Curating results…"`
- `"Still searching, this can take a moment."`

### Empty results
- Title: `"No matches found"`
- Body: `"Try broadening your location, simplifying your request, or switching modes."`
- Chips: `"Remote React jobs"`, `"SaaS fintech startups"`, `"AI automation opportunities"`

### Footer
- `"Results are sourced from public web data via Firecrawl and Hunter."`
- `"Built with Next.js, shadcn/ui, and n8n"`
- `"About"`

### About page
- "Stryde is a portfolio demo that turns a plain-English request into curated job postings or sales leads."
- "Your query is sent to a self-hosted n8n workflow that uses Firecrawl for web search and Hunter for contact verification."
- "No account is required. We do not store your queries or results on our servers."

---

## 14. Open questions for stakeholder / developer before build

1. **Wordmark icon:** Should the header include a simple CSS-only "S" mark before the wordmark, or is text-only preferred?
2. **CTA copy:** Should the button say `"Search with Stryde"` (stronger brand) or `"Search"` (shorter)?
3. **Result `type` values:** The API contract assumes `job` / `client` / `both`. Can the stakeholder confirm the exact strings returned by the existing n8n workflow? Map unknown values generically.
4. **Suggestion chips:** Should empty-state chips auto-fill the textarea on click, or remain static tips?
5. **Sort control:** Is priority/recency sorting required for the demo? The PRD marks it as "Should have."
6. **Mock data indicator:** Should the design include a visible "demo data" badge when local mock responses are active (per PROJECT-CONTEXT design decision #23)?

---

## 15. Change log

| Version | Date | Author | Change |
|---------|------|--------|--------|
| 0.1 | 2026-10-20 | UI/UX Designer subagent | Initial G4 design specification. |
| 0.2 | 2026-10-20 | UI/UX Designer subagent | Brand refresh: Stryde wordmark, indigo/violet brand palette, textured gradient background, premium result cards, micro-interactions, sticky header, and About page. |
