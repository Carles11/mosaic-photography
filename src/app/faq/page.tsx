import { Metadata } from "next";
import { faqStructuredData } from "@/utils/faqStructuredData";
import { faqSections } from "@/app/constants/faqSections";
import FaqClientWrapper from "@/components/wrappers/FaqClientWrapper";
import styles from "./faq.module.css";

export const metadata: Metadata = {
  title: "FAQ – Public Domain Photography",
  description:
    "Answers to common questions about public domain photography, usage rights, and licensing.",
  keywords: [
    "public domain nude photography FAQs",
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
    title: "FAQ – Public Domain Photography",
    description:
      "Answers to common questions about public domain photography, usage rights, and licensing.",
    type: "website",
    url: "https://www.mosaic.photography/faq",
  },
  alternates: {
    canonical: "https://www.mosaic.photography/faq",
  },
};

const FAQPage = () => {
  return (
    <>
      <header className={styles.header}>
        <h1 className={styles.mainTitle}>Frequently Asked Questions</h1>
        <p className={styles.subtitle}>
          Everything you need to know about public domain vintage nude
          photography, usage rights, and optimizing your photography website for
          search engines.
        </p>
      </header>
      <FaqClientWrapper
        faqSections={faqSections}
        faqStructuredData={faqStructuredData}
      />
    </>
  );
};

export default FAQPage;
