import { BookOpenText } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "../../lib/cn";
import { useLanguage } from "../../i18n";

export function Logo({ className, linkTo = "/" }: { className?: string; linkTo?: string }) {
  const { t } = useLanguage();
  return (
    <Link to={linkTo} className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-navy-800 text-white shadow-sm shadow-brand-700/30">
        <BookOpenText className="size-5" aria-hidden />
      </span>
      <span className="font-display text-lg font-bold leading-tight text-fg">
        {t.brand.name}
      </span>
    </Link>
  );
}