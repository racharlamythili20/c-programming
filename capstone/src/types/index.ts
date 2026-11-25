export type FileCategory =
  | 'Documents'
  | 'Images'
  | 'Videos'
  | 'Audio'
  | 'Archives'
  | 'Programming Files'
  | 'Presentations'
  | 'Spreadsheets'
  | 'PDFs'
  | 'Other Files';

export interface UserFile {
  id: string;
  name: string;
  size: number; // bytes
  type: string; // MIME type
  extension: string;
  category: FileCategory;
  hash: string; // SHA-256
  lastModified: number;
  folderId?: string; // Virtual folder id or path
  folderPath?: string;
  blobUrl?: string; // For previewing images/audio/video in browser
  textContent?: string; // Sample text for documents/code
  aiCategory?: FileCategory;
  aiSuggestedFolder?: string;
  aiConfidence?: number; // 0 - 100
  aiReason?: string;
  isDuplicate?: boolean;
  duplicateGroupId?: string;
  isOriginal?: boolean;
  tags?: string[];
  isFavorite?: boolean;
  isArchived?: boolean;
  createdAt: number;
  perceptualHash?: string; // For image similarity
}

export interface VirtualFolder {
  id: string;
  name: string;
  path: string;
  parentId?: string | null;
  color?: string;
  icon?: string;
  fileCount?: number;
  totalSize?: number;
  createdAt: number;
}

export interface DuplicateGroup {
  id: string;
  hash: string;
  sampleFileName: string;
  fileCount: number;
  totalSize: number;
  wastedSize: number; // (fileCount - 1) * singleFileSize
  originalFileId: string;
  duplicateFileIds: string[];
  category: FileCategory;
  similarityType: 'exact_sha256' | 'exact_size_name' | 'visual_similarity';
  similarityPercentage?: number;
}

export interface ScanHistory {
  id: string;
  timestamp: number;
  filesScanned: number;
  duplicatesFound: number;
  savingsFound: number; // bytes
  durationMs: number;
  scope: string; // 'All Files', 'Documents', etc.
}

export type ActivityAction =
  | 'UPLOAD'
  | 'ORGANIZE'
  | 'RENAME'
  | 'MOVE'
  | 'DUPLICATE_DELETE'
  | 'CLEANUP'
  | 'FOLDER_CREATE'
  | 'TAG_CHANGE'
  | 'RESTORE';

export interface ActivityLog {
  id: string;
  timestamp: number;
  action: ActivityAction;
  title: string;
  description: string;
  status: 'success' | 'warning' | 'error' | 'info';
  fileId?: string;
  fileName?: string;
  previousData?: any; // For undo support
  canUndo?: boolean;
}

export type RiskLevel = 'low' | 'medium' | 'high';

export interface CleanupRecommendation {
  id: string;
  title: string;
  description: string;
  category: 'duplicate' | 'large' | 'old' | 'empty_folder' | 'unorganized' | 'redundant';
  riskLevel: RiskLevel;
  potentialSavings: number; // bytes
  affectedFileIds: string[];
  recommendedAction: string;
}

export interface NotificationItem {
  id: string;
  timestamp: number;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionLink?: string;
}

export interface OrganizationRule {
  id: string;
  name: string;
  conditionType: 'extension' | 'name_contains' | 'size_greater' | 'mime_type' | 'ai_topic' | 'category';
  conditionValue: string;
  targetFolder: string;
  enabled: boolean;
  priority?: number;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  role: 'user' | 'admin';
  plan: 'Free' | 'Pro' | 'Enterprise';
  storageQuota: number; // e.g. 5GB or 50GB
  createdAt: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  strictHashOnly: boolean;
  autoOrganizeOnUpload: boolean;
  enableAiSuggestions: boolean;
  retentionDays: number;
  supabaseUrl: string;
  supabaseAnonKey: string;
  soundEffects: boolean;
}

export interface OrganizationProposal {
  fileId: string;
  fileName: string;
  currentFolder: string;
  proposedFolder: string;
  category: FileCategory;
  confidence: number;
  reason: string;
  status: 'pending' | 'accepted' | 'rejected';
}
