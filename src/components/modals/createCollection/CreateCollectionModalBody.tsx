import React, { useState } from "react";
import type { ModalPropsMap } from "@/context/modalContext/modalRegistry";
import { useAuthSession } from "@/context/AuthSessionContext";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "react-hot-toast";
import styles from "./CreateCollectionModal.module.css";

const CreateCollectionModalBody: React.FC<
  ModalPropsMap["createCollection"]
> = ({ onClose, onCreateCollection }) => {
  const { user } = useAuthSession();
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name.trim()) return;
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
        toast.error("Failed to create collection. Please try again.");
        return;
      }
      onCreateCollection(data);
      toast.success("Collection created!");
      setFormData({ name: "", description: "" });
      onClose();
    } catch (err) {
      console.log({ err });
      toast.error("Failed to create collection. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.header}>
        <h2 className={styles.title}>Create New Collection</h2>
        <button
          onClick={onClose}
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
            onClick={onClose}
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
  );
};

export default CreateCollectionModalBody;
