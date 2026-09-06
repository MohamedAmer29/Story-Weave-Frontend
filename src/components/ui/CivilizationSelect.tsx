import { useMemo, useState } from "react";
import { Input, Select } from "./field";
import {
  CIVILIZATIONS_BY_REGION,
  type StoryCivilization,
} from "../../constants/civilizations";

interface CivilizationSelectProps {
  label: string;
  value: StoryCivilization;
  onChange: (value: StoryCivilization) => void;
  searchPlaceholder: string;
}

/**
 * Civilizations are grouped by region and searchable, since the full list is
 * large. When no query is entered the native select renders <optgroup>s in
 * canonical display order; typing filters the options (while always offering
 * the reset-to-Unspecified choice).
 */
export function CivilizationSelect({
  label,
  value,
  onChange,
  searchPlaceholder,
}: CivilizationSelectProps) {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLowerCase();

  const regions = useMemo(() => {
    if (!normalized) {
      return CIVILIZATIONS_BY_REGION;
    }
    return CIVILIZATIONS_BY_REGION.map((region) => ({
      ...region,
      options: region.options.filter((o) =>
        o.label.toLowerCase().includes(normalized),
      ),
    })).filter((region) => region.options.length > 0);
  }, [normalized]);

  return (
    <div className="space-y-2">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={searchPlaceholder}
        className="py-1.5 text-xs"
        aria-label={searchPlaceholder}
      />
      <Select
        label={label}
        value={value}
        onChange={(e) => onChange(e.target.value as StoryCivilization)}
      >
        {normalized && <option value="UNSPECIFIED">Unspecified</option>}
        {regions.map((region) => (
          <optgroup key={region.id} label={region.id}>
            {region.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ))}
      </Select>
    </div>
  );
}