import { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import OtpInput from "react-otp-input";
import { MailCheck } from "lucide-react";
import { authApi } from "../../api/authApi";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/field";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";
import { getErrorMessage } from "../../api/axios";
import { useLanguage } from "../../i18n";
import { useAppDispatch } from "../../store";
import { setCredentials, updateLocalUser, type AuthenticatedUser } from "../../store/authSlice";

export function SendVerifyEmailPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? "");

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification({ email }),
    onSuccess: () => {
      toast.success(t.verifyEmail.resendSuccess);
      navigate(`/verify-email-otp?email=${encodeURIComponent(email)}`);
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      toast.error(t.validation.emailInvalid);
      return;
    }
    resendMutation.mutate();
  };

  return (
    <div className="hero-aurora flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Helmet>
        <title>
          {t.verifyEmail.title} · {t.brand.name}
        </title>
      </Helmet>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo />
            <div>
              <h1 className="mt-2 text-2xl font-bold text-fg">{t.verifyEmail.title}</h1>
              <p className="mt-1 text-sm text-fg-muted">{t.verifyEmail.subtitleSend}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label htmlFor="verify-email" className="block text-sm font-medium text-fg">
                {t.verifyEmail.email}
              </label>
              <Input
                id="verify-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1.5"
                autoComplete="email"
                required
              />
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              disabled={!email.trim() || resendMutation.isPending}
              loading={resendMutation.isPending}
            >
              <MailCheck className="size-4" aria-hidden />
              {t.verifyEmail.sendCodeAction}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

export function VerifyEmailOtpPage() {
  const { t } = useLanguage();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const email = params.get("email") ?? "";
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

  const verifyMutation = useMutation({
    mutationFn: () => authApi.verifyEmail({ email, otp }),
    onSuccess: (res) => {
      if (res.accessToken && res.user) {
        dispatch(
          setCredentials({
            token: res.accessToken,
            user: res.user as AuthenticatedUser,
          })
        );
      } else {
        dispatch(updateLocalUser({ emailVerified: true }));
      }
      toast.success(t.verifyEmail.success);
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification({ email }),
    onSuccess: () => {
      toast.success(t.verifyEmail.resendSuccess);
      setResendCount((c) => c + 1);
      setCooldown(60);
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const handleResend = () => {
    if (cooldown > 0 || resendCount >= 3 || resendMutation.isPending || !email.trim()) return;
    resendMutation.mutate();
  };

  const canSubmit = email.trim().length > 0 && otp.length === 6 && !verifyMutation.isPending;
  const maxResendsReached = resendCount >= 3;
  const isResendDisabled = cooldown > 0 || maxResendsReached || resendMutation.isPending || !email.trim();

  let resendLabel = t.verifyEmail.resend;
  if (maxResendsReached) {
    resendLabel = t.verifyEmail.maxResendsReached;
  } else if (cooldown > 0) {
    resendLabel = t.verifyEmail.resendCooldown.replace("{seconds}", String(cooldown));
  } else if (resendCount > 0) {
    resendLabel = t.verifyEmail.resendAttemptsLeft.replace("{left}", String(3 - resendCount));
  }

  return (
    <div className="hero-aurora flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12">
      <Helmet>
        <title>
          {t.verifyEmail.title} · {t.brand.name}
        </title>
      </Helmet>
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo />
            <div>
              <h1 className="mt-2 text-2xl font-bold text-fg">{t.verifyEmail.title}</h1>
              <p className="mt-1 text-sm text-fg-muted">
                {t.verifyEmail.sentTo} <span className="font-semibold text-fg">{email}</span>
              </p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-5">
              <div dir="ltr" className="flex justify-center my-2">
                <OtpInput
                  value={otp}
                  onChange={(value: string) => setOtp(value.replace(/\D/g, ""))}
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

            <Button type="button" fullWidth size="lg" disabled={!canSubmit} loading={verifyMutation.isPending} onClick={() => verifyMutation.mutate()}>
              <MailCheck className="size-4" aria-hidden />
              {t.verifyEmail.verifyAction}
            </Button>

            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => navigate(`/verify-email?email=${encodeURIComponent(email)}`)}
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
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

// Retained for backward compatibility
export function VerifyEmailPage() {
  return <SendVerifyEmailPage />;
}