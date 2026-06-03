// app/contributors/ContributorClient.tsx
"use client";

import { useState } from "react";
import styles from "./Contributors.module.css";

export default function ContributorClient() {
  const [isFormOpen, setIsFormOpen] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    portfolio: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const subject = encodeURIComponent(
      `Contributor Application - ${formData.name || "New Applicant"}`,
    );
    const body = encodeURIComponent(
      `Name: ${formData.name || "Not provided"}\n` +
        `Email: ${formData.email || "Not provided"}\n` +
        `Location: ${formData.location || "Not provided"}\n` +
        `Portfolio/Website: ${formData.portfolio || "Not provided"}\n\n` +
        `--- Message / Artistic Statement ---\n${formData.message || "No message provided."}\n\n` +
        `---\nSubmitted via Mosaic contributors form`,
    );

    window.location.href = `mailto:submissions@mosaicphotography.com?subject=${subject}&body=${body}`;

    // Optional: reset form
    setFormData({
      name: "",
      email: "",
      location: "",
      portfolio: "",
      message: "",
    });
    setIsFormOpen(false);
  };

  return (
    <section className={styles.ctaSection}>
      <h3>Join the Archive</h3>
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
        <form onSubmit={handleSubmit} className={styles.applicationForm}>
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
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="hello@janedoe.com"
            />
          </div>

          <div className={styles.formRow}>
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
            <div className={styles.formGroup}>
              <label htmlFor="portfolio">Portfolio / Website</label>
              <input
                type="url"
                id="portfolio"
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://janedoe.com"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="message">
              Your experience with film photography, preferred formats...
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Tell us anything about you and your analogue work — artistic statement, favorite cameras, formats, or why you love shooting on film..."
              rows={4}
            />
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
