"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuthSession } from "@/context/AuthSessionContext";
import { Collection } from "@/types";
import styles from "./CreateCollectionModal.module.css";

interface CreateCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCollection: (collection: Collection) => void;
}

export default function CreateCollectionModal({
  isOpen,
  onClose,
  onCreateCollection,
}: CreateCollectionModalProps) {
  const { user } = useAuthSession();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    privacy: "private" as "private" | "public",
  });
  const [loading, setLoading] = useState(false);
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !formData.name.trim()) {
      return;
    }

    // Show privacy warning if switching to public
    if (formData.privacy === "public" && !showPrivacyWarning) {
      setShowPrivacyWarning(true);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("collections")
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          privacy: formData.privacy,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        console.error("Error creating collection:", error);
        alert("Failed to create collection. Please try again.");
        return;
      }

      onCreateCollection(data);
      setFormData({ name: "", description: "", privacy: "private" });
      setShowPrivacyWarning(false);
    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Failed to create collection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", description: "", privacy: "private" });
      setShowPrivacyWarning(false);
      onClose();
    }
  };

  const handlePrivacyChange = (privacy: "private" | "public") => {
    setFormData((prev) => ({ ...prev, privacy }));
    setShowPrivacyWarning(false);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Create New Collection</h2>
          <button
            onClick={handleClose}
            className={styles.closeButton}
            disabled={loading}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Collection Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className={styles.input}
              placeholder="Enter collection name..."
              maxLength={100}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className={styles.textarea}
              placeholder="Optional description..."
              maxLength={500}
              rows={3}
              disabled={loading}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Privacy Setting</label>
            <div className={styles.privacyOptions}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="privacy"
                  value="private"
                  checked={formData.privacy === "private"}
                  onChange={() => handlePrivacyChange("private")}
                  disabled={loading}
                />
                <div className={styles.radioContent}>
                  <div className={styles.radioHeader}>
                    <span className={styles.radioIcon}>🔒</span>
                    <span className={styles.radioTitle}>Private</span>
                  </div>
                  <span className={styles.radioDescription}>
                    Only you can see this collection
                  </span>
                </div>
              </label>

              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="privacy"
                  value="public"
                  checked={formData.privacy === "public"}
                  onChange={() => handlePrivacyChange("public")}
                  disabled={loading}
                />
                <div className={styles.radioContent}>
                  <div className={styles.radioHeader}>
                    <span className={styles.radioIcon}>🌐</span>
                    <span className={styles.radioTitle}>Public</span>
                  </div>
                  <span className={styles.radioDescription}>
                    Anyone can view this collection
                  </span>
                </div>
              </label>
            </div>
          </div>

          {showPrivacyWarning && (
            <div className={styles.privacyWarning}>
              <div className={styles.warningIcon}>⚠️</div>
              <div className={styles.warningContent}>
                <h4>Make Collection Public?</h4>
                <p>
                  This collection will be visible to anyone. You can change this
                  setting later.
                </p>
                <div className={styles.warningActions}>
                  <button
                    type="button"
                    onClick={() => setShowPrivacyWarning(false)}
                    className={styles.cancelWarningButton}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={styles.confirmWarningButton}
                    disabled={loading}
                  >
                    Make Public & Create
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className={styles.actions}>
            <button
              type="button"
              onClick={handleClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.createButton}
              disabled={loading || !formData.name.trim()}
            >
              {loading ? (
                <span className={styles.loadingText}>
                  <span className={styles.spinner}></span>
                  Creating...
                </span>
              ) : showPrivacyWarning ? (
                "Confirm & Create"
              ) : (
                "Create Collection"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
