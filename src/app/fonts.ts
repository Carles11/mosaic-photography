import localFont from "next/font/local";

export const tradeGothic = localFont({
  src: [
    {
      path: "../../public/fonts/TradeGothic-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/TradeGothic-Bold.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/TradeGothic-Light.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "../../public/fonts/TradeGothic-ExtraBold.woff2",
      weight: "800",
      style: "normal",
    },
  ],
  display: "swap",
  variable: "--font-trade-gothic",
});
