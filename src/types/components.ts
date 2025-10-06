type TimelineOrientation = "HORIZONTAL" | "VERTICAL" | "VERTICAL_ALTERNATING";

export interface TimelineItemModelProps {
  title?: string;

  cardTitle?: string;
  cardSubtitle?: string;
  cardDetailedText?: string;
  eventType: "personal" | "historical";
  media?: { type: string; source: { url: string }; name?: string };
  timelineContent?: React.ReactNode;
  [key: string]: unknown;
}

export interface ChronoProps {
  items: TimelineItemModelProps[];
  mode?: TimelineOrientation;
  theme?: unknown;
  [key: string]: unknown;
}

export interface TimelineProps {
  events: TimelineItemModelProps[];
  orientation?: TimelineOrientation;
  width?: string | number;
  height?: string | number;
  // You can add more props like theme, etc.
}
