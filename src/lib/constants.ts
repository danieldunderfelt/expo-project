import designTokens from '~/lib/designTokens.ts'

export const NAV_THEME = {
  light: {
    background: 'hsl(0 0% 100%)', // background
    border: 'hsl(240 5.9% 90%)', // border
    card: 'hsl(0 0% 100%)', // card
    notification: 'hsl(0 84.2% 60.2%)', // destructive
    primary: 'hsl(240 5.9% 10%)', // primary
    text: 'hsl(240 10% 3.9%)', // foreground
  },
  dark: {
    background: designTokens.background,
    border: designTokens.border,
    card: designTokens.card,
    notification: designTokens.destructive,
    primary: designTokens.primary,
    text: designTokens.foreground,
  },
}
