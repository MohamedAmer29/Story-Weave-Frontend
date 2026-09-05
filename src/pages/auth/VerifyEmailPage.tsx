import { useState } from "react";
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

export function VerifyEmailPage() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [email, setEmail] = useState(params.get("email") ?? "");
  const [otp, setOtp] = useState("");

  const verifyMutation = useMutation({
    mutationFn: () => authApi.verifyEmail({ email, otp }),
    onSuccess: () => {
      toast.success(t.verifyEmail.success);
      navigate("/dashboard", { replace: true });
    },
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const resendMutation = useMutation({
    mutationFn: () => authApi.resendVerification({ email }),
    onSuccess: () => toast.success(t.verifyEmail.resendSuccess),
    onError: (err) => toast.error(getErrorMessage(err) ?? t.common.error),
  });

  const canSubmit = email.trim().length > 0 && otp.length === 6 && !verifyMutation.isPending;

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
              <p className="mt-1 text-sm text-fg-muted">{t.verifyEmail.subtitle}</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="space-y-5">
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
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-fg">{t.verifyEmail.otpPlaceholder}</p>
              <OtpInput
                value={otp}
                onChange={(value: string) => setOtp(value.replace(/\D/g, ""))}
                numInputs={6}
                renderSeparator={<span className="text-fg-faint" aria-hidden />}
                renderInput={(inputProps) => (
                  <input
                    {...inputProps}
                    className="size-12 rounded-lg border border-border bg-surface text-center text-lg font-semibold text-fg focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                )}
                containerStyle="flex justify-center gap-2"
                shouldAutoFocus
              />
            </div>

            <Button type="button" fullWidth size="lg" disabled={!canSubmit} loading={verifyMutation.isPending} onClick={() => verifyMutation.mutate()}>
              <MailCheck className="size-4" aria-hidden />
              {t.verifyEmail.verifyAction}
            </Button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => resendMutation.mutate()}
                disabled={resendMutation.isPending || !email.trim()}
                className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-400 disabled:cursor-not-allowed disabled:text-fg-faint"
              >
                {t.verifyEmail.resend}
              </button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}