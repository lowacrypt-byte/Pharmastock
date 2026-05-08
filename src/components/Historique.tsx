import { useState, useEffect } from 'react';
import { Search, Trash2, ShoppingCart, Calendar, Clock, Filter } from 'lucide-react';
import { Vente } from '../types';
import { getVentes, supprimerVente } from '../store';
import { motion } from 'framer-motion';

export default function Historique() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setVentes(getVentes().sort((a, b) =>
      new Date(b.date + 'T' + b.heure).getTime() - new Date(a.date + 'T' + a.heure).getTime()
    ));
  }, []);

  const filtered = ventes.filter(v => {
    const matchSearch = v.nomMedicament.toLowerCase().includes(search.toLowerCase());
    const matchDate = dateFilter ? v.date === dateFilter : true;
    return matchSearch && matchDate;
  });

  const handleDelete = (id: string) => {
    if (confirm('Annuler cette vente ? Le stock sera remis à jour.')) {
      supprimerVente(id);
      setVentes(getVentes().sort((a, b) =>
        new Date(b.date + 'T' + b.heure).getTime() - new Date(a.date + 'T' + a.heure).getTime()
      ));
    }
  };

  const totalMontant = filtered.reduce((s, v) => s + v.montantTotal, 0);
  const totalUnites = filtered.reduce((s, v) => s + v.quantite, 0);

  // Grouper par date
  const grouped: Record<string, Vente[]> = {};
  filtered.forEach(v => {
    if (!grouped[v.date]) grouped[v.date] = [];
    grouped[v.date].push(v);
  });

  const dates = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Historique des Ventes</h2>
        <p className="text-slate-500 mt-1">Consultez et gérez toutes les ventes enregistrées</p>
      </div>

      {/* Stats rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Ventes affichées</p>
          <p className="text-2xl font-bold text-slate-800">{filtered.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
          <p className="text-sm text-slate-500">Unités vendues</p>
          <p className="text-2xl font-bold text-sky-600">{totalUnites}</p>
        </div>
        <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
          <p className="text-sm text-emerald-600">Montant total</p>
          <p className="text-2xl font-bold text-emerald-700">{totalMontant.toLocaleString('fr-FR')} FCFA</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un médicament..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
            showFilters ? 'bg-sky-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Filter size={18} />
          Filtres
        </button>
      </div>

      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white rounded-xl p-4 shadow-sm border border-slate-100"
        >
          <div className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
              <label className="block text-sm font-medium text-slate-700 mb-1">Filtrer par date</label>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button
              onClick={() => { setDateFilter(''); setSearch(''); }}
              className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium"
            >
              Réinitialiser
            </button>
          </div>
        </motion.div>
      )}

      {/* Liste */}
      <div className="space-y-4">
        {dates.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-slate-400 shadow-sm border border-slate-100">
            <ShoppingCart size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aucune vente trouvée</p>
          </div>
        ) : (
          dates.map(date => {
            const dateVentes = grouped[date];
            const dateMontant = dateVentes.reduce((s, v) => s + v.montantTotal, 0);
            const dateObj = new Date(date);
            const dateStr = dateObj.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

            return (
              <motion.div
                key={date}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
              >
                <div className="px-5 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400" />
                    <span className="font-medium text-slate-700 capitalize">{dateStr}</span>
                  </div>
                  <span className="text-sm font-semibold text-sky-600">{dateMontant.toLocaleString('fr-FR')} FCFA</span>
                </div>
                <div className="divide-y divide-slate-100">
                  {dateVentes.map(v => (
                    <div key={v.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center">
                          <ShoppingCart size={14} className="text-sky-600" />
                        </div>
                        <div>
                          <p className="font-medium text-slate-800">{v.nomMedicament}</p>
                          <p className="text-sm text-slate-500">
                            {v.quantite} unité{v.quantite > 1 ? 's' : ''} × {v.prixUnitaire.toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold text-slate-800">{v.montantTotal.toLocaleString('fr-FR')} FCFA</p>
                          <div className="flex items-center gap-1 text-xs text-slate-400">
                            <Clock size={12} />
                            {v.heure}
                          </div>
                        </div>
                        <button
                          onClick={() => handleDelete(v.id)}
                          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Annuler la vente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
