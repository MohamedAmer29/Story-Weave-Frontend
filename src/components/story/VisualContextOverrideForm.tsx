import { useState } from "react";
import { Button } from "../ui/Button";
import { CivilizationSelect } from "../ui/CivilizationSelect";
import { Input, Select } from "../ui/field";
import { useLanguage } from "../../i18n";
import type {
  StoryCivilization,
  StoryEra,
  StoryTheme,
  StoryType,
  VisualContextOverrides,
} from "../../api/types";

const eras: StoryEra[] = ["BCE", "CE", "MODERN"];
const themes: StoryTheme[] = [
  "FANTASY",
  "HISTORICAL",
  "ADVENTURE",
  "ROMANCE",
  "MYSTERY",
  "WAR",
  "HORROR",
  "COMEDY",
  "DRAMA",
  "MYTHOLOGY",
  "RELIGIOUS",
];
const genres: StoryType[] = [
  "FANTASY",
  "ADVENTURE",
  "SCI_FI",
  "MYSTERY",
  "HORROR",
  "ROMANCE",
  "COMEDY",
  "DRAMA",
  "HISTORICAL",
  "FAIRY_TALE",
  "CHILDREN",
  "ACTION",
  "THRILLER",
];

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

interface FormState {
  location: string;
  era: "" | StoryEra;
  year: string;
  civilization: "" | StoryCivilization;
  theme: "" | StoryTheme;
  genre: "" | StoryType;
}

interface Props {
  onSubmit: (overrides: VisualContextOverrides) => void;
  onCancel: () => void;
  loading?: boolean;
}

export function VisualContextOverrideForm({ onSubmit, onCancel, loading }: Props) {
  const { t } = useLanguage();
  const [form, setForm] = useState<FormState>({
    location: "",
    era: "",
    year: "",
    civilization: "",
    theme: "",
    genre: "",
  });

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = () => {
    onSubmit({
      location: form.location.trim() || undefined,
      era: form.era || undefined,
      year: form.year ? Number(form.year) : undefined,
      civilization: form.civilization || undefined,
      theme: form.theme || undefined,
      genre: form.genre || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-fg-muted">
        Leave a field blank to keep the story&apos;s saved visual context. Language is not used for image generation.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={t.create.location}
          value={form.location}
          onChange={(event) => update("location", event.target.value)}
          placeholder={t.create.locationPh}
          maxLength={200}
        />
        <Input
          label={t.create.year}
          type="number"
          min={1}
          max={10000}
          value={form.year}
          onChange={(event) => update("year", event.target.value)}
          placeholder={t.create.yearPh}
        />
        <Select
          label={t.create.era}
          value={form.era}
          onChange={(event) => update("era", event.target.value as FormState["era"])}
        >
          <option value="">{t.create.eraPh}</option>
          {eras.map((era) => <option key={era} value={era}>{humanize(era)}</option>)}
        </Select>
        <CivilizationSelect
          label={t.create.civilization}
          value={form.civilization || "UNSPECIFIED"}
          onChange={(value) => update("civilization", value === "UNSPECIFIED" ? "" : value as FormState["civilization"])}
          searchPlaceholder={t.create.civilizationSearch}
        />
        <Select
          label={t.create.theme}
          value={form.theme}
          onChange={(event) => update("theme", event.target.value as FormState["theme"])}
        >
          <option value="">{t.create.themePh}</option>
          {themes.map((theme) => <option key={theme} value={theme}>{humanize(theme)}</option>)}
        </Select>
        <Select
          label={t.create.storyType}
          value={form.genre}
          onChange={(event) => update("genre", event.target.value as FormState["genre"])}
        >
          <option value="">{t.create.storyType}</option>
          {genres.map((genre) => <option key={genre} value={genre}>{humanize(genre)}</option>)}
        </Select>
      </div>
      <div className="flex justify-end gap-3 border-t border-border pt-4">
        <Button variant="outline" onClick={onCancel}>{t.common.cancel}</Button>
        <Button onClick={submit} loading={loading}>
          Regenerate illustration
        </Button>
      </div>
    </div>
  );
}
