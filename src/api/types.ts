import type { StoryCivilization } from "../constants/civilizations";

export type StoryStatus = "DRAFT" | "PROCESSING" | "READY" | "FAILED";
export type StoryVisibility = "PUBLIC" | "MEMBERS" | "PRIVATE" | "SHARED";
export type SourceType = "TEXT" | "PDF";
export type StoryLanguage = "ARABIC" | "ENGLISH";

export type StoryType =
  | "FANTASY"
  | "ADVENTURE"
  | "SCI_FI"
  | "MYSTERY"
  | "HORROR"
  | "ROMANCE"
  | "COMEDY"
  | "DRAMA"
  | "HISTORICAL"
  | "FAIRY_TALE"
  | "CHILDREN"
  | "ACTION"
  | "THRILLER"
  | "LORD_OF_THE_RINGS"
  | "MIDDLE_EARTH_FANTASY"
  | "HOBBIT_FANTASY"
  | "EPIC_FANTASY"
  | "HIGH_FANTASY"
  | "DARK_FANTASY";

export type StoryEra =
  | "BCE"
  | "CE"
  | "MODERN"
  | "FIRST_AGE"
  | "SECOND_AGE"
  | "THIRD_AGE"
  | "FOURTH_AGE"
  | "UNSPECIFIED";
export type { StoryCivilization };
export type StoryTheme =
  | "FANTASY"
  | "HISTORICAL"
  | "ADVENTURE"
  | "ROMANCE"
  | "MYSTERY"
  | "WAR"
  | "HORROR"
  | "COMEDY"
  | "DRAMA"
  | "MYTHOLOGY"
  | "RELIGIOUS"
  | "CUSTOM"
  | "UNSPECIFIED";

export type UserRole = "USER" | "AUTHOR" | "ADMIN";
export type IllustrationPageStatus =
  | "PENDING"
  | "QUEUED"
  | "GENERATING"
  | "UPLOADING"
  | "COMPLETED"
  | "FAILED";
export type StoryIllustrationStatus =
  | "NOT_STARTED"
  | "QUEUED"
  | "GENERATING"
  | "COMPLETED"
  | "PARTIALLY_FAILED"
  | "FAILED";

export type NotificationType =
  | "STORY_GENERATION_STARTED"
  | "STORY_PAGE_COMPLETED"
  | "STORY_GENERATION_COMPLETED"
  | "STORY_GENERATION_PARTIALLY_FAILED"
  | "STORY_GENERATION_FAILED"
  | "STORY_ILLUSTRATION_FAILED"
  | "STORY_DELETED"
  | "AI_DAILY_LIMIT_REACHED"
  | "STORY_SHARED"
  | "STORY_ACCESS_REMOVED";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Standard success envelope used by most backend endpoints. */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
}

/** Generic paginated list envelope. */
export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

/** Shaped-along with the backend HttpExceptionFilter JSON body. */
export interface ApiError {
  statusCode: number;
  requestId?: string;
  timestamp?: string;
  path?: string;
  errorCode?: string;
  message: string | string[];
}

/** Story sharing record persisted in the backend. */
export interface StoryShare {
  id: string;
  storyId: string;
  userId: string;
  createdAt: string;
}

export interface StoryResponse {
  id: string;
  userId: string;
  title: string;
  description?: string;
  originalText: string;
  sourceType: SourceType;
  storyType: StoryType | null;
  status: StoryStatus;
  visibility: StoryVisibility;
  language?: string;
  era: StoryEra;
  year?: number;
  location?: string;
  civilization: StoryCivilization;
  customCivilization?: string;
  theme: StoryTheme;
  customTheme?: string;
  visualStyle?: string;
  errorMessage?: string;
  genreId?: string | null;
  eraId?: string | null;
  civilizationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoryOption {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  legacyValue?: string | null;
  createdBy?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StoryLibraryItem {
  id: string;
  title: string;
  description?: string;
  visibility: StoryVisibility;
  status: StoryStatus;
  sourceType: SourceType;
  storyType?: StoryType | null;
  author?: { id: string; name: string };
  coverImageUrl?: string;
  totalPages: number;
  illustratedPages: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoryPage {
  id: string;
  pageNumber: number;
  title: string | null;
  text: string;
  wordCount: number | null;
  sceneDescription: string | null;
  location: string | null;
  imageUrl: string | null;
  imageStatus: IllustrationPageStatus | null;
  generationError?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StorySection {
  pageNumber: number;
  text: string;
  wordCount: number;
  imageUrl: string | null;
  imageStatus: IllustrationPageStatus | null;
}

export interface StoryDetails {
  id: string;
  title: string;
  storyType: StoryType | null;
  genreId?: string | null;
  genreName?: string | null;
  visualStyle?: string | null;
  description: string | null;
  visibility: StoryVisibility;
  status: StoryStatus;
  sourceType: SourceType;
  language: string | null;
  era: StoryEra | null;
  eraId?: string | null;
  eraName?: string | null;
  year: number | null;
  location: string | null;
  civilization: StoryCivilization | null;
  civilizationId?: string | null;
  civilizationName?: string | null;
  customCivilization: string | null;
  theme: StoryTheme | null;
  customTheme: string | null;
  author: { id: string; name: string; avatarUrl: string | null };
  stats: {
    totalPages: number;
    illustratedPages: number;
    failedPages: number;
    pendingPages: number;
    progress: number;
  };
  pages: StoryPage[];
  cover: {
    imageUrl: string | null;
    imageStatus: IllustrationPageStatus | null;
  };
  sections: StorySection[];
  createdAt: string;
  updatedAt: string;
}

export interface IllustrationStatus {
  storyId: string;
  status: StoryIllustrationStatus;
  totalPages: number;
  queued: number;
  generating: number;
  uploading: number;
  completed: number;
  failed: number;
  progress: number;
}

export interface UserStats {
  totalStories: number;
  publicStories: number;
  privateStories: number;
  sharedStories: number;
  completedStories: number;
  processingStories: number;
  failedStories: number;
  draftStories: number;
  totalPages: number;
  illustratedPages: number;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  name: string | null;
  email: string;
  role: UserRole;
  emailVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  avatarUrl: string | null;
  stats: {
    publicStories: number;
  };
}

export interface NotificationItem {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
}

export interface StoryContext {
  storyType?: StoryType | null;
  language?: string | null;
  visualStyle?: string | null;
  era?: StoryEra | null;
  year?: number | null;
  location?: string | null;
  civilization?: StoryCivilization | null;
  customCivilization?: string | null;
  theme?: StoryTheme | null;
  customTheme?: string | null;
}

/** Temporary visual-context changes used for a single regeneration request. */
export interface VisualContextOverrides {
  location?: string;
  era?: StoryEra;
  year?: number;
  civilization?: StoryCivilization;
  theme?: StoryTheme;
  genre?: StoryType;
}

export interface CreateStoryInput {
  title: string;
  description?: string;
  storyType?: StoryType;
  text: string;
  sourceType?: SourceType;
  visibility?: StoryVisibility;
  language?: string;
  visualStyle?: string;
  era?: StoryEra;
  year?: number;
  location?: string;
  civilization?: StoryCivilization;
  customCivilization?: string;
  theme?: StoryTheme;
  customTheme?: string;
  genreId?: string;
  eraId?: string;
  civilizationId?: string;
}

export interface UpdateStoryInput {
  title?: string;
  description?: string;
  storyType?: StoryType;
  sourceType?: SourceType;
  visibility?: StoryVisibility;
  language?: string;
  visualStyle?: string;
  era?: StoryEra;
  year?: number;
  location?: string;
  civilization?: StoryCivilization;
  customCivilization?: string;
  theme?: StoryTheme;
  customTheme?: string;
  genreId?: string;
  eraId?: string;
  civilizationId?: string;
}

export interface ShareEntry {
  userId: string;
  name: string;
  email: string;
  sharedAt: string;
}

export interface DashboardData {
  user: { id: string; name: string; avatarUrl: string };
  stats: UserStats;
  recentStories: StoryLibraryItem[];
  recentNotifications: NotificationItem[];
}

export interface AdminDashboardData {
  users: {
    total: number;
    active: number;
    inactive: number;
    admins: number;
    authors: number;
    consumers: number;
  };
  stories: {
    total: number;
    byStatus: {
      draft: number;
      processing: number;
      ready: number;
      failed: number;
    };
    byVisibility: { public: number; private: number; shared: number };
  };
  generations: {
    inFlightStories: number;
    pageCounts: {
      total: number;
      completed: number;
      failed: number;
      inFlight: number;
    };
    failedPages: number;
  };
  aiUsage: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
    blocked: boolean;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
  }>;
}

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  emailVerified: boolean;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  storyCount: number;
}

export interface AdminStory {
  id: string;
  title: string;
  description?: string;
  status: StoryStatus;
  visibility: StoryVisibility;
  sourceType: SourceType;
  storyType: StoryType | null;
  illustrationStatus: StoryIllustrationStatus;
  totalImages: number;
  completedImages: number;
  failedImages: number;
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
  owner?: { id: string; name: string; email: string };
}

export interface AiUsage {
  dailyLimit: number;
  safetyLimit: number;
  used: number;
  remainingUntilSafetyLimit: number;
  percentageUsed: number;
  blocked: boolean;
  date: string;
}

export interface QueueStats {
  queue: string;
  counts: {
    waiting: number;
    active: number;
    delayed: number;
    failed: number;
    completed: number;
    total: number;
  };
}

export interface SystemHealth {
  status: "ok" | "degraded" | "down";
  timestamp: string;
  checks: {
    database: "up" | "down";
    redis: "up" | "down";
    queue: "up" | "down";
  };
}

export interface AuditMetadata {
  method?: string;
  path?: string;
}

export interface AuditEntry {
  id: string;
  adminId: string;
  adminEmail: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: AuditMetadata | null;
  ip: string | null;
  userAgent: string | null;
  createdAt: string;
}
