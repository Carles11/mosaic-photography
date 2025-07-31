"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Collection } from "@/types";
import styles from "./EditCollectionModal.module.css";

interface EditCollectionModalProps {
  isOpen: boolean;
  collection: Collection;
  onClose: () => void;
  onUpdateCollection: (collection: Collection) => void;
}

export default function EditCollectionModal({
  isOpen,
  collection,
  onClose,
  onUpdateCollection,
}: EditCollectionModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    // privacy: "private" as "private" | "public",
  });
  const [loading, setLoading] = useState(false);
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);
  const [privacyChangeDirection, setPrivacyChangeDirection] = useState<
    "toPublic" | "toPrivate" | null
  >(null);

  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name,
        description: collection.description || "",
        // privacy: collection.privacy,
      });
      // Reset warning states when collection changes
      setShowPrivacyWarning(false);
      setPrivacyChangeDirection(null);
    }
  }, [collection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    // Show privacy warning if changing privacy setting
    // const isPrivacyChanging = formData.privacy !== collection.privacy;
    if (!showPrivacyWarning) {
      // setPrivacyChangeDirection(
      //   formData.privacy === "public" ? "toPublic" : "toPrivate",
      // );
      setShowPrivacyWarning(true);
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("collections")
        .update({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          // privacy: formData.privacy,
        })
        .eq("id", collection.id)
        .select()
        .single();

      if (error) {
        console.error("Error updating collection:", error);
        alert("Failed to update collection. Please try again.");
        return;
      }

      onUpdateCollection(data);
      // setShowPrivacyWarning(false);
      // setPrivacyChangeDirection(null);
      console.log(
        "Collection updated successfully, loading should be false now",
      );
    } catch (error) {
      console.error("Error updating collection:", error);
      alert("Failed to update collection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      // setShowPrivacyWarning(false);
      // setPrivacyChangeDirection(null);
      onClose();
    }
  };

  const handlePrivacyChange = (privacy: "private" | "public") => {
    setFormData((prev) => ({ ...prev, privacy }));
    // setShowPrivacyWarning(false);
    // setPrivacyChangeDirection(null);
  };

  if (!isOpen || !collection) return null;

  const hasChanges =
    formData.name !== collection.name ||
    formData.description !== (collection.description || "");
  // ||
  // formData.privacy !== collection.privacy;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>Edit Collection</h2>
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

          {/* <div className={styles.field}>
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
 */}
          {/* {showPrivacyWarning && (
            <div className={styles.privacyWarning}>
              <div className={styles.warningIcon}>
                {privacyChangeDirection === "toPublic" ? "⚠️" : "🔒"}
              </div>
              <div className={styles.warningContent}>
                <h4>
                  {privacyChangeDirection === "toPublic"
                    ? "Make Collection Public?"
                    : "Make Collection Private?"}
                </h4>
                <p>
                  {privacyChangeDirection === "toPublic"
                    ? "This collection will become visible to anyone. Existing shares will continue to work."
                    : "This collection will become private and only visible to you. Any existing public shares will stop working."}
                </p>
                <div className={styles.warningActions}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPrivacyWarning(false);
                      setPrivacyChangeDirection(null);
                      setFormData((prev) => ({
                        ...prev,
                        privacy: collection.privacy,
                      }));
                    }}
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
                    {privacyChangeDirection === "toPublic"
                      ? "Make Public"
                      : "Make Private"}
                  </button>
                </div>
              </div>
            </div>
          )} */}

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
              className={styles.saveButton}
              disabled={loading || !formData.name.trim() || !hasChanges}
            >
              {loading ? (
                <span className={styles.loadingText}>
                  <span className={styles.spinner}></span>
                  Saving...
                </span>
              ) : showPrivacyWarning ? (
                "Confirm Changes"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
