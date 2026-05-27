# Direction 3 — Test script (pace / weight / intense + breath)

Use in **vela-dir3** (`npm run dev`, usually http://localhost:3000 or 3001).

Send **one User line at a time**. Wait for Vela’s reply (and breath overlay if noted) before the next line.

---

## Phase A — Normal chat (`none`, no breath)

**User 1**  
`I went through some old photos today. Mostly holidays.`

*Expected: `none` · no signal bar · no breath*

**User 2**  
`There is one of him laughing in the kitchen. I almost smiled.`

*Expected: `none` or `weight_signal` (either ok) · breath only if META sets triggerBreath*

---

## Phase B — Pace signal (`pace_signal` + breath likely)

**User 3**  
`I don't know.`

*Expected: `pace_signal` · bar: **pace signal**

**User 4**  
`Hard to say.`

*Expected: `pace_signal` · may trigger breath if model sets triggerBreath*

**User 5**  
`Can we just pause for a moment?`

*Expected: `pace_signal` · **breath space** opens (light halo, ~30s, no tap to skip) · auto returns to chat*

*After breath ends: chat shows a **breath session** bubble + return line; sidebar gets a **session summary** prefixed with "Breath pause ·". Older summaries: swipe left to delete.*

---

## Phase C — Weight signal (`weight_signal`)

**User 6**  
`The anniversary is next week. I keep thinking about the hospital room.`

*Expected: `weight_signal` · bar: **weight signal** · breath optional*

**User 7**  
`Everyone else seems to have moved on.`

*Expected: `weight_signal` or `none`*

---

## Phase D — Intense signal (`intense_signal` + breath)

**User 8**  
`I can't do this. It's too much. I feel like I'm falling apart.`

*Expected: `intense_signal` · bar: **intense signal** · **breath overlay** should open*

*Wait for breath to finish on its own (~30s) → another session summary in sidebar (most recent on top).*

---

## Phase E — Explicit pause request

**User 9**  
`I need to breathe. Just stop for a second.`

*Expected: `pace_signal` + **breath overlay***

---

## Quick reference

| Step | Trigger | Signal bar | Breath overlay | Sidebar |
|------|---------|------------|----------------|---------|
| 1–2 | Everyday talk | none | no | — |
| 3–5 | Short / pause | pace_signal | often yes | summary after breath |
| 6–7 | Heavy memory | weight_signal | maybe | — |
| 8 | Overwhelm | intense_signal | yes | summary after breath |
| 9 | Ask to breathe | pace_signal | yes | — |

---

## UI checks (sidebar)

1. **Aurora** behind “Vela” should **move** (rose/sage glow).
2. Glow should reach **“moving at your pace”** and the **thin gradient line** below it.
3. **Session summaries** list after at least one completed breath.
4. **Most recent** summary: tap to expand (no swipe delete).
5. **Older** summaries: **swipe left** → red trash → delete.

---

## Breath space behavior

- **Enter:** stays **dark**; colorful halos fade in and drift slowly (~2.6s).
- **Hold:** ~26s with "breathe in" / "breathe out" cues; **cannot tap to skip**.
- **Exit:** halos fade, background returns to dark (~2.4s), then chat resumes.
- **History:** a breath session line appears in the thread; sidebar summary includes `Breath pause ·`.

## If breath does not appear

- Confirm API returns `triggerBreath: true` in network tab (POST `/api/chat`).
- Try shorter, clearer lines for steps 5, 8, or 9.
- Refresh the page and run step 8 alone if needed.

## If signals do not show

Signal bar appears under **your** message (user bubble), not Vela’s.
