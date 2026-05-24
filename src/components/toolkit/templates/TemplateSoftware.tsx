import React from "react";
import ToolkitHero from "../ToolkitHero";
import ToolkitEditorial from "../ToolkitEditorial";
import ToolkitAffiliateBadge from "../ToolkitAffiliateBadge";
import type { AffiliateAdvertiser, AffiliateProduct } from "@/types/supabase";
import Image from "next/image";

interface TemplateSoftwareProps {
  advertiser: AffiliateAdvertiser;
  products: AffiliateProduct[];
  locale: string;
}

export default function TemplateSoftware({
  advertiser,
  products,
  locale,
}: TemplateSoftwareProps) {
  return (
    <>
      <ToolkitHero advertiser={advertiser} />
      <ToolkitEditorial advertiser={advertiser} />
      {/* Before/After Showcase */}
      {advertiser.banner_image_url && (
        <section style={{ margin: "3rem 0" }}>
          <h2
            style={{
              color: "#fff",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              fontWeight: 700,
              fontSize: "1.2rem",
              marginBottom: "1.5rem",
            }}
          >
            SEE THE DIFFERENCE
          </h2>

          {advertiser.banner_link_url && (
            <a
              href={advertiser.banner_link_url ?? advertiser.website_url}
              target="_blank"
              rel="sponsored"
              style={{ display: "block" }}
            >
              <Image
                src={advertiser.banner_image_url}
                alt={`${advertiser.name} before and after`}
                width={2000}
                height={2000}
                style={{ width: "100%", height: "auto", display: "block" }}
                unoptimized
              />
            </a>
          )}
        </section>
      )}
      {/* Tools Grid */}
      <section style={{ margin: "3rem 0" }}>
        <h2
          style={{
            color: "#fff",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 700,
            fontSize: "1.2rem",
            marginBottom: "1.5rem",
          }}
        >
          THE TOOLS
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
            gap: 1,
          }}
        >
          {products.map((product) => (
            <div
              key={product.id}
              style={{
                background: "#181818",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 0,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                minHeight: 300,
                position: "relative",
              }}
            >
              {product.featured && (
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    right: 10,
                    background: "#fff",
                    color: "#111",
                    fontSize: "0.6rem",
                    textTransform: "uppercase",
                    padding: "0.2rem 0.5rem",
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                >
                  FEATURED
                </span>
              )}
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
      </section>
      {/* Pricing Note */}
      <section
        style={{
          display: "flex",
          gap: "2rem",
          margin: "3rem 0",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: 220,
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "1.5rem",
            borderRadius: 0,
          }}
        >
          <div
            style={{
              color: "#fff",
              textTransform: "uppercase",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.09em",
              marginBottom: 8,
            }}
          >
            ONE-TIME
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.98rem",
              marginBottom: 12,
            }}
          >
            Pay once, own forever.
          </div>
        </div>
        <div
          style={{
            flex: 1,
            minWidth: 220,
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "1.5rem",
            borderRadius: 0,
          }}
        >
          <div
            style={{
              color: "#fff",
              textTransform: "uppercase",
              fontWeight: 700,
              fontSize: "1rem",
              letterSpacing: "0.09em",
              marginBottom: 8,
            }}
          >
            SUBSCRIPTION
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.6)",
              fontSize: "0.98rem",
              marginBottom: 12,
            }}
          >
            Flexible access. Try multiple tools at lower cost.
          </div>
        </div>
      </section>
      {/* Free Trial CTA (Retouch4me only) */}
      {advertiser.slug === "retouch4me" && (
        <section
          style={{
            background: "#1d1d1d",
            border: "1px solid rgba(255,255,255,0.07)",
            padding: "2.5rem 0",
            margin: "3rem 0",
          }}
        >
          <div style={{ textAlign: "center" }}>
            <h2
              style={{
                color: "#fff",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                fontWeight: 700,
                fontSize: "1.2rem",
                marginBottom: "1.2rem",
              }}
            >
              TRY IT FREE
            </h2>
            <div
              style={{
                color: "rgba(255,255,255,0.7)",
                fontSize: "1.1rem",
                marginBottom: "1.5rem",
              }}
            >
              20 free retouches. No credit card required.
            </div>
            {advertiser.website_url && (
              <a
                href={advertiser.website_url}
                target="_blank"
                rel="sponsored"
                style={{
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
                Try Now
              </a>
            )}
          </div>
        </section>
      )}
      <ToolkitAffiliateBadge />
    </>
  );
}
