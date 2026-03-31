# Caseflow Design System Core Elements

This document outlines the core visual tokens and structural elements of the Caseflow platform. Use these as a reference to sustain the project's consistent UI while experimenting with new designs.

## 1. Typography
The system uses a modern sans-serif for content and a fixed-width font for technical clinical data.

- **Primary Font (Sans):** `DM Sans` (Google Fonts)
  - Stack: `var(--font-sans)` ('DM Sans', system-ui, -apple-system, sans-serif)
  - Purpose: Headings, navigation, body text.
- **Technical Font (Mono):** `DM Mono`
  - Stack: `var(--font-mono)` ('DM Mono', 'Fira Code', monospace)
  - Purpose: Simulation logs, vital signs, technical data displays.

## 2. Color Palette
The brand identity is "Clinical Modern" with "Gamified Engagement". 

| Category | Token | Hex Value | Description |
| :--- | :--- | :--- | :--- |
| **Surface (Page)** | `--surface-page` | `#FAFAF9` | Off-white (Stone-50) background |
| **Surface (Card)** | `--surface-card` | `#FFFFFF` | Primary container background |
| **Brand (Teal)** | `--brand` | `#0D9488` | Active states, primary buttons, branding |
| **Reward (Amber)** | `--reward` | `#F59E0B` | XP gains, streaks, achievements |
| **Success (Green)** | `--success` | `#10B981` | Positive clinical outcomes |
| **Danger (Red)** | `--danger` | `#EF4444` | Errors, critical patient states |
| **Text (Primary)** | `--text-primary`| `#111827` | Headings and high-emphasis body text |
| **Text (Secondary)**| `--text-secondary`| `#6B7280` | Muted descriptions and metadata |

## 3. Structural Elements
- **Border Radius:** Standardized for hierarchy.
  - `xl (16px)`: Major layout blocks.
  - `lg (12px)`: Primary cards and containers.
  - `md (8px)`: Buttons, inputs, small components.
- **Shadows:** Soft and subtle.
  - `card`: `0 1px 3px rgba(0,0,0,0.08)` (Subtle elevation).
  - `hover`: Deepened shadow for interactive hover states.
- **Borders:** Focused on low visual noise.
  - `--border-default`: Light grain (`#E5E7EB`).
  - `--border-brand`: Accent border used for focus states (`#5EEAD4`).

## 4. Interaction & Motion
- **Transitions:** Standard 180ms ease for state changes.
- **Key Animations:**
  - `xp-shimmer`: Shimmer effect for gaining experience points.
  - `streak-pop`: Scale-up effect for streak milestones.
  - `pulse-brand`: Subtle breathing animation for interactive clinical points.

## 5. UI Architecture Patterns
- **The Case Card:** Simple, data-rich cards with high padding and status-color borders.
- **Simulation Dashboard:** Dynamic side-panel layout with modular "Vitals" and "History" widgets.
- **Gamification HUD:** Overlay-style widgets (Top Bar) showing XP, streaks, and current level with high-contrast icons.
