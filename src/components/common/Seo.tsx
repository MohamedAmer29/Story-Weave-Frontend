import type { ReactNode } from "react";
import { Helmet } from "react-helmet-async";

export interface SeoProps {
  title: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  children?: ReactNode;
}

export function Seo({
  title,
  description,
  canonical,
  ogType = "website",
  ogImage,
  children,
}: SeoProps) {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={title} />
      {description && <meta property="og:description" content={description} />}
      {ogImage && <meta property="og:image" content={ogImage} />}
      {children}
    </Helmet>
  );
}