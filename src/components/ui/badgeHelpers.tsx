import type { BadgeProps } from "./Badge";
import { Badge } from "./Badge";
import { useLanguage } from "../../i18n";
import type { StoryStatus, StoryVisibility } from "../../api/types";

const statusTone: Record<StoryStatus, BadgeProps["tone"]> = {
  DRAFT: "neutral",
  PROCESSING: "warning",
  READY: "success",
  FAILED: "danger",
};

const visibilityTone: Record<StoryVisibility, BadgeProps["tone"]> = {
  PUBLIC: "brand",
  PRIVATE: "neutral",
  SHARED: "info",
};

export function StatusBadge({ status }: { status: StoryStatus }) {
  const { t } = useLanguage();
  return (
    <Badge tone={statusTone[status]} dot={status === "PROCESSING"}>
      {t.status[status]}
    </Badge>
  );
}

export function VisibilityBadge({ visibility }: { visibility: StoryVisibility }) {
  const { t } = useLanguage();
  return <Badge tone={visibilityTone[visibility]}>{t.status[visibility]}</Badge>;
}

export function SourceTypeBadge({ sourceType }: { sourceType: "TEXT" | "PDF" }) {
  const { t } = useLanguage();
  return <Badge tone="neutral">{t.status[sourceType]}</Badge>;
}