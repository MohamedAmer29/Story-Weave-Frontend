import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { storiesApi } from "../api/storiesApi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input, Select, Textarea } from "../components/ui/field";
import { Button } from "../components/ui/Button";
import { PageLoader } from "../components/ui/Skeleton";
import { ErrorState } from "../components/ui/States";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../i18n";
import type { StoryCivilization, StoryEra, StoryTheme, StoryType } from "../api/types";

const storyTypes: StoryType[] = [
  "FANTASY", "ADVENTURE", "SCI_FI", "MYSTERY", "HORROR", "ROMANCE", "COMEDY", "DRAMA",
  "HISTORICAL", "FAIRY_TALE", "CHILDREN", "ACTION", "THRILLER",
];
const eras: StoryEra[] = ["BCE", "CE", "MODERN", "UNSPECIFIED"];
const civilizations: StoryCivilization[] = ["UNSPECIFIED", "ANCIENT_EGYPTIAN", "EGYPTIAN", "ARABIC", "GREEK", "ROMAN", "CUSTOM"];
const themes: StoryTheme[] = ["UNSPECIFIED", "FANTASY", "HISTORICAL", "ADVENTURE", "ROMANCE", "MYSTERY", "WAR", "HORROR", "COMEDY", "DRAMA", "MYTHOLOGY", "RELIGIOUS", "CUSTOM"];

function humanize(value: string): string {
  return value.toLowerCase().split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
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
}

export function EditStoryPage() {
  const { id } = useParams<{ id: string }>();
  const storyId = id!;
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();

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
    },
  });

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = form;
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
      });
    }
  }, [query.data, reset]);

  const isOwner = Boolean(user && user.id === query.data?.author.id);

  const onSubmit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await storiesApi.update(storyId, {
        title: values.title,
        description: values.description || undefined,
        storyType: values.storyType,
        visualStyle: values.visualStyle || undefined,
        language: values.language || undefined,
        era: values.era === "UNSPECIFIED" ? undefined : values.era,
        year: values.year ? Number(values.year) : undefined,
        location: values.location || undefined,
        civilization: values.civilization === "UNSPECIFIED" ? undefined : values.civilization,
        customCivilization: values.civilization === "CUSTOM" ? values.customCivilization : undefined,
        theme: values.theme === "UNSPECIFIED" ? undefined : values.theme,
        customTheme: values.theme === "CUSTOM" ? values.customTheme : undefined,
      });
      toast.success(t.common.save);
      navigate(`/stories/${storyId}`);
    } catch (err) {
      toast.error(getErrorMessage(err) ?? t.common.error);
    } finally {
      setSaving(false);
    }
  });

  if (query.isLoading) {
    return <div className="mx-auto max-w-4xl px-4 py-16"><PageLoader label={t.reader.loading} /></div>;
  }
  if (query.isError || !query.data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState title={t.reader.storyNotFound} onRetry={() => query.refetch()} retryLabel={t.common.retry} />
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
        <Link to={`/stories/${storyId}`} className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400">
          ← {t.reader.backToLibrary}
        </Link>
        <h1 className="font-display mt-4 text-3xl font-bold text-fg sm:text-4xl">{t.common.edit}</h1>

        <form onSubmit={onSubmit} className="mt-6 space-y-6" noValidate>
          <Card>
            <CardBody className="space-y-4 p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={t.create.storyTitle}
                  required
                  error={errors.title?.message}
                  {...register("title", { required: t.validation.titleRequired })}
                />
                <Select
                  label={t.create.storyType}
                  value={watch("storyType")}
                  onChange={(e) => setValue("storyType", e.target.value as StoryType)}
                >
                  {storyTypes.map((s) => (
                    <option key={s} value={s}>{humanize(s)}</option>
                  ))}
                </Select>
              </div>
              <Textarea label={t.create.description} rows={3} {...register("description")} />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input label={t.create.language} {...register("language")} />
                <Input label={t.create.visualStyle} {...register("visualStyle")} />
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-base font-bold text-fg">{t.nav.features}</h2>
            </CardHeader>
            <CardBody className="p-6">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <Input label={t.create.year} type="number" min={1} max={10000} {...register("year")} />
                <Input label={t.create.location} {...register("location")} />
                <Select label={t.create.era} value={watch("era")} onChange={(e) => setValue("era", e.target.value as StoryEra)}>
                  {eras.map((e) => (
                    <option key={e} value={e}>{e === "UNSPECIFIED" ? "—" : humanize(e)}</option>
                  ))}
                </Select>
                <Select label={t.create.civilization} value={watch("civilization")} onChange={(e) => setValue("civilization", e.target.value as StoryCivilization)}>
                  {civilizations.map((c) => (
                    <option key={c} value={c}>{c === "UNSPECIFIED" ? "—" : humanize(c)}</option>
                  ))}
                </Select>
                {civilization === "CUSTOM" && (
                  <Input label={t.create.customCivilization} {...register("customCivilization")} />
                )}
                <Select label={t.create.theme} value={watch("theme")} onChange={(e) => setValue("theme", e.target.value as StoryTheme)}>
                  {themes.map((th) => (
                    <option key={th} value={th}>{th === "UNSPECIFIED" ? "—" : humanize(th)}</option>
                  ))}
                </Select>
                {theme === "CUSTOM" && (
                  <Input label={t.create.customTheme} {...register("customTheme")} />
                )}
              </div>
            </CardBody>
          </Card>

          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => navigate(`/stories/${storyId}`)}>
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
  return useQuery({ queryKey: ["story", storyId], queryFn: () => storiesApi.get(storyId) });
}