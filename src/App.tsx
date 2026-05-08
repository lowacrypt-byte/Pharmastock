import { useState } from 'react';
import { Menu, Pill } from 'lucide-react';
import { View } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Stock from './components/Stock';
import Vente from './components/Vente';
import Historique from './components/Historique';
import Rapport from './components/Rapport';
import './index.css';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'stock': return <Stock />;
      case 'vente': return <Vente />;
      case 'historique': return <Historique />;
      case 'rapport': return <Rapport />;
      default: return <Dashboard />;
    }
  };

  const viewTitles: Record<View, string> = {
    dashboard: 'Tableau de bord',
    stock: 'Stock Médicaments',
    vente: 'Nouvelle Vente',
    historique: 'Historique des Ventes',
    rapport: 'Rapport Journalier',
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <Sidebar
        currentView={currentView}
        onNavigate={setCurrentView}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Menu size={20} className="text-slate-600" />
              </button>
              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                  <Pill size={16} className="text-white" />
                </div>
                <span className="font-bold text-slate-800">PharmaStock</span>
              </div>
              <h1 className="hidden lg:block text-lg font-semibold text-slate-800">{viewTitles[currentView]}</h1>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 hidden sm:block">
                {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
