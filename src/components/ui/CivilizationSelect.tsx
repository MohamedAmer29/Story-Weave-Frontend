import { useMemo, useState } from "react";
import { Input } from "./field";
import {
  CIVILIZATIONS_BY_REGION,
  getCivilizationLabel,
} from "../../constants/civilizations";
import { useLanguage } from "../../i18n";

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

const VALUE_TO_REGION = new Map<string, string>();
const LABEL_TO_REGION = new Map<string, string>();
for (const group of CIVILIZATIONS_BY_REGION) {
  for (const option of group.options) {
    VALUE_TO_REGION.set(option.value, group.id);
    LABEL_TO_REGION.set(option.label, group.id);
  }
}

/** Real-world regions stay in the "Civilization" tab; fantasy and generic
 * custom/other selections live in the "Custom / Fantasy" tab. */
const FANTASY_REGIONS = new Set(["Fantasy", "Custom", "Other"]);

function optionRegion(option: CivilizationOption): string {
  if (option.legacyValue) {
    const region = VALUE_TO_REGION.get(option.legacyValue);
    if (region) return region;
  }
  return LABEL_TO_REGION.get(option.label) ?? "";
}

function isFantasyOption(option: CivilizationOption): boolean {
  return FANTASY_REGIONS.has(optionRegion(option));
}

type Tab = "civilization" | "fantasy";

/** Civilizations are grouped by tab (real vs fantasy/custom) and searchable
 * from the result list. */
export function CivilizationSelect({
  label,
  value,
  onChange,
  searchPlaceholder,
  options = [],
}: CivilizationSelectProps) {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("civilization");
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

  const { civilizationOptions, fantasyOptions } = useMemo(() => {
    const real: CivilizationOption[] = [];
    const fantasy: CivilizationOption[] = [];
    for (const option of availableOptions) {
      if (isFantasyOption(option)) fantasy.push(option);
      else real.push(option);
    }
    return { civilizationOptions: real, fantasyOptions: fantasy };
  }, [availableOptions]);

  const openSearch = () => {
    setTab(
      availableOptions.some(
        (option) =>
          isFantasyOption(option) &&
          (option.value === value || option.legacyValue === value),
      )
        ? "fantasy"
        : "civilization",
    );
    setSearchOpen(true);
  };

  const activeOptions =
    tab === "civilization" ? civilizationOptions : fantasyOptions;
  const filtered = normalized
    ? activeOptions.filter((option) =>
        option.label.toLowerCase().includes(normalized),
      )
    : activeOptions;
  const regions = filtered.length > 0
    ? [
        {
          id: tab === "civilization" ? t.create.civilization : t.create.customCivilization,
          options: filtered,
        },
      ]
    : [];
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
          onClick={openSearch}
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
            className="mb-2 grid grid-cols-2 gap-1 rounded-lg border border-border bg-surface-1 p-1"
            role="tablist"
            aria-label={label}
          >
            <button
              type="button"
              role="tab"
              aria-selected={tab === "civilization"}
              onClick={() => setTab("civilization")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === "civilization"
                  ? "bg-brand-500/15 text-brand-700 dark:text-brand-300"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              {t.create.civilization}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={tab === "fantasy"}
              onClick={() => setTab("fantasy")}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                tab === "fantasy"
                  ? "bg-brand-500/15 text-brand-700 dark:text-brand-300"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              {t.create.customCivilization}
            </button>
          </div>
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