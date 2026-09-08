import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Helmet } from "react-helmet-async";
import { Pencil, Plus, Power } from "lucide-react";
import { toast } from "react-toastify";
import { storyOptionsApi } from "../api/storyOptionsApi";
import { Card, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Input, Textarea } from "../components/ui/field";
import { Skeleton } from "../components/ui/Skeleton";
import { Modal } from "../components/ui/Modal";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import {
  TabsProvider,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "../components/ui/Tabs";
import { useLanguage } from "../i18n";
import type { StoryOption } from "../api/types";

type Kind = "genres" | "eras" | "civilizations";

const PAGE_SIZE = 10;

function useKind(kind: Kind): {
  loader: () => Promise<StoryOption[]>;
  create: (payload: {
    name: string;
    description?: string;
    legacyValue?: string;
  }) => Promise<StoryOption>;
  update: (
    id: string,
    payload: { name?: string; description?: string; isActive?: boolean },
  ) => Promise<StoryOption>;
  deactivate: (id: string) => Promise<StoryOption>;
} {
  switch (kind) {
    case "genres":
      return {
        loader: () => storyOptionsApi.getGenres(true),
        create: storyOptionsApi.createGenre,
        update: storyOptionsApi.updateGenre,
        deactivate: storyOptionsApi.deactivateGenre,
      };
    case "eras":
      return {
        loader: () => storyOptionsApi.getEras(true),
        create: storyOptionsApi.createEra,
        update: storyOptionsApi.updateEra,
        deactivate: storyOptionsApi.deactivateEra,
      };
    case "civilizations":
      return {
        loader: () => storyOptionsApi.getCivilizations(true),
        create: storyOptionsApi.createCivilization,
        update: storyOptionsApi.updateCivilization,
        deactivate: storyOptionsApi.deactivateCivilization,
      };
  }
}

interface OptionFormState {
  name: string;
  description: string;
  legacyValue: string;
}

interface OptionTableProps {
  items: StoryOption[];
  loading: boolean;
  error: boolean;
  editing: StoryOption | null;
  onEdit: (option: StoryOption) => void;
  onToggleActive: (option: StoryOption) => void;
}

function OptionTable({
  items,
  loading,
  error,
  editing,
  onEdit,
  onToggleActive,
}: OptionTableProps) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
        <Skeleton className="h-12" />
      </div>
    );
  }
  if (error) {
    return <p className="text-red-600">{t.common.error}</p>;
  }
  if (items.length === 0) {
    return <p className="text-fg-muted">{t.common.empty}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wide text-fg-faint">
            <th className="px-4 py-3 text-start font-semibold">{t.storyOptions.name}</th>
            <th className="px-4 py-3 text-start font-semibold">{t.storyOptions.description}</th>
            <th className="px-4 py-3 text-start font-semibold">{t.storyOptions.legacyValue}</th>
            <th className="px-4 py-3 text-start font-semibold">{t.storyOptions.status}</th>
            <th className="px-4 py-3 text-start font-semibold">{t.storyOptions.createdBy}</th>
            <th className="px-4 py-3 text-end font-semibold">{t.storyOptions.actions}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((option) => (
            <tr
              key={option.id}
              className={`border-b border-border last:border-0 hover:bg-surface-2/60 ${
                option.id === editing?.id ? "bg-brand-500/5" : ""
              }`}
            >
              <td className="px-4 py-3 font-medium text-fg">{option.name}</td>
              <td className="max-w-xs truncate px-4 py-3 text-fg-muted">
                {option.description ?? "—"}
              </td>
              <td className="px-4 py-3 font-mono text-xs text-fg-muted">
                {option.legacyValue ?? (
                  <span className="text-fg-faint">{t.storyOptions.none}</span>
                )}
              </td>
              <td className="px-4 py-3">
                {option.isActive ? (
                  <Badge tone="success">{t.storyOptions.active}</Badge>
                ) : (
                  <Badge tone="danger">{t.storyOptions.inactive}</Badge>
                )}
              </td>
              <td className="px-4 py-3 text-fg-muted">
                {option.createdBy ? (
                  <span className="font-mono text-xs">
                    {option.createdBy.slice(0, 8)}
                  </span>
                ) : (
                  t.storyOptions.system
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-1.5">
                  <Button
                    variant="subtle"
                    size="sm"
                    onClick={() => onEdit(option)}
                  >
                    <Pencil className="size-3.5" />
                    {t.common.edit}
                  </Button>
                  <Button
                    variant={option.isActive ? "outline" : "subtle"}
                    size="sm"
                    onClick={() => onToggleActive(option)}
                  >
                    <Power className="size-3.5" />
                    {option.isActive
                      ? t.storyOptions.deactivateAction
                      : t.storyOptions.activateAction}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StoryOptionsPage() {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Kind>("genres");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StoryOption | null>(null);
  const [pending, setPending] = useState<StoryOption | null>(null);
  const [form, setForm] = useState<OptionFormState>({
    name: "",
    description: "",
    legacyValue: "",
  });
  const [formError, setFormError] = useState("");
  const [page, setPage] = useState(1);

  const genres = useQuery({
    queryKey: ["story-options", "genres", { catalog: true }],
    queryFn: () => storyOptionsApi.getGenres(true),
  });
  const eras = useQuery({
    queryKey: ["story-options", "eras", { catalog: true }],
    queryFn: () => storyOptionsApi.getEras(true),
  });
  const civilizations = useQuery({
    queryKey: ["story-options", "civilizations", { catalog: true }],
    queryFn: () => storyOptionsApi.getCivilizations(true),
  });

  const queries: Record<Kind, typeof genres> = {
    genres,
    eras,
    civilizations,
  };
  const query = queries[tab];
  const kindApi = useKind(tab);

  const items = useMemo(() => {
    const all = query.data ?? [];
    return all.filter((o) => o.isActive || !query.data?.some((x) => x.isActive));
  }, [query.data]);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const pagedItems = items.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const refreshOptionQueries = async () => {
    await queryClient.refetchQueries({
      queryKey: ["story-options"],
      type: "all",
    });
    await queryClient.invalidateQueries({ queryKey: ["catalogs"] });
  };

  const createMut = useMutation({
    mutationFn: kindApi.create,
    onSuccess: async () => {
      toast.success(t.storyOptions.created);
      setModalOpen(false);
      setForm({ name: "", description: "", legacyValue: "" });
      await refreshOptionQueries();
    },
    onError: (err: unknown) => {
      setFormError(extractError(err) ?? t.common.error);
    },
  });

  const updateMut = useMutation({
    mutationFn: (payload: { id: string; body: Parameters<typeof kindApi.update>[1] }) =>
      kindApi.update(payload.id, payload.body),
    onSuccess: async () => {
      toast.success(t.storyOptions.updated);
      setModalOpen(false);
      setEditing(null);
      setForm({ name: "", description: "", legacyValue: "" });
      await refreshOptionQueries();
    },
    onError: (err: unknown) => {
      setFormError(extractError(err) ?? t.common.error);
    },
  });

  const toggleMut = useMutation({
    mutationFn: (option: StoryOption) =>
      kindApi.update(option.id, { isActive: !option.isActive }),
    onSuccess: async (result) => {
      toast.success(result.isActive ? t.storyOptions.activated : t.storyOptions.deactivated);
      setPending(null);
      await refreshOptionQueries();
    },
    onError: (err: unknown) => {
      toast.error(extractError(err) ?? t.common.error);
      setPending(null);
    },
  });

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", description: "", legacyValue: "" });
    setFormError("");
    setModalOpen(true);
  };

  const openEdit = (option: StoryOption) => {
    setEditing(option);
    setForm({
      name: option.name,
      description: option.description ?? "",
      legacyValue: option.legacyValue ?? "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const submit = () => {
    if (!form.name.trim()) {
      setFormError(t.storyOptions.nameRequired);
      return;
    }
    setFormError("");
    if (editing) {
      updateMut.mutate({
        id: editing.id,
        body: {
          name: form.name.trim(),
          description: form.description.trim() || undefined,
        },
      });
    } else {
      createMut.mutate({
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        legacyValue: form.legacyValue.trim() || undefined,
      });
    }
  };

  const loading = query.isLoading;
  const changing = createMut.isPending || updateMut.isPending;

  return (
    <>
      <Helmet>
        <title>
          {t.storyOptions.title} · {t.brand.name}
        </title>
      </Helmet>
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
              {t.storyOptions.title}
            </h1>
            <p className="mt-2 text-fg-muted">{t.storyOptions.subtitle}</p>
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            {t.storyOptions.add}
          </Button>
        </div>

        <TabsProvider
          value={tab}
          onValueChange={(v) => {
            setTab(v as Kind);
            setPage(1);
          }}
        >
          <TabsList>
            <TabsTrigger value="genres">{t.storyOptions.genres}</TabsTrigger>
            <TabsTrigger value="eras">{t.storyOptions.eras}</TabsTrigger>
            <TabsTrigger value="civilizations">
              {t.storyOptions.civilizations}
            </TabsTrigger>
          </TabsList>
          <TabsContent value={tab}>
            <Card>
              <CardBody>
                <OptionTable
                  items={pagedItems}
                  loading={loading}
                  error={query.isError}
                  editing={editing}
                  onEdit={openEdit}
                  onToggleActive={setPending}
                />
                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-end gap-2 text-sm">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      {t.common.previous}
                    </Button>
                    <span className="text-fg-muted">
                      {page} / {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
                      {t.common.next}
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          </TabsContent>
        </TabsProvider>
      </section>

      <Modal
        open={modalOpen}
        onClose={() => {
          if (changing) return;
          setModalOpen(false);
          setEditing(null);
        }}
        title={
          editing
            ? (tab === "genres"
                ? t.storyOptions.editGenre
                : tab === "eras"
                  ? t.storyOptions.editEra
                  : t.storyOptions.editCivilization)
            : (tab === "genres"
                ? t.storyOptions.addGenre
                : tab === "eras"
                  ? t.storyOptions.addEra
                  : t.storyOptions.addCivilization)
        }
        footer={
          <>
            <Button
              variant="outline"
              disabled={changing}
              onClick={() => {
                setModalOpen(false);
                setEditing(null);
              }}
            >
              {t.common.cancel}
            </Button>
            <Button loading={changing} onClick={submit}>
              {editing ? t.common.save : t.storyOptions.createAction}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input
            label={t.storyOptions.optionName}
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <Textarea
            label={t.storyOptions.optionDescription}
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <Input
            label={t.storyOptions.legacyValue}
            disabled={Boolean(editing)}
            value={form.legacyValue}
            onChange={(e) => setForm({ ...form, legacyValue: e.target.value })}
          />
          {!editing && (
            <p className="text-xs text-fg-muted">{t.storyOptions.legacyHint}</p>
          )}
          {formError && <p className="text-sm text-red-600">{formError}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.isActive ? t.storyOptions.deactivateAction : t.storyOptions.activateAction}
        message={
          pending?.isActive
            ? t.storyOptions.confirmDeactivate
            : t.storyOptions.confirmActivate
        }
        loading={toggleMut.isPending}
        onConfirm={() => pending && toggleMut.mutate(pending)}
        onCancel={() => setPending(null)}
      />
    </>
  );
}

function extractError(err: unknown): string | undefined {
  if (typeof err === "object" && err !== null) {
    const maybe = (err as { message?: unknown }).message;
    if (typeof maybe === "string") return maybe;
  }
  if (err instanceof Error && err.message) return err.message;
  return undefined;
}
