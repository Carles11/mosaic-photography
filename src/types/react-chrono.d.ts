declare module "react-chrono" {
  import * as React from "react";
  export interface TimelineItemModel {
    title?: string;
    cardTitle?: string;
    cardSubtitle?: string;
    cardDetailedText?: string;
    media?: { type: string; source: { url: string } };
    timelineContent?: React.ReactNode;
    [key: string]: unknown;
  }
  export interface ChronoProps {
    items: TimelineItemModel[];
    mode?: "HORIZONTAL" | "VERTICAL" | "VERTICAL_ALTERNATING";
    theme?: unknown;
    [key: string]: unknown;
  }
  export const Chrono: React.FC<ChronoProps>;
}
