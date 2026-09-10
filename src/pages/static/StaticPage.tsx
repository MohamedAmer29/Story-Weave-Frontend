import { Helmet } from "react-helmet-async";
import type { ReactNode } from "react";
import { useLanguage } from "../../i18n";

export interface StaticSection {
  heading: string;
  body: string;
}

const sectionCard =
  "rounded-[1.6rem] border border-border bg-surface/90 p-6 shadow-[0_16px_40px_rgba(49,34,23,0.05)]";

export function StaticPage({
  title,
  intro,
  sections,
  children,
}: {
  title: string;
  intro?: string;
  sections?: StaticSection[];
  children?: ReactNode;
}) {
  const { t } = useLanguage();
  return (
    <>
      <Helmet>
        <title>
          {title} · {t.brand.name}
        </title>
      </Helmet>
      <section className="hero-aurora relative">
        <div className="page-shell max-w-3xl">
          <h1 className="font-display text-center text-4xl font-semibold tracking-[-0.04em] text-fg sm:text-5xl">
            {title}
          </h1>
          {intro && (
            <p className="mx-auto mt-4 max-w-xl text-center text-lg text-fg-muted">
              {intro}
            </p>
          )}
          <div className="mt-10 space-y-5">
            {sections?.map((section) => (
              <div key={section.heading} className={sectionCard}>
                <h2 className="text-lg font-bold text-fg">{section.heading}</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">
                  {section.body}
                </p>
              </div>
            ))}
            {children}
          </div>
        </div>
      </section>
    </>
  );
}
