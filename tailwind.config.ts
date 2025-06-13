// @ts-expect-error This file does not have type definitions.
import nativewindPreset from 'nativewind/preset'
import { hairlineWidth } from 'nativewind/theme'
import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'
import designTokens from './src/lib/designTokens'

export default {
  darkMode: 'class',
  content: ['./src/**/*.{js,ts,tsx,css}'],
  presets: [nativewindPreset],
  theme: {
    extend: {
      colors: {
        border: designTokens.border,
        input: designTokens.input,
        ring: designTokens.ring,
        background: designTokens.background,
        foreground: designTokens.foreground,
        primary: {
          DEFAULT: designTokens.primary,
          foreground: designTokens.primaryForeground,
        },
        secondary: {
          DEFAULT: designTokens.secondary,
          foreground: designTokens.secondaryForeground,
        },
        destructive: {
          DEFAULT: designTokens.destructive,
          foreground: designTokens.destructiveForeground,
        },
        muted: {
          DEFAULT: designTokens.muted,
          foreground: designTokens.mutedForeground,
        },
        accent: {
          DEFAULT: designTokens.accent,
          foreground: designTokens.accentForeground,
        },
        popover: {
          DEFAULT: designTokens.popover,
          foreground: designTokens.popoverForeground,
        },
        card: {
          DEFAULT: designTokens.card,
          foreground: designTokens.cardForeground,
        },
      },
      borderWidth: {
        hairline: hairlineWidth(),
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config
