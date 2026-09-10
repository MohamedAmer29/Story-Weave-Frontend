import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FileUp, MapPin, Sparkles } from "lucide-react";
import { storiesApi } from "../api/storiesApi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input, Select, Textarea } from "../components/ui/field";
import { CatalogSelect } from "../components/ui/CatalogSelect";
import { CivilizationSelect } from "../components/ui/CivilizationSelect";
import { Button } from "../components/ui/Button";
import { getErrorMessage } from "../api/axios";
import { useLanguage } from "../i18n";
import { cn } from "../lib/cn";
import {
  useStoryCivilizations,
  useStoryEras,
  useStoryGenres,
  useCatalogs,
} from "../hooks/useStoryOptions";
import {
  humanize,
  isCatalogId,
  resolveCatalogEntry,
  resolveCivilizationValue,
} from "../lib/storyCatalog";
import type { StoryEra, StoryTheme, StoryType } from "../api/types";

interface CreateForm {
  title: string;
  description?: string;
  genreId: string;
  text: string;
  language: string;
  visualStyle?: string;
  eraId: string;
  year?: number;
  location?: string;
  civilization: string;
  theme: StoryTheme;
  customTheme?: string;
  visibility: "PUBLIC" | "MEMBERS" | "PRIVATE" | "SHARED";
}

const languages: string[] = ["ARABIC", "ENGLISH"];

const legacyStoryTypes: StoryType[] = [
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

const legacyEras: StoryEra[] = ["BCE", "CE", "MODERN", "UNSPECIFIED"];

export function CreateStoryPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"write" | "pdf">("write");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const form = useForm<CreateForm>({
    defaultValues: {
      genreId: "FANTASY",
      language: "",
      eraId: "UNSPECIFIED",
      civilization: "UNSPECIFIED",
      theme: "UNSPECIFIED",
      visibility: "PRIVATE",
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = form;
  const genreId = watch("genreId");
  const eraId = watch("eraId");
  const civilization = watch("civilization");
  const theme = watch("theme");

  const genresQuery = useStoryGenres();
  const erasQuery = useStoryEras();
  const civQuery = useStoryCivilizations();
  const catalogs = useCatalogs(
    {
      genres: genresQuery,
      eras: erasQuery,
      civilizations: civQuery,
    },
    {
      genres: legacyStoryTypes,
      eras: legacyEras,
    },
  );

  const legacyGenreOptions = legacyStoryTypes.map((s) => ({
    value: s,
    label: humanize(s),
    legacyValue: s,
  }));
  const legacyEraOptions = legacyEras.map((e) => ({
    value: e,
    label: e === "UNSPECIFIED" ? "—" : humanize(e),
    legacyValue: e,
  }));

  const resolveGenre = (value: string) =>
    resolveCatalogEntry(value, catalogs.genres, legacyGenreOptions);

  const resolveEra = (value: string) =>
    resolveCatalogEntry(value, catalogs.eras, legacyEraOptions);

  const uploadInput = useRef<HTMLInputElement>(null);

  const createTextStory = async (values: CreateForm) => {
    if (!values.text.trim()) {
      toast.error(t.validation.textRequired);
      return;
    }
    const genre = resolveGenre(values.genreId);
    const era = resolveEra(values.eraId);
    const civPayload = resolveCivilizationValue(
      values.civilization,
      catalogs.civilizations,
    );
    const story = await storiesApi.create({
      title: values.title,
      description: values.description || undefined,
      storyType: genre ? (genre.legacyValue as StoryType) : undefined,
      text: values.text,
      sourceType: "TEXT",
      visibility: values.visibility,
      language: values.language || undefined,
      visualStyle: values.visualStyle || undefined,
      genreId: genre && isCatalogId(genre.id) ? genre.id : undefined,
      eraId: era && isCatalogId(era.id) ? era.id : undefined,
      era: era ? (era.legacyValue as StoryEra) : undefined,
      year: values.year || undefined,
      location: values.location || undefined,
      civilization: civPayload.civilization,
      customCivilization: civPayload.customCivilization,
      theme: values.theme === "UNSPECIFIED" ? undefined : values.theme,
      customTheme: values.theme === "CUSTOM" ? values.customTheme : undefined,
      civilizationId: civPayload.civilizationId,
    });
    toast.success(t.create.created);
    navigate(`/stories/${story.id}`);
  };

  const createPdfStory = async (values: CreateForm) => {
    if (!pdfFile) {
      toast.error(t.validation.textRequired);
      return;
    }
    const genre = resolveGenre(values.genreId);
    const era = resolveEra(values.eraId);
    const civPayload = resolveCivilizationValue(
      values.civilization,
      catalogs.civilizations,
    );
    const story = await storiesApi.uploadPdf(pdfFile, {
      storyType: genre ? (genre.legacyValue as StoryType) : undefined,
      visualStyle: values.visualStyle || undefined,
      language: values.language || undefined,
      genreId: genre && isCatalogId(genre.id) ? genre.id : undefined,
      eraId: era && isCatalogId(era.id) ? era.id : undefined,
      era: era ? (era.legacyValue as StoryEra) : undefined,
      year: values.year || undefined,
      location: values.location || undefined,
      civilization: civPayload.civilization,
      customCivilization: civPayload.customCivilization,
      theme: values.theme === "UNSPECIFIED" ? undefined : values.theme,
      customTheme: values.theme === "CUSTOM" ? values.customTheme : undefined,
      civilizationId: civPayload.civilizationId,
    });
    toast.success(t.create.created);
    navigate(`/stories/${story.id}`);
  };

  const onSubmit = handleSubmit((values) => {
    if (tab === "write") {
      void createTextStory(values).catch((err) =>
        toast.error(getErrorMessage(err) ?? t.common.error),
      );
    } else {
      void createPdfStory(values).catch((err) =>
        toast.error(getErrorMessage(err) ?? t.common.error),
      );
    }
  });

  const contextOptions = useMemo(
    () => (
      <div className="rounded-2xl border border-border bg-surface-2/60 p-5">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-fg">
          <Sparkles
            className="size-4 text-brand-600 dark:text-brand-400"
            aria-hidden
          />
          {t.create.contextHint}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input
            label={t.create.year}
            type="number"
            min={1}
            max={10000}
            placeholder={t.create.yearPh}
            {...register("year")}
          />
          <Input
            label={t.create.location}
            placeholder={t.create.locationPh}
            {...register("location")}
          />
          <CatalogSelect
            label={t.create.era}
            value={eraId}
            onChange={(v) => setValue("eraId", v)}
            options={catalogs.eras.map((o) => ({
              value: o.value,
              label: o.legacyValue === "UNSPECIFIED" ? "—" : o.label,
            }))}
            legacyOptions={legacyEraOptions.map((o) => ({
              value: o.value,
              label: o.label,
            }))}
            loading={erasQuery.isLoading && !catalogs.erasFallback}
          />
          <CivilizationSelect
            label={t.create.civilization}
            value={civilization}
            onChange={(v) => setValue("civilization", v)}
            searchPlaceholder={t.create.civilizationSearch}
            options={catalogs.civilizations}
          />
          <Select
            label={t.create.theme}
            value={theme}
            onChange={(e) => setValue("theme", e.target.value as StoryTheme)}
          >
            {(
              [
                "UNSPECIFIED",
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
                "CUSTOM",
              ] as StoryTheme[]
            ).map((th) => (
              <option key={th} value={th}>
                {th === "UNSPECIFIED" ? "—" : humanize(th)}
              </option>
            ))}
          </Select>
          {theme === "CUSTOM" && (
            <Input
              label={t.create.customTheme}
              placeholder={t.create.customTheme}
              {...register("customTheme")}
            />
          )}
        </div>
      </div>
    ),
    [
      eraId,
      civilization,
      theme,
      setValue,
      register,
      t,
      catalogs,
      erasQuery.isLoading,
    ],
  );

  return (
    <>
      <Helmet>
        <title>
          {t.nav.createStory} · {t.brand.name}
        </title>
      </Helmet>
      <section className="hero-aurora relative">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
          <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
            {t.create.title}
          </h1>
          <p className="mt-2 text-fg-muted">{t.create.subtitle}</p>

          <div
            className="mt-6 flex rounded-lg border border-border bg-surface p-1"
            role="tablist"
            aria-label="Creation mode"
          >
            <button
              role="tab"
              aria-selected={tab === "write"}
              onClick={() => setTab("write")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                tab === "write"
                  ? "bg-brand-600 text-white"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {t.create.writeTab}
            </button>
            <button
              role="tab"
              aria-selected={tab === "pdf"}
              onClick={() => setTab("pdf")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                tab === "pdf"
                  ? "bg-brand-600 text-white"
                  : "text-fg-muted hover:text-fg",
              )}
            >
              {t.create.uploadTab}
            </button>
          </div>

          <form onSubmit={onSubmit} className="mt-6 space-y-6" noValidate>
            <Card>
              <CardBody className="space-y-4 p-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input
                    label={t.create.storyTitle}
                    placeholder={t.create.storyTitlePh}
                    required
                    error={errors.title?.message}
                    {...register("title", {
                      required: t.validation.titleRequired,
                      maxLength: {
                        value: 200,
                        message: t.validation.maxLength.replace(
                          "{count}",
                          "200",
                        ),
                      },
                    })}
                  />
                  <CatalogSelect
                    label={t.create.storyType}
                    value={genreId}
                    onChange={(v) => setValue("genreId", v)}
                    options={catalogs.genres.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                    legacyOptions={legacyGenreOptions.map((o) => ({
                      value: o.value,
                      label: o.label,
                    }))}
                    loading={genresQuery.isLoading && !catalogs.genresFallback}
                  />
                </div>
                <Input
                  label={t.create.description}
                  placeholder={t.create.descriptionPh}
                  {...register("description")}
                />
                <Select
                  label={t.create.language}
                  value={watch("language")}
                  onChange={(e) => setValue("language", e.target.value)}
                >
                  <option value="">—</option>
                  {languages.map((lang) => (
                    <option key={lang} value={lang}>
                      {lang === "ARABIC" ? t.common.arabic : t.common.english}
                    </option>
                  ))}
                </Select>
                <Input
                  label={t.create.visualStyle}
                  placeholder={t.create.visualStylePh}
                  {...register("visualStyle")}
                />
                <p className="text-sm text-fg-muted">
                  Story language is for reading and narration. It does not
                  control the image style, culture, or setting.
                </p>

                {tab === "write" ? (
                  <Textarea
                    label={t.create.storyText}
                    placeholder={t.create.storyTextPh}
                    required
                    rows={12}
                    error={errors.text?.message}
                    {...register("text", {
                      required: t.validation.textRequired,
                    })}
                  />
                ) : (
                  <div>
                    <input
                      ref={uploadInput}
                      type="file"
                      accept="application/pdf"
                      className="sr-only"
                      onChange={(e) => setPdfFile(e.target.files?.[0] ?? null)}
                    />
                    <button
                      type="button"
                      onClick={() => uploadInput.current?.click()}
                      className="flex w-full flex-col items-center gap-3 rounded-2xl border-2 border-dashed border-border-strong bg-surface-2/50 p-8 text-center transition-colors hover:border-brand-500/50 hover:bg-brand-500/5"
                    >
                      <span className="flex size-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                        <FileUp className="size-6" aria-hidden />
                      </span>
                      <span className="text-sm font-semibold text-fg">
                        {pdfFile ? pdfFile.name : t.create.uploadLabel}
                      </span>
                      <span className="text-xs text-fg-faint">
                        {t.create.uploadHint}
                      </span>
                    </button>
                  </div>
                )}
              </CardBody>
            </Card>

            {contextOptions}

            <Card>
              <CardHeader>
                <h2 className="flex items-center gap-2 text-base font-bold text-fg">
                  <MapPin
                    className="size-4 text-brand-600 dark:text-brand-400"
                    aria-hidden
                  />
                  {t.reader.visibilityLabel}
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-2 gap-3">
                  {(["PRIVATE", "PUBLIC", "MEMBERS", "SHARED"] as const).map(
                    (v) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setValue("visibility", v)}
                        className={cn(
                          "rounded-lg border p-3 text-sm font-semibold transition-colors",
                          watch("visibility") === v
                            ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400"
                            : "border-border bg-surface text-fg-muted hover:border-brand-500/40",
                        )}
                      >
                        {t.status[v]}
                      </button>
                    ),
                  )}
                </div>
              </CardBody>
            </Card>

            <Button type="submit" size="lg" fullWidth>
              {t.create.submit}
            </Button>
          </form>
        </div>
      </section>
    </>
  );
}
