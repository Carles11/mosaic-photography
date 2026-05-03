import { QualityLevel } from "@/types";
import styles from "@/components/modals/downloadOptions/DownloadOptionsModalBody.module.css";

export const qualityConfig: Record<
  QualityLevel,
  {
    stars: string;
    label: string;
    badge: string;
    printDescription: string;
    recommended: boolean;
  }
> = {
  professional: {
    stars: "★★★★★",
    label: "Professional",
    badge: styles.qualityBadgeProfessional,
    printDescription:
      "Exceptional resolution — ideal for large-format and commercial print.",
    recommended: true,
  },
  excellent: {
    stars: "★★★★",
    label: "Excellent",
    badge: styles.qualityBadgeExcellent,
    printDescription:
      "High resolution — great for framed prints and quality reproduction.",
    recommended: true,
  },
  good: {
    stars: "★★★",
    label: "Good",
    badge: styles.qualityBadgeGood,
    printDescription:
      "Decent resolution — suitable for small prints and casual use.",
    recommended: false,
  },
  standard: {
    stars: "★★",
    label: "Standard",
    badge: styles.qualityBadgeStandard,
    printDescription:
      "Low resolution — not recommended for print, best for web and screen use.",
    recommended: false,
  },
  "": {
    stars: "★",
    label: "Unknown",
    badge: styles.qualityBadgeStandard,
    printDescription: "Resolution unknown — download at your own discretion.",
    recommended: false,
  },
};
