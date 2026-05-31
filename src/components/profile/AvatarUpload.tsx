"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import styles from "./AvatarUpload.module.css";

interface AvatarUploadProps {
  userId: string;
  displayName?: string;
  currentAvatarUrl?: string | null;
  onUploadSuccess: (newUrl: string) => void;
  onDeleteSuccess: () => void;
}

export default function AvatarUpload({
  userId,
  displayName,
  currentAvatarUrl,
  onUploadSuccess,
  onDeleteSuccess,
}: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    currentAvatarUrl ?? null,
  );

  const initial = displayName?.trim()?.[0]?.toUpperCase() ?? "?";
  const busy = uploading || deleting;

  const handleClick = () => {
    if (!busy) inputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    try {
      const path = `${userId}/avatar.jpg`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          contentType: "image/jpeg",
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      const publicUrl = `${urlData.publicUrl}?t=${Date.now()}`;

      const { error: dbError } = await supabase
        .from("user_profiles")
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (dbError) throw dbError;

      setPreviewUrl(publicUrl);
      onUploadSuccess(publicUrl);
    } catch (err) {
      console.error("Avatar upload error:", err);
      setError("Upload failed. Please try again.");
      setPreviewUrl(currentAvatarUrl ?? null);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);

    try {
      const path = `${userId}/avatar.jpg`;

      const { error: storageError } = await supabase.storage
        .from("avatars")
        .remove([path]);

      if (storageError) throw storageError;

      const { error: dbError } = await supabase
        .from("user_profiles")
        .update({ avatar_url: null, updated_at: new Date().toISOString() })
        .eq("id", userId);

      if (dbError) throw dbError;

      setPreviewUrl(null);
      onDeleteSuccess();
    } catch (err) {
      console.error("Avatar delete error:", err);
      setError("Could not remove avatar. Please try again.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <button
        type="button"
        className={styles.avatarButton}
        onClick={handleClick}
        aria-label="Change profile picture"
        disabled={busy}
      >
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt="Profile avatar"
            width={96}
            height={96}
            className={styles.avatarImage}
            unoptimized
          />
        ) : (
          <span className={styles.initial} aria-hidden="true">
            {initial}
          </span>
        )}

        <span className={styles.overlay} aria-hidden="true">
          {uploading ? (
            <span className={styles.spinner} />
          ) : (
            <span className={styles.cameraIcon}>&#9998;</span>
          )}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={handleFileChange}
        tabIndex={-1}
        aria-hidden="true"
      />

      {previewUrl && (
        <button
          type="button"
          className={styles.removeButton}
          onClick={handleDelete}
          disabled={busy}
          aria-label="Remove profile picture"
        >
          {deleting ? "Removing…" : "Remove photo"}
        </button>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
