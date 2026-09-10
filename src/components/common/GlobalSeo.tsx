import { useLocation } from "react-router-dom";
import { useLanguage } from "../../i18n";
import {
  INDEXABLE_ROBOTS,
  isIndexablePath,
  NOINDEX_ROBOTS,
} from "../../lib/seo";
import { Seo } from "./Seo";

/**
 * Global SEO fallback rendered once at the app root.
 *
 * - Supplies the localized default title/description used by pages that do not
 *   define their own metadata.
 * - Sets the canonical link to the current (query-insensitive) pathname.
 * - Enforces `noindex, nofollow` on all private/authenticated/utility areas
 *   (dashboard, library, editor, profile, settings, notifications, admin,
 *   auth, etc.) without requiring each page to opt in.
 *
 * Individual pages use the deeper <Seo /> (or <Helmet />) component, which
 * takes priority over these defaults for the tags it defines.
 */
export function GlobalSeo() {
  const { t } = useLanguage();
  const { pathname } = useLocation();

  return (
    <Seo
      title={t.seo.defaultTitle}
      description={t.seo.defaultDescription}
      robots={isIndexablePath(pathname) ? INDEXABLE_ROBOTS : NOINDEX_ROBOTS}
    />
  );
}