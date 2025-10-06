"use client";

import { Chrono } from "react-chrono";
import type { TimelineProps } from "@/types/components";
import useIsMobile from "@/hooks/useIsMobile";

const Timeline: React.FC<TimelineProps> = ({
  events,
  width = "100%",
  height = "auto",
}) => {
  const isMobile = useIsMobile(768);
  const responsiveOrientation = isMobile ? "HORIZONTAL" : "HORIZONTAL";
  console.log("responsiveOrientation", responsiveOrientation);
  return (
    <div style={{ width, height }}>
      <Chrono
        disableToolbar={true}
        items={events}
        mode={responsiveOrientation}
        semanticTags={{
          title: "h1",
          cardTitle: "h2",
          cardDetailedText: "p",
        }}
        itemWidth={100}
        theme={{
          primary: "var(--accent-color)",
          secondary: "var(--foreground)",
          cardBgColor: "var(--card-background)",
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
