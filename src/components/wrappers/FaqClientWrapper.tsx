"use client";
import React from "react";
import styles from "../../app/faq/faq.module.css";
import Link from "next/link";
import GoToTopButton from "@/components/buttons/GoToTopButton";

interface FAQItemProps {
  question: string;
  answer: string;
  id: string;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, answer, id }) => (
  <div className={styles.faqItem} id={id}>
    <h3 className={styles.question}>{question}</h3>
    <div className={styles.answer}>
      <p>{answer}</p>
    </div>
  </div>
);

interface FaqClientWrapperProps {
  faqSections: Array<{
    title: string;
    faqs: Array<{ id: string; question: string; answer: string }>;
  }>;
  faqStructuredData: object;
}

const FaqClientWrapper: React.FC<FaqClientWrapperProps> = ({
  faqSections,
  faqStructuredData,
}) => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData),
        }}
      />
      <div className={styles.faqContainer}>
        <div id="top"></div>
        <header className={styles.header}>
          <h1 className={styles.mainTitle}>Frequently Asked Questions</h1>
          <p className={styles.subtitle}>
            Everything you need to know about public domain vintage nude
            photography, usage rights, and optimizing your photography website
            for search engines.
          </p>
        </header>

        <div className={styles.tableOfContents}>
          <h2>Quick Navigation</h2>
          <ul>
            {faqSections.map((section, index) => (
              <li key={index}>
                <a href={`#section-${index}`}>{section.title}</a>
                <ul>
                  {section.faqs.map((faq) => (
                    <li key={faq.id}>
                      <a href={`#${faq.id}`}>{faq.question}</a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>

        <main className={styles.faqContent}>
          {faqSections.map((section, sectionIndex) => (
            <section
              key={sectionIndex}
              id={`section-${sectionIndex}`}
              className={styles.faqSection}
            >
              <h2 className={styles.sectionTitle}>{section.title}</h2>
              {section.faqs.map((faq) => (
                <FAQItem
                  key={faq.id}
                  id={faq.id}
                  question={faq.question}
                  answer={faq.answer}
                />
              ))}
            </section>
          ))}
        </main>

        <section className={styles.faqFooter}>
          <div className={styles.callToAction}>
            <h2>Still Have Questions?</h2>
            <p>
              Can&apos;t find the answer you&apos;re looking for? We&apos;re
              here to help! Our curated collection of public domain vintage nude
              photography continues to grow, and we&apos;re always happy to
              assist with specific questions about usage rights, historical
              context, or technical details.
            </p>
            <div className={styles.contactInfo}>
              <p>
                Explore our{" "}
                <Link href="/">vintage nude photography gallery</Link> or learn
                more about our{" "}
                <Link href="/legal/terms-of-service">terms of service</Link>.
              </p>
            </div>
          </div>
        </section>
      </div>

      <GoToTopButton />
    </>
  );
};

export default FaqClientWrapper;
