import postcssImport from "postcss-import";
import purgecss from "@fullhuman/postcss-purgecss";
import autoprefixer from "autoprefixer";

const config = {
  plugins: [
    postcssImport,
    purgecss({
      content: ["./src/**/*.{js,ts,jsx,tsx}", "./app/**/*.{js,ts,jsx,tsx}"],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      safelist: [],
    }),
    autoprefixer,
  ],
};

export default config;
