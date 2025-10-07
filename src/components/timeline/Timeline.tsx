"use client";

import { Chrono } from "react-chrono";
import type { TimelineProps } from "@/types/components";
import useIsMobile from "@/hooks/useIsMobile";
import { getCssVar } from "@/helpers/colors";

const Timeline: React.FC<TimelineProps> = ({
  events,
  width = "100%",
  height = "auto",
}) => {
  const isMobile = useIsMobile();

  return (
    <div style={{ width, height }}>
      <Chrono
        disableToolbar={true}
        items={events}
        mode={"HORIZONTAL"}
        semanticTags={{
          title: "h1",
          cardTitle: "h2",
          cardDetailedText: "p",
        }}
        itemWidth={isMobile ? 85 : 150}
        theme={{
          primary: "var(--accent-color)",
          secondary: "var(--foreground)",
          cardBgColor: getCssVar("--card-background", "#2d2d2d"),
          cardDetailsBackGround: "transparent",
          cardDetailsColor: "var(--text-color)",
          cardSubtitleColor: "var(--text-color)",
          cardTitleColor: "var(--text-color)",
          detailsColor: "var(--text-color)",
          textColor: "var(--text-color)",
          titleColor: "var(--text-color)",
        }}
        slideShow
        slideItemDuration={3000}
        showProgressOnSlideshow={true}
        showOverallSlideshowProgress={true}
        contentDetailsHeight={100}
        highlightCardsOnHover={true}
        fontSizes={{
          title: "1.5rem",
          cardTitle: "1.25rem",
          cardSubtitle: "1rem",
        }}
        scrollable={true}
        timelinePointShape="square"
      />
    </div>
  );
};

export default Timeline;
