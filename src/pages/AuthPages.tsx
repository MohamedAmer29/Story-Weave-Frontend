import { type ReactNode, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Eye, EyeOff, Sparkles } from "lucide-react";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { Input } from "../components/ui/field";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/ui/Logo";
import { getErrorMessage } from "../api/axios";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../i18n";
import { Reveal } from "../components/motion/Reveal";

function AuthFrame({ children }: { children: ReactNode }) {
  const { t } = useLanguage();
  return (
    <div className="relative isolate min-h-[calc(100svh-4.5rem)] overflow-hidden">
      <div className="hero-aurora absolute inset-0" aria-hidden />
      <div className="page-grain pointer-events-none absolute inset-0" aria-hidden />
      <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-4 py-12 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-16">
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
      await login({
        email: values.email,
        password: values.password,
        rememberMe: values.rememberMe,
      });
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
      <Card className="w-full max-w-md lg:ms-auto">
        <CardHeader>
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
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <Input
              label={t.auth.email}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
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
              <div className="relative">
                <Input
                  label={t.auth.password}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  error={errors.password?.message}
                  className="pe-11"
                  {...register("password", { required: t.validation.required })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t.common.close : t.common.search}
                  className="absolute end-3 top-[2.79rem]  -translate-y-1/2 text-fg-faint hover:text-fg"
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-fg-muted">
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
            {t.auth.noAccount}{" "}
            <Link
              to="/register"
              className="font-semibold text-brand-600 hover:underline dark:text-brand-400"
            >
              {t.nav.register}
            </Link>
          </p>
        </CardBody>
      </Card>
    </AuthFrame>
  );
}

export function RegisterPage() {
  const { t } = useLanguage();
  const { register: registerUser, registerPending } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  interface RegisterForm {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = watch("password");

  const onSubmit = handleSubmit(async (values) => {
    try {
      await registerUser({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });
      toast.success(t.auth.registerSuccess);
      navigate(`/verify-email-otp?email=${encodeURIComponent(values.email)}`, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err) ?? t.common.error);
    }
  });

  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  return (
    <AuthFrame>
      <Helmet>
        <title>
          {t.nav.register} · {t.brand.name}
        </title>
      </Helmet>
      <Card className="w-full max-w-md lg:ms-auto">
        <CardHeader>
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo />
            <div>
              <h1 className="mt-2 text-2xl font-bold text-fg">
                {t.auth.registerTitle}
              </h1>
              <p className="mt-1 text-sm text-fg-muted">
                {t.auth.registerSubtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4" noValidate>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={t.auth.firstName}
                autoComplete="given-name"
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
            <Input
              label={t.auth.email}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register("email", {
                required: t.validation.required,
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: t.validation.emailInvalid,
                },
              })}
            />
            <div className="relative">
              <Input
                label={t.auth.password}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                error={errors.password?.message}
                hint={t.auth.passwordHelp}
                className="pe-11"
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
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? t.common.close : t.common.search}
                className="absolute end-3 top-[2.79rem] -translate-y-1/2 text-fg-faint hover:text-fg"
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
              autoComplete="new-password"
              error={errors.confirmPassword?.message}
              {...register("confirmPassword", {
                required: t.validation.required,
                validate: (v) => v === password || t.validation.confirmMismatch,
              })}
            />

            <Button type="submit" fullWidth loading={registerPending} size="lg">
              {t.auth.registerAction}
            </Button>
          </form>

          <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-sm text-fg-muted">
            <Sparkles className="size-4 text-brand-500" aria-hidden />
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
