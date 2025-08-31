import { Metadata } from "next";
import { faqStructuredData } from "@/utils/faqStructuredData";
import { faqSections } from "@/app/constants/faqSections";
import FaqClientWrapper from "./FaqClientWrapper";

export const metadata: Metadata = {
  title:
    "FAQ - Frequently Asked Questions | Public Domain Vintage Nude Photography",
  description:
    "Find answers to common questions about public domain vintage nude photography, usage rights, commercial licensin and copyright laws.",
  keywords: [
    "public domain nude photography FAQ",
    "vintage nude photography questions",
    "copyright free nude art",
    "nude photography usage rights",
    "public domain photography commercial use",
    "vintage nude photography licensing",
    "nude art copyright laws",
    "nude photography legal questions",
    "public domain art questions",
  ],
  openGraph: {
    title: "FAQ - Public Domain Vintage Nude Photography Questions",
    description:
      "Comprehensive answers to frequently asked questions about public domain vintage nude photography, usage rights, and commercial licensing.",
    type: "website",
    url: "https://www.mosaic.photography/faq",
  },
  alternates: {
    canonical: "https://www.mosaic.photography/faq",
  },
};

const FAQPage = () => {
  return (
    <FaqClientWrapper
      faqSections={faqSections}
      faqStructuredData={faqStructuredData}
    />
  );
};

export default FAQPage;
