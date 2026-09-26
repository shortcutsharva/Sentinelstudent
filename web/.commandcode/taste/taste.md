# Taste

## Design & UI
- For web/UI design, prefers **light themes with vibrant but professional** color (e.g. soft tinted canvas + royal blue / violet / teal accents used with restraint). Explicitly rejects "AI-generic" looks: dark glassmorphism, glass-on-black, neon gradients, excessive glow orbs. (Note: an initial brief asked for dark glassmorphism, but the user overrode it with this direction — the light/vibrant preference wins.) Confidence: 0.9
- Expects prototypes to look like a genuine, polished SaaS product — not an academic slide deck. Copy should be minimal, scannable, and high-impact; layout polish and clear visual hierarchy matter. Confidence: 0.85
- Likes modern sans-serif typography (Inter / Plus Jakarta Sans), high contrast, punchy text; micro-interactions and smooth hover states are welcome but should respect `prefers-reduced-motion`. Confidence: 0.7

## Workflow & Communication
- Writes detailed, structured briefs (role, objectives, design system, page architecture, execution constraints) with exact copy strings — execute the spec faithfully and keep the provided wording. Confidence: 0.75

## Tooling
- Environment gotcha (Windows dev box): `NODE_ENV=production` is set in the shell, so npm silently skips devDependencies and the toolchain (vite, typescript, @types/*) disappears from node_modules. Use `npm install --include=dev` to restore; if builds fail on missing vite/@types, this is the cause. Confidence: 0.8
