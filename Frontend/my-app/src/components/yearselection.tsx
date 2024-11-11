// YearSelection.tsx
import React from "react";

const YearSelection = ({ setSelectedYear }: { setSelectedYear: React.Dispatch<React.SetStateAction<number | null>> }) => {
  return (
    <select onChange={(e) => setSelectedYear(Number(e.target.value))}>
      <option value="">Select Year</option>
      {Array.from({ length: 8 }, (_, i) => 2016 + i).map((year) => (
        <option key={year} value={year}>
          {year}
        </option>
      ))}
    </select>
  );
};

export default YearSelection;
