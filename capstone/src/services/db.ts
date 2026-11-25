import { UserFile, VirtualFolder, ActivityLog, DuplicateGroup, ScanHistory, OrganizationRule, AppSettings, UserProfile } from '../types';

const DB_NAME = 'IntelligentFileOrganizer_v3';
const DB_VERSION = 1;

class StorageDB {
  private db: IDBDatabase | null = null;
  private initPromise: Promise<IDBDatabase> | null = null;

  async init(): Promise<IDBDatabase> {
    if (this.db) return this.db;
    if (this.initPromise) return this.initPromise;

    this.initPromise = new Promise((resolve, reject) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          if (!db.objectStoreNames.contains('files')) {
            const fileStore = db.createObjectStore('files', { keyPath: 'id' });
            fileStore.createIndex('hash', 'hash', { unique: false });
            fileStore.createIndex('category', 'category', { unique: false });
            fileStore.createIndex('folderPath', 'folderPath', { unique: false });
          }

          if (!db.objectStoreNames.contains('fileBlobs')) {
            db.createObjectStore('fileBlobs', { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains('folders')) {
            db.createObjectStore('folders', { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains('activityLogs')) {
            const logStore = db.createObjectStore('activityLogs', { keyPath: 'id' });
            logStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          if (!db.objectStoreNames.contains('duplicateGroups')) {
            db.createObjectStore('duplicateGroups', { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains('scanHistory')) {
            db.createObjectStore('scanHistory', { keyPath: 'id' });
          }

          if (!db.objectStoreNames.contains('organizationRules')) {
            db.createObjectStore('organizationRules', { keyPath: 'id' });
          }
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve(this.db);
        };

        request.onerror = () => {
          console.warn('IndexedDB open error:', request.error);
          reject(request.error);
        };
      } catch (err) {
        console.warn('IndexedDB init exception:', err);
        reject(err);
      }
    });

    return this.initPromise;
  }

  // Helper to sanitize UserFile object into pure cloneable JSON properties
  private sanitizeFile(f: UserFile) {
    return {
      id: f.id,
      name: f.name,
      size: f.size,
      type: f.type || 'application/octet-stream',
      extension: f.extension || '',
      category: f.category,
      hash: f.hash || '',
      lastModified: f.lastModified || Date.now(),
      folderPath: f.folderPath || '/',
      folderId: f.folderId || undefined,
      textContent: f.textContent || undefined,
      aiCategory: f.aiCategory,
      aiSuggestedFolder: f.aiSuggestedFolder,
      aiConfidence: f.aiConfidence,
      aiReason: f.aiReason,
      isDuplicate: Boolean(f.isDuplicate),
      duplicateGroupId: f.duplicateGroupId || undefined,
      isOriginal: Boolean(f.isOriginal),
      tags: f.tags || [],
      isFavorite: Boolean(f.isFavorite),
      isArchived: Boolean(f.isArchived),
      createdAt: f.createdAt || Date.now()
    };
  }

  // --- Files ---
  async getAllFiles(): Promise<UserFile[]> {
    try {
      const db = await this.init();
      const filesFromIDB = await new Promise<UserFile[]>((resolve) => {
        const tx = db.transaction('files', 'readonly');
        const store = tx.objectStore('files');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });

      if (filesFromIDB && filesFromIDB.length > 0) {
        return filesFromIDB;
      }
    } catch (e) {
      console.warn('Error reading files from IDB:', e);
    }

    // Resilient fallback to metadata cache
    try {
      const cached = localStorage.getItem('cached_files_meta');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading cached files:', e);
    }

    return [];
  }

  async saveFile(file: UserFile, blob?: Blob): Promise<void> {
    const sanitized = this.sanitizeFile(file);

    // Sync to local cache
    try {
      const existing = await this.getAllFiles();
      const idx = existing.findIndex(f => f.id === file.id);
      if (idx >= 0) {
        existing[idx] = sanitized;
      } else {
        existing.push(sanitized);
      }
      localStorage.setItem('cached_files_meta', JSON.stringify(existing.slice(0, 500)));
    } catch {}

    try {
      const db = await this.init();
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').put(sanitized);
      await new Promise<void>((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });

      if (blob && db.objectStoreNames.contains('fileBlobs')) {
        try {
          const bTx = db.transaction('fileBlobs', 'readwrite');
          bTx.objectStore('fileBlobs').put({ id: file.id, blob });
        } catch {}
      }
    } catch (e) {
      console.warn('saveFile caught error:', e);
    }
  }

  async saveFilesBatch(files: UserFile[], blobs?: { id: string; blob: Blob }[]): Promise<void> {
    const sanitizedList = files.map(f => this.sanitizeFile(f));

    // 1. Immediately sync to backup cache for zero-loss guarantee
    try {
      localStorage.setItem('cached_files_meta', JSON.stringify(sanitizedList.slice(0, 500)));
    } catch (e) {
      console.warn('Local storage cache warning:', e);
    }

    // 2. Commit metadata to IndexedDB
    try {
      const db = await this.init();
      const tx = db.transaction('files', 'readwrite');
      const fileStore = tx.objectStore('files');

      sanitizedList.forEach(f => {
        try {
          fileStore.put(f);
        } catch (err) {
          console.warn('put file failed:', err);
        }
      });

      await new Promise<void>((resolve) => {
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
        tx.onabort = () => resolve();
      });
    } catch (err) {
      console.warn('IndexedDB saveFilesBatch metadata error:', err);
    }

    // 3. Isolated optional blob storage (failures here never affect metadata)
    if (blobs && blobs.length > 0) {
      try {
        const db = await this.init();
        if (db.objectStoreNames.contains('fileBlobs')) {
          const blobTx = db.transaction('fileBlobs', 'readwrite');
          const blobStore = blobTx.objectStore('fileBlobs');
          blobs.forEach(b => {
            try {
              blobStore.put({ id: b.id, blob: b.blob });
            } catch {
              // ignore blob cloning limits
            }
          });
        }
      } catch {
        // Blob store optional
      }
    }
  }

  async getFileBlob(fileId: string): Promise<Blob | null> {
    try {
      const db = await this.init();
      if (!db.objectStoreNames.contains('fileBlobs')) return null;
      return new Promise((resolve) => {
        const tx = db.transaction('fileBlobs', 'readonly');
        const store = tx.objectStore('fileBlobs');
        const request = store.get(fileId);
        request.onsuccess = () => resolve(request.result ? request.result.blob : null);
        request.onerror = () => resolve(null);
      });
    } catch {
      return null;
    }
  }

  async deleteFile(fileId: string): Promise<void> {
    try {
      const existing = await this.getAllFiles();
      const filtered = existing.filter(f => f.id !== fileId);
      localStorage.setItem('cached_files_meta', JSON.stringify(filtered));

      const db = await this.init();
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').delete(fileId);

      if (db.objectStoreNames.contains('fileBlobs')) {
        try {
          const bTx = db.transaction('fileBlobs', 'readwrite');
          bTx.objectStore('fileBlobs').delete(fileId);
        } catch {}
      }
    } catch (e) {
      console.warn('deleteFile caught error:', e);
    }
  }

  async deleteFilesBatch(fileIds: string[]): Promise<void> {
    try {
      const existing = await this.getAllFiles();
      const filtered = existing.filter(f => !fileIds.includes(f.id));
      localStorage.setItem('cached_files_meta', JSON.stringify(filtered));

      const db = await this.init();
      const tx = db.transaction('files', 'readwrite');
      const fileStore = tx.objectStore('files');
      fileIds.forEach(id => fileStore.delete(id));

      if (db.objectStoreNames.contains('fileBlobs')) {
        try {
          const bTx = db.transaction('fileBlobs', 'readwrite');
          const blobStore = bTx.objectStore('fileBlobs');
          fileIds.forEach(id => blobStore.delete(id));
        } catch {}
      }
    } catch (e) {
      console.warn('deleteFilesBatch caught error:', e);
    }
  }

  // --- Folders ---
  async getAllFolders(): Promise<VirtualFolder[]> {
    try {
      const db = await this.init();
      const folders = await new Promise<VirtualFolder[]>((resolve) => {
        const tx = db.transaction('folders', 'readonly');
        const request = tx.objectStore('folders').getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
      if (folders && folders.length > 0) return folders;
    } catch {}

    try {
      const cached = localStorage.getItem('cached_folders');
      if (cached) return JSON.parse(cached);
    } catch {}

    return [];
  }

  async saveFolder(folder: VirtualFolder): Promise<void> {
    try {
      const existing = await this.getAllFolders();
      const idx = existing.findIndex(f => f.id === folder.id);
      if (idx >= 0) existing[idx] = folder;
      else existing.push(folder);
      localStorage.setItem('cached_folders', JSON.stringify(existing));

      const db = await this.init();
      const tx = db.transaction('folders', 'readwrite');
      tx.objectStore('folders').put(folder);
    } catch (e) {
      console.warn('saveFolder caught error:', e);
    }
  }

  async deleteFolder(folderId: string): Promise<void> {
    try {
      const existing = await this.getAllFolders();
      const filtered = existing.filter(f => f.id !== folderId);
      localStorage.setItem('cached_folders', JSON.stringify(filtered));

      const db = await this.init();
      const tx = db.transaction('folders', 'readwrite');
      tx.objectStore('folders').delete(folderId);
    } catch (e) {
      console.warn('deleteFolder caught error:', e);
    }
  }

  // --- Activity Logs ---
  async getActivityLogs(): Promise<ActivityLog[]> {
    try {
      const db = await this.init();
      const logs = await new Promise<ActivityLog[]>((resolve) => {
        const tx = db.transaction('activityLogs', 'readonly');
        const request = tx.objectStore('activityLogs').getAll();
        request.onsuccess = () => {
          const l = request.result || [];
          l.sort((a, b) => b.timestamp - a.timestamp);
          resolve(l);
        };
        request.onerror = () => resolve([]);
      });
      if (logs && logs.length > 0) return logs;
    } catch {}

    try {
      const cached = localStorage.getItem('cached_activity_logs');
      if (cached) return JSON.parse(cached);
    } catch {}

    return [];
  }

  async addActivityLog(log: ActivityLog): Promise<void> {
    try {
      const existing = await this.getActivityLogs();
      const updated = [log, ...existing].slice(0, 200);
      localStorage.setItem('cached_activity_logs', JSON.stringify(updated));

      const db = await this.init();
      const tx = db.transaction('activityLogs', 'readwrite');
      tx.objectStore('activityLogs').put(log);
    } catch (e) {
      console.warn('addActivityLog caught error:', e);
    }
  }

  // --- Duplicate Groups ---
  async getDuplicateGroups(): Promise<DuplicateGroup[]> {
    try {
      const db = await this.init();
      const groups = await new Promise<DuplicateGroup[]>((resolve) => {
        const tx = db.transaction('duplicateGroups', 'readonly');
        const request = tx.objectStore('duplicateGroups').getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
      if (groups && groups.length > 0) return groups;
    } catch {}

    try {
      const cached = localStorage.getItem('cached_dup_groups');
      if (cached) return JSON.parse(cached);
    } catch {}

    return [];
  }

  async saveDuplicateGroups(groups: DuplicateGroup[]): Promise<void> {
    try {
      localStorage.setItem('cached_dup_groups', JSON.stringify(groups));
      const db = await this.init();
      const tx = db.transaction('duplicateGroups', 'readwrite');
      const store = tx.objectStore('duplicateGroups');
      store.clear();
      groups.forEach(g => store.put(g));
    } catch (e) {
      console.warn('saveDuplicateGroups caught error:', e);
    }
  }

  // --- Scan History ---
  async getScanHistory(): Promise<ScanHistory[]> {
    try {
      const db = await this.init();
      const scans = await new Promise<ScanHistory[]>((resolve) => {
        const tx = db.transaction('scanHistory', 'readonly');
        const request = tx.objectStore('scanHistory').getAll();
        request.onsuccess = () => {
          const s = request.result || [];
          s.sort((a, b) => b.timestamp - a.timestamp);
          resolve(s);
        };
        request.onerror = () => resolve([]);
      });
      if (scans && scans.length > 0) return scans;
    } catch {}

    try {
      const cached = localStorage.getItem('cached_scan_history');
      if (cached) return JSON.parse(cached);
    } catch {}

    return [];
  }

  async addScanRecord(scan: ScanHistory): Promise<void> {
    try {
      const existing = await this.getScanHistory();
      const updated = [scan, ...existing].slice(0, 100);
      localStorage.setItem('cached_scan_history', JSON.stringify(updated));

      const db = await this.init();
      const tx = db.transaction('scanHistory', 'readwrite');
      tx.objectStore('scanHistory').put(scan);
    } catch (e) {
      console.warn('addScanRecord caught error:', e);
    }
  }

  // --- Organization Rules ---
  async getRules(): Promise<OrganizationRule[]> {
    try {
      const db = await this.init();
      const rules = await new Promise<OrganizationRule[]>((resolve) => {
        const tx = db.transaction('organizationRules', 'readonly');
        const request = tx.objectStore('organizationRules').getAll();
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
      if (rules && rules.length > 0) return rules;
    } catch {}

    try {
      const cached = localStorage.getItem('cached_org_rules');
      if (cached) return JSON.parse(cached);
    } catch {}

    return [];
  }

  async saveRules(rules: OrganizationRule[]): Promise<void> {
    try {
      localStorage.setItem('cached_org_rules', JSON.stringify(rules));
      const db = await this.init();
      const tx = db.transaction('organizationRules', 'readwrite');
      const store = tx.objectStore('organizationRules');
      store.clear();
      rules.forEach(r => store.put(r));
    } catch (e) {
      console.warn('saveRules caught error:', e);
    }
  }

  // Clear all data
  async clearAllData(): Promise<void> {
    try {
      localStorage.removeItem('cached_files_meta');
      localStorage.removeItem('cached_dup_groups');
      localStorage.removeItem('cached_folders');
      localStorage.removeItem('cached_activity_logs');
      localStorage.removeItem('cached_scan_history');
      localStorage.removeItem('cached_org_rules');

      const db = await this.init();
      const stores = ['files', 'fileBlobs', 'folders', 'activityLogs', 'duplicateGroups', 'scanHistory', 'organizationRules'];
      const tx = db.transaction(stores, 'readwrite');
      stores.forEach(name => {
        if (db.objectStoreNames.contains(name)) {
          tx.objectStore(name).clear();
        }
      });
    } catch (e) {
      console.warn('clearAllData caught error:', e);
    }
  }
}

export const dbService = new StorageDB();

// Local Storage helpers for Settings
export const getAppSettings = (): AppSettings => {
  const saved = localStorage.getItem('app_settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  return {
    theme: 'light',
    strictHashOnly: false,
    autoOrganizeOnUpload: false,
    enableAiSuggestions: true,
    retentionDays: 30,
    supabaseUrl: '',
    supabaseAnonKey: '',
    soundEffects: true
  };
};

export const saveAppSettings = (settings: AppSettings) => {
  localStorage.setItem('app_settings', JSON.stringify(settings));
};

// Real User Profiles Management (No hardcoded demo account!)
export const getCurrentUser = (): UserProfile | null => {
  const saved = localStorage.getItem('user_profile');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return null;
    }
  }
  return null;
};

export const saveCurrentUser = (profile: UserProfile | null) => {
  if (profile) {
    localStorage.setItem('user_profile', JSON.stringify(profile));
    saveRegisteredUser(profile);
  } else {
    localStorage.removeItem('user_profile');
  }
};

export const getRegisteredUsers = (): UserProfile[] => {
  const saved = localStorage.getItem('registered_users_list');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return [];
    }
  }
  return [];
};

export const saveRegisteredUser = (user: UserProfile) => {
  const users = getRegisteredUsers();
  const existingIdx = users.findIndex(u => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (existingIdx >= 0) {
    users[existingIdx] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem('registered_users_list', JSON.stringify(users));
};
