import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import styles from "./EditCollectionModal.module.css";
import { supabase } from "@/lib/supabaseClient";
import type { ModalPropsMap } from "@/context/modalContext/modalRegistry";

const EditCollectionModalBody: React.FC<ModalPropsMap["editCollection"]> = ({
  collection,
  onClose,
  onUpdateCollection,
}) => {
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);
  const [showPrivacyWarning, setShowPrivacyWarning] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_privacyChangeDirection, setPrivacyChangeDirection] = useState<
    "toPublic" | "toPrivate" | null
  >(null);

  useEffect(() => {
    if (collection) {
      setFormData({
        name: collection.name,
        description: collection.description || "",
      });
      setShowPrivacyWarning(false);
      setPrivacyChangeDirection(null);
    }
  }, [collection]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    if (!showPrivacyWarning) {
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
        })
        .eq("id", collection.id)
        .select()
        .single();
      if (error) {
        toast.error("Failed to update collection. Please try again.");
        return;
      }
      onUpdateCollection(data);
      toast.success("Collection updated!");
    } catch (error) {
      console.log({ error });
      toast.error("Failed to update collection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) onClose();
  };

  const hasChanges =
    formData.name !== collection.name ||
    formData.description !== (collection.description || "");

  return (
    <div className={styles.modal}>
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
            autoFocus
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Description</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
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
  );
};

export default EditCollectionModalBody;
