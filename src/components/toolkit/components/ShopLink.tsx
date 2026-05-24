"use client";

import React, { useState } from "react";

interface ShopLinkProps {
  href: string;
  label: string;
}

export default function ShopLink({ href, label }: ShopLinkProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <a
      href={href}
      target="_blank"
      rel="sponsored"
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
      style={{
        display: "inline-block",
        border: "1px solid #fff",
        color: isHovered ? "#000" : "#fff",
        background: isHovered ? "#fff" : "transparent",
        padding: "0.75rem 1.5rem",
        fontSize: "0.8rem",
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        textDecoration: "none",
        fontWeight: 700,
        transition: "all 0.2s ease",
      }}
    >
      {label}
    </a>
  );
}
