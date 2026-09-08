import { useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import {
  Camera,
  Eye,
  EyeOff,
  Laptop,
  Loader2,
  Smartphone,
} from "lucide-react";
import { usersApi } from "../api/usersApi";
import { authApi, type SessionInfo } from "../api/authApi";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/field";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PageLoader } from "../components/ui/Skeleton";
import { useContentLoading } from "../layouts/PageLoading";
import { ErrorState } from "../components/ui/States";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useAppDispatch } from "../store";
import { updateLocalUser } from "../store/authSlice";
import { useLanguage } from "../i18n";
import { buildResponsiveSrcSet } from "../utils/imageSrcSet";

interface ProfileForm {
  firstName: string;
  lastName: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirm: string;
}

const MOBILE_RE = /Mobile|Android|iPhone|iPad|Tablet/i;
const OS_RE = /(Windows NT [\d.]+|Mac OS X [\d_]+|Android [\d.]+|iPhone OS [\d_]+|Linux)/i;
type T = ReturnType<typeof useLanguage>["t"];

function describeDevice(session: SessionInfo): { name: string; mobile: boolean } {
  const ua = session.device;
  const osMatch = ua.match(OS_RE);
  const os = osMatch
    ? osMatch[1].replace(/Mac OS X|iPhone OS/, "iOS").replace(/_/g, ".")
    : "Device";
  const label = ua.includes("Edg/")
    ? "Edge"
    : ua.includes("Firefox/")
      ? "Firefox"
      : ua.includes("Chrome/") && !ua.includes("Edg/")
        ? "Chrome"
        : ua.includes("Safari/") && !ua.includes("Chrome/")
          ? "Safari"
          : "Browser";
  return { name: `${os} · ${label}`, mobile: MOBILE_RE.test(ua) };
}

function lastUsedLabel(t: T, lastUsedAt: string | null): string {
  if (!lastUsedAt) return "—";
  const diff = Date.now() - new Date(lastUsedAt).getTime();
  if (diff < 60_000) return t.profile.sessionsJustNow;
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return `${t.profile.sessionsLastUsed} ${Math.floor(diff / 60_000)}m`;
  if (hours < 24) return `${t.profile.sessionsLastUsed} ${hours}h`;
  return `${t.profile.sessionsLastUsed} ${Math.floor(hours / 24)}d`;
}

export function ProfilePage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const avatarInput = useRef<HTMLInputElement>(null);

  const profileQuery = useQuery({
    queryKey: ["profile"],
    queryFn: usersApi.me,
    enabled: Boolean(user),
  });

  const statsQuery = useQuery({
    queryKey: ["profile", "stats"],
    queryFn: usersApi.myStats,
    enabled: Boolean(user),
  });

  const profileForm = useForm<ProfileForm>({
    defaultValues: {
      firstName: profileQuery.data?.data.firstName ?? user?.firstName ?? "",
      lastName: profileQuery.data?.data.lastName ?? user?.lastName ?? "",
    },
  });

  const passwordForm = useForm<PasswordForm>();
  const [showPassword, setShowPassword] = useState(false);

  const updateProfile = useMutation({
    mutationFn: (v: ProfileForm) =>
      usersApi.updateProfile({ firstName: v.firstName, lastName: v.lastName }),
    onSuccess: (res) => {
      toast.success(t.profile.updated);
      dispatch(
        updateLocalUser({
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          name: res.data.name,
          avatarUrl: res.data.avatarUrl,
          email: res.data.email,
        }),
      );
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (res) => {
      toast.success(t.profile.avatarUpdated);
      dispatch(updateLocalUser({ avatarUrl: res.data.avatarUrl }));
      void queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const changePassword = useMutation({
    mutationFn: (v: PasswordForm) =>
      authApi.changePassword({
        currentPassword: v.currentPassword,
        newPassword: v.newPassword,
      }),
    onSuccess: async () => {
      toast.success(t.profile.passwordChanged);
      passwordForm.reset();
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const sessionsQuery = useQuery({
    queryKey: ["auth", "sessions"],
    queryFn: authApi.sessions,
    enabled: Boolean(user),
  });

  const [revokeTarget, setRevokeTarget] = useState<SessionInfo | null>(null);
  const [revokeAllOpen, setRevokeAllOpen] = useState(false);

  const revokeSession = useMutation({
    mutationFn: (sessionId: string) => authApi.revokeSession(sessionId),
    onSuccess: () => {
      toast.success(t.profile.sessionRevoked);
      void queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
    onSettled: () => setRevokeTarget(null),
  });

  const revokeOthers = useMutation({
    mutationFn: () => authApi.revokeOtherSessions(),
    onSuccess: () => {
      toast.success(t.profile.otherSessionsRevoked);
      void queryClient.invalidateQueries({ queryKey: ["auth", "sessions"] });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
    onSettled: () => setRevokeAllOpen(false),
  });

  const onSubmitProfile = profileForm.handleSubmit((v) =>
    updateProfile.mutate(v),
  );
  const onSubmitPassword = passwordForm.handleSubmit(async (v) => {
    if (v.newPassword !== v.confirm) {
      toast.error(t.validation.confirmMismatch);
      return;
    }
    await changePassword.mutateAsync(v);
  });

  useContentLoading(profileQuery.isLoading);

  if (profileQuery.isLoading)
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <PageLoader label={t.common.loading} />
      </div>
    );
  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16">
        <ErrorState
          title={t.common.error}
          onRetry={() => profileQuery.refetch()}
          retryLabel={t.common.retry}
        />
      </div>
    );
  }

  const profile = profileQuery.data.data;

  return (
    <>
      <Helmet>
        <title>
          {t.nav.profile} · {t.brand.name}
        </title>
      </Helmet>
      <section className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">
          {t.profile.title}
        </h1>
        <p className="mt-2 text-fg-muted">{t.profile.subtitle}</p>

        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <Card className="p-6">
              <div className="flex flex-col items-center gap-4">
                <div className="relative">
                  {profile.avatarUrl ? (
                    <img
                      src={profile.avatarUrl}
                      alt={profile.name ?? ""}
                      loading="lazy"
                      srcSet={
                        buildResponsiveSrcSet(profile.avatarUrl) ?? undefined
                      }
                      className="size-24 rounded-full border border-border object-cover"
                    />
                  ) : (
                    <span className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-navy-800 text-3xl font-bold text-white">
                      {(profile.firstName?.[0] ?? "U").toUpperCase()}
                    </span>
                  )}
                  <button
                    onClick={() => avatarInput.current?.click()}
                    className="absolute -bottom-1 -end-1 flex size-8 items-center justify-center rounded-full bg-brand-600 text-white shadow transition-colors hover:bg-brand-700 dark:hover:bg-brand-600"
                    aria-label={t.profile.uploadAvatar}
                  >
                    {avatarMutation.isPending ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <Camera className="size-4" />
                    )}
                  </button>
                  <input
                    ref={avatarInput}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="sr-only"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) avatarMutation.mutate(file);
                      e.target.value = "";
                    }}
                  />
                </div>
                <div className="text-center">
                  <h2 className="text-lg font-bold text-fg">{profile.name}</h2>
                  <p className="text-sm text-fg-muted">{profile.email}</p>
                  <p className="mt-1 text-xs text-fg-faint">{profile.role}</p>
                </div>
              </div>

              {statsQuery.data && (
                <div className="mt-6 border-t border-border pt-4">
                  <h3 className="mb-3 text-sm font-semibold text-fg">
                    {t.profile.statsTitle}
                  </h3>
                  <dl className="grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-lg bg-surface-2 p-3">
                      <dt className="text-xs text-fg-faint">
                        {t.dashboard.totalStories}
                      </dt>
                      <dd className="text-lg font-bold text-fg">
                        {statsQuery.data.data.totalStories}
                      </dd>
                    </div>
                    <div className="rounded-lg bg-surface-2 p-3">
                      <dt className="text-xs text-fg-faint">
                        {t.dashboard.illustratedPages}
                      </dt>
                      <dd className="text-lg font-bold text-fg">
                        {statsQuery.data.data.illustratedPages}
                      </dd>
                    </div>
                    <div className="col-span-2 rounded-lg bg-surface-2 p-3">
                      <dt className="text-xs text-fg-faint">
                        {t.dashboard.totalPages}
                      </dt>
                      <dd className="text-lg font-bold text-fg">
                        {statsQuery.data.data.totalPages}
                      </dd>
                    </div>
                  </dl>
                </div>
              )}
            </Card>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-fg">{t.profile.title}</h2>
              </CardHeader>
              <CardBody className="p-6">
                <form
                  onSubmit={onSubmitProfile}
                  className="space-y-4"
                  noValidate
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label={t.auth.firstName}
                      {...profileForm.register("firstName", {
                        required: t.validation.required,
                      })}
                    />
                    <Input
                      label={t.auth.lastName}
                      {...profileForm.register("lastName", {
                        required: t.validation.required,
                      })}
                    />
                  </div>
                  <Button type="submit" loading={updateProfile.isPending}>
                    {t.profile.updateAction}
                  </Button>
                </form>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <h2 className="text-lg font-bold text-fg">
                  {t.profile.changePassword}
                </h2>
              </CardHeader>
              <CardBody className="p-6">
                <form
                  onSubmit={onSubmitPassword}
                  className="space-y-4"
                  noValidate
                >
                  <Input
                    label={t.profile.currentPassword}
                    type="password"
                    autoComplete="current-password"
                    {...passwordForm.register("currentPassword", {
                      required: t.validation.required,
                    })}
                  />
                  <div className="relative">
                    <Input
                      label={t.profile.newPassword}
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      hint={t.auth.passwordHelp}
                      className="pe-11"
                      {...passwordForm.register("newPassword", {
                        required: t.validation.required,
                        minLength: {
                          value: 8,
                          message: t.validation.minLength.replace(
                            "{count}",
                            "8",
                          ),
                        },
                        pattern: {
                          value:
                            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/,
                          message: t.validation.passwordStrength,
                        },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute end-3 top-[2.9rem] -translate-y-1/2 text-fg-faint hover:text-fg"
                      aria-label={
                        showPassword ? t.common.close : t.common.search
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                  <Input
                    label={t.auth.confirmPassword}
                    type="password"
                    {...passwordForm.register("confirm", {
                      required: t.validation.required,
                    })}
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    loading={changePassword.isPending}
                  >
                    {t.profile.changePasswordAction}
                  </Button>
                </form>
              </CardBody>
            </Card>

            <Card>
              <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-fg">
                    {t.profile.sessionsTitle}
                  </h2>
                  <p className="text-sm text-fg-muted">
                    {t.profile.sessionsSubtitle}
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setRevokeAllOpen(true)}
                  disabled={!sessionsQuery.data?.some((s) => !s.current)}
                  loading={revokeOthers.isPending}
                >
                  {t.profile.sessionsRevokeAll}
                </Button>
              </CardHeader>
              <CardBody className="p-6">
                {sessionsQuery.isError ? (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {t.profile.sessionsError}
                  </p>
                ) : sessionsQuery.isLoading ? (
                  <p className="text-sm text-fg-muted">{t.common.loading}</p>
                ) : sessionsQuery.data?.length ? (
                  <ul className="divide-y divide-border">
                    {sessionsQuery.data.map((session) => {
                      const device = describeDevice(session);
                      return (
                        <li
                          key={session.id}
                          className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-fg-muted">
                              {device.mobile ? (
                                <Smartphone className="size-4.5" aria-hidden />
                              ) : (
                                <Laptop className="size-4.5" aria-hidden />
                              )}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium text-fg">
                                {device.name}
                              </p>
                              <p className="truncate text-xs text-fg-faint">
                                {session.ipAddress} ·{" "}
                                {lastUsedLabel(t, session.lastUsedAt)}
                              </p>
                            </div>
                          </div>
                          {session.current ? (
                            <Badge tone="success" dot>
                              {t.profile.sessionsCurrent}
                            </Badge>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRevokeTarget(session)}
                              loading={
                                revokeSession.isPending &&
                                revokeSession.variables === session.id
                              }
                            >
                              {t.profile.sessionsRevoke}
                            </Button>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-fg-muted">{t.profile.sessionsEmpty}</p>
                )}
              </CardBody>
            </Card>
          </div>
        </div>
      </section>
      <ConfirmDialog
        open={Boolean(revokeTarget)}
        title={t.profile.sessionsConfirmTitle}
        message={
          revokeTarget
            ? `${describeDevice(revokeTarget).name} · ${revokeTarget.ipAddress}`
            : undefined
        }
        loading={revokeSession.isPending}
        confirmLabel={t.profile.sessionsRevoke}
        onConfirm={() =>
          revokeTarget && revokeSession.mutate(revokeTarget.id)
        }
        onCancel={() => setRevokeTarget(null)}
      />
      <ConfirmDialog
        open={revokeAllOpen}
        title={t.profile.sessionsConfirmAllTitle}
        message={t.profile.sessionsConfirmAllMessage}
        loading={revokeOthers.isPending}
        confirmLabel={t.profile.sessionsRevokeAll}
        onConfirm={() => revokeOthers.mutate()}
        onCancel={() => setRevokeAllOpen(false)}
      />
    </>
  );
}
