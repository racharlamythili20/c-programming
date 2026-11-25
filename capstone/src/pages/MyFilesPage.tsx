import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { UserFile, VirtualFolder, FileCategory } from '../types';
import { formatBytes, formatDate } from '../services/fileProcessor';
import {
  Folder,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Film,
  Music,
  Code,
  Archive,
  Grid,
  List,
  Filter,
  ArrowUpDown,
  Search,
  Plus,
  Trash2,
  FolderInput,
  Star,
  Download,
  MoreVertical,
  CheckSquare,
  Square,
  ChevronRight,
  FolderPlus,
  Upload,
  Layers,
  X
} from 'lucide-react';

export const MyFilesPage: React.FC = () => {
  const {
    files,
    folders,
    createFolder,
    deleteFolder,
    deleteFiles,
    moveFiles,
    toggleFavorite,
    setSelectedFileForPreview,
    renameFile,
    uploadFiles
  } = useApp();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [scope, setScope] = useState<'folder' | 'all'>('folder');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'size' | 'date' | 'type'>('date');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  // Folder creation modal
  const [showCreateFolderModal, setShowCreateFolderModal] = useState<boolean>(false);
  const [newFolderName, setNewFolderName] = useState<string>('');
  const [newFolderColor, setNewFolderColor] = useState<string>('#3b82f6');

  // Move files modal
  const [showMoveModal, setShowMoveModal] = useState<boolean>(false);
  const [targetMoveFolder, setTargetMoveFolder] = useState<string>('');

  // Current folder object
  const currentFolder = folders.find(f => f.id === currentFolderId);

  // Subfolders in this folder
  const subFolders = folders.filter(f => {
    if (scope === 'all') return false;
    if (!currentFolderId) return !f.parentId;
    return f.parentId === currentFolderId;
  });

  // Files in this folder
  const currentFiles = files.filter(f => {
    if (scope === 'all') return true;
    if (!currentFolderId) {
      // In Root folder: show root files or unassigned or files whose folder no longer exists
      return !f.folderId || f.folderPath === '/' || f.folderPath === 'Root' || !f.folderPath || !folders.some(folder => folder.id === f.folderId || folder.path === f.folderPath);
    }
    return f.folderId === currentFolderId || f.folderPath === currentFolder?.path;
  });

  // Filtered files
  const filteredFiles = currentFiles.filter(f => {
    const matchesCategory = selectedCategory === 'All' || f.category === selectedCategory;
    const matchesQuery = f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.extension.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         f.hash.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  // Sorted files
  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let cmp = 0;
    if (sortBy === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortBy === 'size') cmp = a.size - b.size;
    else if (sortBy === 'date') cmp = a.lastModified - b.lastModified;
    else if (sortBy === 'type') cmp = a.category.localeCompare(b.category);
    return sortAsc ? cmp : -cmp;
  });

  const categories: string[] = [
    'All',
    'Documents',
    'Images',
    'Videos',
    'Audio',
    'Archives',
    'Programming Files',
    'Presentations',
    'Spreadsheets',
    'PDFs',
    'Other Files'
  ];

  const handleSelectAll = () => {
    if (selectedFileIds.length === sortedFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(sortedFiles.map(f => f.id));
    }
  };

  const handleToggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (selectedFileIds.includes(id)) {
      setSelectedFileIds(selectedFileIds.filter(item => item !== id));
    } else {
      setSelectedFileIds([...selectedFileIds, id]);
    }
  };

  const handleBatchDelete = async () => {
    if (selectedFileIds.length === 0) return;
    if (confirm(`Permanently delete ${selectedFileIds.length} selected file(s)?`)) {
      await deleteFiles(selectedFileIds, 'Batch delete from My Files');
      setSelectedFileIds([]);
    }
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    await createFolder(newFolderName.trim(), currentFolderId || undefined, newFolderColor);
    setNewFolderName('');
    setShowCreateFolderModal(false);
  };

  const handleExecuteMove = async () => {
    if (selectedFileIds.length === 0 || !targetMoveFolder) return;
    await moveFiles(selectedFileIds, targetMoveFolder);
    setSelectedFileIds([]);
    setShowMoveModal(false);
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const targetPath = currentFolder ? currentFolder.path : '/';
      await uploadFiles(e.target.files, targetPath);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const targetPath = currentFolder ? currentFolder.path : '/';
      await uploadFiles(e.dataTransfer.files, targetPath);
    }
  };

  const folderColors = ['#3b82f6', '#8b5cf6', '#10b981', '#ec4899', '#f59e0b', '#06b6d4'];

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`space-y-6 animate-fadeIn pb-12 min-h-[80vh] transition-colors relative ${
        isDragging ? 'bg-blue-50/30 dark:bg-blue-950/20 rounded-3xl' : ''
      }`}
    >
      {/* Hidden file & folder inputs for direct uploading inside My Files */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        multiple
        className="hidden"
      />
      <input
        type="file"
        ref={folderInputRef}
        onChange={handleFileInputChange}
        {...({ webkitdirectory: '', directory: '' } as any)}
        multiple
        className="hidden"
      />

      {/* Dragging Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-blue-600/10 backdrop-blur-sm border-4 border-dashed border-blue-500 flex items-center justify-center pointer-events-none rounded-3xl m-4">
          <div className="p-8 rounded-3xl bg-white/90 dark:bg-slate-900/90 shadow-2xl text-center space-y-3">
            <Upload className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto animate-bounce" />
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Drop Files to Upload & Index
            </h3>
            <p className="text-xs text-slate-500">
              Files will be hashed with SHA-256 and categorized automatically.
            </p>
          </div>
        </div>
      )}

      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Breadcrumb path */}
          <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-1">
            <button
              onClick={() => {
                setCurrentFolderId(null);
                setScope('folder');
              }}
              className="hover:text-blue-600 font-semibold"
            >
              My Storage
            </button>
            {scope === 'all' ? (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  All Files ({files.length})
                </span>
              </>
            ) : currentFolder ? (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-bold text-slate-900 dark:text-white">
                  {currentFolder.name}
                </span>
              </>
            ) : null}
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            {scope === 'all'
              ? `All Indexed Files (${files.length})`
              : currentFolder
              ? currentFolder.name
              : 'All Files & Folders'}
          </h1>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {selectedFileIds.length > 0 && (
            <>
              <button
                onClick={() => setShowMoveModal(true)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition flex items-center gap-1.5"
              >
                <FolderInput className="w-4 h-4" />
                <span>Move ({selectedFileIds.length})</span>
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 hover:bg-red-100 transition flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </>
          )}

          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <FolderPlus className="w-4 h-4 text-blue-500" />
            <span>New Folder</span>
          </button>

          <button
            onClick={() => folderInputRef.current?.click()}
            className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition shadow-sm"
            title="Upload an entire directory folder"
          >
            <Folder className="w-4 h-4 text-violet-500" />
            <span>Upload Folder</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white transition flex items-center gap-1.5 shadow-md shadow-blue-500/25"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Files</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar Controls */}
      <div className="p-4 rounded-2xl glass-card space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search current directory..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border-transparent focus:border-blue-500 focus:outline-none"
            />
          </div>

          {/* Scope Selector & Sort & View Mode */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
            {/* View Scope toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 text-xs font-semibold">
              <button
                onClick={() => setScope('folder')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  scope === 'folder'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-slate-500'
                }`}
              >
                Directory
              </button>
              <button
                onClick={() => setScope('all')}
                className={`px-2.5 py-1 rounded-lg transition ${
                  scope === 'all'
                    ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400'
                    : 'text-slate-500'
                }`}
              >
                All Files ({files.length})
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="date">Date Modified</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
                <option value="type">Category</option>
              </select>
            </div>

            <button
              onClick={() => setSortAsc(!sortAsc)}
              className="text-xs px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
            >
              {sortAsc ? 'Asc ↑' : 'Desc ↓'}
            </button>

            {/* View Grid/List toggle */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600' : 'text-slate-400'}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Folders Section */}
      {subFolders.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Folders ({subFolders.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {subFolders.map((folder) => {
              const fileCount = files.filter(f => f.folderId === folder.id || f.folderPath === folder.path).length;
              return (
                <div
                  key={folder.id}
                  onClick={() => setCurrentFolderId(folder.id)}
                  className="p-3 rounded-2xl glass-card hover:border-blue-500/50 hover:shadow-md transition cursor-pointer group flex flex-col justify-between space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div
                      className="p-2.5 rounded-xl text-white shadow-sm"
                      style={{ backgroundColor: folder.color || '#3b82f6' }}
                    >
                      <Folder className="w-4 h-4 fill-current" />
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete virtual folder "${folder.name}"?`)) deleteFolder(folder.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition"
                      title="Delete folder"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{folder.name}</p>
                    <p className="text-[10px] text-slate-400">{fileCount} files</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Files Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Files ({sortedFiles.length})
          </h3>
          {sortedFiles.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              {selectedFileIds.length === sortedFiles.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>

        {sortedFiles.length === 0 ? (
          <div className="p-12 text-center rounded-3xl glass-card border-2 border-dashed border-slate-300 dark:border-slate-800 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
              <Upload className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-slate-800 dark:text-white">
                No Files in This Directory
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Drag and drop your local files here, or click below to browse and organize.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Files Now</span>
              </button>
              <button
                onClick={() => folderInputRef.current?.click()}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition flex items-center gap-2"
              >
                <FolderPlus className="w-4 h-4 text-blue-500" />
                <span>Select Folder</span>
              </button>
            </div>
          </div>
        ) : viewMode === 'grid' ? (
          /* Grid View Mode */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {sortedFiles.map((file) => {
              const isSelected = selectedFileIds.includes(file.id);
              return (
                <div
                  key={file.id}
                  onClick={() => setSelectedFileForPreview(file)}
                  className={`p-3 rounded-2xl glass-card hover:shadow-lg transition cursor-pointer relative group flex flex-col justify-between space-y-3 border ${
                    isSelected ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-200/80 dark:border-slate-800'
                  }`}
                >
                  {/* Select Checkbox & Favorite */}
                  <div className="flex items-center justify-between z-10">
                    <button
                      onClick={(e) => handleToggleSelect(file.id, e)}
                      className="text-slate-400 hover:text-blue-600 transition"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-4 h-4 text-blue-600 fill-blue-50 dark:fill-blue-950" />
                      ) : (
                        <Square className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(file.id);
                      }}
                      className={`p-1 transition ${file.isFavorite ? 'text-amber-500' : 'text-slate-300 dark:text-slate-600 hover:text-amber-400'}`}
                    >
                      <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  {/* Thumbnail / Icon preview */}
                  <div className="h-24 rounded-xl bg-slate-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
                    {file.category === 'Images' && (file.blobUrl || file.textContent) ? (
                      <img
                        src={file.blobUrl || 'data:image/svg+xml;utf8,' + encodeURIComponent(file.textContent || '')}
                        alt={file.name}
                        className="max-h-full object-contain"
                      />
                    ) : file.category === 'Videos' ? (
                      <Film className="w-8 h-8 text-violet-500" />
                    ) : file.category === 'Audio' ? (
                      <Music className="w-8 h-8 text-pink-500" />
                    ) : file.category === 'Programming Files' ? (
                      <Code className="w-8 h-8 text-cyan-500" />
                    ) : file.category === 'Archives' ? (
                      <Archive className="w-8 h-8 text-indigo-500" />
                    ) : (
                      <FileText className="w-8 h-8 text-blue-500" />
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate" title={file.name}>
                      {file.name}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400">
                      <span>{formatBytes(file.size)}</span>
                      <span>{file.extension.toUpperCase()}</span>
                    </div>
                  </div>

                  {/* Duplicate Badge */}
                  {file.isDuplicate && (
                    <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
                      Dup
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* List View Mode */
          <div className="rounded-2xl glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 dark:bg-slate-950/40 text-slate-500 font-semibold border-b border-slate-200/80 dark:border-slate-800">
                  <tr>
                    <th className="p-3 w-10"></th>
                    <th className="p-3">File Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Modified</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {sortedFiles.map((file) => {
                    const isSelected = selectedFileIds.includes(file.id);
                    return (
                      <tr
                        key={file.id}
                        onClick={() => setSelectedFileForPreview(file)}
                        className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 cursor-pointer transition ${
                          isSelected ? 'bg-blue-50/40 dark:bg-blue-950/20' : ''
                        }`}
                      >
                        <td className="p-3" onClick={(e) => handleToggleSelect(file.id, e)}>
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-600 fill-blue-50 dark:fill-blue-950" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400" />
                          )}
                        </td>
                        <td className="p-3 font-bold text-slate-900 dark:text-white flex items-center gap-2">
                          <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                          <span className="truncate max-w-xs">{file.name}</span>
                          {file.isDuplicate && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-600">
                              Duplicate
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-500">{file.category}</td>
                        <td className="p-3 font-semibold text-slate-700 dark:text-slate-300">{formatBytes(file.size)}</td>
                        <td className="p-3 text-slate-400">{formatDate(file.lastModified)}</td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => toggleFavorite(file.id)}
                              className={`p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 ${
                                file.isFavorite ? 'text-amber-500' : 'text-slate-400'
                              }`}
                            >
                              <Star className={`w-3.5 h-3.5 ${file.isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <button
                              onClick={() => deleteFiles([file.id], 'Single file delete')}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Create Folder Modal */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <form
            onSubmit={handleCreateFolder}
            className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Virtual Folder</h3>
              <button onClick={() => setShowCreateFolderModal(false)} type="button">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">Folder Name</label>
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="e.g. Research Papers 2024"
                className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-900 dark:text-white border-transparent focus:border-blue-500 focus:outline-none"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1.5">Color Tag</label>
              <div className="flex items-center gap-2">
                {folderColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setNewFolderColor(c)}
                    className={`w-6 h-6 rounded-full transition ${newFolderColor === c ? 'ring-2 ring-offset-2 ring-blue-500 scale-110' : ''}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowCreateFolderModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25"
              >
                Create Folder
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Move Files Modal */}
      {showMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Move {selectedFileIds.length} Selected Files
              </h3>
              <button onClick={() => setShowMoveModal(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              <div
                onClick={() => setTargetMoveFolder('/')}
                className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center gap-2 ${
                  targetMoveFolder === '/' ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600' : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <Folder className="w-4 h-4" /> Root Directory (/)
              </div>
              {folders.map((f) => (
                <div
                  key={f.id}
                  onClick={() => setTargetMoveFolder(f.path)}
                  className={`p-3 rounded-xl border text-xs font-semibold cursor-pointer transition flex items-center gap-2 ${
                    targetMoveFolder === f.path ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-600' : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <Folder className="w-4 h-4 text-blue-500" /> {f.path}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteMove}
                disabled={!targetMoveFolder}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md disabled:opacity-50"
              >
                Confirm Move
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
