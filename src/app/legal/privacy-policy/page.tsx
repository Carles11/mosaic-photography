import React from "react";
import styles from "./privacy-policy.module.css";

// Overwrite metadata for this page
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
    title: "Privacy Policy - Mosaic Photography",
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
        non-personal information such as IP address, browser type, and operating
        system. Google Analytics may use cookies to analyze usage patterns and
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
        or decline analytics cookies through our cookie consent banner.
      </p>

      <h2 className={styles.subtitle}>Information Use</h2>
      <p className={styles.text}>
        Non-personal data collected via Google Analytics is used to improve our
        website and provide a better user experience.
      </p>

      <h2 className={styles.subtitle}>Information Sharing</h2>
      <p className={styles.text}>
        We do not share your personal information with third parties.
      </p>

      <h2 className={styles.subtitle}>Google Tag Manager</h2>
      <p className={styles.text}>
        We use Google Tag Manager to manage analytics and tracking tags on our
        website. Google Tag Manager itself does not collect personal data but
        may deploy tags that do for analytics and user experience purposes. For
        more information, see{" "}
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

      <h2 className={styles.subtitle}>Microsoft Clarity</h2>
      <p className={styles.text}>
        We use Microsoft Clarity to understand how users interact with our
        website through behavioral metrics, heatmaps, and session replays. This
        helps us improve and market our products and services. Website usage
        data is collected using first- and third-party cookies and other
        tracking technologies to assess product popularity and online activity.
        This data is also used for site optimization and fraud prevention. For
        details, see{" "}
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
        as your email address and profile details you provide. This data is used
        to manage your account, provide personalized features, and maintain site
        security. Your account data is securely stored and only shared with
        trusted third parties necessary to operate the website (e.g., Supabase).
      </p>

      <h2 id="account-deletion" className={styles.subtitle}>
        Account Deletion
      </h2>
      <p className={styles.text}>
        You may permanently delete your account directly from the app:
      </p>
      <ol className={styles.text}>
        <li>Log in to the Mosaic Photography App</li>
        <li>Go to your Profile</li>
        <li>Tap the &quot;Delete Account&quot; button</li>
        <li>Confirm deletion</li>
      </ol>
      <p className={styles.text}>
        All your account data will be deleted completely and promptly from our
        servers. No data remains after deletion. For assistance, contact us at{" "}
        <a href="mailto:carles@rio-frances.com" className="fancy-link">
          carles@rio-frances.com
        </a>
        .
      </p>

      <h2 className={styles.subtitle}>For App Store & Play Store Reviewers</h2>
      <p className={styles.text}>
        This version of Mosaic Photography complies with store requirements. Key
        points for reviewers:
      </p>
      <ul className={styles.text}>
        <li>
          No pornography or sexually explicit content is included in
          store-visible screenshots or videos.
        </li>
        <li>
          Historical/artistic nudity is age-gated and hidden by default. Consent
          is stored server-side (logged-in) or locally (anonymous users).
        </li>
        <li>Users can revoke consent at any time through Filters → Nudity.</li>
        <li>
          All images are public-domain; provenance can be provided on request.
        </li>
        <li>
          Users can report inappropriate images or comments in-app; reported
          content is reviewed promptly and removed if necessary.
        </li>
        <li>
          Non-personal analytics (Google Analytics, Microsoft Clarity) is used
          solely for QA, performance, and UX improvement.
        </li>
        <li>
          Account data (email, profile info) is securely stored and can be
          permanently deleted by the user.
        </li>
      </ul>
      <h2 className={styles.subtitle}>Contact</h2>
      <p className={styles.text}>
        If you have any questions or concerns about this privacy policy, please
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
