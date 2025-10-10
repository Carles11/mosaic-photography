"use client";

import { Chrono } from "react-chrono";
import type { TimelineProps } from "@/types/components";
import useIsMobile from "@/hooks/useIsMobile";
import { getCssVar } from "@/helpers/colors";
import "./Timeline.module.css";

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
          primary: getCssVar("--accent-color", "#f4d35e"),
          secondary: getCssVar("--foreground", "#fff"),
          cardBgColor: getCssVar("--card-background", "#2d2d2d"),
          cardDetailsBackGround: getCssVar(
            "--card-details-background",
            "transparent"
          ),
          cardDetailsColor: getCssVar("--text-color", "#fff"),
          cardSubtitleColor: getCssVar("--text-color", "#fff"),
          cardTitleColor: getCssVar("--text-color", "#fff"),
          detailsColor: getCssVar("--text-color", "#fff"),
          textColor: getCssVar("--text-color", "#fff"),
          titleColor: getCssVar("--text-color", "#fff"),
        }}
        slideShow
        slideItemDuration={3000}
        showProgressOnSlideshow={true}
        showOverallSlideshowProgress={true}
        contentDetailsHeight={100}
        highlightCardsOnHover={true}
        fontSizes={{
          title: "1.5rem",
          cardTitle: "1.4rem",
          cardSubtitle: "1.2rem",
          cardDetailedText: "1.25rem",
        }}
        scrollable={true}
        timelinePointShape="square"
      />
    </div>
  );
};

export default Timeline;
