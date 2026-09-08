import { Select } from "./field";
import { Skeleton } from "./Skeleton";

interface CatalogOption {
  value: string;
  label: string;
}

interface CatalogSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: CatalogOption[];
  loading?: boolean;
  emptyLabel?: string;
  error?: string;
  /** Label used when `value` is not in `options` but matches this legacy list. */
  legacyOptions?: CatalogOption[];
}

function displayLabel(
  value: string,
  options: CatalogOption[],
  legacyOptions: CatalogOption[],
  emptyLabel?: string,
): string | undefined {
  if (!value) {
    return emptyLabel !== undefined ? emptyLabel : undefined;
  }
  const exact = options.find((o) => o.value === value);
  if (exact) {
    return exact.label;
  }
  const legacy = legacyOptions.find((o) => o.value === value);
  return legacy ? legacy.label : undefined;
}

/** Dropdown fed by a story-options catalog (value = catalog id). */
export function CatalogSelect({
  label,
  value,
  onChange,
  options,
  loading = false,
  emptyLabel = "—",
  error,
  legacyOptions = [],
}: CatalogSelectProps) {
  if (loading) {
    return (
      <div className="space-y-1.5">
        <p className="text-sm font-medium text-fg">{label}</p>
        <Skeleton className="h-11" />
      </div>
    );
  }

  const display = displayLabel(value, options, legacyOptions, emptyLabel);

  return (
    <Select
      label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as string)}
      error={error}
      displayLabel={display}
    >
      {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
}