import React from "react";
import Image from "next/image";
import { AffiliateAdvertiser } from "@/types/supabase";

interface ToolkitHeroProps {
  advertiser: AffiliateAdvertiser;
  showCTA?: boolean;
}

export default function ToolkitHero({
  advertiser,
  showCTA = true,
}: ToolkitHeroProps) {
  return (
    <section
      style={{
        background: "#0a0a0a",
        minHeight: 260,
        width: "100%",
        padding: "2.5rem 0 2rem 0",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 2rem" }}>
        {advertiser.logo_url ? (
          <Image
            src={advertiser.logo_url}
            alt={advertiser.name}
            height={48}
            width={180}
            style={{ maxHeight: 48, objectFit: "contain", width: "auto" }}
          />
        ) : (
          <h2
            style={{
              color: "#fff",
              fontSize: "2.5rem",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {advertiser.name}
          </h2>
        )}
        <div
          style={{
            marginTop: "1.5rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
          }}
        >
          <h1
            style={{
              color: "#fff",
              fontSize: "clamp(2rem,5vw,3.5rem)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 700,
              margin: 0,
            }}
          >
            {advertiser.name}
          </h1>
          <span
            style={{
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: 2,
              fontSize: "0.65rem",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.6)",
              padding: "0.2rem 0.7rem",
              marginLeft: 8,
            }}
          >
            VIA {advertiser.platform?.toUpperCase()}
          </span>
        </div>
        <div
          style={{
            color: "rgba(255,255,255,0.6)",
            marginTop: "1.2rem",
            maxWidth: 560,
            fontSize: "1.1rem",
          }}
        >
          {advertiser.description}
        </div>
        {showCTA && advertiser.website_url && (
          <a
            href={advertiser.website_url}
            target="_blank"
            rel="sponsored"
            style={{
              display: "inline-block",
              marginTop: "2.2rem",
              background: "#fff",
              color: "#111",
              padding: "0.75rem 2rem",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              fontWeight: 700,
              fontSize: "0.75rem",
              textDecoration: "none",
              borderRadius: 0,
            }}
          >
            Visit {advertiser.name}
          </a>
        )}
      </div>
    </section>
  );
}
