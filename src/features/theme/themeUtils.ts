import type { ThemePalette, ThemePreset, ThemeTokens } from "./types";

export function buildCssVariables(
  palette: ThemePalette,
  tokens: ThemeTokens,
  gradients: ThemePreset["gradients"],
): Record<string, string> {
  return {
    "--background": palette.background,
    "--foreground": palette.foreground,
    "--card": palette.card,
    "--card-foreground": palette.cardForeground,
    "--popover": palette.popover,
    "--popover-foreground": palette.popoverForeground,
    "--primary": palette.primary,
    "--primary-foreground": palette.primaryForeground,
    "--secondary": palette.secondary,
    "--secondary-foreground": palette.secondaryForeground,
    "--accent": palette.accent,
    "--accent-foreground": palette.accentForeground,
    "--muted": palette.muted,
    "--muted-foreground": palette.mutedForeground,
    "--border": palette.border,
    "--destructive": palette.destructive,
    "--destructive-foreground": palette.destructiveForeground,
    "--glow": palette.glow,
    "--radius": `${tokens.radius}px`,
    "--blur": `${tokens.blur}px`,
    "--glow-opacity": tokens.glowOpacity.toString(),
    "--glow-size": `${tokens.glowSize}px`,
    "--gradient-mesh": gradients.mesh,
    "--gradient-primary": gradients.primary,
    "--gradient-aurora": gradients.aurora,
  };
}

export function applyCssVariables(
  element: HTMLElement,
  vars: Record<string, string>,
) {
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}

export function hslVar(triplet: string, alpha?: number): string {
  return alpha === undefined
    ? `hsl(${triplet})`
    : `hsl(${triplet} / ${alpha})`;
}

export function mergePreset(
  base: ThemePreset,
  overrides?: {
    palette?: Partial<ThemePalette>;
    tokens?: Partial<ThemeTokens>;
    gradients?: Partial<ThemePreset["gradients"]>;
  },
): ThemePreset {
  if (!overrides) return base;
  return {
    ...base,
    palette: { ...base.palette, ...(overrides.palette ?? {}) },
    tokens: { ...base.tokens, ...(overrides.tokens ?? {}) },
    gradients: { ...base.gradients, ...(overrides.gradients ?? {}) },
  };
}

export function hslTripletToHex(triplet: string): string {
  const [hStr, sStr, lStr] = triplet.trim().split(/\s+/);
  const h = parseFloat(hStr ?? "0");
  const s = parseFloat(sStr ?? "0") / 100;
  const l = parseFloat(lStr ?? "0") / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hPrime = h / 60;
  const x = c * (1 - Math.abs((hPrime % 2) - 1));
  let r1 = 0;
  let g1 = 0;
  let b1 = 0;
  if (hPrime >= 0 && hPrime < 1) [r1, g1, b1] = [c, x, 0];
  else if (hPrime < 2) [r1, g1, b1] = [x, c, 0];
  else if (hPrime < 3) [r1, g1, b1] = [0, c, x];
  else if (hPrime < 4) [r1, g1, b1] = [0, x, c];
  else if (hPrime < 5) [r1, g1, b1] = [x, 0, c];
  else if (hPrime < 6) [r1, g1, b1] = [c, 0, x];
  const m = l - c / 2;
  const r = Math.round((r1 + m) * 255);
  const g = Math.round((g1 + m) * 255);
  const b = Math.round((b1 + m) * 255);
  return `#${[r, g, b]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

export function hexToHslTriplet(hex: string): string {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length !== 6) return "0 0% 0%";
  const r = parseInt(normalized.slice(0, 2), 16) / 255;
  const g = parseInt(normalized.slice(2, 4), 16) / 255;
  const b = parseInt(normalized.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h *= 60;
  }
  return `${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}
