import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import OtpInput from "react-otp-input";
import {
  ArrowLeft,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { authApi } from "../../api/authApi";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/field";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";
import { getErrorMessage } from "../../api/axios";
import { useLanguage } from "../../i18n";
import { cn } from "../../lib/cn";

// Page 1: Request Email Reset Code
export function ForgotPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") || "");

  const forgotMutation = useMutation({
    mutationFn: (userEmail: string) =>
      authApi.forgotPassword({ email: userEmail }),
    onSuccess: () => {
      toast.success(t.forgotPassword.codeSent);
      navigate(`/forgot-password-otp?email=${encodeURIComponent(email)}`);
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error(t.validation.emailInvalid);
      return;
    }
    forgotMutation.mutate(email);
  };

  return (
    <div className="hero-aurora flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Helmet>
        <title>
          {t.forgotPassword.title} · {t.brand.name}
        </title>
      </Helmet>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo />
            <div>
              <h1 className="mt-2 text-2xl font-bold text-fg">
                {t.forgotPassword.title}
              </h1>
              <p className="mt-1 text-sm text-fg-muted">
                {t.forgotPassword.subtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label={t.auth.email}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              placeholder="you@example.com"
              required
            />

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={forgotMutation.isPending}
              disabled={!email.trim()}
            >
              <Mail className="size-4" aria-hidden />
              {t.forgotPassword.sendCodeAction}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
            >
              <ArrowLeft className="size-4" />
              {t.forgotPassword.backToLogin}
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Page 2: Verify OTP
export function ForgotPasswordOtpPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [resendCount, setResendCount] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const forgotMutation = useMutation({
    mutationFn: (userEmail: string) =>
      authApi.forgotPassword({ email: userEmail }),
    onSuccess: () => {
      toast.success(t.forgotPassword.codeSent);
      setResendCount((c) => c + 1);
      setCooldown(60);
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const verifyOtpMutation = useMutation({
    mutationFn: () => authApi.verifyResetOtp({ email, otp }),
    onSuccess: (data) => {
      toast.success(t.forgotPassword.otpVerified);
      navigate(
        `/reset-password?resetToken=${encodeURIComponent(
          data.resetToken,
        )}&email=${encodeURIComponent(email)}`,
      );
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const handleResend = () => {
    if (
      cooldown > 0 ||
      resendCount >= 3 ||
      forgotMutation.isPending ||
      !email.trim()
    )
      return;
    forgotMutation.mutate(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    verifyOtpMutation.mutate();
  };

  const maxResendsReached = resendCount >= 3;
  const isResendDisabled =
    cooldown > 0 ||
    maxResendsReached ||
    forgotMutation.isPending ||
    !email.trim();

  let resendLabel = t.verifyEmail.resend;
  if (maxResendsReached) {
    resendLabel = t.verifyEmail.maxResendsReached;
  } else if (cooldown > 0) {
    resendLabel = t.verifyEmail.resendCooldown.replace(
      "{seconds}",
      String(cooldown),
    );
  } else if (resendCount > 0) {
    resendLabel = t.verifyEmail.resendAttemptsLeft.replace(
      "{left}",
      String(3 - resendCount),
    );
  }

  return (
    <div className="hero-aurora flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Helmet>
        <title>
          {t.forgotPassword.verifyTitle} · {t.brand.name}
        </title>
      </Helmet>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo />
            <div>
              <h1 className="mt-2 text-2xl font-bold text-fg">
                {t.forgotPassword.verifyTitle}
              </h1>
              <p className="mt-1 text-sm text-fg-muted">
                {t.forgotPassword.verifySubtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div dir="ltr" className="flex justify-center my-2">
              <OtpInput
                value={otp}
                onChange={(val: string) => setOtp(val.replace(/\D/g, ""))}
                numInputs={6}
                renderSeparator={<span className="w-1.5 sm:w-2" aria-hidden />}
                renderInput={(inputProps, index) => {
                  const isFilled = Boolean(otp[index ?? 0]);
                  return (
                    <input
                      {...inputProps}
                      style={{ width: undefined }}
                      className={`size-11 sm:size-12 rounded-xl border-2 text-center text-xl font-bold text-fg transition-all duration-150 outline-none ${
                        isFilled
                          ? "border-brand-500 bg-brand-500/10 shadow-sm dark:bg-brand-500/20"
                          : "border-border bg-surface hover:border-fg-faint"
                      } focus:border-brand-500 focus:bg-surface focus:ring-4 focus:ring-brand-500/20`}
                    />
                  );
                }}
                containerStyle="flex justify-center items-center gap-1 sm:gap-1.5"
                shouldAutoFocus
              />
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={otp.length !== 6 || verifyOtpMutation.isPending}
              loading={verifyOtpMutation.isPending}
            >
              <KeyRound className="size-4" aria-hidden />
              {t.forgotPassword.verifyAction}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/forgot-password?email=${encodeURIComponent(email)}`,
                  )
                }
                className="font-medium text-fg-muted hover:text-fg"
              >
                {t.forgotPassword.changeEmail}
              </button>
              <button
                type="button"
                onClick={handleResend}
                disabled={isResendDisabled}
                className="font-medium text-brand-600 hover:underline dark:text-brand-400 disabled:cursor-not-allowed disabled:text-fg-faint disabled:no-underline"
              >
                {resendLabel}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
            >
              <ArrowLeft className="size-4" />
              {t.forgotPassword.backToLogin}
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Page 3: New Password
export function ResetPasswordPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const resetToken = searchParams.get("resetToken") || "";
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  interface ResetPasswordForm {
    newPassword: string;
    confirmPassword: string;
  }

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordForm>();

  const newPassword = watch("newPassword") || "";
  const confirmPassword = watch("confirmPassword") || "";

  // Password requirements calculation
  const reqLength = newPassword.length >= 8;
  const reqUpper = /[A-Z]/.test(newPassword);
  const reqLower = /[a-z]/.test(newPassword);
  const reqNumber = /\d/.test(newPassword);
  const reqSpecial = /[!@#$%^&*]/.test(newPassword);

  const reqMetCount = [
    reqLength,
    reqUpper && reqLower,
    reqNumber,
    reqSpecial,
  ].filter(Boolean).length;

  const getStrengthMeta = () => {
    if (!newPassword) return { percent: 0, color: "bg-border", label: "" };
    if (reqMetCount <= 1)
      return { percent: 25, color: "bg-red-500", label: "Weak" };
    if (reqMetCount === 2)
      return { percent: 50, color: "bg-amber-500", label: "Fair" };
    if (reqMetCount === 3)
      return { percent: 75, color: "bg-blue-500", label: "Good" };
    return { percent: 100, color: "bg-emerald-500", label: "Strong" };
  };

  const strengthMeta = getStrengthMeta();

  const resetPasswordMutation = useMutation({
    mutationFn: (values: ResetPasswordForm) =>
      authApi.resetPassword({ resetToken, newPassword: values.newPassword }),
    onSuccess: () => {
      toast.success(t.forgotPassword.resetSuccess);
      navigate("/login", { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;

  const handleStep3Submit = handleSubmit((values) => {
    resetPasswordMutation.mutate(values);
  });

  return (
    <div className="hero-aurora flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Helmet>
        <title>
          {t.forgotPassword.newPasswordTitle} · {t.brand.name}
        </title>
      </Helmet>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo />
            <div>
              <h1 className="mt-2 text-2xl font-bold text-fg">
                {t.forgotPassword.newPasswordTitle}
              </h1>
              <p className="mt-1 text-sm text-fg-muted">
                {t.forgotPassword.newPasswordSubtitle}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleStep3Submit} className="space-y-4" noValidate>
            <div className="relative">
              <Input
                label={t.profile.newPassword}
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                error={errors.newPassword?.message}
                hint={t.auth.passwordHelp}
                className="pe-11"
                {...register("newPassword", {
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

            {/* Password Strength Meter & Checklist */}
            {newPassword ? (
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
                      strengthMeta.label === "Strong" && "text-emerald-500",
                    )}
                  >
                    {strengthMeta.label}
                  </span>
                </div>

                <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden flex gap-1 p-0.5">
                  <div
                    className={cn(
                      "h-full flex-1 rounded-full transition-colors duration-150",
                      strengthMeta.percent >= 25
                        ? strengthMeta.color
                        : "bg-border/60",
                    )}
                  />
                  <div
                    className={cn(
                      "h-full flex-1 rounded-full transition-colors duration-150",
                      strengthMeta.percent >= 50
                        ? strengthMeta.color
                        : "bg-border/60",
                    )}
                  />
                  <div
                    className={cn(
                      "h-full flex-1 rounded-full transition-colors duration-150",
                      strengthMeta.percent >= 75
                        ? strengthMeta.color
                        : "bg-border/60",
                    )}
                  />
                  <div
                    className={cn(
                      "h-full flex-1 rounded-full transition-colors duration-150",
                      strengthMeta.percent >= 100
                        ? strengthMeta.color
                        : "bg-border/60",
                    )}
                  />
                </div>

                {/* Requirements grid */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 pt-1 text-xs">
                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      reqLength
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-fg-faint",
                    )}
                  >
                    <div
                      className={cn(
                        "size-3.5 rounded-full flex items-center justify-center text-[10px]",
                        reqLength
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-surface-2 text-fg-faint",
                      )}
                    >
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    8+ characters
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      reqUpper && reqLower
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-fg-faint",
                    )}
                  >
                    <div
                      className={cn(
                        "size-3.5 rounded-full flex items-center justify-center text-[10px]",
                        reqUpper && reqLower
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-surface-2 text-fg-faint",
                      )}
                    >
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    Upper & lowercase
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      reqNumber
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-fg-faint",
                    )}
                  >
                    <div
                      className={cn(
                        "size-3.5 rounded-full flex items-center justify-center text-[10px]",
                        reqNumber
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-surface-2 text-fg-faint",
                      )}
                    >
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    One number
                  </div>

                  <div
                    className={cn(
                      "flex items-center gap-1.5",
                      reqSpecial
                        ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "text-fg-faint",
                    )}
                  >
                    <div
                      className={cn(
                        "size-3.5 rounded-full flex items-center justify-center text-[10px]",
                        reqSpecial
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-surface-2 text-fg-faint",
                      )}
                    >
                      <Check className="size-2.5 stroke-[3]" />
                    </div>
                    Special symbol (!@#$)
                  </div>
                </div>
              </div>
            ) : null}

            <div className="relative">
              <Input
                label={t.auth.confirmPassword}
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                className="pe-11"
                {...register("confirmPassword", {
                  required: t.validation.required,
                  validate: (v) =>
                    v === newPassword || t.validation.confirmMismatch,
                })}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                aria-label={
                  showConfirmPassword ? t.common.close : t.common.search
                }
                className="absolute end-3 top-[2.79rem] -translate-y-1/2 text-fg-faint hover:text-fg"
              >
                {showConfirmPassword ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
              {confirmPassword && confirmPassword === newPassword && (
                <span className="absolute end-11 top-[2.79rem] -translate-y-1/2 text-emerald-500">
                  <Check className="size-4" />
                </span>
              )}
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={resetPasswordMutation.isPending}
            >
              <Lock className="size-4" aria-hidden />
              {t.forgotPassword.resetAction}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted hover:text-fg"
            >
              <ArrowLeft className="size-4" />
              {t.forgotPassword.backToLogin}
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
