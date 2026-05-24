import React from "react";
import ToolkitHero from "../ToolkitHero";
import ToolkitEditorial from "../ToolkitEditorial";
import ToolkitAffiliateBadge from "../ToolkitAffiliateBadge";
import type { AffiliateAdvertiser, AffiliateProduct } from "@/types/supabase";
import Image from "next/image";
import ShopLink from "../components/ShopLink";

interface TemplatePrintProps {
  advertiser: AffiliateAdvertiser;
  products: AffiliateProduct[];
  locale: string;
}

export default function TemplatePrint({
  advertiser,
  products,
  locale,
}: TemplatePrintProps) {
  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 1.5rem",
        color: "#fff",
      }}
    >
      <ToolkitHero advertiser={advertiser} />
      <ToolkitEditorial advertiser={advertiser} />

      {/* Curated Prints Section */}
      <section style={{ margin: "4rem 0" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            marginBottom: "2.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 700,
          }}
        >
          Curated Collection
        </h2>

        {/* CSS Grid for Gallery Feel */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: "3rem",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                background: "rgba(255,255,255,0.02)",
                padding: "1rem",
                borderRadius: "12px",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {/* Product Image */}
              {product.image_url && (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "4/5",
                    borderRadius: "8px",
                    overflow: "hidden",
                    background: "#1a1a1a",
                  }}
                >
                  <Image
                    src={product.image_url}
                    alt={
                      product.title?.[locale] || product.title?.en || "Print"
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}

              {/* Details */}
              <div style={{ flexGrow: 1 }}>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    marginBottom: "0.75rem",
                    fontWeight: 600,
                  }}
                >
                  {product.title?.[locale] || product.title?.en}
                </h3>
                <p
                  style={{
                    color: "rgba(255,255,255,0.6)",
                    fontSize: "0.95rem",
                    lineHeight: "1.6",
                    marginBottom: "1.5rem",
                  }}
                >
                  {product.description?.[locale] || product.description?.en}
                </p>
                <ShopLink href={product.affiliate_url} label="View Details" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Quality Callouts */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "2rem",
          margin: "4rem 0",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          paddingTop: "3rem",
        }}
      >
        {[
          {
            label: "MUSEUM-GRADE",
            desc: "Archival papers and premium pigments.",
          },
          { label: "EXPERT FRAMING", desc: "Hand-finished gallery quality." },
          { label: "SECURE DELIVERY", desc: "Worldwide shipping with care." },
        ].map((item, i) => (
          <div key={i}>
            <div
              style={{
                fontSize: "0.9rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
                marginBottom: "0.5rem",
              }}
            >
              {item.label}
            </div>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.9rem" }}>
              {item.desc}
            </div>
          </div>
        ))}
      </section>

      {/* CTA Footer */}
      <section
        style={{
          background: "#111",
          padding: "4rem 2rem",
          textAlign: "center",
          borderRadius: "12px",
          margin: "4rem 0",
        }}
      >
        <h2 style={{ fontSize: "1.8rem", marginBottom: "1.5rem" }}>
          PRINT YOUR COLLECTION
        </h2>
        {advertiser.website_url && (
          <a
            href={advertiser.website_url}
            target="_blank"
            rel="sponsored"
            style={{
              background: "#fff",
              color: "#000",
              padding: "1rem 3rem",
              textTransform: "uppercase",
              fontSize: "0.8rem",
              fontWeight: 700,
              textDecoration: "none",
              letterSpacing: "0.1em",
            }}
          >
            Visit Shop
          </a>
        )}
      </section>

      <ToolkitAffiliateBadge />
    </div>
  );
}
