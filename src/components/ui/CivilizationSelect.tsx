import { useMemo, useState } from "react";
import { Input } from "./field";
import {
  CIVILIZATIONS_BY_REGION,
  getCivilizationLabel,
} from "../../constants/civilizations";

interface CivilizationOption {
  value: string;
  label: string;
  legacyValue?: string | null;
}

interface CivilizationSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  searchPlaceholder: string;
  options?: CivilizationOption[];
}

/** Civilizations are grouped by region and searchable from the result list. */
export function CivilizationSelect({
  label,
  value,
  onChange,
  searchPlaceholder,
  options = [],
}: CivilizationSelectProps) {
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const isSearching = searchOpen || value === "UNSPECIFIED";
  const normalized = query.trim().toLowerCase();
  const availableOptions = useMemo(
    (): CivilizationOption[] =>
      options.length > 0
        ? options
        : CIVILIZATIONS_BY_REGION.flatMap((region) =>
            region.options.map((option) => ({
              value: option.value,
              label: option.label,
              legacyValue: option.value,
            })),
          ),
    [options],
  );

  const regions = useMemo(() => {
    const filtered = normalized
      ? availableOptions.filter((option) =>
          option.label.toLowerCase().includes(normalized),
        )
      : availableOptions;
    return filtered.length > 0
      ? [{ id: "Civilizations", options: filtered }]
      : [];
  }, [availableOptions, normalized]);
  const hasMatches = regions.length > 0;
  const selectedLabel =
    availableOptions.find(
      (option) => option.value === value || option.legacyValue === value,
    )?.label ??
    getCivilizationLabel(value) ??
    value;

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-fg">{label}</p>
      {!isSearching ? (
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-brand-500/50 bg-brand-500/10 px-4 py-2.5 text-start text-sm font-medium text-brand-700 transition-colors hover:bg-brand-500/15 dark:text-brand-300"
          aria-label={`${selectedLabel}. ${searchPlaceholder}`}
        >
          <span>{selectedLabel}</span>
          <span className="text-xs text-fg-muted">{searchPlaceholder}</span>
        </button>
      ) : (
        <>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            className="py-1.5 text-xs"
            aria-label={searchPlaceholder}
            autoFocus={searchOpen && value !== "UNSPECIFIED"}
          />
          <div
            className="max-h-64 overflow-y-auto rounded-lg border border-border bg-surface-2 p-1"
            role="listbox"
            aria-label={label}
          >
            {regions.map((region) => (
              <div key={region.id}>
                <p className="px-3 pb-1 pt-2 text-[0.65rem] font-semibold uppercase tracking-wide text-fg-faint">
                  {region.id}
                </p>
                {region.options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={value === option.value}
                    onClick={() => {
                      onChange(option.value);
                      setQuery("");
                      setSearchOpen(false);
                    }}
                    className={`block w-full rounded-md px-3 py-2 text-start text-sm transition-colors hover:bg-brand-500/10 ${
                      value === option.value
                        ? "bg-brand-500/15 font-medium text-brand-700 dark:text-brand-300"
                        : "text-fg"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ))}
            {!hasMatches && normalized && (
              <p className="px-3 py-3 text-xs text-fg-muted">
                No civilizations match "{query.trim()}". Try a different search.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
