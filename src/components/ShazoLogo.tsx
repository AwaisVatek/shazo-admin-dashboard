import React from "react";
import { getBrandLogo } from "../utils/branding";

export type ShazoLogoProps = {
  variant?: "horizontal" | "square" | "icon";
  tone?: "white" | "coloured";
  className?: string;
  alt?: string;
  purpose?: "login" | "sidebar" | "header" | "general" | "square" | "favicon" | "icon";
};

export const ShazoLogo: React.FC<ShazoLogoProps> = ({
  variant = "horizontal",
  tone = "coloured",
  className = "h-8",
  alt,
  purpose,
}) => {
  // Let's resolve the actual image source
  let logoSrc: string | null = null;

  // 1. Check customized logos in localStorage based on purpose
  if (purpose === "login") {
    logoSrc = getBrandLogo("login");
  } else if (purpose === "sidebar") {
    logoSrc = getBrandLogo("sidebar");
  } else if (purpose === "header") {
    logoSrc = getBrandLogo("icon");
  } else if (purpose === "general") {
    logoSrc = getBrandLogo("horizontal");
  } else if (purpose === "square") {
    logoSrc = getBrandLogo("square");
  } else if (purpose === "favicon") {
    logoSrc = getBrandLogo("favicon");
  } else if (purpose === "icon") {
    logoSrc = getBrandLogo("icon");
  }

  // 2. If no purpose specified, infer purpose from variant + tone
  if (!logoSrc) {
    if (variant === "square" && tone === "coloured") {
      logoSrc = getBrandLogo("login") || getBrandLogo("square");
    } else if (variant === "horizontal" && tone === "white") {
      logoSrc = getBrandLogo("sidebar") || getBrandLogo("horizontal");
    } else if (variant === "icon") {
      logoSrc = getBrandLogo("icon");
    } else if (variant === "horizontal") {
      logoSrc = getBrandLogo("horizontal");
    } else if (variant === "square") {
      logoSrc = getBrandLogo("square");
    }
  }

  // 3. Absolute fallback to static file if not found in custom storage
  if (!logoSrc) {
    logoSrc = `/brand/shazo-ride-${variant}-${tone}.png`;
  }

  const altText = alt || `Shazo Ride ${variant} ${tone}`;

  return (
    <img
      src={logoSrc}
      alt={altText}
      className={`object-contain ${className}`}
      referrerPolicy="no-referrer"
    />
  );
};
