import { StaticPage } from "./StaticPage";
import { useLanguage } from "../../i18n";

export function TermsPage() {
  const { t } = useLanguage();
  const s = t.static;
  return (
    <StaticPage
      title={s.termsTitle}
      intro={s.termsIntro}
      sections={[
        { heading: s.termsUse, body: s.termsUseBody },
        { heading: s.termsContent, body: s.termsContentBody },
      ]}
    />
  );
}
