export type ColorMode = "dark" | "light";

/**
 * All color values are expressed as raw HSL triplets (e.g. "224 71% 4%")
 * so they can be consumed by Tailwind's `hsl(var(--token) / <alpha>)` syntax.
 */
export interface ThemePalette {
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  muted: string;
  mutedForeground: string;
  border: string;
  destructive: string;
  destructiveForeground: string;
  glow: string;
}

export interface ThemeGradients {
  mesh: string;
  primary: string;
  aurora: string;
}

export interface ThemeTokens {
  radius: number;
  blur: number;
  glowOpacity: number;
  glowSize: number;
  glass: boolean;
  motion: boolean;
}

export interface ThemePreset {
  id: string;
  name: string;
  tagline: string;
  description: string;
  mode: ColorMode;
  vibe: string;
  symbol: string;
  palette: ThemePalette;
  gradients: ThemeGradients;
  tokens: ThemeTokens;
}

export type ThemeOverrides = Partial<{
  palette: Partial<ThemePalette>;
  tokens: Partial<ThemeTokens>;
  gradients: Partial<ThemeGradients>;
}>;
