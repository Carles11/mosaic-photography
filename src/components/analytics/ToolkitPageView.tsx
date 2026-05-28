"use client";
import { useEffect } from "react";
import { sendGTMEvent } from "@next/third-parties/google";

export default function ToolkitPageView({
  advertiser,
}: {
  advertiser: string;
}) {
  useEffect(() => {
    sendGTMEvent({
      event: "toolkitPageView",
      advertiser,
    });
  }, [advertiser]);
  return null;
}
