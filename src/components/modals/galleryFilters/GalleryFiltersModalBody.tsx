import React, { useState } from "react";
import { GalleryFilter } from "@/types";
import styles from "./GalleryFiltersModalBody.module.css";
import { YearPicker } from "@/components/pickers/date/datePicker";

type Props = {
  filters: GalleryFilter;
  onApply: (filters: GalleryFilter) => void;
  onClose: () => void;
};

const orientationOptions = [
  { value: "vertical", label: "Vertical" },
  { value: "horizontal", label: "Horizontal" },
];
const colorOptions = [
  { value: "bw", label: "Black & White / Sepia" },
  { value: "color", label: "Color" },
];
const nudityOptions = [
  { value: "nude", label: "Nude" },
  { value: "not-nude", label: "Not Nude" },
];
const genderOptions = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "mixed", label: "Only mixed couples" },
];
const printQualityOptions = [
  { value: "standard", label: "Standard" },
  { value: "good", label: "Good" },
  { value: "excellent", label: "Excellent" },
  { value: "professional", label: "Professional" },
];

export default function GalleryFiltersModalBody({
  filters,
  onApply,
  onClose,
}: Props) {
  const [localFilters, setLocalFilters] = useState<GalleryFilter>(filters);

  const minYear = 1800;
  const maxYear = 2000;

  function handleYearSelect(year: number, bound: "from" | "to") {
    setLocalFilters({
      ...localFilters,
      year: {
        from: bound === "from" ? year : localFilters.year?.from ?? minYear,
        to: bound === "to" ? year : localFilters.year?.to ?? maxYear,
      },
    });
  }

  return (
    <div className={styles.modalBody}>
      <h2 className={styles.heading}>Gallery Filters</h2>

      <div className={styles.field}>
        <label className={styles.label}>Orientation:</label>
        <select
          className={styles.select}
          value={localFilters.orientation ?? ""}
          onChange={(e) =>
            setLocalFilters({
              ...localFilters,
              orientation: e.target.value
                ? (e.target.value as "vertical" | "horizontal")
                : null,
            })
          }
        >
          <option value="">Include all orientations</option>
          {orientationOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Image Color:</label>
        <select
          className={styles.select}
          value={localFilters.color ?? ""}
          onChange={(e) =>
            setLocalFilters({
              ...localFilters,
              color: e.target.value ? (e.target.value as "bw" | "color") : null,
            })
          }
        >
          <option value="">Include all</option>
          {colorOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Nudity:</label>
        <select
          className={styles.select}
          value={localFilters.nudity ?? ""}
          onChange={(e) =>
            setLocalFilters({
              ...localFilters,
              nudity: e.target.value
                ? (e.target.value as "nude" | "not-nude")
                : null,
            })
          }
        >
          <option value="">Show all types</option>
          {nudityOptions.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Gender:</label>
        <select
          className={styles.select}
          value={localFilters.gender ?? ""}
          onChange={(e) =>
            setLocalFilters({
              ...localFilters,
              gender: e.target.value
                ? (e.target.value as "female" | "male" | "mixed")
                : null,
            })
          }
        >
          <option value="">Include all genders</option>
          {genderOptions.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Print Quality:</label>
        <select
          className={styles.select}
          value={localFilters.print_quality ?? ""}
          onChange={(e) =>
            setLocalFilters({
              ...localFilters,
              print_quality: e.target.value
                ? (e.target.value as
                    | "good"
                    | "standard"
                    | "excellent"
                    | "professional")
                : null,
            })
          }
        >
          <option value="">Any</option>
          {printQualityOptions.map((pq) => (
            <option key={pq.value} value={pq.value}>
              {pq.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>Year:</label>
        <div className={styles.yearRow}>
          <YearPicker
            selectedYear={localFilters.year?.from}
            onYearSelect={(year) => handleYearSelect(year, "from")}
            fromYear={minYear}
            toYear={maxYear}
          />
          <span className={styles.yearSeparator}>to</span>
          <YearPicker
            selectedYear={localFilters.year?.to}
            onYearSelect={(year) => handleYearSelect(year, "to")}
            fromYear={minYear}
            toYear={maxYear}
          />
        </div>
      </div>

      <div className={styles.buttonRow}>
        <button
          className={styles.applyButton}
          onClick={() => {
            onApply(localFilters);
            onClose();
          }}
        >
          Apply
        </button>
        <button className={styles.cancelButton} onClick={onClose}>
          Cancel
        </button>
      </div>
    </div>
  );
}
