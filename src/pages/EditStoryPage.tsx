import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { storiesApi } from "../api/storiesApi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input, Select, Textarea } from "../components/ui/field";
import { CivilizationSelect } from "../components/ui/CivilizationSelect";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Skeleton";
import { useContentLoading } from "../layouts/PageLoading";
import { ErrorState } from "../components/ui/States";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../i18n";
import { isCustomCivilization } from "../constants/civilizations";
import type {
  StoryCivilization,
  StoryEra,
  StoryTheme,
  StoryType,
  StoryVisibility,
} from "../api/types";

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
const languages: string[] = ["ARABIC", "ENGLISH"];
const themes: StoryTheme[] = [
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
];

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface EditForm {
  title: string;
  description: string;
  storyType: StoryType;
  visualStyle: string;
  language: string;
  era: StoryEra;
  year: string;
  location: string;
  civilization: StoryCivilization;
  customCivilization: string;
  theme: StoryTheme;
  customTheme: string;
  visibility: StoryVisibility;
}

export function EditStoryPage() {
  const { id } = useParams<{ id: string }>();
  const storyId = id!;
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const query = useStoryQuery(storyId);

  const form = useForm<EditForm>({
    defaultValues: {
      title: "",
      description: "",
      storyType: "FANTASY",
      visualStyle: "",
      language: "",
      era: "UNSPECIFIED",
      year: "",
      location: "",
      civilization: "UNSPECIFIED",
      customCivilization: "",
      theme: "UNSPECIFIED",
      customTheme: "",
      visibility: "PRIVATE",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = form;
  const civilization = watch("civilization");
  const theme = watch("theme");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (query.data) {
      reset({
        title: query.data.title,
        description: query.data.description ?? "",
        storyType: query.data.storyType ?? "FANTASY",
        visualStyle: query.data.visualStyle ?? "",
        language: query.data.language ?? "",
        era: query.data.era ?? "UNSPECIFIED",
        year: query.data.year != null ? String(query.data.year) : "",
        location: query.data.location ?? "",
        civilization: query.data.civilization ?? "UNSPECIFIED",
        customCivilization: query.data.customCivilization ?? "",
        theme: query.data.theme ?? "UNSPECIFIED",
        customTheme: query.data.customTheme ?? "",
        visibility: query.data.visibility ?? "PRIVATE",
      });
    }
  }, [query.data, reset]);

  const isOwner = Boolean(user && user.id === query.data?.author.id);

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const updated = await storiesApi.update(storyId, {
        title: values.title,
        description: values.description || undefined,
        storyType: values.storyType,
        visualStyle: values.visualStyle || undefined,
        language: values.language || undefined,
        era: values.era === "UNSPECIFIED" ? undefined : values.era,
        year: values.year ? Number(values.year) : undefined,
        location: values.location || undefined,
        civilization:
          values.civilization === "UNSPECIFIED"
            ? undefined
            : values.civilization,
        customCivilization:
          isCustomCivilization(values.civilization)
            ? values.customCivilization
            : undefined,
        theme: values.theme === "UNSPECIFIED" ? undefined : values.theme,
        customTheme: values.theme === "CUSTOM" ? values.customTheme : undefined,
        visibility: values.visibility,
      });

      queryClient.setQueryData(
        ["story", storyId],
        (previous: typeof query.data | undefined) =>
          previous ? { ...previous, visibility: updated.visibility } : previous,
      );
      void queryClient.invalidateQueries({ queryKey: ["story", storyId] });
      void queryClient.invalidateQueries({ queryKey: ["library"] });

      toast.success(t.common.save);
      navigate(`/stories/${storyId}`);
    } catch (err) {
      toast.error(getErrorMessage(err) ?? t.common.error);
    } finally {
      setSaving(false);
    }
  });

  useContentLoading(query.isLoading);

  if (query.isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <PageLoader label={t.reader.loading} />
      </div>
    );
  }
  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState
          title={t.reader.storyNotFound}
          onRetry={() => query.refetch()}
          retryLabel={t.common.retry}
        />
      </div>
    );
  }
  if (!isOwner) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState title={t.reader.storyNotFound} />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>
          {t.create.title} · {t.brand.name}
        </title>
      </Helmet>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link
          to={`/stories/${storyId}`}
          className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
        >
          ← {t.reader.backToLibrary}
        </Link>
        <h1 className="font-display mt-4 text-3xl font-bold text-fg sm:text-4xl">
          {t.common.edit}
        </h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-6" noValidate>
          <Card>
            <CardBody className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={t.create.storyTitle}
                  required
                  error={errors.title?.message}
                  {...register("title", {
                    required: t.validation.titleRequired,
                  })}
                />
                <Select
                  label={t.create.storyType}
                  value={watch("storyType")}
                  onChange={(e) =>
                    setValue("storyType", e.target.value as StoryType)
                  }
                >
                  {storyTypes.map((s) => (
                    <option key={s} value={s}>
                      {humanize(s)}
                    </option>
                  ))}
                </Select>
              </div>
              <Textarea
                label={t.create.description}
                rows={3}
                {...register("description")}
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                  {...register("visualStyle")}
                />
              </div>
              <p className="text-sm text-fg-muted">
                Story language is for reading and narration. It does not control the image style, culture, or setting.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-base font-bold text-fg">{t.nav.features}</h2>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input
                  label={t.create.year}
                  type="number"
                  min={1}
                  max={10000}
                  {...register("year")}
                />
                <Input label={t.create.location} {...register("location")} />
                <Select
                  label={t.create.era}
                  value={watch("era")}
                  onChange={(e) => setValue("era", e.target.value as StoryEra)}
                >
                  {eras.map((e) => (
                    <option key={e} value={e}>
                      {e === "UNSPECIFIED" ? "—" : humanize(e)}
                    </option>
                  ))}
                </Select>
                <CivilizationSelect
                  label={t.create.civilization}
                  value={watch("civilization")}
                  onChange={(v) => setValue("civilization", v)}
                  searchPlaceholder={t.create.civilizationSearch}
                />
                {isCustomCivilization(civilization) && (
                  <Input
                    label={t.create.customCivilization}
                    {...register("customCivilization")}
                  />
                )}
                <Select
                  label={t.create.theme}
                  value={watch("theme")}
                  onChange={(e) =>
                    setValue("theme", e.target.value as StoryTheme)
                  }
                >
                  {themes.map((th) => (
                    <option key={th} value={th}>
                      {th === "UNSPECIFIED" ? "—" : humanize(th)}
                    </option>
                  ))}
                </Select>
                {theme === "CUSTOM" && (
                  <Input
                    label={t.create.customTheme}
                    {...register("customTheme")}
                  />
                )}
              </div>
              <p className="mt-4 text-sm text-fg-muted">
                Use the story text for the scene. Era, location, civilization, and theme only shape the visual world around it.
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="flex items-center gap-2 text-base font-bold text-fg">
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
                    className={
                      watch("visibility") === v
                        ? "rounded-lg border border-brand-500 bg-brand-500/10 p-3 text-sm font-semibold text-brand-600 dark:text-brand-400"
                        : "rounded-lg border border-border bg-surface p-3 text-sm font-semibold text-fg-muted transition-colors hover:border-brand-500/40"
                    }
                  >
                    {t.status[v]}
                  </button>
                ))}
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(`/stories/${storyId}`)}
            >
              {t.common.cancel}
            </Button>
            <Button type="submit" loading={saving}>
              {t.common.save}
            </Button>
          </div>
        </form>
      </section>
    </>
  );
}

function useStoryQuery(storyId: string) {
  return useQuery({
    queryKey: ["story", storyId],
    queryFn: () => storiesApi.get(storyId),
  });
}
