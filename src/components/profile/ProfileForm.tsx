"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { supabase, SupabaseUser } from "@/lib/supabaseClient";
import { useFavorites } from "@/context/FavoritesContext";
import type { UserProfile } from "@/types";
import styles from "./ProfileForm.module.css";

interface ProfileFormProps {
  user: SupabaseUser;
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const { favorites } = useFavorites();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    instagram: "",
    website: "",
    own_store_name: "",
    own_store_url: "",
  });

  const [databaseError, setDatabaseError] = useState(false);

  const createInitialProfile = useCallback(async () => {
    // Don't try to create profile if we know the database table doesn't exist
    if (databaseError) {
      return;
    }

    try {
      const newProfile = {
        id: user.id,
        name: "",
        instagram: "",
        website: "",
        own_store_name: "",
        own_store_url: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("user_profiles")
        .insert([newProfile])
        .select()
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        if (error.code === "42P01") {
          // relation does not exist
          console.warn(
            "user_profiles table doesn't exist yet. Please run the database migrations.",
          );
          setDatabaseError(true);
          setMessage({
            type: "error",
            text: "Database setup required. Please see instructions below.",
          });
        }
      } else if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error("Error creating initial profile:", error);
    }
  }, [databaseError, user.id]);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        console.error("Error loading profile:", error);
        // If the table doesn't exist, we'll handle it gracefully
        if (error.code === "42P01") {
          // relation does not exist
          console.warn(
            "user_profiles table doesn't exist yet. Please run the database migrations.",
          );
          setDatabaseError(true);
          setMessage({
            type: "error",
            text: "Database setup required. Please see instructions below.",
          });
          return; // Exit early, don't try to create profile
        } else {
          setMessage({ type: "error", text: "Failed to load profile" });
        }
      } else if (data) {
        setProfile(data);
        setFormData({
          name: data.name || "",
          instagram: data.instagram || "",
          website: data.website || "",
          own_store_name: data.own_store_name || "",
          own_store_url: data.own_store_url || "",
        });
      } else {
        // No profile exists yet, create a basic one
        await createInitialProfile();
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      setMessage({ type: "error", text: "Failed to load profile" });
    } finally {
      setLoading(false);
    }
  }, [user.id, databaseError, createInitialProfile]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Don't try to submit if we know the database table doesn't exist
    if (databaseError) {
      setMessage({ type: "error", text: "Please set up the database first." });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const updatedProfile = {
        ...formData,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("user_profiles")
        .upsert([{ id: user.id, ...updatedProfile }], { onConflict: "id" });

      if (error) {
        console.error("Error updating profile:", error);
        if (error.code === "42P01") {
          // relation does not exist
          setDatabaseError(true);
          setMessage({
            type: "error",
            text: "Database setup required. Please see instructions below.",
          });
        } else {
          setMessage({ type: "error", text: "Failed to update profile" });
        }
      } else {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        await loadProfile(); // Reload to get the latest data
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      setMessage({ type: "error", text: "Failed to update profile" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {databaseError && (
        <div className={styles.databaseSetup}>
          <h3>🔧 Database Setup Required</h3>
          <p>
            To use the profile functionality, you need to create the database
            table first.
          </p>
          <details className={styles.instructions}>
            <summary>Click here for setup instructions</summary>
            <ol>
              <li>
                Go to your{" "}
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Supabase Dashboard
                </a>
              </li>
              <li>
                Navigate to the <strong>SQL Editor</strong> tab
              </li>
              <li>
                Copy and paste the SQL from <code>DATABASE_SETUP.md</code>
              </li>
              <li>Click &quot;Run&quot; to execute the SQL</li>
              <li>Refresh this page</li>
            </ol>
            <p>
              The SQL file is located in your project root:{" "}
              <code>DATABASE_SETUP.md</code>
            </p>
          </details>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Account Information</h2>
        <div className={styles.infoItem}>
          <span className={styles.label}>Email:</span>
          <span className={styles.value}>{user.email}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Member since:</span>
          <span className={styles.value}>
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString()
              : "N/A"}
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.label}>Favorites:</span>
          <span className={styles.value}>{favorites.size} images</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.sectionTitle}>Profile Details</h2>

        {databaseError && (
          <div className={styles.disabledForm}>
            <p>⚠️ Form disabled until database setup is complete</p>
          </div>
        )}

        <div className={styles.field}>
          <label htmlFor="name" className={styles.label}>
            Display Name
          </label>
          <input
            type="text"
            id="name"
            className={styles.input}
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            placeholder="Enter your display name"
            maxLength={100}
            disabled={databaseError}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="instagram" className={styles.label}>
            Instagram
          </label>
          <div className={styles.inputWrapper}>
            <span className={styles.prefix}>@</span>
            <input
              type="text"
              id="instagram"
              className={`${styles.input} ${styles.inputWithPrefix}`}
              value={formData.instagram}
              onChange={(e) =>
                handleInputChange("instagram", e.target.value.replace("@", ""))
              }
              placeholder="your_username"
              maxLength={30}
              disabled={databaseError}
            />
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="website" className={styles.label}>
            Website
          </label>
          <input
            type="url"
            id="website"
            className={styles.input}
            value={formData.website}
            onChange={(e) => handleInputChange("website", e.target.value)}
            placeholder="https://yourwebsite.com"
            disabled={databaseError}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="own_store_name" className={styles.label}>
            Store Name
          </label>
          <input
            type="text"
            id="own_store_name"
            className={styles.input}
            value={formData.own_store_name}
            onChange={(e) =>
              handleInputChange("own_store_name", e.target.value)
            }
            placeholder="Enter your store name"
            maxLength={100}
            disabled={databaseError}
          />
        </div>

        <div className={styles.field}>
          <label htmlFor="own_store_url" className={styles.label}>
            Store URL
          </label>
          <input
            type="url"
            id="own_store_url"
            className={styles.input}
            value={formData.own_store_url}
            onChange={(e) => handleInputChange("own_store_url", e.target.value)}
            placeholder="https://yourstore.com"
            disabled={databaseError}
          />
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={saving || databaseError}
        >
          {saving
            ? "Saving..."
            : databaseError
              ? "Database Setup Required"
              : "Update Profile"}
        </button>
      </form>

      {/* Quick Access Section */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Quick Access</h2>
        <div className={styles.quickAccess}>
          <Link
            href="/my-content?tab=favorites"
            className={styles.quickAccessItem}
          >
            <span className={styles.quickAccessIcon}>♡</span>
            <div className={styles.quickAccessContent}>
              <h3>My Favorites</h3>
              <p>{favorites.size} saved images</p>
            </div>
          </Link>

          <Link
            href="/my-content?tab=collections"
            className={styles.quickAccessItem}
          >
            <span className={styles.quickAccessIcon}>📚</span>
            <div className={styles.quickAccessContent}>
              <h3>My Collections</h3>
              <p>Organized image sets</p>
            </div>
          </Link>

          <Link
            href="/my-content?tab=comments"
            className={styles.quickAccessItem}
          >
            <span className={styles.quickAccessIcon}>💬</span>
            <div className={styles.quickAccessContent}>
              <h3>My Comments</h3>
              <p>Your gallery interactions</p>
            </div>
          </Link>
        </div>

        <div className={styles.quickAccessFullLink}>
          <Link href="/my-content" className={styles.viewAllButton}>
            View All My Content →
          </Link>
        </div>
      </div>
    </div>
  );
}
