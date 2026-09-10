import { StaticPage } from "./StaticPage";
import { useLanguage } from "../../i18n";

export function PrivacyPage() {
  const { t } = useLanguage();
  const s = t.static;
  return (
    <StaticPage
      title={s.privacyTitle}
      intro={s.privacyIntro}
      sections={[
        { heading: s.privacyData, body: s.privacyDataBody },
        { heading: s.privacyRights, body: s.privacyRightsBody },
      ]}
    />
  );
}
