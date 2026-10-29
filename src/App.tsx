import React from 'react';
import { CanteenProvider, useCanteen } from './context/CanteenContext';
import { Navbar } from './components/Navbar';
import { LiveSessionBar } from './components/LiveSessionBar';
import { HomeScreen } from './components/HomeScreen';
import { StudentPortal } from './components/StudentPortal';
import { StaffPOSScreen } from './components/StaffPOSScreen';
import { JdbcInspectorModal } from './components/JdbcInspectorModal';
import { UtensilsCrossed, Database, ShieldCheck, Heart } from 'lucide-react';

const AppContent: React.FC = () => {
  const { currentTab, setCurrentTab } = useCanteen();

  return (
    <div className="min-h-screen bg-[#FCFBF7] text-[#1F2937] flex flex-col font-sans selection:bg-[#A7F3D0] selection:text-[#065F46]">
      <Navbar />
      <LiveSessionBar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'home' && <HomeScreen />}
        {currentTab === 'student' && <StudentPortal />}
        {currentTab === 'staff' && <StaffPOSScreen />}
        {currentTab === 'jdbc' && <JdbcInspectorModal />}
      </main>

      {/* Clean, quiet, anti-slop footer */}
      <footer className="border-t border-[#EAE6DC] bg-[#FAF8F2] py-8 text-xs text-gray-500 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-800">
              <UtensilsCrossed className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-gray-900">CanteenFlow</span>
            <span className="text-gray-300">·</span>
            <span>Smart Canteen Queue Management System</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setCurrentTab('home')}
              className="hover:text-gray-900 transition-colors"
            >
              Home
            </button>
            <button
              onClick={() => setCurrentTab('student')}
              className="hover:text-gray-900 transition-colors"
            >
              Student Portal
            </button>
            <button
              onClick={() => setCurrentTab('staff')}
              className="hover:text-gray-900 transition-colors"
            >
              Staff POS
            </button>
            <button
              onClick={() => setCurrentTab('jdbc')}
              className="hover:text-gray-900 transition-colors flex items-center gap-1"
            >
              <Database className="w-3 h-3 text-emerald-700" />
              <span>JDBC Architecture</span>
            </button>
          </div>

          <div className="text-[11px] text-gray-400">
            Powered by MySQL PreparedStatement &amp; HikariCP Simulation
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CanteenProvider>
      <AppContent />
    </CanteenProvider>
  );
}
