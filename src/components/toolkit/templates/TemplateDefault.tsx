import React from "react";
import ToolkitHero from "../ToolkitHero";
import ToolkitEditorial from "../ToolkitEditorial";
import ToolkitAffiliateBadge from "../ToolkitAffiliateBadge";
import Image from "next/image";
import type { AffiliateAdvertiser, AffiliateProduct } from "@/types/supabase";

interface TemplateDefaultProps {
  advertiser: AffiliateAdvertiser;
  products: AffiliateProduct[];
  locale: string;
}

export default function TemplateDefault({
  advertiser,
  products,
  locale,
}: TemplateDefaultProps) {
  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1.5rem" }}>
      <ToolkitHero advertiser={advertiser} />
      <ToolkitEditorial advertiser={advertiser} />

      <section style={{ margin: "4rem 0" }}>
        <h2
          style={{
            color: "var(--text-color, #333)",
            fontSize: "1.5rem",
            marginBottom: "2.5rem",
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            fontWeight: 700,
          }}
        >
          Recommended Items
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "2.5rem",
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                display: "flex",
                flexDirection: "column",
                background: "#111",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {/* Optimized Image Container */}
              {product.image_url && (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                    aspectRatio: "16/9",
                    background: "#1a1a1a",
                  }}
                >
                  <Image
                    src={product.image_url}
                    alt={
                      product.title?.[locale] || product.title?.en || "Product"
                    }
                    fill
                    sizes="(max-width: 768px) 100vw, 300px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}

              {/* Product Body */}
              <div
                style={{
                  padding: "1.5rem",
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <h2
                  style={{
                    color: "var(--text-color, #333)",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                    padding: "0.5rem 0",
                    margin: 0,
                  }}
                >
                  {product.photographer_author || ""}
                </h2>
                <h3
                  style={{
                    color: "var(--text-color, #333)",
                    fontSize: "1.1rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    margin: "0.5rem 0",
                  }}
                >
                  {product.title?.[locale] || product.title?.en}
                </h3>

                <p
                  style={{
                    color: "var(--foreground-muted, #aaa)",
                    fontSize: "0.9rem",
                    lineHeight: "1.5",
                    marginBottom: "2rem",
                    flex: 1,
                  }}
                >
                  {product.description?.[locale] || product.description?.en}
                </p>

                <a
                  href={product.affiliate_url}
                  target="_blank"
                  rel="sponsored"
                  style={{
                    display: "inline-block",
                    background: "#fff",
                    color: "#000",
                    padding: "0.75rem 1.5rem",
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.15em",
                    fontWeight: 700,
                    textDecoration: "none",
                    textAlign: "center",
                  }}
                >
                  Shop Now
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      <ToolkitAffiliateBadge />
    </div>
  );
}
