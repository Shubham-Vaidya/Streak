import { useAppStore } from '../../store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { DashboardPage } from '../../pages/DashboardPage';
import { TodayPage } from '../../pages/TodayPage';
import { HabitsPage } from '../../pages/HabitsPage';
import { AnalyticsPage } from '../../pages/AnalyticsPage';
import { SettingsPage } from '../../pages/SettingsPage';
import { HabitDetailPage } from '../../pages/HabitDetailPage';
import { AddHabitModal } from '../habits/AddHabitModal';
import { EditHabitModal } from '../habits/EditHabitModal';
import { DeleteConfirmDialog } from '../habits/DeleteConfirmDialog';

export function Layout() {
  const { currentPage, sidebarOpen, addHabitModalOpen, editHabitId, deleteHabitId } = useAppStore();

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard': return <DashboardPage />;
      case 'today': return <TodayPage />;
      case 'habits': return <HabitsPage />;
      case 'analytics': return <AnalyticsPage />;
      case 'settings': return <SettingsPage />;
      case 'habit-detail': return <HabitDetailPage />;
      default: return <DashboardPage />;
    }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      <Sidebar />

      {/* Main content */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out`}
        style={{ marginLeft: sidebarOpen ? '240px' : '64px' }}
      >
        <Header />
        <main className="flex-1 overflow-auto">
          <div className="animate-fade-in">
            {renderPage()}
          </div>
        </main>
      </div>

      {/* Modals */}
      {addHabitModalOpen && <AddHabitModal />}
      {editHabitId && <EditHabitModal habitId={editHabitId} />}
      {deleteHabitId && <DeleteConfirmDialog habitId={deleteHabitId} />}
    </div>
  );
}
