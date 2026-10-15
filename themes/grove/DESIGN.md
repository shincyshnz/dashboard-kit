---
# Tenant theme. Only values that differ from the root DESIGN.md are listed;
# everything else is inherited. Activate with <html data-theme="grove">.

meta:
  name: Grove
  version: 1.0.0
  description: Example tenant theme. Forest green, tighter corners, denser layout.

radius: 0.375rem

density:
  spacing: 0.23rem

colors:
  light:
    background: oklch(0.985 0.004 140)
    card: oklch(1 0 0)
    primary: oklch(0.44 0.1 150)
    primary-foreground: oklch(0.98 0.01 150)
    secondary: oklch(0.95 0.012 140)
    accent: oklch(0.94 0.03 135)
    accent-foreground: oklch(0.28 0.05 150)
    ring: oklch(0.52 0.1 150)
    chart-1: oklch(0.48 0.1 150)
    chart-2: oklch(0.72 0.13 95)
    chart-3: oklch(0.58 0.08 200)
    sidebar: oklch(0.27 0.04 155)
    sidebar-foreground: oklch(0.93 0.015 140)
    sidebar-primary: oklch(0.8 0.13 130)
    sidebar-primary-foreground: oklch(0.22 0.04 150)
    sidebar-accent: oklch(0.34 0.05 155)
    sidebar-accent-foreground: oklch(0.97 0.01 140)
    sidebar-border: oklch(0.34 0.04 155)
    sidebar-ring: oklch(0.8 0.13 130)
  dark:
    background: oklch(0.17 0.015 155)
    card: oklch(0.21 0.018 155)
    popover: oklch(0.21 0.018 155)
    primary: oklch(0.76 0.13 140)
    primary-foreground: oklch(0.2 0.04 150)
    accent: oklch(0.29 0.035 150)
    ring: oklch(0.68 0.11 145)
    chart-1: oklch(0.76 0.13 140)
    chart-2: oklch(0.8 0.13 95)
    chart-3: oklch(0.7 0.08 200)
    sidebar: oklch(0.2 0.02 155)
    sidebar-primary: oklch(0.76 0.13 140)
    sidebar-primary-foreground: oklch(0.2 0.04 150)
    sidebar-accent: oklch(0.27 0.03 150)
    sidebar-ring: oklch(0.68 0.11 145)
---

# Grove theme

An example tenant theme showing how little a tenant needs to declare:
a green palette, a dark sidebar in light mode, smaller corners and a
slightly denser layout. Everything else comes from the root `DESIGN.md`.

## Changelog

- **1.0.0** — Initial example theme.
