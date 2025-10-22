import React from "react";
import styles from "./privacy-policy.module.css";

// overwrwite metadata for this page

export const metadata = {
  title: "Privacy Policy - Mosaic Photography",
  description:
    "Learn about Mosaic Photography's privacy practices, including our use of Google Analytics, Microsoft Clarity, and how we handle your data.",
  openGraph: {
    title: "Privacy Policy - Mosaic Photography",
    description:
      "Learn about Mosaic Photography's privacy practices, including our use of Google Analytics, Microsoft Clarity, and how we handle your data.",
    images: ["/images/og-image.jpg"],
  },
  twitter: {
    cardType: "summary_large_image",
    title: "Privacy policy - Mosaic Photography",
    description:
      "Privacy policy page of Mosaic Photography. Learn about Mosaic Photography's privacy practices, including our use of Google Analytics, Microsoft Clarity, and how we handle your data.",
    image: "/favicons/favicon.ico",
  },
};

const PrivacyPolicy: React.FC = () => {
  return (
    <section className={styles.container}>
      <h1 className={styles.title}>Privacy Policy</h1>

      <h2 className={styles.subtitle}>Information Collection</h2>
      <p className={styles.text}>
        We do not collect any personal information from visitors to our website.
        However, we use Google Analytics (via Google Tag Manager) to collect
        non-personal information such as your IP address, browser type, and
        operating system. Google Analytics may use cookies to analyze usage and
        may transfer data outside the EU. For more details, see{" "}
        <a
          href="https://policies.google.com/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="fancy-link"
        >
          Google’s Privacy Policy
        </a>
        .
      </p>
      <h2 className={styles.subtitle}>Cookies</h2>
      <p className={styles.text}>
        We use cookies to remember your preferences (such as theme and age
        consent) and, with your consent, for analytics purposes. You can accept
        or decline analytics cookies via our cookie consent banner.
      </p>
      <h2 className={styles.subtitle}>Information Use</h2>
      <p className={styles.text}>
        We use the non-personal information collected by Google Analytics to
        improve our website and provide a better user experience.
      </p>
      <h2 className={styles.subtitle}>Information Sharing</h2>
      <p className={styles.text}>
        We don&apos;t share your information with third parties.
      </p>
      <h2 className={styles.subtitle}>Google Tag Manager</h2>
      <p className={styles.text}>
        We use Google Tag Manager to help manage analytics and tracking on our
        website. Google Tag Manager itself does not collect personal
        information, but it may deploy tags that collect data for analytics
        purposes and help us improve the user experience. For more information,
        please review Google&apos;s privacy policy.
      </p>
      <h2 className={styles.subtitle}>Microsoft Clarity</h2>
      <p className={styles.text}>
        We use Microsoft Clarity to capture how you use and interact with our
        website through behavioral metrics, heatmaps, and session replay to
        improve and market our products/services. By using our site, you agree
        that we and Microsoft can collect this data. Website usage data is
        captured using first and third-party cookies and other tracking
        technologies to determine the popularity of products/services and online
        activity. Additionally, we use this information for site optimization,
        fraud/security purposes. For more information about how Microsoft
        collects and uses your data, visit the{" "}
        <a
          href="https://privacy.microsoft.com/privacystatement"
          target="_blank"
          rel="noopener noreferrer"
          className="fancy-link"
        >
          Microsoft Privacy Statement
        </a>
        .
      </p>
      <h2 className={styles.subtitle}>Account and Login Information</h2>
      <p className={styles.text}>
        If you create an account or log in, we collect personal information such
        as your email address and any profile details you provide. This data is
        used to manage your account, provide access to personalized features,
        and ensure site security. Your account data is stored securely and is
        not shared with third parties except as required to operate the website
        (for example, with our authentication provider, Supabase).
      </p>

      <h2 className={styles.subtitle}>Contact</h2>
      <p className={styles.text}>
        If you have any questions or concerns about our privacy policy, please
        contact us at{" "}
        <a href="mailto:carles@rio-frances.com" className="fancy-link">
          carles@rio-frances.com
        </a>
        .
      </p>
    </section>
  );
};

export default PrivacyPolicy;
