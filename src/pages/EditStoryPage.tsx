import { useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { storiesApi } from "../api/storiesApi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input, Select, Textarea } from "../components/ui/field";
import { CatalogSelect } from "../components/ui/CatalogSelect";
import { CivilizationSelect } from "../components/ui/CivilizationSelect";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Skeleton";
import { useContentLoading } from "../layouts/PageLoading";
import { ErrorState } from "../components/ui/States";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../i18n";
import { isCustomCivilization } from "../constants/civilizations";
import {
  useStoryCivilizations,
  useStoryEras,
  useStoryGenres,
  useCatalogs,
} from "../hooks/useStoryOptions";
import { humanize, isCatalogId, resolveCatalogEntry } from "../lib/storyCatalog";
import type {
  StoryCivilization,
  StoryEra,
  StoryTheme,
  StoryType,
  StoryVisibility,
} from "../api/types";

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

const MAX_PAGE_CHARACTERS = 1000;

interface EditForm {
  title: string;
  description: string;
  genreId: string;
  visualStyle: string;
  language: string;
  eraId: string;
  year: string;
  location: string;
  civilization: string;
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
  const pagesQuery = useQuery({ queryKey: ["story-pages", storyId], queryFn: () => storiesApi.getPages(storyId) });
  const [appendText, setAppendText] = useState("");
  const [appendFile, setAppendFile] = useState<File | null>(null);

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

  const form = useForm<EditForm>({
    defaultValues: {
      title: "",
      description: "",
      genreId: "",
      visualStyle: "",
      language: "",
      eraId: "",
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
  const genreId = watch("genreId");
  const eraId = watch("eraId");
  const civilization = watch("civilization");
  const theme = watch("theme");
  const [saving, setSaving] = useState(false);
  const [pageDrafts, setPageDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (query.data) {
      const genreOption =
        catalogs.genres.find((o) => o.value === query.data?.genreId) ??
        catalogs.genres.find((o) => o.legacyValue === query.data?.storyType);
      const eraOption =
        catalogs.eras.find((o) => o.value === query.data?.eraId) ??
        catalogs.eras.find((o) => o.legacyValue === query.data?.era);
      reset({
        title: query.data.title,
        description: query.data.description ?? "",
        genreId: genreOption?.value ?? query.data.storyType ?? "",
        visualStyle: query.data.visualStyle ?? "",
        language: query.data.language ?? "",
        eraId: eraOption?.value ?? query.data.era ?? "UNSPECIFIED",
        year: query.data.year != null ? String(query.data.year) : "",
        location: query.data.location ?? "",
        civilization:
          query.data.civilizationId ?? query.data.civilization ?? "UNSPECIFIED",
        customCivilization: query.data.customCivilization ?? "",
        theme: query.data.theme ?? "UNSPECIFIED",
        customTheme: query.data.customTheme ?? "",
        visibility: query.data.visibility ?? "PRIVATE",
      });
    }
  }, [query.data, reset]);

  useEffect(() => {
    if (pagesQuery.data) setPageDrafts(Object.fromEntries(pagesQuery.data.map((page) => [page.id, page.content])));
  }, [pagesQuery.data]);

  const refreshPages = () => void queryClient.invalidateQueries({ queryKey: ["story-pages", storyId] });
  const savePage = async (pageId: string) => { await storiesApi.updatePage(storyId, pageId, pageDrafts[pageId] ?? ""); refreshPages(); toast.success(t.common.save); };
  const movePage = async (pageId: string, direction: -1 | 1) => {
    const pages = pagesQuery.data ?? [];
    const index = pages.findIndex((page) => page.id === pageId);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= pages.length) return;
    const pageIds = pages.map((page) => page.id);
    [pageIds[index], pageIds[target]] = [pageIds[target], pageIds[index]];
    await storiesApi.reorderPages(storyId, pageIds);
    refreshPages();
  };
  const removePage = async (pageId: string) => {
    if (!window.confirm("Delete this page?")) return;
    await storiesApi.deletePage(storyId, pageId);
    refreshPages();
    toast.success(t.common.save);
  };

  const isOwner = Boolean(user && user.id === query.data?.author.id);

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      const genre = resolveCatalogEntry(values.genreId, catalogs.genres, legacyGenreOptions);
      const era = resolveCatalogEntry(values.eraId, catalogs.eras, legacyEraOptions);
      const civilizationOption = catalogs.civilizations.find(
        (c) => c.value === values.civilization || c.legacyValue === values.civilization,
      );
      const updated = await storiesApi.update(storyId, {
        title: values.title,
        description: values.description || undefined,
        storyType: genre ? (genre.legacyValue as StoryType) : undefined,
        genreId: genre && isCatalogId(genre.id) ? genre.id : undefined,
        eraId: era && isCatalogId(era.id) ? era.id : undefined,
        era: era ? (era.legacyValue as StoryEra) : undefined,
        visualStyle: values.visualStyle || undefined,
        language: values.language || undefined,
        year: values.year ? Number(values.year) : undefined,
        location: values.location || undefined,
        civilization:
          values.civilization === "UNSPECIFIED" || isCatalogId(values.civilization)
            ? undefined
            : (values.civilization as StoryCivilization),
        customCivilization:
          isCustomCivilization(values.civilization)
            ? values.customCivilization
            : undefined,
        theme: values.theme === "UNSPECIFIED" ? undefined : values.theme,
        customTheme: values.theme === "CUSTOM" ? values.customTheme : undefined,
        civilizationId: isCatalogId(civilizationOption?.value)
          ? civilizationOption?.value
          : undefined,
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
            <CardHeader><h2 className="text-base font-bold text-fg">Story pages</h2></CardHeader>
            <CardBody className="space-y-5 p-6">
              {pagesQuery.data?.map((page) => (
                <div key={page.id} className="space-y-2 rounded-lg border border-border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-fg-muted">
                    <span>Page {page.pageNumber}</span>
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="sm" aria-label="Move page up" disabled={page.pageNumber === 1} onClick={() => void movePage(page.id, -1)}><ArrowUp className="size-4" /></Button>
                      <Button type="button" variant="outline" size="sm" aria-label="Move page down" disabled={page.pageNumber === (pagesQuery.data?.length ?? 0)} onClick={() => void movePage(page.id, 1)}><ArrowDown className="size-4" /></Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => void savePage(page.id)}>Save page</Button>
                      <Button type="button" variant="outline" size="sm" aria-label="Delete page" onClick={() => void removePage(page.id)}><Trash2 className="size-4 text-red-600" /></Button>
                    </div>
                  </div>
                  <Textarea
                    rows={6}
                    maxLength={MAX_PAGE_CHARACTERS}
                    value={pageDrafts[page.id] ?? page.content}
                    onChange={(e) =>
                      setPageDrafts((current) => ({
                        ...current,
                        [page.id]: e.target.value,
                      }))
                    }
                  />
                  <p className="text-end text-xs text-fg-muted">
                    {(pageDrafts[page.id] ?? page.content).length}/
                    {MAX_PAGE_CHARACTERS}
                  </p>
                  {page.imageStatus === "PENDING" && <p className="text-xs text-fg-muted">Illustration needs regeneration after this edit.</p>}
                </div>
              ))}
              <Textarea
                label="Append new text"
                rows={4}
                maxLength={100000}
                value={appendText}
                onChange={(e) => setAppendText(e.target.value)}
              />
              <div className="space-y-2">
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={(e) => setAppendFile(e.target.files?.[0] ?? null)}
                  className="block w-full text-sm text-fg-muted file:me-3 file:rounded-md file:border-0 file:bg-brand-500/10 file:px-3 file:py-2 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-500/15 dark:file:text-brand-300"
                  aria-label="Upload continuation PDF"
                />
                <div className="flex items-center justify-between text-xs text-fg-muted">
                  <span>Enter text or upload a PDF continuation.</span>
                  <span>{appendText.length}/100000</span>
                </div>
              </div>
              <Button
                type="button"
                disabled={
                  (!appendText.trim() && !appendFile) ||
                  (Boolean(appendText.trim()) && Boolean(appendFile))
                }
                onClick={async () => {
                  if (!appendText.trim() && !appendFile) return;
                  if (appendText.trim() && appendFile) return;
                  await storiesApi.append(storyId, {
                    content: appendText.trim() || undefined,
                    file: appendFile ?? undefined,
                  });
                  setAppendText("");
                  setAppendFile(null);
                  refreshPages();
                  toast.success(t.common.save);
                }}
              >
                Append text
              </Button>
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
                  value={watch("civilization")}
                  onChange={(v) => setValue("civilization", v)}
                  searchPlaceholder={t.create.civilizationSearch}
                  options={catalogs.civilizations}
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
