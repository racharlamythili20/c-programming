import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserFile,
  VirtualFolder,
  DuplicateGroup,
  ActivityLog,
  ScanHistory,
  OrganizationRule,
  CleanupRecommendation,
  NotificationItem,
  UserProfile,
  AppSettings,
  OrganizationProposal,
  FileCategory
} from '../types';
import { dbService, getAppSettings, saveAppSettings, getCurrentUser, saveCurrentUser } from '../services/db';
import {
  getFileCategory,
  calculateSha256,
  runAiClassification,
  detectDuplicates,
  generateCleanupRecommendations,
  readTextSample,
  generateImageThumbnail
} from '../services/fileProcessor';

interface AppContextType {
  files: UserFile[];
  folders: VirtualFolder[];
  duplicateGroups: DuplicateGroup[];
  activityLogs: ActivityLog[];
  scanHistory: ScanHistory[];
  rules: OrganizationRule[];
  recommendations: CleanupRecommendation[];
  notifications: NotificationItem[];
  currentUser: UserProfile | null;
  settings: AppSettings;
  theme: 'light' | 'dark';
  isScanning: boolean;
  scanProgress: number;
  scanStatusText: string;
  activeTab: string;
  selectedFileForPreview: UserFile | null;
  selectedDuplicateGroupForCompare: DuplicateGroup | null;
  setActiveTab: (tab: string) => void;
  setSelectedFileForPreview: (file: UserFile | null) => void;
  setSelectedDuplicateGroupForCompare: (group: DuplicateGroup | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setCurrentUser: (user: UserProfile | null) => void;
  logout: () => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  clearAllData: () => Promise<void>;
  uploadFiles: (fileList: FileList | File[], targetFolder?: string) => Promise<void>;
  createFolder: (name: string, parentId?: string, color?: string) => Promise<void>;
  deleteFolder: (folderId: string) => Promise<void>;
  renameFile: (fileId: string, newName: string) => Promise<void>;
  moveFiles: (fileIds: string[], targetFolderPath: string) => Promise<void>;
  deleteFiles: (fileIds: string[], reason?: string) => Promise<void>;
  toggleFavorite: (fileId: string) => Promise<void>;
  runDuplicateScan: (scope?: string) => Promise<DuplicateGroup[]>;
  applyOrganizationProposals: (proposals: OrganizationProposal[]) => Promise<void>;
  applyCleanupRecommendation: (recId: string) => Promise<void>;
  undoAction: (logId: string) => Promise<void>;
  addRule: (rule: OrganizationRule) => Promise<void>;
  deleteRule: (id: string) => Promise<void>;
  addNotification: (title: string, message: string, type?: NotificationItem['type']) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [files, setFiles] = useState<UserFile[]>([]);
  const [folders, setFolders] = useState<VirtualFolder[]>([]);
  const [duplicateGroups, setDuplicateGroups] = useState<DuplicateGroup[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanHistory[]>([]);
  const [rules, setRules] = useState<OrganizationRule[]>([]);
  const [recommendations, setRecommendations] = useState<CleanupRecommendation[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(getCurrentUser());
  const [settings, setSettingsState] = useState<AppSettings>(getAppSettings());
  const [theme, setThemeState] = useState<'light' | 'dark'>(settings.theme === 'dark' ? 'dark' : 'light');

  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [scanStatusText, setScanStatusText] = useState<string>('');

  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<UserFile | null>(null);
  const [selectedDuplicateGroupForCompare, setSelectedDuplicateGroupForCompare] = useState<DuplicateGroup | null>(null);

  // Initialize theme on HTML root
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load initial data from IndexedDB strictly (no auto-seeding demo values!)
  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedFiles, savedFolders, savedLogs, savedGroups, savedScans, savedRules] = await Promise.all([
          dbService.getAllFiles(),
          dbService.getAllFolders(),
          dbService.getActivityLogs(),
          dbService.getDuplicateGroups(),
          dbService.getScanHistory(),
          dbService.getRules()
        ]);

        setFiles(savedFiles);
        setFolders(savedFolders);
        setActivityLogs(savedLogs);
        setDuplicateGroups(savedGroups);
        setScanHistory(savedScans);
        setRules(savedRules);
        setRecommendations(generateCleanupRecommendations(savedFiles, savedFolders));
      } catch (e) {
        console.error('Failed to load initial data:', e);
      }
    };

    loadData();
  }, []);

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    const updated = { ...settings, theme: newTheme };
    setSettingsState(updated);
    saveAppSettings(updated);
  };

  const setCurrentUser = (user: UserProfile | null) => {
    setCurrentUserState(user);
    saveCurrentUser(user);
  };

  const logout = () => {
    saveCurrentUser(null);
    setCurrentUserState(null);
    setActiveTab('auth');
    addNotification('Signed Out', 'You have been signed out successfully.', 'info');
  };

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    const updated = { ...settings, ...newSettings };
    setSettingsState(updated);
    saveAppSettings(updated);
    addNotification('Settings Updated', 'Your preferences have been saved.', 'info');
  };

  const addNotification = (title: string, message: string, type: NotificationItem['type'] = 'info') => {
    const item: NotificationItem = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      title,
      message,
      type,
      read: false
    };
    setNotifications(prev => [item, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Clear all data
  const clearAllData = async () => {
    await dbService.clearAllData();
    setFiles([]);
    setFolders([]);
    setDuplicateGroups([]);
    setActivityLogs([]);
    setScanHistory([]);
    setRecommendations([]);
    addNotification('Storage Cleared', 'All local files and records have been deleted.', 'warning');
  };

  // Upload user files from disk or folder picker
  const uploadFiles = async (fileList: FileList | File[], targetFolder: string = '/') => {
    const list = Array.from(fileList);
    if (list.length === 0) return;

    setIsScanning(true);
    setScanProgress(10);
    setScanStatusText(`Analyzing ${list.length} selected files...`);

    const newFiles: UserFile[] = [];
    const blobsToSave: { id: string; blob: Blob }[] = [];

    for (let i = 0; i < list.length; i++) {
      const file = list[i];
      setScanProgress(10 + Math.floor((i / list.length) * 70));
      setScanStatusText(`Processing ${file.name} (Calculating SHA-256 hash)...`);

      // 1. Calculate SHA-256 Hash
      const hash = await calculateSha256(file);

      // 2. Determine Category & Extension
      const ext = file.name.split('.').pop()?.toLowerCase() || '';
      const category = getFileCategory(file.name, file.type);

      // 3. Read snippet or preview if supported
      let textSnippet = '';
      let blobUrl = '';
      if (['Documents', 'Programming Files'].includes(category) || ext === 'txt' || ext === 'json' || ext === 'md') {
        textSnippet = await readTextSample(file);
      } else if (category === 'Images') {
        blobUrl = await generateImageThumbnail(file);
      }

      // 4. Run AI Semantic Classification
      const ai = runAiClassification(file.name, category, file.size, textSnippet);

      const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const userFile: UserFile = {
        id: fileId,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        extension: ext,
        category,
        hash,
        lastModified: file.lastModified || Date.now(),
        folderPath: targetFolder,
        blobUrl: blobUrl || undefined,
        textContent: textSnippet || undefined,
        aiCategory: category,
        aiSuggestedFolder: ai.suggestedFolder,
        aiConfidence: ai.confidence,
        aiReason: ai.reason,
        tags: ai.tags,
        createdAt: Date.now()
      };

      newFiles.push(userFile);
      blobsToSave.push({ id: fileId, blob: file });
    }

    setScanProgress(85);
    setScanStatusText('Saving files and evaluating duplicates...');

    // Combine with existing files
    const combinedFiles = [...files, ...newFiles];
    const { groups, updatedFiles } = detectDuplicates(combinedFiles, settings.strictHashOnly);
    const recs = generateCleanupRecommendations(updatedFiles, folders);

    // 1. Update state immediately so UI updates instantaneously
    setFiles(updatedFiles);
    setDuplicateGroups(groups);
    setRecommendations(recs);

    // 2. Persist to storage safely
    try {
      await dbService.saveFilesBatch(updatedFiles, blobsToSave);
      await dbService.saveDuplicateGroups(groups);
    } catch (err) {
      console.warn('Storage persistence warning:', err);
    }

    // 3. Activity log
    const log: ActivityLog = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: Date.now(),
      action: 'UPLOAD',
      title: 'Files Uploaded',
      description: `Uploaded and indexed ${newFiles.length} file(s) into workspace.`,
      status: 'success',
      canUndo: true,
      previousData: { fileIds: newFiles.map(f => f.id) }
    };
    try {
      await dbService.addActivityLog(log);
    } catch (e) {
      console.warn('Activity log write error:', e);
    }
    setActivityLogs(prev => [log, ...prev]);

    setIsScanning(false);
    setScanProgress(100);
    setScanStatusText('Complete!');

    addNotification('Upload Complete', `Processed ${newFiles.length} file(s) with SHA-256 verification.`, 'success');

    // If currently on landing, signin, or signup, switch to 'files' tab so user sees their uploaded files immediately
    if (['landing', 'signin', 'signup', 'auth'].includes(activeTab)) {
      setActiveTab('files');
    }
  };

  // Create Virtual Folder
  const createFolder = async (name: string, parentId?: string, color: string = '#3b82f6') => {
    let path = name;
    if (parentId) {
      const parent = folders.find(f => f.id === parentId);
      if (parent) {
        path = `${parent.path} / ${name}`;
      }
    }

    const newFolder: VirtualFolder = {
      id: `fld_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      path,
      parentId,
      color,
      createdAt: Date.now()
    };

    await dbService.saveFolder(newFolder);
    setFolders(prev => [...prev, newFolder]);

    const log: ActivityLog = {
      id: `act_${Date.now()}`,
      timestamp: Date.now(),
      action: 'FOLDER_CREATE',
      title: 'Folder Created',
      description: `Created new folder "${path}".`,
      status: 'success'
    };
    await dbService.addActivityLog(log);
    setActivityLogs(prev => [log, ...prev]);

    addNotification('Folder Created', `Folder "${name}" was created.`, 'info');
  };

  // Delete Virtual Folder
  const deleteFolder = async (folderId: string) => {
    const folder = folders.find(f => f.id === folderId);
    if (!folder) return;

    await dbService.deleteFolder(folderId);
    setFolders(prev => prev.filter(f => f.id !== folderId));

    // Move any files in this folder back to Root
    const updatedFiles = files.map(f => {
      if (f.folderId === folderId || f.folderPath === folder.path) {
        return { ...f, folderId: undefined, folderPath: '/' };
      }
      return f;
    });

    await dbService.saveFilesBatch(updatedFiles);
    setFiles(updatedFiles);

    addNotification('Folder Deleted', `Folder "${folder.name}" deleted. Contained files moved to root.`, 'warning');
  };

  // Rename File
  const renameFile = async (fileId: string, newName: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const oldName = file.name;
    const ext = newName.split('.').pop()?.toLowerCase() || file.extension;
    const category = getFileCategory(newName, file.type);

    const updatedFile: UserFile = {
      ...file,
      name: newName,
      extension: ext,
      category
    };

    const updatedList = files.map(f => (f.id === fileId ? updatedFile : f));
    await dbService.saveFile(updatedFile);
    setFiles(updatedList);

    const log: ActivityLog = {
      id: `act_${Date.now()}`,
      timestamp: Date.now(),
      action: 'RENAME',
      title: 'File Renamed',
      description: `Renamed "${oldName}" to "${newName}".`,
      status: 'success',
      fileId,
      canUndo: true,
      previousData: { fileId, oldName }
    };
    await dbService.addActivityLog(log);
    setActivityLogs(prev => [log, ...prev]);

    addNotification('File Renamed', `Changed name to "${newName}".`, 'info');
  };

  // Move Files
  const moveFiles = async (fileIds: string[], targetFolderPath: string) => {
    const targetFolder = folders.find(f => f.path === targetFolderPath);
    const previousMap: { [id: string]: string | undefined } = {};

    const updatedList = files.map(f => {
      if (fileIds.includes(f.id)) {
        previousMap[f.id] = f.folderPath;
        return {
          ...f,
          folderPath: targetFolderPath,
          folderId: targetFolder?.id
        };
      }
      return f;
    });

    await dbService.saveFilesBatch(updatedList);
    setFiles(updatedList);

    const log: ActivityLog = {
      id: `act_${Date.now()}`,
      timestamp: Date.now(),
      action: 'MOVE',
      title: 'Files Moved',
      description: `Moved ${fileIds.length} file(s) to "${targetFolderPath}".`,
      status: 'success',
      canUndo: true,
      previousData: { previousMap }
    };
    await dbService.addActivityLog(log);
    setActivityLogs(prev => [log, ...prev]);

    addNotification('Files Moved', `Moved ${fileIds.length} file(s) into ${targetFolderPath}.`, 'success');
  };

  // Delete Files
  const deleteFiles = async (fileIds: string[], reason: string = 'User deleted') => {
    const deletedFiles = files.filter(f => fileIds.includes(f.id));
    await dbService.deleteFilesBatch(fileIds);

    const remainingFiles = files.filter(f => !fileIds.includes(f.id));
    const { groups, updatedFiles } = detectDuplicates(remainingFiles, settings.strictHashOnly);
    const recs = generateCleanupRecommendations(updatedFiles, folders);

    setFiles(updatedFiles);
    setDuplicateGroups(groups);
    setRecommendations(recs);

    const log: ActivityLog = {
      id: `act_${Date.now()}`,
      timestamp: Date.now(),
      action: 'DUPLICATE_DELETE',
      title: 'Files Removed',
      description: `Removed ${fileIds.length} file(s) (${reason}).`,
      status: 'warning',
      canUndo: false,
      previousData: { deletedFiles }
    };
    await dbService.addActivityLog(log);
    setActivityLogs(prev => [log, ...prev]);

    addNotification('Files Removed', `Successfully deleted ${fileIds.length} file(s).`, 'warning');
  };

  // Toggle Favorite
  const toggleFavorite = async (fileId: string) => {
    const file = files.find(f => f.id === fileId);
    if (!file) return;

    const updated = { ...file, isFavorite: !file.isFavorite };
    await dbService.saveFile(updated);
    setFiles(prev => prev.map(f => (f.id === fileId ? updated : f)));
  };

  // Run Duplicate Scan
  const runDuplicateScan = async (scope: string = 'All Files'): Promise<DuplicateGroup[]> => {
    setIsScanning(true);
    setScanProgress(15);
    setScanStatusText(`Scanning files for exact SHA-256 byte duplicates (${scope})...`);

    const startTime = Date.now();

    await new Promise(r => setTimeout(r, 600));
    setScanProgress(50);
    setScanStatusText('Cross-referencing cryptographic hash tables...');

    await new Promise(r => setTimeout(r, 600));
    setScanProgress(80);
    setScanStatusText('Generating duplicate clusters and recovery analysis...');

    const { groups, updatedFiles } = detectDuplicates(files, settings.strictHashOnly);
    await dbService.saveFilesBatch(updatedFiles);
    await dbService.saveDuplicateGroups(groups);

    setFiles(updatedFiles);
    setDuplicateGroups(groups);

    const duration = Date.now() - startTime;
    const totalWasted = groups.reduce((acc, g) => acc + g.wastedSize, 0);

    const scanRecord: ScanHistory = {
      id: `scan_${Date.now()}`,
      timestamp: Date.now(),
      filesScanned: files.length,
      duplicatesFound: groups.reduce((acc, g) => acc + g.duplicateFileIds.length, 0),
      savingsFound: totalWasted,
      durationMs: duration,
      scope
    };

    await dbService.addScanRecord(scanRecord);
    setScanHistory(prev => [scanRecord, ...prev]);

    setIsScanning(false);
    setScanProgress(100);
    setScanStatusText('Scan Finished');

    addNotification(
      'Duplicate Scan Finished',
      `Identified ${groups.length} duplicate groups with potential ${Math.round(totalWasted / 1024)} KB recoverable.`,
      groups.length > 0 ? 'warning' : 'success'
    );

    return groups;
  };

  // Apply Organization Proposals
  const applyOrganizationProposals = async (proposals: OrganizationProposal[]) => {
    const accepted = proposals.filter(p => p.status === 'accepted');
    if (accepted.length === 0) return;

    const previousMap: { [id: string]: string | undefined } = {};
    const newFoldersToCreate = new Set<string>();

    accepted.forEach(p => {
      newFoldersToCreate.add(p.proposedFolder);
    });

    // Ensure virtual folders exist
    for (const folderPath of Array.from(newFoldersToCreate)) {
      if (!folders.some(f => f.path === folderPath)) {
        const parts = folderPath.split(' / ');
        const name = parts[parts.length - 1];
        await createFolder(name, undefined, '#8b5cf6');
      }
    }

    const updatedList = files.map(file => {
      const match = accepted.find(p => p.fileId === file.id);
      if (match) {
        previousMap[file.id] = file.folderPath;
        return {
          ...file,
          folderPath: match.proposedFolder,
        };
      }
      return file;
    });

    await dbService.saveFilesBatch(updatedList);
    setFiles(updatedList);

    const log: ActivityLog = {
      id: `act_${Date.now()}`,
      timestamp: Date.now(),
      action: 'ORGANIZE',
      title: 'AI Smart Organization Applied',
      description: `Organized ${accepted.length} files into hierarchical topic folders.`,
      status: 'success',
      canUndo: true,
      previousData: { previousMap }
    };
    await dbService.addActivityLog(log);
    setActivityLogs(prev => [log, ...prev]);

    addNotification('Organization Applied', `Organized ${accepted.length} file(s) into folders.`, 'success');
  };

  // Apply Cleanup Recommendation
  const applyCleanupRecommendation = async (recId: string) => {
    const rec = recommendations.find(r => r.id === recId);
    if (!rec) return;

    if (rec.category === 'duplicate' || rec.category === 'redundant') {
      await deleteFiles(rec.affectedFileIds, rec.title);
    } else if (rec.category === 'unorganized') {
      // Auto organize root files using AI suggestions
      const proposals: OrganizationProposal[] = rec.affectedFileIds.map(fId => {
        const file = files.find(f => f.id === fId)!;
        return {
          fileId: file.id,
          fileName: file.name,
          currentFolder: file.folderPath || '/',
          proposedFolder: file.aiSuggestedFolder || `${file.category} / Organized`,
          category: file.category,
          confidence: file.aiConfidence || 90,
          reason: file.aiReason || 'Automated smart topic routing.',
          status: 'accepted'
        };
      });
      await applyOrganizationProposals(proposals);
    }

    setRecommendations(prev => prev.filter(r => r.id !== recId));
    addNotification('Cleanup Complete', `Completed action for "${rec.title}".`, 'success');
  };

  // Undo Action
  const undoAction = async (logId: string) => {
    const log = activityLogs.find(l => l.id === logId);
    if (!log || !log.previousData) return;

    if (log.action === 'MOVE' || log.action === 'ORGANIZE') {
      const prevMap = log.previousData.previousMap;
      const updatedList = files.map(f => {
        if (prevMap[f.id] !== undefined) {
          return { ...f, folderPath: prevMap[f.id] };
        }
        return f;
      });
      await dbService.saveFilesBatch(updatedList);
      setFiles(updatedList);
      addNotification('Undo Successful', 'Reverted files to previous folders.', 'info');
    } else if (log.action === 'RENAME') {
      const { fileId, oldName } = log.previousData;
      await renameFile(fileId, oldName);
    }

    setActivityLogs(prev =>
      prev.map(l => (l.id === logId ? { ...l, canUndo: false, status: 'info' } : l))
    );
  };

  const addRule = async (rule: OrganizationRule) => {
    const updated = [...rules, rule];
    await dbService.saveRules(updated);
    setRules(updated);
    addNotification('Rule Created', `Created organization rule "${rule.name}".`, 'info');
  };

  const deleteRule = async (id: string) => {
    const updated = rules.filter(r => r.id !== id);
    await dbService.saveRules(updated);
    setRules(updated);
    addNotification('Rule Removed', 'Organization rule deleted.', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        files,
        folders,
        duplicateGroups,
        activityLogs,
        scanHistory,
        rules,
        recommendations,
        notifications,
        currentUser,
        settings,
        theme,
        isScanning,
        scanProgress,
        scanStatusText,
        activeTab,
        selectedFileForPreview,
        selectedDuplicateGroupForCompare,
        setActiveTab,
        setSelectedFileForPreview,
        setSelectedDuplicateGroupForCompare,
        setTheme,
        setCurrentUser,
        logout,
        updateSettings,
        clearAllData,
        uploadFiles,
        createFolder,
        deleteFolder,
        renameFile,
        moveFiles,
        deleteFiles,
        toggleFavorite,
        runDuplicateScan,
        applyOrganizationProposals,
        applyCleanupRecommendation,
        undoAction,
        addRule,
        deleteRule,
        addNotification,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
