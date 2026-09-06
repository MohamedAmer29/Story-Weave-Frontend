import { BookOpenText } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { useLanguage } from "../../i18n";

export function Logo({ className, linkTo = "/" }: { className?: string; linkTo?: string }) {
  const { t } = useLanguage();
  return (
    <Link to={linkTo} className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-2xl bg-linear-to-br from-brand-500 to-sky-400 text-white shadow-[0_10px_20px_rgba(138,70,48,0.28)]">
        <BookOpenText className="size-5" aria-hidden />
      </span>
      <span className="font-display text-xl font-bold leading-tight tracking-[-0.03em] text-fg">
        {t.brand.name}
      </span>
    </Link>
  );
}