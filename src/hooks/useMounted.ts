"use client";

import { useEffect, useState } from "react";

/** Returns `true` after the first client-side render. Useful for skipping
 * SSR-incompatible UI (e.g. accessing localStorage or `window`). */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
