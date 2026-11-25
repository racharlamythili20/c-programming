import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { FilePreviewModal } from '../modals/FilePreviewModal';
import { DuplicateCompareModal } from '../modals/DuplicateCompareModal';

// Pages
import { LandingPage } from '../../pages/LandingPage';
import { DashboardOverview } from '../../pages/DashboardOverview';
import { MyFilesPage } from '../../pages/MyFilesPage';
import { SmartOrganizerPage } from '../../pages/SmartOrganizerPage';
import { DuplicateFinderPage } from '../../pages/DuplicateFinderPage';
import { StorageAnalyzerPage } from '../../pages/StorageAnalyzerPage';
import { CleanupAssistantPage } from '../../pages/CleanupAssistantPage';
import { SmartSearchPage } from '../../pages/SmartSearchPage';
import { ReportsAnalyticsPage } from '../../pages/ReportsAnalyticsPage';
import { ActivityHistoryPage } from '../../pages/ActivityHistoryPage';
import { NotificationsPage } from '../../pages/NotificationsPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { ProfilePage } from '../../pages/ProfilePage';
import { AdminDashboardPage } from '../../pages/AdminDashboardPage';
import { SignInPage } from '../../pages/SignInPage';
import { SignUpPage } from '../../pages/SignUpPage';

export const AppLayout: React.FC = () => {
  const { activeTab } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  // If active tab is landing page, render full landing page without sidebar
  if (activeTab === 'landing') {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19]">
        <LandingPage />
        <FilePreviewModal />
        <DuplicateCompareModal />
      </div>
    );
  }

  // Render the current active module inside application chrome
  const renderActiveModule = () => {
    switch (activeTab) {
      case 'overview':
        return <DashboardOverview />;
      case 'files':
        return <MyFilesPage />;
      case 'organizer':
        return <SmartOrganizerPage />;
      case 'duplicates':
        return <DuplicateFinderPage />;
      case 'storage':
        return <StorageAnalyzerPage />;
      case 'cleanup':
        return <CleanupAssistantPage />;
      case 'search':
        return <SmartSearchPage />;
      case 'reports':
        return <ReportsAnalyticsPage />;
      case 'history':
        return <ActivityHistoryPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'signin':
      case 'auth':
        return <SignInPage />;
      case 'signup':
        return <SignUpPage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] text-slate-900 dark:text-slate-100 flex">
      {/* Sidebar Navigation */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        <Header onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveModule()}
        </main>
      </div>

      {/* Persistent Global Modals */}
      <FilePreviewModal />
      <DuplicateCompareModal />
    </div>
  );
};
