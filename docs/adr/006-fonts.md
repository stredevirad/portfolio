# ADR-006: Self-hosted variable fonts (SIL OFL 1.1)

- Status: accepted · 2026-11-21

| Role | Family | Axes | License | Source |
|---|---|---|---|---|
| Display | Bricolage Grotesque Variable | wght 200–800, wdth 75–100, opsz 12–96 | SIL OFL 1.1 | `@fontsource-variable/bricolage-grotesque` (Google Fonts) |
| Text (grotesk) | Instrument Sans Variable | wght 400–700, wdth 75–100 | SIL OFL 1.1 | `@fontsource-variable/instrument-sans` |
| Mono | JetBrains Mono Variable | wght 100–800 | SIL OFL 1.1 | `@fontsource-variable/jetbrains-mono` |

Latin subset WOFF2 files are copied to `public/fonts/` with their OFL license texts. The display face is preloaded.
The display face's weight axis is animated by scroll velocity (variable-font weight shift).
