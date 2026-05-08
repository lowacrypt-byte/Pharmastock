import { LayoutDashboard, Package, ShoppingCart, History, FileText, Pill } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onNavigate: (view: View) => void;
  isOpen: boolean;
  onClose: () => void;
}

const menuItems: { view: View; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Tableau de bord', icon: <LayoutDashboard size={20} /> },
  { view: 'stock', label: 'Stock Médicaments', icon: <Package size={20} /> },
  { view: 'vente', label: 'Nouvelle Vente', icon: <ShoppingCart size={20} /> },
  { view: 'historique', label: 'Historique Ventes', icon: <History size={20} /> },
  { view: 'rapport', label: 'Rapport Journalier', icon: <FileText size={20} /> },
];

export default function Sidebar({ currentView, onNavigate, isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transform transition-transform duration-300 ease-in-out flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center">
              <Pill size={22} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight">PharmaStock</h1>
              <p className="text-xs text-slate-400">Gestion de stock</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => {
                onNavigate(item.view);
                onClose();
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                currentView === item.view
                  ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700">
          <div className="bg-slate-800 rounded-lg p-3">
            <p className="text-xs text-slate-400 mb-1">Stock total</p>
            <p className="text-lg font-bold text-sky-400">Médicaments</p>
          </div>
        </div>
      </aside>
    </>
  );
}
