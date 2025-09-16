// Utility to help with critical CSS management
// This file can be used to generate and update critical CSS

export const criticalCSSConfig = {
  // URLs to analyze for critical CSS
  urls: [
    "http://localhost:3000",
    "http://localhost:3000/profile",
    // Add more URLs as needed
  ],

  // Viewport dimensions for critical CSS generation
  dimensions: [
    { width: 1200, height: 900 }, // Desktop
    { width: 375, height: 667 }, // Mobile
  ],

  // CSS selectors that should always be included in critical CSS
  forceInclude: [
    // Font faces
    "@font-face",
    // CSS variables
    ":root",
    // Basic layout
    "html",
    "body",
    // Theme-related
    '[data-theme="dark"]',
  ],

  // CSS selectors that should never be included in critical CSS
  ignore: [
    // Animations
    "@keyframes",
    // Hover states
    ":hover",
    // Focus states
    ":focus",
    // Third-party libraries

    ".pswp",
  ],
};

// Function to validate critical CSS size
export const validateCriticalCSS = (css: string) => {
  const sizeInBytes = new Blob([css]).size;
  const sizeInKB = sizeInBytes / 1024;

  console.log(`Critical CSS size: ${sizeInKB.toFixed(2)} KB`);

  if (sizeInKB > 14) {
    console.warn(
      "⚠️ Critical CSS is larger than 14KB. Consider removing non-critical styles."
    );
  } else {
    console.log("✅ Critical CSS size is optimal.");
  }

  return sizeInKB;
};
