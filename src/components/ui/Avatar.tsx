import { forwardRef, useState, type ImgHTMLAttributes } from "react";
import { cn } from "../../lib/cn";
import { buildResponsiveSrcSet } from "../../utils/imageSrcSet";

type AvatarSize = "sm" | "md" | "lg" | "xl";

export interface AvatarProps extends Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src"
> {
  src?: string | null;
  name?: string;
  size?: AvatarSize;
}

const sizeClasses: Record<AvatarSize, string> = {
  sm: "size-6 text-xs",
  md: "size-9 text-sm",
  lg: "size-12 text-lg",
  xl: "size-16 text-xl",
};

function initials(name?: string): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean).slice(0, 2);
  if (parts.length === 0) return "U";
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("");
}

export const Avatar = forwardRef<HTMLImageElement, AvatarProps>(function Avatar(
  { src, name, size = "md", className, alt, ...rest },
  ref,
) {
  const [failed, setFailed] = useState(false);
  const showImage = !!src && !failed;

  return showImage ? (
    <img
      ref={ref}
      src={src}
      alt={alt ?? name ?? "avatar"}
      loading="lazy"
      onError={() => setFailed(true)}
      srcSet={buildResponsiveSrcSet(src) ?? undefined}
      className={cn(
        "rounded-full border border-border object-cover",
        sizeClasses[size],
        className,
      )}
      {...rest}
    />
  ) : (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full border border-border bg-gradient-to-br from-brand-600 to-navy-800 font-bold text-white",
        sizeClasses[size],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
});
