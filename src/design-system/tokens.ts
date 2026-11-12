/**
 * NepalAI Design System - Design Tokens
 * 
 * Domain-specific tokens for NepalAI.tech sovereign AI platform:
 * - Deep navy, slate, ivory, restrained emerald (Nepal flag blue/green heritage) and restrained gold/bronze.
 * - Anti-AI slop: zero garish candy pills, human typographic scale, hairline dividers.
 * - WCAG AA compliant contrast ratios across dark and light modes.
 */

export const tokens = {
  colors: {
    // Brand Core: Deep Navy & Sovereign Night
    navy: {
      950: '#04060a',
      900: '#06080e', // Primary Dark background
      850: '#0a0d17',
      800: '#0f1422', // Dark Surface (cards, panels)
      700: '#171f33', // Dark Elevated (hover, elevated modals)
      600: '#232d47',
    },
    // Light Canvas: Warm Slate & Crisp Ivory
    canvas: {
      light: '#f8fafc', // Primary Light background
      lightSurface: '#ffffff', // Light Card surface
      lightSubtle: '#f1f5f9',
      lightBorder: '#e2e8f0',
      lightBorderHover: '#cbd5e1',
    },
    // Accent: Restrained Emerald & Forest
    emerald: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399', // Dark mode accent
      500: '#10b981', // Brand primary accent
      600: '#059669', // Light mode accessible accent
      700: '#047857',
      800: '#065f46',
      900: '#064e3b',
      950: '#022c22',
    },
    // Restrained Gold / Bronze (Sovereign Authority & Verified NRB markers)
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f',
    },
    // Semantic States
    state: {
      info: {
        light: '#0284c7',
        lightBg: '#f0f9ff',
        dark: '#38bdf8',
        darkBg: 'rgba(14, 165, 233, 0.1)',
      },
      success: {
        light: '#16a34a',
        lightBg: '#f0fdf4',
        dark: '#4ade80',
        darkBg: 'rgba(34, 197, 94, 0.1)',
      },
      warning: {
        light: '#d97706',
        lightBg: '#fffbeb',
        dark: '#fbbf24',
        darkBg: 'rgba(245, 158, 11, 0.1)',
      },
      error: {
        light: '#dc2626',
        lightBg: '#fef2f2',
        dark: '#f87171',
        darkBg: 'rgba(239, 68, 68, 0.1)',
      },
    },
    // Hairline Dividers
    hairline: {
      dark: 'rgba(255, 255, 255, 0.08)',
      darkStrong: 'rgba(255, 255, 255, 0.15)',
      light: 'rgba(15, 23, 42, 0.08)',
      lightStrong: 'rgba(15, 23, 42, 0.14)',
    },
  },

  typography: {
    fonts: {
      sans: "'Plus Jakarta Sans', 'Instrument Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      display: "'Plus Jakarta Sans', 'Outfit', -apple-system, BlinkMacSystemFont, sans-serif",
      serif: "'Instrument Serif', Georgia, Cambria, 'Times New Roman', serif",
      devanagari: "'Mukta', 'Noto Sans Devanagari', -apple-system, sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', Menlo, Consolas, monospace",
    },
    tracking: {
      tighter: '-0.035em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    },
    lineHeight: {
      tight: '1.15',
      snug: '1.25',
      normal: '1.5',
      relaxed: '1.65',
      devanagari: '1.75', // Accommodates Devanagari ascenders and descenders (matras)
    },
  },

  radii: {
    none: '0px',
    xs: '4px',
    sm: '6px',
    md: '8px',
    lg: '12px',
    xl: '16px',
    full: '9999px',
  },

  shadows: {
    subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    cardLight: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
    cardHoverLight: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.07)',
    cardDark: '0 0 0 1px rgba(255, 255, 255, 0.07)',
    cardHoverDark: '0 0 0 1px rgba(52, 211, 153, 0.25), 0 8px 24px -4px rgba(0, 0, 0, 0.4)',
    modal: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 8px 10px -6px rgba(0, 0, 0, 0.25)',
  },

  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: '300ms cubic-bezier(0.16, 1, 0.3, 1)',
  },

  zIndices: {
    base: 0,
    dropdown: 20,
    sticky: 30,
    modalBackdrop: 40,
    modal: 50,
    tooltip: 60,
    toast: 70,
  },
} as const;

export type ThemeVariant = 'light' | 'dark';
