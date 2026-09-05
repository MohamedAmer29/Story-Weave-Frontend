import { Helmet } from "react-helmet-async";
import { Card, CardBody, CardHeader } from "../components/ui/Card";
import { LanguageSelect, ThemeSelect } from "../components/layout/themeControls";
import { useLanguage } from "../i18n";

export function SettingsPage() {
  const { t } = useLanguage();

  return (
    <>
      <Helmet>
        <title>
          {t.nav.settings} · {t.brand.name}
        </title>
      </Helmet>
      <section className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl font-bold text-fg sm:text-4xl">{t.nav.settings}</h1>
        <p className="mt-2 text-fg-muted">{t.settings.subtitle}</p>

        <div className="mt-8 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-fg">{t.settings.languageTitle}</h2>
              <p className="mt-1 text-sm text-fg-muted">{t.settings.languageDesc}</p>
            </CardHeader>
            <CardBody className="p-6" >
              <div className="flex flex-wrap items-center gap-3">
                <LanguageSelect />
                {t.common.english} / {t.common.arabic}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-bold text-fg">{t.settings.themeTitle}</h2>
              <p className="mt-1 text-sm text-fg-muted">{t.settings.themeDesc}</p>
            </CardHeader>
            <CardBody className="p-6">
              <ThemeSelect />
            </CardBody>
          </Card>
        </div>
      </section>
    </>
  );
}