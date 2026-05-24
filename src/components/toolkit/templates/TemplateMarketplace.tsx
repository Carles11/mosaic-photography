import React from "react";
import ToolkitHero from "../ToolkitHero";
import ToolkitEditorial from "../ToolkitEditorial";
import ToolkitAffiliateBadge from "../ToolkitAffiliateBadge";
import type { AffiliateAdvertiser, AffiliateProduct } from "@/types/supabase";
import Image from "next/image";

interface TemplateMarketplaceProps {
  advertiser: AffiliateAdvertiser;
  products: AffiliateProduct[];
  locale: string;
}

export default function TemplateMarketplace({
  advertiser,
  products,
  locale,
}: TemplateMarketplaceProps) {
  // Group products by type
  const grouped = products.reduce(
    (acc, p) => {
      const type = p.type || "Other";
      if (!acc[type]) acc[type] = [];
      acc[type].push(p);
      return acc;
    },
    {} as Record<string, AffiliateProduct[]>,
  );

  return (
    <>
      <ToolkitHero advertiser={advertiser} />
      <ToolkitEditorial advertiser={advertiser} />
      {/* Product Categories */}
      <section style={{ margin: "3rem 0" }}>
        {Object.entries(grouped).map(([type, group]) => (
          <div key={type} style={{ marginBottom: "2.5rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 18,
              }}
            >
              <h2
                style={{
                  color: "#fff",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                  margin: 0,
                }}
              >
                {type}
              </h2>
              <div
                style={{
                  flex: 1,
                  height: 1,
                  background: "rgba(255,255,255,0.07)",
                }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 1,
              }}
            >
              {group.map((product) => (
                <div
                  key={product.id}
                  style={{
                    background: "#181818",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: 0,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    minHeight: 280,
                  }}
                >
                  {product.image_url && (
                    <div
                      style={{
                        position: "relative",
                        height: 180,
                        width: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <Image
                        src={product.image_url}
                        alt={product.title?.[locale] || product.title?.en}
                        loading="eager"
                        unoptimized
                        layout="fill"
                        objectFit="cover"
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: 60,
                          background:
                            "linear-gradient(0deg, #181818 80%, transparent)",
                        }}
                      />
                    </div>
                  )}
                  <div
                    style={{
                      padding: "1.2rem 1rem 1.5rem 1rem",
                      flex: 1,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <div
                      style={{
                        color: "#fff",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.09em",
                        fontSize: "1.1rem",
                        marginBottom: 8,
                      }}
                    >
                      {product.title?.[locale] || product.title?.en}
                    </div>
                    <div
                      style={{
                        color: "rgba(255,255,255,0.6)",
                        fontSize: "0.98rem",
                        marginBottom: 12,
                        lineHeight: 1.5,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {product.description?.[locale] || product.description?.en}
                    </div>
                    <a
                      href={product.affiliate_url}
                      target="_blank"
                      rel="sponsored"
                      style={{
                        background: "#fff",
                        color: "#111",
                        padding: "0.6rem 1.5rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.12em",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                        textDecoration: "none",
                        borderRadius: 0,
                        alignSelf: "flex-start",
                      }}
                    >
                      Shop Now
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
      <ToolkitAffiliateBadge />
    </>
  );
}
