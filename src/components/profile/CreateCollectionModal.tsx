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
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !formData.name.trim()) {
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("collections")
        .insert({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
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
      setFormData({ name: "", description: "" });
    } catch (error) {
      console.error("Error creating collection:", error);
      alert("Failed to create collection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setFormData({ name: "", description: "" });
      onClose();
    }
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
