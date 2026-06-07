"use client";

import { useState, useCallback } from "react";

export function useOverlayToggle() {
  const [overlaysVisible, setOverlaysVisible] = useState(true);

  const onSlideContainerClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    const interactive = target.closest(
      "a, button, [role='button'], input, textarea, select, label, svg, path",
    );
    if (interactive) return;

    setOverlaysVisible((v) => !v);
  }, []);

  const resetOverlays = useCallback(() => {
    setOverlaysVisible(true);
  }, []);

  return { overlaysVisible, onSlideContainerClick, resetOverlays };
}
