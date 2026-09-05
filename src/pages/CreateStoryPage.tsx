import { useMemo, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FileUp, MapPin, Sparkles } from "lucide-react";
import { storiesApi } from "../api/storiesApi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input, Select, Textarea } from "../components/ui/field";
import { Button } from "../components/ui/Button";
import { getErrorMessage } from "../api/axios";
import { useLanguage } from "../i18n";
import { cn } from "../lib/cn";
import type { StoryCivilization, StoryEra, StoryTheme, StoryType } from "../api/types";

interface CreateForm {
  title: string;
  description?: string;
  storyType: StoryType;
  text: string;
  language: string;
  visualStyle?: string;
  era: StoryEra;
  year?: number;
  location?: string;
  civilization: StoryCivilization;
  customCivilization?: string;
  theme: StoryTheme;
  customTheme?: string;
  visibility: "PUBLIC" | "PRIVATE" | "SHARED";
}

const storyTypes: StoryType[] = [
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

const eras: StoryEra[] = ["BCE", "CE", "MODERN", "UNSPECIFIED"];
const civilizations: StoryCivilization[] = ["UNSPECIFIED", "ANCIENT_EGYPTIAN", "EGYPTIAN", "ARABIC", "GREEK", "ROMAN", "CUSTOM"];
const themes: StoryTheme[] = ["UNSPECIFIED", "FANTASY", "HISTORICAL", "ADVENTURE", "ROMANCE", "MYSTERY", "WAR", "HORROR", "COMEDY", "DRAMA", "MYTHOLOGY", "RELIGIOUS", "CUSTOM"];

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function CreateStoryPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [tab, setTab] = useState<"write" | "pdf">("write");
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  const form = useForm<CreateForm>({
    defaultValues: {
      storyType: "FANTASY",
      language: "",
      era: "UNSPECIFIED",
      civilization: "UNSPECIFIED",
      theme: "UNSPECIFIED",
      visibility: "PRIVATE",
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = form;
  const storyType = watch("storyType");
  const era = watch("era");
  const civilization = watch("civilization");
  const theme = watch("theme");

  const uploadInput = useRef<HTMLInputElement>(null);

  const createTextStory = async (values: CreateForm) => {
    if (!values.text.trim()) {
      toast.error(t.validation.textRequired);
      return;
    }
    const story = await storiesApi.create({
      title: values.title,
      description: values.description || undefined,
      storyType: values.storyType,
      text: values.text,
      sourceType: "TEXT",
      visibility: values.visibility,
      language: values.language || undefined,
      visualStyle: values.visualStyle || undefined,
      era: values.era === "UNSPECIFIED" ? undefined : values.era,
      year: values.year || undefined,
      location: values.location || undefined,
      civilization: values.civilization === "UNSPECIFIED" ? undefined : values.civilization,
      customCivilization:
        values.civilization === "CUSTOM" ? values.customCivilization : undefined,
      theme: values.theme === "UNSPECIFIED" ? undefined : values.theme,
      customTheme: values.theme === "CUSTOM" ? values.customTheme : undefined,
    });
    toast.success(t.create.created);
    navigate(`/stories/${story.id}`);
  };

  const createPdfStory = async (values: CreateForm) => {
    if (!pdfFile) {
      toast.error(t.validation.textRequired);
      return;
    }
    const story = await storiesApi.uploadPdf(pdfFile, {
      storyType: values.storyType,
      visualStyle: values.visualStyle || undefined,
      language: values.language || undefined,
      era: values.era === "UNSPECIFIED" ? undefined : values.era,
      year: values.year || undefined,
      location: values.location || undefined,
      civilization: values.civilization === "UNSPECIFIED" ? undefined : values.civilization,
      customCivilization:
        values.civilization === "CUSTOM" ? values.customCivilization : undefined,
      theme: values.theme === "UNSPECIFIED" ? undefined : values.theme,
      customTheme: values.theme === "CUSTOM" ? values.customTheme : undefined,
    });
    toast.success(t.create.created);
    navigate(`/stories/${story.id}`);
  };

  const onSubmit = handleSubmit((values) => {
    if (tab === "write") {
      void createTextStory(values).catch((err) => toast.error(getErrorMessage(err) ?? t.common.error));
    } else {
      void createPdfStory(values).catch((err) => toast.error(getErrorMessage(err) ?? t.common.error));
    }
  });

  const contextOptions = useMemo(
    () => (
      <div className="rounded-2xl border border-border bg-surface-2/60 p-5">
        <p className="mb-4 flex items-center gap-2 text-sm font-semibold text-fg">
          <Sparkles className="size-4 text-brand-600 dark:text-brand-400" aria-hidden />
          {t.create.contextHint}
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Input label={t.create.year} type="number" min={1} max={10000} placeholder={t.create.yearPh} {...register("year")} />
          <Input label={t.create.location} placeholder={t.create.locationPh} {...register("location")} />
          <Select label={t.create.era} value={era} onChange={(e) => setValue("era", e.target.value as StoryEra)}>
            {eras.map((e) => (
              <option key={e} value={e}>
                {e === "UNSPECIFIED" ? "—" : humanize(e)}
              </option>
            ))}
          </Select>
          <Select
            label={t.create.civilization}
            value={civilization}
            onChange={(e) => setValue("civilization", e.target.value as StoryCivilization)}
          >
            {civilizations.map((c) => (
              <option key={c} value={c}>
                {c === "UNSPECIFIED" ? "—" : humanize(c)}
              </option>
            ))}
          </Select>
          {civilization === "CUSTOM" && (
            <Input label={t.create.customCivilization} placeholder={t.create.customCivilization} {...register("customCivilization")} />
          )}
          <Select label={t.create.theme} value={theme} onChange={(e) => setValue("theme", e.target.value as StoryTheme)}>
            {themes.map((th) => (
              <option key={th} value={th}>
                {th === "UNSPECIFIED" ? "—" : humanize(th)}
              </option>
            ))}
          </Select>
          {theme === "CUSTOM" && (
            <Input label={t.create.customTheme} placeholder={t.create.customTheme} {...register("customTheme")} />
          )}
        </div>
      </div>
    ),
    [era, civilization, theme, setValue, register, t]
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
          <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">{t.create.title}</h1>
          <p className="mt-2 text-fg-muted">{t.create.subtitle}</p>

          <div className="mt-6 flex rounded-lg border border-border bg-surface p-1" role="tablist" aria-label="Creation mode">
            <button
              role="tab"
              aria-selected={tab === "write"}
              onClick={() => setTab("write")}
              className={cn(
                "flex-1 rounded-md px-4 py-2 text-sm font-semibold transition-colors",
                tab === "write" ? "bg-brand-600 text-white" : "text-fg-muted hover:text-fg"
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
                tab === "pdf" ? "bg-brand-600 text-white" : "text-fg-muted hover:text-fg"
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
                    {...register("title", { required: t.validation.titleRequired, maxLength: { value: 200, message: t.validation.maxLength.replace("{count}", "200") } })}
                  />
                  <Select
                    label={t.create.storyType}
                    value={storyType}
                    onChange={(e) => setValue("storyType", e.target.value as StoryType)}
                  >
                    {storyTypes.map((s) => (
                      <option key={s} value={s}>
                        {humanize(s)}
                      </option>
                    ))}
                  </Select>
                </div>
                <Input
                  label={t.create.description}
                  placeholder={t.create.descriptionPh}
                  {...register("description")}
                />
                <Input
                  label={t.create.language}
                  placeholder={t.common.english}
                  {...register("language")}
                />
                <Input
                  label={t.create.visualStyle}
                  placeholder={t.create.visualStylePh}
                  {...register("visualStyle")}
                />

                {tab === "write" ? (
                  <Textarea
                    label={t.create.storyText}
                    placeholder={t.create.storyTextPh}
                    required
                    rows={12}
                    error={errors.text?.message}
                    {...register("text", { required: t.validation.textRequired })}
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
                      <span className="text-xs text-fg-faint">{t.create.uploadHint}</span>
                    </button>
                  </div>
                )}
              </CardBody>
            </Card>

            {contextOptions}

            <Card>
              <CardHeader>
                <h2 className="flex items-center gap-2 text-base font-bold text-fg">
                  <MapPin className="size-4 text-brand-600 dark:text-brand-400" aria-hidden />
                  {t.reader.visibilityLabel}
                </h2>
              </CardHeader>
              <CardBody>
                <div className="grid grid-cols-3 gap-3">
                  {(["PRIVATE", "PUBLIC", "SHARED"] as const).map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setValue("visibility", v)}
                      className={cn(
                        "rounded-lg border p-3 text-sm font-semibold transition-colors",
                        watch("visibility") === v
                          ? "border-brand-500 bg-brand-500/10 text-brand-600 dark:text-brand-400"
                          : "border-border bg-surface text-fg-muted hover:border-brand-500/40"
                      )}
                    >
                      {t.status[v]}
                    </button>
                  ))}
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