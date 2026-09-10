import { StaticPage } from "./StaticPage";
import { useLanguage } from "../../i18n";

export function AboutPage() {
  const { t } = useLanguage();
  const s = t.static;
  return (
    <StaticPage
      title={s.aboutTitle}
      intro={s.aboutIntro}
      sections={[
        { heading: s.aboutMission, body: s.aboutMissionBody },
        { heading: s.aboutApproach, body: s.aboutApproachBody },
      ]}
    />
  );
}
