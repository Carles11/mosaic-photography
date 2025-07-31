import React from "react";
import { Metadata } from "next";
import { faqStructuredData } from "@/utils/faqStructuredData";
import Header from "@/components/header/Header";
import Footer from "@/components/footer/Footer";
import styles from "./faq.module.css";

export const metadata: Metadata = {
  title:
    "FAQ - Frequently Asked Questions | Public Domain Vintage Nude Photography",
  description:
    "Find answers to common questions about public domain vintage nude photography, usage rights, commercial licensing, copyright laws, and SEO optimization for photography websites.",
  keywords: [
    "public domain nude photography FAQ",
    "vintage nude photography questions",
    "copyright free nude art",
    "nude photography usage rights",
    "public domain photography commercial use",
    "vintage nude photography licensing",
    "nude art copyright laws",
    "photography website SEO FAQ",
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

const FAQPage: React.FC = () => {
  const faqSections = [
    {
      title: "Public Domain Nude Photography",
      faqs: [
        {
          id: "what-is-public-domain-nude-photography",
          question: "What is public domain nude photography?",
          answer:
            "Public domain nude photography refers to artistic nude photographs where the copyright has expired, been forfeited, or was never applicable. These works are freely available for anyone to use, modify, distribute, or even sell without needing permission from the original creator. Most vintage nude photography from the early 20th century and before has entered the public domain, making it a treasure trove for art enthusiasts, researchers, and commercial users seeking high-quality, historically significant imagery.",
        },
        {
          id: "vintage-nude-photographs-public-domain",
          question: "Are vintage nude photographs in the public domain?",
          answer:
            "Most vintage nude photographs are indeed in the public domain, particularly those created before 1928 in the United States, or works where the copyright has expired according to the laws of the country of origin. Many legendary photographers like Wilhelm von Gloeden, Baron von Plüschow, and early pictorialist artists created their masterpieces during eras when copyright terms were shorter. However, it's essential to verify each photograph's status, as some works may have had their copyrights renewed or may be owned by estates or institutions.",
        },
        {
          id: "how-to-tell-public-domain-status",
          question:
            "How can I tell if a nude photograph is in the public domain?",
          answer:
            "Determining public domain status requires research into several factors: the photographer's death date (works typically enter public domain 70 years after the creator's death in most countries), the publication date (pre-1928 works are generally public domain in the US), and whether copyrights were properly renewed. Look for works by photographers who died before 1954, check museum databases, consult the Catalog of Copyright Entries, and use resources like Wikimedia Commons. When in doubt, assume the work is still under copyright protection.",
        },
        {
          id: "commercial-use-public-domain-nude",
          question:
            "Can I use public domain nude photographs for commercial purposes?",
          answer:
            "Absolutely! Public domain nude photographs can be used for any commercial purpose without restrictions - you can sell prints, use them in advertising, incorporate them into products, or license them to others. This freedom makes public domain collections incredibly valuable for businesses, publishers, artists, and entrepreneurs. However, be mindful of platform policies (some social media sites restrict nude content regardless of copyright status) and local decency laws that might affect how you can commercially distribute such content.",
        },
        {
          id: "difference-public-domain-copyrighted",
          question:
            "What is the difference between public domain nude photography and copyrighted nude photography?",
          answer:
            "The fundamental difference lies in legal permissions and restrictions. Public domain nude photography is free from copyright restrictions - you can use, modify, and distribute these works without seeking permission or paying fees. Copyrighted nude photography, typically created after 1928 or by living photographers, requires explicit permission from the copyright holder and often involves licensing fees. While both may have similar artistic value, only public domain works offer complete freedom of use, making them invaluable for commercial projects, academic research, and artistic endeavors.",
        },
        {
          id: "where-to-find-high-quality-public-domain",
          question:
            "Where can I find high-quality public domain nude photographs?",
          answer:
            "High-quality public domain nude photographs can be found through several reputable sources: museum digital collections (like the Metropolitan Museum, Getty Museum), institutional archives, specialized galleries like Mosaic Photography that curate vintage collections, Wikimedia Commons, the Internet Archive, and academic databases. Many museums have digitized their historical photography collections, offering high-resolution downloads. Always verify the public domain status and look for institutions that provide clear usage rights information.",
        },
        {
          id: "museums-copyright-claims",
          question:
            "Can museums claim copyright on photographs of public domain nude artworks?",
          answer:
            "This is a complex legal area with varying interpretations. Generally, museums cannot claim new copyright on faithful reproductions of two-dimensional public domain works - a photograph of a public domain nude photograph should also be public domain. However, some museums claim copyright on their digital reproductions, though these claims are legally questionable. Three-dimensional artworks photographed by museums may involve more legitimate copyright claims on the photographs themselves. The trend is moving toward open access, with many major museums now explicitly releasing their digitized public domain collections without additional restrictions.",
        },
        {
          id: "how-to-legally-use-vintage-nude",
          question:
            "How can I legally use vintage nude photographs from the public domain?",
          answer:
            "Using public domain vintage nude photographs legally is straightforward: you have complete freedom to download, modify, redistribute, and commercialize these works. Best practices include: documenting the source and public domain status for your records, being mindful of platform policies when sharing online, respecting local laws regarding nude content distribution, and considering cultural sensitivity in your usage. While legal permission isn't required, ethical use that honors the artistic legacy and historical context of these works is always appreciated.",
        },
      ],
    },
    {
      title: "Usage and Copyright",
      faqs: [
        {
          id: "what-does-public-domain-mean",
          question: "What does it mean when a photograph is 'public domain'?",
          answer:
            "When a photograph is 'public domain,' it means the work belongs to the public as a whole - no individual or entity holds exclusive copyright control over it. This status occurs when copyrights expire (typically 70 years after the creator's death), are explicitly waived by the creator, or never existed in the first place. Public domain works become part of our shared cultural heritage, freely available for anyone to use for any purpose, including commercial applications, without needing permission or paying licensing fees.",
        },
        {
          id: "nude-artwork-photos-always-free",
          question: "Are photographs of nude artworks always free to use?",
          answer:
            "Not necessarily. While the original nude artwork might be in the public domain, the photograph of that artwork could be under copyright protection if it was created recently or involves creative interpretation. However, simple, faithful reproductions of two-dimensional public domain works (like photographing a vintage nude photograph) generally don't create new copyrights. The legal principle is that you cannot claim copyright on a reproduction that lacks originality or creativity. Always check the specific terms and source of the photograph.",
        },
        {
          id: "posting-public-domain-website",
          question:
            "Can I post public domain nude photos on my website without permission?",
          answer:
            "Yes, you can legally post public domain nude photos on your website without seeking permission, as these works are free from copyright restrictions. However, consider practical factors: website hosting terms of service, payment processor policies if you're selling content, age verification requirements, SEO implications, and local regulations. Many successful websites feature public domain nude photography by implementing appropriate content warnings, age gates, and clear categorization to ensure compliance with platform policies while maximizing accessibility.",
        },
        {
          id: "copyright-laws-nude-photography",
          question: "How do copyright laws apply to nude photography?",
          answer:
            "Copyright laws apply to nude photography the same way they apply to any other photographic work - they protect the photographer's creative expression from the moment of creation. The nude subject matter doesn't affect copyright protection; what matters is originality, creativity, and fixation in a tangible medium. Copyright duration follows standard terms (life of author plus 70 years in most countries), and all exclusive rights (reproduction, distribution, display, derivative works) apply equally. The artistic and historical value of nude photography has led to strong copyright protection and significant commercial markets.",
        },
        {
          id: "monetize-public-domain-nude-photos",
          question:
            "Can I monetize public domain nude photographs on my website?",
          answer:
            "Absolutely! Public domain nude photographs offer excellent monetization opportunities: selling high-quality prints, offering digital downloads, creating derivative works like calendars or art books, licensing to other businesses, developing subscription-based galleries, or selling educational content about photography history. Many successful businesses are built around public domain art curation and sales. The key is adding value through curation, quality, presentation, and service while being mindful of payment processor policies and advertising platform restrictions.",
        },
        {
          id: "legal-risks-nude-photos-online",
          question:
            "What are the legal risks of using nude photographs found online?",
          answer:
            "Using nude photographs found online without proper verification carries significant legal risks: copyright infringement claims, which can result in substantial damages and legal fees; personality rights violations if the subjects are identifiable and didn't consent to commercial use; potential criminal liability if images involve minors; platform bans and account suspensions; and business reputation damage. Always verify public domain status through reputable sources, avoid using contemporary or unverified imagery, and when in doubt, consult with legal professionals specializing in intellectual property law.",
        },
      ],
    },
    {
      title: "Photography Website SEO and FAQs",
      faqs: [
        {
          id: "faq-improve-photography-website-seo",
          question: "How can an FAQ page improve my photography website's SEO?",
          answer:
            "FAQ pages are SEO powerhouses for photography websites because they naturally target long-tail, question-based search queries that users frequently type into search engines. They help capture featured snippets, improve semantic SEO by providing comprehensive topic coverage, create opportunities for internal linking, and demonstrate expertise and authority in your niche. For photography websites, FAQs can address technical questions, usage rights, pricing, and artistic concepts, making your site a valuable resource that search engines and AI systems love to reference and rank highly.",
        },
        {
          id: "questions-photography-website-faq",
          question:
            "What questions should I include in my photography website FAQ?",
          answer:
            "Effective photography website FAQs should address your audience's primary concerns: usage rights and licensing (especially crucial for stock or vintage photography), technical specifications and quality, pricing and purchasing options, delivery methods and timelines, customization and commission possibilities, and educational content about your photography niche. For specialized sites like vintage or public domain photography, include questions about historical context, authenticity, and legal usage. Use tools like Google's 'People Also Ask' and keyword research to identify the questions your target audience is actually searching for.",
        },
        {
          id: "optimize-image-seo-vintage-nude",
          question: "How to optimize image SEO for vintage nude photography?",
          answer:
            "Optimizing image SEO for vintage nude photography requires a strategic approach: use descriptive, keyword-rich filenames that include photographer names, dates, and artistic terms; write comprehensive alt text that describes both the artistic and historical context; implement structured data markup for images and galleries; create detailed captions with historical information and technical details; optimize file sizes for fast loading while maintaining quality; use appropriate image formats (WebP for modern browsers); and organize images into well-structured galleries with clear navigation and categorization.",
        },
        {
          id: "best-keywords-public-domain-vintage-nude",
          question:
            "What keywords work best for public domain vintage nude photography?",
          answer:
            "Effective keywords for public domain vintage nude photography combine artistic, historical, and legal terms: 'public domain nude photography,' 'vintage nude art,' 'classical nude photography,' photographer-specific terms like 'Wilhelm von Gloeden nudes,' era-specific phrases like 'pictorialist nude photography,' usage-focused terms like 'royalty-free vintage nudes,' and educational keywords like 'art history nude photography.' Long-tail keywords perform exceptionally well: 'free to use vintage nude photographs,' 'public domain classical art nudes,' and 'historical nude photography collection.' Focus on intent-based keywords that match what researchers, artists, and commercial users actually search for.",
        },
        {
          id: "ai-search-engines-rank-photography-websites",
          question: "How do AI search engines rank photography websites?",
          answer:
            "AI search engines evaluate photography websites using sophisticated algorithms that assess content quality, user experience, technical performance, and semantic relevance. They prioritize sites with comprehensive image metadata, fast loading times, mobile optimization, clear navigation, and rich contextual information about photographs. AI systems particularly value structured data markup, detailed descriptions, historical context, and educational content that demonstrates expertise. For photography sites, providing extensive information about techniques, equipment, historical context, and usage rights signals authority and relevance to AI ranking systems.",
        },
      ],
    },
  ];

  return (
    <>
      <Header />
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
              Can't find the answer you're looking for? We're here to help! Our
              curated collection of public domain vintage nude photography
              continues to grow, and we're always happy to assist with specific
              questions about usage rights, historical context, or technical
              details.
            </p>
            <div className={styles.contactInfo}>
              <p>
                Explore our <a href="/">vintage nude photography gallery</a> or
                learn more about our{" "}
                <a href="/legal/terms-of-service">terms of service</a>.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Simple Go to Top Button - CSS only, no JavaScript needed */}
      <a href="#top" className={styles.goToTopButton} aria-label="Go to top">
        ↑
      </a>

      <Footer />
    </>
  );
};

export default FAQPage;
