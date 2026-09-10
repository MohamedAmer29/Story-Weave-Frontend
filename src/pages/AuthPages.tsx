import { type ReactNode, useRef, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  BookOpen,
  Camera,
  Check,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PenTool,
  ShieldCheck,
  Sparkles,
  Upload,
  User,
  X,
} from "lucide-react";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/field";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/ui/Logo";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { usersApi } from "../api/usersApi";
import { useLanguage } from "../i18n";
import { Reveal } from "../components/motion/Reveal";
import { cn } from "../lib/cn";

function AuthFrame({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  const { t } = useLanguage();
  return (
    <div className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden">
      <div className="hero-aurora absolute inset-0" aria-hidden />
      <div className="page-grain pointer-events-none absolute inset-0" aria-hidden />
      <div className={cn(
        "relative mx-auto grid items-center gap-10 px-4 py-10 lg:px-8 lg:py-14",
        wide 
          ? "max-w-7xl lg:grid-cols-[0.8fr_1.2fr]" 
          : "max-w-6xl lg:grid-cols-[1.05fr_0.95fr]"
      )}>
        <div className="hidden lg:block">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/8 px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-brand-700">
            {t.brand.name}
          </p>
          <p className="mt-5 font-display text-5xl font-semibold leading-[0.95] tracking-[-0.04em] text-fg">
            {t.hero.title}
          </p>
          <p className="mt-5 max-w-md text-lg leading-relaxed text-fg-muted">
            {t.hero.subtitle}
          </p>
        </div>
        <Reveal y={24}>{children}</Reveal>
      </div>
    </div>
  );
}

interface LoginForm {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export function LoginPage() {
  const { t } = useLanguage();
  const { login, loginPending } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);

  const from =
    (location.state as { from?: string } | null)?.from ?? "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = handleSubmit(async (values) => {
    try {
      const res = await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
      if (res.user?.emailVerified === false) {
        toast.warning(t.verifyEmail.verifyToContinue);
        navigate(
          `/verify-email-otp?email=${encodeURIComponent(values.email)}`,
          { replace: true },
        );
        return;
      }
      toast.success(t.auth.loginSuccess);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err) ?? t.common.error);
    }
  });

  return (
    <AuthFrame>
      <Helmet>
        <title>
          {t.nav.login} · {t.brand.name}
        </title>
      </Helmet>
      <Card className="w-full max-w-md lg:ms-auto shadow-xl backdrop-blur-sm border-border/80">
        <CardHeader className="pt-6 pb-2">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo />
            <div>
              <h1 className="mt-2 text-2xl font-bold text-fg">
                {t.auth.loginTitle}
              </h1>
              <p className="mt-1 text-sm text-fg-muted">
                {t.auth.loginSubtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-6 sm:px-8">
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input
              label={t.auth.email}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              startIcon={<Mail className="size-4" />}
              error={errors.email?.message}
              {...register("email", {
                required: t.validation.required,
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: t.validation.emailInvalid,
                },
              })}
            />
            <div>
              <Input
                label={t.auth.password}
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                startIcon={<Lock className="size-4" />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t.common.close : t.common.search}
                    className="text-fg-faint hover:text-fg transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                {...register("password", { required: t.validation.required })}
              />
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-fg-muted cursor-pointer select-none">
                  <input
                    type="checkbox"
                    className="size-4 rounded border-border text-brand-600 focus:ring-brand-500"
                    {...register("rememberMe")}
                  />
                  {t.auth.rememberMe}
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400"
                >
                  {t.auth.forgotPassword}
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth loading={loginPending} size="lg">
              {t.auth.loginAction}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-fg-muted">
            {t.auth.haveAccount ? (
              <>
                {t.auth.noAccount}{" "}
                <Link
                  to="/register"
                  className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
                >
                  {t.nav.register}
                </Link>
              </>
            ) : null}
          </p>
        </CardBody>
      </Card>
    </AuthFrame>
  );
}

interface RegisterForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: "AUTHOR" | "USER";
}

export function RegisterPage() {
  const { t } = useLanguage();
  const { register: registerUser, registerPending } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>({
    defaultValues: { role: "USER" },
  });

  const password = watch("password") || "";
  const confirmPassword = watch("confirmPassword") || "";
  const selectedRole = watch("role");

  // Password requirements calculation
  const reqLength = password.length >= 8;
  const reqUpper = /[A-Z]/.test(password);
  const reqLower = /[a-z]/.test(password);
  const reqNumber = /\d/.test(password);
  const reqSpecial = /[!@#$%^&*]/.test(password);

  const reqMetCount = [reqLength, reqUpper && reqLower, reqNumber, reqSpecial].filter(Boolean).length;

  const getStrengthMeta = () => {
    if (!password) return { percent: 0, color: "bg-border", label: "" };
    if (reqMetCount <= 1) return { percent: 25, color: "bg-red-500", label: "Weak" };
    if (reqMetCount === 2) return { percent: 50, color: "bg-amber-500", label: "Fair" };
    if (reqMetCount === 3) return { percent: 75, color: "bg-blue-500", label: "Good" };
    return { percent: 100, color: "bg-emerald-500", label: "Strong" };
  };

  const strengthMeta = getStrengthMeta();

  const handleAvatarChange = (file: File | null) => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setAvatarFile(file);
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
    } else {
      setAvatarPreview(null);
    }
  };

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
        role: values.role,
      });
      if (avatarFile) {
        try {
          await usersApi.uploadAvatar(avatarFile);
        } catch {
          toast.warn("Your account was created, but the profile image could not be uploaded.");
        }
      }
      toast.success(t.auth.registerSuccess);
      navigate(`/verify-email-otp?email=${encodeURIComponent(values.email)}`, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err) ?? t.common.error);
    }
  });

  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  return (
    <AuthFrame wide>
      <Helmet>
        <title>
          {t.nav.register} · {t.brand.name}
        </title>
      </Helmet>
      <Card className="w-full max-w-2xl lg:ms-auto shadow-2xl backdrop-blur-md border-border/80">
        <CardHeader className="pt-6 pb-4 border-b border-border/60">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo />
            <div>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-fg sm:text-3xl">
                {t.auth.registerTitle}
              </h1>
              <p className="mt-1 text-sm text-fg-muted">
                {t.auth.registerSubtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-6 sm:px-9 space-y-6">
          <form onSubmit={onSubmit} className="space-y-6" noValidate>
            
            {/* 1. Avatar Upload Section */}
            <div className="flex flex-col items-center justify-center pb-1">
              <input
                ref={avatarInputRef}
                id="register-avatar"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => handleAvatarChange(e.target.files?.[0] ?? null)}
              />
              <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
                <div className={cn(
                  "size-20 rounded-full border-2 border-dashed flex items-center justify-center overflow-hidden transition-all duration-200",
                  avatarPreview 
                    ? "border-brand-500 shadow-md ring-4 ring-brand-500/10" 
                    : "border-border hover:border-brand-400 bg-surface-2/40"
                )}>
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Avatar preview" className="size-full object-cover" />
                  ) : (
                    <User className="size-9 text-fg-faint transition-colors group-hover:text-brand-500" />
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    <Camera className="size-6 text-white" />
                  </div>
                </div>
                {avatarFile && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAvatarChange(null);
                      if (avatarInputRef.current) avatarInputRef.current.value = "";
                    }}
                    className="absolute -top-1 -end-1 size-6 rounded-full bg-error text-white flex items-center justify-center shadow hover:bg-error/90 transition-transform hover:scale-110"
                    title="Remove picture"
                  >
                    <X className="size-3.5" />
                  </button>
                )}
              </div>
              <span className="mt-2 text-xs font-medium text-fg-muted flex items-center gap-1.5">
                <Upload className="size-3.5 text-brand-500" />
                {avatarFile ? avatarFile.name : "Add profile picture (optional)"}
              </span>
            </div>

            {/* 2. Name Fields: 2 Columns */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t.auth.firstName}
                autoComplete="given-name"
                placeholder="John"
                startIcon={<User className="size-4" />}
                error={errors.firstName?.message}
                {...register("firstName", {
                  required: t.validation.required,
                  maxLength: {
                    value: 50,
                    message: t.validation.maxLength.replace("{count}", "50"),
                  },
                })}
              />
              <Input
                label={t.auth.lastName}
                autoComplete="family-name"
                placeholder="Doe"
                startIcon={<User className="size-4" />}
                error={errors.lastName?.message}
                {...register("lastName", {
                  required: t.validation.required,
                  maxLength: {
                    value: 50,
                    message: t.validation.maxLength.replace("{count}", "50"),
                  },
                })}
              />
            </div>

            {/* 3. Email Field */}
            <Input
              label={t.auth.email}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              startIcon={<Mail className="size-4" />}
              error={errors.email?.message}
              {...register("email", {
                required: t.validation.required,
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: t.validation.emailInvalid,
                },
              })}
            />

            {/* 4. Role Selection (Positioned directly under First Name & Email) */}
            <div className="p-4 rounded-2xl bg-surface-2/40 border border-border/60">
              <label className="mb-2.5 block text-xs font-bold uppercase tracking-wider text-fg-muted">
                I want to join as
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label
                  className={cn(
                    "relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 select-none",
                    selectedRole === "AUTHOR"
                      ? "border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/20 shadow-xs"
                      : "border-border hover:border-brand-300 dark:hover:border-brand-700 bg-surface"
                  )}
                >
                  <input
                    type="radio"
                    value="AUTHOR"
                    className="sr-only"
                    {...register("role")}
                  />
                  <div className={cn(
                    "mt-0.5 rounded-lg p-2 transition-colors",
                    selectedRole === "AUTHOR" ? "bg-brand-500 text-white" : "bg-surface-2 text-fg-muted"
                  )}>
                    <PenTool className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-fg">Author</span>
                    <span className="block text-xs leading-tight text-fg-muted mt-0.5">
                      Create, illustrate & publish stories
                    </span>
                  </div>
                  {selectedRole === "AUTHOR" && (
                    <div className="absolute top-3 end-3 size-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                  )}
                </label>

                <label
                  className={cn(
                    "relative flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-all duration-200 select-none",
                    selectedRole === "USER"
                      ? "border-brand-500 bg-brand-500/10 ring-2 ring-brand-500/20 shadow-xs"
                      : "border-border hover:border-brand-300 dark:hover:border-brand-700 bg-surface"
                  )}
                >
                  <input
                    type="radio"
                    value="USER"
                    className="sr-only"
                    {...register("role")}
                  />
                  <div className={cn(
                    "mt-0.5 rounded-lg p-2 transition-colors",
                    selectedRole === "USER" ? "bg-brand-500 text-white" : "bg-surface-2 text-fg-muted"
                  )}>
                    <BookOpen className="size-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block text-sm font-bold text-fg">Audience</span>
                    <span className="block text-xs leading-tight text-fg-muted mt-0.5">
                      Explore & read visual worlds
                    </span>
                  </div>
                  {selectedRole === "USER" && (
                    <div className="absolute top-3 end-3 size-4 rounded-full bg-brand-500 text-white flex items-center justify-center">
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* 5. Password & Confirm Password: 2 Columns */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 items-start">
              <Input
                label={t.auth.password}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                startIcon={<Lock className="size-4" />}
                endIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t.common.close : t.common.search}
                    className="text-fg-faint hover:text-fg transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                }
                error={errors.password?.message}
                {...register("password", {
                  required: t.validation.required,
                  minLength: {
                    value: 8,
                    message: t.validation.minLength.replace("{count}", "8"),
                  },
                  pattern: {
                    value: passwordPattern,
                    message: t.validation.passwordStrength,
                  },
                })}
              />

              <Input
                label={t.auth.confirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                startIcon={<Lock className="size-4" />}
                endIcon={
                  <div className="flex items-center gap-2">
                    {confirmPassword && (
                      confirmPassword === password ? (
                        <Check className="size-4 text-emerald-500" />
                      ) : null
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      aria-label={showConfirmPassword ? t.common.close : t.common.search}
                      className="text-fg-faint hover:text-fg transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                }
                error={errors.confirmPassword?.message}
                {...register("confirmPassword", {
                  required: t.validation.required,
                  validate: (v) => v === password || t.validation.confirmMismatch,
                })}
              />
            </div>

            {/* 6. Password Strength Meter & Checklist */}
            {password ? (
              <div className="space-y-2 rounded-xl bg-surface-2/30 p-3.5 border border-border/50 shadow-2xs mt-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-fg-muted font-semibold flex items-center gap-1.5">
                    <ShieldCheck className="size-4 text-brand-500" />
                    Password strength
                  </span>
                  <span
                    className={cn(
                      "font-bold",
                      strengthMeta.label === "Weak" && "text-red-500",
                      strengthMeta.label === "Fair" && "text-amber-500",
                      strengthMeta.label === "Good" && "text-blue-500",
                      strengthMeta.label === "Strong" && "text-emerald-500"
                    )}
                  >
                    {strengthMeta.label}
                  </span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden flex gap-1 p-0.5">
                  <div className={cn("h-full flex-1 rounded-full transition-colors duration-150", strengthMeta.percent >= 25 ? strengthMeta.color : "bg-border/60")} />
                  <div className={cn("h-full flex-1 rounded-full transition-colors duration-150", strengthMeta.percent >= 50 ? strengthMeta.color : "bg-border/60")} />
                  <div className={cn("h-full flex-1 rounded-full transition-colors duration-150", strengthMeta.percent >= 75 ? strengthMeta.color : "bg-border/60")} />
                  <div className={cn("h-full flex-1 rounded-full transition-colors duration-150", strengthMeta.percent >= 100 ? strengthMeta.color : "bg-border/60")} />
                </div>

                {/* Requirements grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1 text-xs">
                  <div className={cn("flex items-center gap-1.5", reqLength ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-fg-faint")}>
                    <div className={cn("size-3.5 rounded-full flex items-center justify-center text-[10px]", reqLength ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-surface-2 text-fg-faint")}>
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    8+ characters
                  </div>

                  <div className={cn("flex items-center gap-1.5", reqUpper && reqLower ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-fg-faint")}>
                    <div className={cn("size-3.5 rounded-full flex items-center justify-center text-[10px]", reqUpper && reqLower ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-surface-2 text-fg-faint")}>
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    Upper & lowercase
                  </div>

                  <div className={cn("flex items-center gap-1.5", reqNumber ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-fg-faint")}>
                    <div className={cn("size-3.5 rounded-full flex items-center justify-center text-[10px]", reqNumber ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-surface-2 text-fg-faint")}>
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    One number
                  </div>

                  <div className={cn("flex items-center gap-1.5", reqSpecial ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-fg-faint")}>
                    <div className={cn("size-3.5 rounded-full flex items-center justify-center text-[10px]", reqSpecial ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "bg-surface-2 text-fg-faint")}>
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    Special symbol (!@#$)
                  </div>
                </div>
              </div>
            ) : null}

            <Button type="submit" fullWidth loading={registerPending} size="lg" className="mt-2 shadow-md hover:shadow-lg py-3 text-base">
              {t.auth.registerAction}
            </Button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-sm text-fg-muted">
            <Sparkles className="size-4 text-brand-500 animate-pulse" aria-hidden />
            {t.brand.tagline}
          </p>

          <p className="mt-4 text-center text-sm text-fg-muted">
            {t.auth.haveAccount}{" "}
            <Link
              to="/login"
              className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              {t.nav.login}
            </Link>
          </p>
        </CardBody>
      </Card>
    </AuthFrame>
  );
}
