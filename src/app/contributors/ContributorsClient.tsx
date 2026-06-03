// app/contributors/ContributorClient.tsx
"use client";

import { useRef, useState } from "react";
import styles from "./Contributors.module.css";

export default function ContributorClient() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    instagram: "",
    portfolio: "",
    imageGallery: "",
    message: "",
  });
  const [rightsAccepted, setRightsAccepted] = useState(false);

  const [errors, setErrors] = useState({
    email: "",
    instagram: "",
    portfolio: "",
    imageGallery: "",
  });
  const [rightsError, setRightsError] = useState("");

  const fieldRefs = useRef<
    Record<string, HTMLInputElement | HTMLTextAreaElement | null>
  >({});
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    // Clear error for the field being edited
    const fieldName = e.target.name;
    if (
      fieldName === "email" ||
      fieldName === "instagram" ||
      fieldName === "portfolio" ||
      fieldName === "imageGallery"
    ) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
    setFormData({ ...formData, [fieldName]: e.target.value });
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInstagram = (
    instagram: string,
  ): { isValid: boolean; formatted: string; error: string } => {
    if (!instagram.trim()) {
      return { isValid: true, formatted: "", error: "" }; // Optional field
    }

    let username = instagram.trim();

    // Remove @ if present at the beginning
    username = username.replace(/^@/, "");

    // Remove any leading/trailing spaces
    username = username.trim();

    // Remove Instagram URL if user pasted full URL
    const urlMatch = username.match(
      /(?:instagram\.com\/|instagr\.am\/)([a-zA-Z0-9_.]+)/,
    );
    if (urlMatch) {
      username = urlMatch[1];
    }

    // Instagram username rules: letters, numbers, dots, underscores - 1-30 characters
    const instagramRegex = /^[a-zA-Z0-9_.]{1,30}$/;

    if (!instagramRegex.test(username)) {
      return {
        isValid: false,
        formatted: "",
        error:
          "Please enter a valid Instagram username (letters, numbers, dots, underscores only)",
      };
    }

    return { isValid: true, formatted: `@${username}`, error: "" };
  };

  const validatePortfolio = (
    portfolio: string,
  ): { isValid: boolean; formatted: string; error: string } => {
    if (!portfolio.trim()) {
      return { isValid: true, formatted: "", error: "" }; // Optional field
    }

    let url = portfolio.trim().replace(/\s/g, "");

    // Basic domain pattern check (must contain a dot and no spaces)
    if (!url.includes(".")) {
      return {
        isValid: false,
        formatted: "",
        error: "Please enter a valid website (e.g., janedoe.com)",
      };
    }

    // Add https:// if no protocol is present
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    // Simple URL validation after adding protocol
    try {
      new URL(url);
      return { isValid: true, formatted: url, error: "" };
    } catch {
      return {
        isValid: false,
        formatted: "",
        error: "Please enter a valid website URL",
      };
    }
  };

  const validateImageGallery = (
    gallery: string,
  ): { isValid: boolean; formatted: string; error: string } => {
    if (!gallery.trim()) {
      return { isValid: true, formatted: "", error: "" }; // Optional field
    }

    let url = gallery.trim().replace(/\s/g, "");

    // Add https:// if no protocol is present
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = `https://${url}`;
    }

    // Simple URL validation
    try {
      new URL(url);
      return { isValid: true, formatted: url, error: "" };
    } catch {
      return {
        isValid: false,
        formatted: "",
        error:
          "Please enter a valid URL (e.g., https://flickr.com/photos/username)",
      };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setErrors({ email: "", instagram: "", portfolio: "", imageGallery: "" });

    let hasError = false;
    let formattedInstagram = "";
    let formattedPortfolio = "";
    let formattedImageGallery = "";
    let firstInvalidField: string | null = null;

    // Validate email
    if (!formData.email.trim()) {
      setErrors((prev) => ({
        ...prev,
        email: "Email address is required",
      }));

      firstInvalidField ??= "email";
      hasError = true;
    } else if (!validateEmail(formData.email.trim())) {
      setErrors((prev) => ({
        ...prev,
        email: "Please enter a valid email address (e.g., name@domain.com)",
      }));
      firstInvalidField ??= "email";

      hasError = true;
    }

    // Validate Instagram
    const instagramValidation = validateInstagram(formData.instagram);
    if (!instagramValidation.isValid) {
      setErrors((prev) => ({ ...prev, instagram: instagramValidation.error }));
      firstInvalidField ??= "instagram";
      hasError = true;
    } else {
      formattedInstagram = instagramValidation.formatted;
    }

    // Validate portfolio
    const portfolioValidation = validatePortfolio(formData.portfolio);
    if (!portfolioValidation.isValid) {
      setErrors((prev) => ({ ...prev, portfolio: portfolioValidation.error }));
      firstInvalidField ??= "portfolio";
      hasError = true;
    } else {
      formattedPortfolio = portfolioValidation.formatted;
    }

    // Validate image gallery
    const galleryValidation = validateImageGallery(formData.imageGallery);
    if (!galleryValidation.isValid) {
      setErrors((prev) => ({ ...prev, imageGallery: galleryValidation.error }));
      hasError = true;
    } else {
      formattedImageGallery = galleryValidation.formatted;
    }

    if (!rightsAccepted) {
      setRightsError(
        "Please confirm that you own or control the rights to the photographs you may submit.",
      );

      firstInvalidField ??= "licenseAgreement";
      hasError = true;
    } else {
      setRightsError("");
    }

    if (hasError) {
      const element = firstInvalidField
        ? fieldRefs.current[firstInvalidField]
        : null;

      element?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      if (
        element instanceof HTMLInputElement ||
        element instanceof HTMLTextAreaElement
      ) {
        setTimeout(() => {
          element.focus();
        }, 300);
      }

      return;
    }

    // Build formatted email body
    const emailBody = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📷 NEW CONTRIBUTOR APPLICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Hello Mosaic Team,

A new photographer is interested in joining the archive.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  APPLICANT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Name: ${formData.name || "Not provided"}
• Email: ${formData.email || "Not provided"}
• Location: ${formData.location || "Not provided"}
• Instagram: ${formattedInstagram || "Not provided"}
• Portfolio: ${formattedPortfolio || "Not provided"}
• Image Gallery / Link: ${formattedImageGallery || "Not provided"}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  ARTISTIC STATEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${formData.message || "No message provided."}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RIGHTS CONFIRMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✓ Applicant confirmed ownership or control of rights
✓ Applicant confirmed authority to license submitted photographs
✓ Applicant confirmed required permissions have been obtained

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  APPLICATION DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

• Submitted via: Mosaic Contributors Form
• Date: ${new Date().toLocaleDateString()}
• Time: ${new Date().toLocaleTimeString()}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Please review this application and follow up with the photographer.

Mosaic Submission System
`.trim();

    const subject = encodeURIComponent(
      `📷 New Contributor Application: ${formData.name || "Anonymous"} - Mosaic Gallery`,
    );
    const body = encodeURIComponent(emailBody);

    window.location.href = `mailto:submissions@mosaic.photography?subject=${subject}&body=${body}`;

    // Reset form
    setFormData({
      name: "",
      email: "",
      location: "",
      instagram: "",
      portfolio: "",
      imageGallery: "",
      message: "",
    });
    setErrors({ email: "", instagram: "", portfolio: "", imageGallery: "" });
    setIsFormOpen(false);
  };

  return (
    <section className={styles.ctaSection}>
      <h3>Share Your Work</h3>

      <p>
        Mosaic welcomes photographers whose work aligns with the spirit of the
        archive: thoughtful image-making, strong visual storytelling, and a
        respect for photographic heritage.
      </p>

      <p>
        Contributors retain copyright to their work and choose the license under
        which their images are made available.
      </p>
      <p>
        Are you an analogue photographer? We are looking for submissions that
        honor the classic medium.
      </p>
      <button
        onClick={() => setIsFormOpen(!isFormOpen)}
        className={styles.ctaButton}
        aria-expanded={isFormOpen}
      >
        {isFormOpen ? "✕ Cancel" : "Apply to contribute"}
      </button>

      <div
        className={`${styles.formContainer} ${
          isFormOpen ? styles.formContainerOpen : ""
        }`}
      >
        <form
          onSubmit={handleSubmit}
          className={styles.applicationForm}
          noValidate
        >
          <div className={styles.formGroup}>
            <label htmlFor="name">Full name *</label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Jane Doe"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email address *</label>
            <input
              ref={(el) => {
                fieldRefs.current.email = el;
              }}
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="hello@janedoe.com"
              className={errors.email ? styles.errorInput : ""}
            />
            {errors.email && (
              <small className={styles.errorMessage}>{errors.email}</small>
            )}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="City, Country"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label htmlFor="instagram">Instagram</label>
              <input
                ref={(el) => {
                  fieldRefs.current.instagram = el;
                }}
                type="text"
                id="instagram"
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                placeholder="@username or instagram.com/username"
                className={errors.instagram ? styles.errorInput : ""}
              />
              {errors.instagram && (
                <small className={styles.errorMessage}>
                  {errors.instagram}
                </small>
              )}
              <small className={styles.hintText}>
                Accepts @username, username, or full Instagram URL
              </small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="portfolio">Portfolio / Website</label>
              <input
                ref={(el) => {
                  fieldRefs.current.portfolio = el;
                }}
                type="text"
                id="portfolio"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="janedoe.com or https://janedoe.com"
                className={errors.portfolio ? styles.errorInput : ""}
              />
              {errors.portfolio && (
                <small className={styles.errorMessage}>
                  {errors.portfolio}
                </small>
              )}
              <small className={styles.hintText}>
                Accepts with or without https:// or www.
              </small>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="imageGallery">
              Link to where images can be found
            </label>
            <input
              type="text"
              id="imageGallery"
              name="imageGallery"
              ref={(el) => {
                fieldRefs.current.imageGallery = el;
              }}
              value={formData.imageGallery}
              onChange={handleChange}
              placeholder="https://flickr.com/photos/username or https://dropbox.com/..."
              className={errors.imageGallery ? styles.errorInput : ""}
            />
            {errors.imageGallery && (
              <small className={styles.errorMessage}>
                {errors.imageGallery}
              </small>
            )}
            <small className={styles.hintText}>
              Flickr, Google Drive, Dropbox, personal gallery — any link to view
              your work
            </small>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message">
              Your experience with film photography, preferred gear and
              formats...
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us anything about you, your background, and your analogue work — artistic statement, favorite cameras, formats, or why you love shooting on film..."
              rows={4}
            />
          </div>
          <div className={styles.licenseNotice}>
            <h4>Rights & Licensing</h4>

            <p>
              By applying, you confirm that any photographs later submitted to
              Mosaic are your own work or that you have the necessary rights to
              license them.
            </p>

            <p>
              You also confirm that publication of the photographs does not
              knowingly infringe the rights of third parties and that any
              required permissions have been obtained where applicable.
            </p>
          </div>

          <div className={styles.checkboxGroup}>
            <label>
              <input
                type="checkbox"
                name="licenseAgreement"
                checked={rightsAccepted}
                onChange={(e) => {
                  setRightsAccepted(e.target.checked);
                  setRightsError("");
                }}
                ref={(el) => {
                  fieldRefs.current.licenseAgreement = el;
                }}
              />
              I confirm that I own or control the rights to the photographs I
              may submit and that I have authority to grant Mosaic permission to
              display them under the selected license.
            </label>

            {rightsError && (
              <small className={styles.errorMessage}>{rightsError}</small>
            )}
          </div>
          <button type="submit" className={styles.submitButton}>
            Preview & send application
          </button>
          <div className={styles.formFooter}>
            This will open your email client with a pre-filled message.
          </div>
        </form>
      </div>
    </section>
  );
}
