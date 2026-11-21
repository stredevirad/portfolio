# ADR-005: CSS custom properties + plain CSS (no Tailwind)

- Status: accepted · 2026-11-21

## Decision
Design tokens live in `src/styles/tokens.css` (CSS variables; themed via `[data-theme]`) and are mirrored for JS in
`src/design/tokens.ts` (motion tokens, breakpoints). Components use plain CSS files with BEM-ish class names.

## Why
Zero runtime, no build plugin, tokens are the single styling API, themes swap by changing variables (including the
secret accent theme at runtime). Tailwind would add a second vocabulary on top of the tokens.
