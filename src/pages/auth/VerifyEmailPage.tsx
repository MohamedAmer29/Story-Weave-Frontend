import { useState, useEffect, useRef } from "react";
import { Helmet } from "react-helmet-async";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import OtpInput from "react-otp-input";
import { MailCheck, RefreshCw, ArrowLeft, Mail } from "lucide-react";
import { authApi } from "../../api/authApi";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Input } from "../../components/ui/field";
import { Button } from "../../components/ui/Button";
import { Logo } from "../../components/ui/Logo";
import { getErrorMessage } from "../../api/axios";
import { useLanguage } from "../../i18n";
import { useAuth } from "../../hooks/useAuth";
import { useAppDispatch } from "../../store";
import { setCredentials, updateLocalUser, type AuthenticatedUser } from "../../store/authSlice";

export function SendVerifyEmailPage() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [email, setEmail] = useState(searchParams.get("email") ?? user?.email ?? "");

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification({ email: email.trim() }),
    onSuccess: () => {
      toast.success(t.verifyEmail.resendSuccess);
      navigate(`/verify-email-otp?email=${encodeURIComponent(email.trim())}`);
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email.trim())) {
      toast.error(t.validation.emailInvalid);
      return;
    }
    resendMutation.mutate();
  };

  return (
    <div className="hero-aurora flex min-h-screen items-center justify-center px-4 py-12">
      <Helmet>
        <title>
          {t.verifyEmail.title} · {t.brand.name}
        </title>
      </Helmet>
      <Card className="w-full max-w-md shadow-xl backdrop-blur-sm border-border/80">
        <CardHeader className="pt-6 pb-2">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo />
            <div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-fg">{t.verifyEmail.title}</h1>
              <p className="mt-1.5 text-sm text-fg-muted">{t.verifyEmail.subtitleSend}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-6 sm:px-8">
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <Input
                id="verify-email"
                type="email"
                label={t.verifyEmail.email}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                startIcon={<Mail className="size-4" />}
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
              className="shadow-md hover:shadow-lg"
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
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  
  const [email, setEmail] = useState(params.get("email") ?? user?.email ?? "");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(60);
  const [resendCount, setResendCount] = useState(0);
  const submittingRef = useRef(false);

  useEffect(() => {
    if (!email && user?.email) {
      setEmail(user.email);
    }
  }, [user?.email, email]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const verifyMutation = useMutation({
    mutationFn: (targetOtp: string) => authApi.verifyEmail({ email: email.trim(), otp: targetOtp }),
    onSuccess: (res) => {
      submittingRef.current = false;
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
    onError: (err) => {
      submittingRef.current = false;
      toast.error(getErrorMessage(err) ?? t.common.error);
    },
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification({ email: email.trim() }),
    onSuccess: () => {
      toast.success(t.verifyEmail.resendSuccess);
      setResendCount((c) => c + 1);
      setCooldown(60);
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const handleOtpChange = (value: string) => {
    const clean = value.replace(/\D/g, "");
    setOtp(clean);
    
    // Auto-submit when all 6 digits are typed
    if (clean.length === 6 && email.trim() && !verifyMutation.isPending && !submittingRef.current) {
      submittingRef.current = true;
      verifyMutation.mutate(clean);
    }
  };

  const handleResend = () => {
    if (cooldown > 0 || resendCount >= 3 || resendMutation.isPending || !email.trim()) return;
    resendMutation.mutate();
  };

  const handleSubmit = () => {
    if (otp.length === 6 && email.trim() && !verifyMutation.isPending) {
      submittingRef.current = true;
      verifyMutation.mutate(otp);
    }
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
    <div className="hero-aurora flex min-h-screen items-center justify-center px-4 py-12">
      <Helmet>
        <title>
          {t.verifyEmail.title} · {t.brand.name}
        </title>
      </Helmet>
      <Card className="w-full max-w-md shadow-xl backdrop-blur-sm border-border/80">
        <CardHeader className="pt-6 pb-2">
          <div className="flex flex-col items-center gap-3 text-center">
            <Logo />
            <div>
              <h1 className="mt-2 text-2xl font-bold tracking-tight text-fg">{t.verifyEmail.title}</h1>
              {email ? (
                <p className="mt-1.5 text-sm text-fg-muted">
                  {t.verifyEmail.sentTo} <span className="font-semibold text-fgDir dir-ltr">{email}</span>
                </p>
              ) : (
                <p className="mt-1.5 text-sm text-fg-muted">
                  Enter the verification code sent to your email.
                </p>
              )}
            </div>
          </div>
        </CardHeader>
        <CardBody className="px-6 py-6 sm:px-8">
          <div className="space-y-6">
            {!email ? (
              <div className="space-y-4">
                <Input
                  type="email"
                  label={t.verifyEmail.email}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  startIcon={<Mail className="size-4" />}
                />
              </div>
            ) : null}

            {/* OTP Input Boxes */}
            <div dir="ltr" className="flex justify-center my-3">
              <OtpInput
                value={otp}
                onChange={handleOtpChange}
                numInputs={6}
                renderSeparator={<span className="w-1.5 sm:w-2.5" aria-hidden />}
                renderInput={(inputProps, index) => {
                  const isFilled = Boolean(otp[index ?? 0]);
                  return (
                    <input
                      {...inputProps}
                      style={{ width: undefined }}
                      className={`size-11 sm:size-12 rounded-2xl border-2 text-center text-xl font-bold text-fg transition-all duration-200 outline-none ${
                        isFilled
                          ? "border-brand-500 bg-brand-500/10 ring-4 ring-brand-500/15 shadow-sm dark:bg-brand-500/20"
                          : "border-border bg-surface/70 hover:border-brand-400"
                      } focus:border-brand-500 focus:bg-surface focus:ring-4 focus:ring-brand-500/20`}
                    />
                  );
                }}
                containerStyle="flex justify-center items-center gap-1 sm:gap-1.5"
                shouldAutoFocus
              />
            </div>

            <Button
              type="button"
              fullWidth
              size="lg"
              disabled={!canSubmit}
              loading={verifyMutation.isPending}
              onClick={handleSubmit}
              className="shadow-md hover:shadow-lg"
            >
              <MailCheck className="size-4" aria-hidden />
              {t.verifyEmail.verifyAction}
            </Button>

            <div className="flex items-center justify-between text-sm pt-1">
              <button
                type="button"
                onClick={() => navigate(`/verify-email?email=${encodeURIComponent(email)}`)}
                className="inline-flex items-center gap-1.5 font-medium text-fg-muted hover:text-fg transition-colors"
              >
                <ArrowLeft className="size-3.5 rtl:rotate-180" />
                {t.forgotPassword.changeEmail}
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={isResendDisabled}
                className="inline-flex items-center gap-1.5 font-semibold text-brand-600 hover:underline dark:text-brand-400 disabled:cursor-not-allowed disabled:text-fg-faint disabled:no-underline transition-colors"
              >
                {resendMutation.isPending ? (
                  <RefreshCw className="size-3.5 animate-spin" />
                ) : null}
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