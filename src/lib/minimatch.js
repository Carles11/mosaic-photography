// Use dynamic import for Vercel compatibility
let minimatch;

if (typeof window === "undefined") {
  // Server environment
  minimatch = require("minimatch");
} else {
  // Client environment
  minimatch = require("minimatch").default || require("minimatch");
}

module.exports = minimatch;
