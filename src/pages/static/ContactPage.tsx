import { Mail } from "lucide-react";
import { StaticPage } from "./StaticPage";
import { useLanguage } from "../../i18n";

export function ContactPage() {
  const { t } = useLanguage();
  const s = t.static;
  return (
    <StaticPage title={s.contactTitle} intro={s.contactIntro}>
      <div className="rounded-[1.6rem] border border-border bg-surface/90 p-6 text-center shadow-[0_16px_40px_rgba(49,34,23,0.05)]">
        <a
          href={`mailto:${s.contactEmail}`}
          className="inline-flex items-center gap-2 font-semibold text-brand-600 hover:underline dark:text-brand-400"
        >
          <Mail className="size-4" aria-hidden />
          {s.contactEmail}
        </a>
        <p className="mt-2 text-sm text-fg-muted">{s.contactResponse}</p>
      </div>
    </StaticPage>
  );
}
