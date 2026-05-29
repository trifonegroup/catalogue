# Design Inspiration Skill

## Purpose
Before creating or modifying any UI component, screen, or visual element, load and study the visual references stored in `.claude/skills/design-inspiration-refs/`. These images define the target look and feel. Every design decision should be reconciled against them.

## Trigger
Invoke this skill whenever:
- A new UI component, screen, or layout is being built
- An existing design is being modified or restyled
- Color, typography, spacing, or visual hierarchy decisions need to be made
- The user asks about the design direction or aesthetic

## Step-by-step

1. **Load all reference files** in `.claude/skills/design-inspiration-refs/` using the Read tool. This directory may contain:
   - Screenshots (`.png`, `.jpg`, `.webp`)
   - Annotated mockups
   - A `notes.md` file with written design intent
   - Sub-folders organized by component or theme

2. **Extract the visual language** from the references:
   - Color palette — primary, secondary, accent, background, surface, text colors
   - Typography — font families, weights, sizes, line heights, letter spacing
   - Spacing & layout — grid, padding/margin rhythm, container widths
   - Shape & radius — border radius style (sharp, soft, pill)
   - Elevation — shadow style and depth (flat, subtle, deep)
   - Iconography — style (outline, filled, duotone, etc.)
   - Motion hints — any transitions or interaction patterns visible

3. **Summarize what you see** in 3–5 bullets before touching code, so the user can confirm alignment.

4. **Apply the language** faithfully when writing or editing styles, components, and layouts. When in doubt, match the references over generic conventions.

5. **Call out deviations** explicitly. If a requirement forces a departure from the reference aesthetic, flag it to the user before implementing.

## Reference directory
`.claude/skills/design-inspiration-refs/`

Drop any number of image files or a `notes.md` into that folder. Subdirectories are fine — Claude will walk the whole tree.

## What to avoid
- Generic Material Design or Tailwind defaults that don't match the references
- Inventing colors or type scales not grounded in the reference images
- Skipping the reference check because "it's a small change" — small changes drift the aesthetic fastest
