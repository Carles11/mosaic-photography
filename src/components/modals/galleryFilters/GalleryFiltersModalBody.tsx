import React, { useState } from "react";
import { GalleryFilter } from "@/types";

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
  { value: "mixed", label: "Mixed" },
];
const printQualityOptions = [
  { value: "good", label: "Good" },
  { value: "standard", label: "Standard" },
  { value: "excellent", label: "Excellent" },
  { value: "professional", label: "Professional" },
];

export default function GalleryFiltersModalBody({
  filters,
  onApply,
  onClose,
}: Props) {
  const [localFilters, setLocalFilters] = useState<GalleryFilter>(filters);

  // For the year slider, set some reasonable defaults
  const minYear = 1830;
  const maxYear = 2000;

  function handleYearChange(
    e: React.ChangeEvent<HTMLInputElement>,
    bound: "from" | "to"
  ) {
    const value = parseInt(e.target.value) || minYear;
    setLocalFilters({
      ...localFilters,
      year: {
        from: bound === "from" ? value : localFilters.year?.from ?? minYear,
        to: bound === "to" ? value : localFilters.year?.to ?? maxYear,
      },
    });
  }

  return (
    <div style={{ padding: "2rem", minWidth: 300 }}>
      <h2>Gallery Filters</h2>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>Orientation:</label>
        <select
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
          <option value="">Any</option>
          {orientationOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>Image Color:</label>
        <select
          value={localFilters.color ?? ""}
          onChange={(e) =>
            setLocalFilters({
              ...localFilters,
              color: e.target.value ? (e.target.value as "bw" | "color") : null,
            })
          }
        >
          <option value="">Any</option>
          {colorOptions.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>Nudity:</label>
        <select
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
          <option value="">Any</option>
          {nudityOptions.map((n) => (
            <option key={n.value} value={n.value}>
              {n.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>Gender:</label>
        <select
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
          <option value="">Any</option>
          {genderOptions.map((g) => (
            <option key={g.value} value={g.value}>
              {g.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "1.5rem" }}>
        <label>Print Quality:</label>
        <select
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

      <div style={{ marginBottom: "1.5rem" }}>
        <label>Year:</label>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <input
            type="number"
            min={minYear}
            max={maxYear}
            value={localFilters.year?.from ?? minYear}
            onChange={(e) => handleYearChange(e, "from")}
            style={{ width: 80 }}
          />
          <span>to</span>
          <input
            type="number"
            min={minYear}
            max={maxYear}
            value={localFilters.year?.to ?? maxYear}
            onChange={(e) => handleYearChange(e, "to")}
            style={{ width: 80 }}
          />
        </div>
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        <button
          onClick={() => {
            onApply(localFilters);
            onClose();
          }}
          style={{ padding: "0.5rem 1.5rem" }}
        >
          Apply
        </button>
        <button onClick={onClose} style={{ padding: "0.5rem 1.5rem" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}
