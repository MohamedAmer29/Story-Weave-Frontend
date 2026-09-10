import { useEffect, useMemo, useRef, useState } from "react";
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

const VALUE_TO_REGION = new Map<string, string>();
const LABEL_TO_REGION = new Map<string, string>();
for (const group of CIVILIZATIONS_BY_REGION) {
  for (const option of group.options) {
    VALUE_TO_REGION.set(option.value, group.id);
    LABEL_TO_REGION.set(option.label, group.id);
  }
}

function regionFor(option: CivilizationOption): string {
  if (option.legacyValue) {
    const region = VALUE_TO_REGION.get(option.legacyValue);
    if (region) return region;
  }
  return LABEL_TO_REGION.get(option.label) ?? "Custom";
}

/** The select is backed by free text. Catalog ids / legacy enum values are
 * displayed as their human label so a saved story still reads correctly. */
function displayName(
  raw: string | undefined,
  options: CivilizationOption[],
): string {
  if (!raw || raw === "UNSPECIFIED") return "";
  const byValue = options.find((o) => o.value === raw);
  if (byValue) return byValue.label;
  const byLegacy = options.find((o) => o.legacyValue === raw);
  if (byLegacy) return byLegacy.label;
  return getCivilizationLabel(raw) ?? raw;
}

/** Search-as-you-type civilization field. Whatever text is in the input is the
 * committed value — selecting a suggestion just fills the input with its text. */
export function CivilizationSelect({
  label,
  value,
  onChange,
  searchPlaceholder,
  options = [],
}: CivilizationSelectProps) {
  const availableOptions = useMemo<CivilizationOption[]>(
    () =>
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

  const [query, setQuery] = useState(() =>
    displayName(value, availableOptions),
  );
  const [open, setOpen] = useState(false);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setQuery(displayName(value, availableOptions));
  }, [value, availableOptions]);

  const normalized = query.trim().toLowerCase();
  const matched = normalized
    ? availableOptions.filter((option) =>
        option.label.toLowerCase().includes(normalized),
      )
    : availableOptions;

  const groups: { region: string; items: CivilizationOption[] }[] = [];
  for (const option of matched) {
    const region = regionFor(option);
    const group = groups.find((g) => g.region === region);
    if (group) group.items.push(option);
    else groups.push({ region, items: [option] });
  }

  const commit = (text: string) => {
    const trimmed = text.trim();
    onChange(trimmed === "UNSPECIFIED" ? "" : trimmed);
  };

  const selectOption = (option: CivilizationOption) => {
    setQuery(option.label);
    setOpen(false);
    commit(option.label);
  };

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-fg">{label}</p>
      <div className="relative">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            commit(e.target.value);
          }}
          onFocus={() => {
            focused.current = true;
            setOpen(true);
          }}
          onBlur={() => {
            focused.current = false;
            setOpen(false);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              commit(query);
              setOpen(false);
              (e.target as HTMLInputElement).blur();
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
        />
        {open && normalized && (
          <div
            className="absolute inset-x-0 top-full z-30 mt-1.5 max-h-64 overflow-y-auto rounded-xl border border-border bg-surface p-1.5 shadow-xl dark:bg-surface-2"
            role="listbox"
            aria-label={label}
          >
            <button
              type="button"
              role="option"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                setQuery(query.trim());
                setOpen(false);
                commit(query);
              }}
              className="mb-1 block w-full rounded-lg border-b border-border/60 px-3 py-2 text-start text-sm font-medium text-brand-700 transition-colors hover:bg-brand-500/10 dark:text-brand-300"
            >
              Use "{query.trim()}" as custom civilization
            </button>
            {groups.length > 0 ? (
              groups.map((group) => (
                <div key={group.region}>
                  <p className="px-3 pb-1 pt-2 text-[0.6rem] font-bold uppercase tracking-wider text-fg-faint">
                    {group.region}
                  </p>
                  {group.items.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={
                        query.trim().toLowerCase() === option.label.toLowerCase()
                      }
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectOption(option)}
                      className={`block w-full rounded-lg px-3 py-2 text-start text-sm transition-colors hover:bg-brand-500/10 ${
                        query.trim().toLowerCase() === option.label.toLowerCase()
                          ? "bg-brand-500/15 font-medium text-brand-700 dark:text-brand-300"
                          : "text-fg hover:text-fg"
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              ))
            ) : (
              <p className="px-3 py-2.5 text-xs text-fg-muted">
                No civilizations match "{query.trim()}".
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}