import React from "react";
import "react-day-picker/dist/style.css";

type YearPickerProps = {
  selectedYear?: number;
  onYearSelect: (year: number) => void;
  fromYear?: number;
  toYear?: number;
};

export const YearPicker: React.FC<YearPickerProps> = ({
  selectedYear,
  onYearSelect,
  fromYear = 2000,
  toYear = new Date().getFullYear(),
}) => {
  // Generate array of years for dropdown
  const years = [];
  for (let y = fromYear; y <= toYear; y++) {
    years.push(y);
  }

  return (
    <select
      value={selectedYear ?? ""}
      onChange={(e) => onYearSelect(Number(e.target.value))}
      style={{ padding: "0.5em", fontSize: "1em" }}
    >
      <option value="">Select year</option>
      {years.map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
};
