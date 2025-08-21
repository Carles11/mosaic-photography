// Performance monitoring utility
// Add this to your layout.tsx to monitor performance improvements

export const performanceMonitor = () => {
  if (typeof window !== "undefined") {
    // Monitor First Contentful Paint
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === "first-contentful-paint") {
          console.log("🎨 First Contentful Paint:", entry.startTime, "ms");
        }
        if (entry.name === "largest-contentful-paint") {
          console.log("🖼️ Largest Contentful Paint:", entry.startTime, "ms");
        }
      }
    });

    observer.observe({ entryTypes: ["paint", "largest-contentful-paint"] });

    // Monitor when non-critical CSS loads
    const nonCriticalLink = document.querySelector(
      'link[href="/non-critical.css"]',
    );
    if (nonCriticalLink) {
      nonCriticalLink.addEventListener("load", () => {
        console.log("✅ Non-critical CSS loaded");
      });
    }
  }
};
