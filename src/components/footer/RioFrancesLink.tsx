"use client";
import { sendGTMEvent } from "@next/third-parties/google";

export default function RioFrancesLink() {
  return (
    <a
      href="https://www.rio-frances.com"
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => {
        sendGTMEvent({
          event: "rio-frances-websiteClicked-FOOTER",
          value: "rio-frances-websiteClicked-FOOTER",
        });
      }}
    >
      Carles del Río Francés
    </a>
  );
}
