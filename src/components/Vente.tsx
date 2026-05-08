import { useState, useEffect } from 'react';
import { ShoppingCart, Minus, Plus, CheckCircle, AlertCircle, X, Search } from 'lucide-react';
import { Medicament, Vente as VenteType, Categorie } from '../types';
import { getMedicaments, enregistrerVente } from '../store';
import { CATEGORIES, getCategorieColor } from '../lib/categories';
import { motion, AnimatePresence } from 'framer-motion';

export default function Vente() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [selectedMed, setSelectedMed] = useState<Medicament | null>(null);
  const [quantite, setQuantite] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categorieFilter, setCategorieFilter] = useState<Categorie | 'Tous'>('Tous');

  useEffect(() => {
    setMedicaments(getMedicaments().filter(m => m.quantite > 0));
  }, []);

  const filtered = medicaments.filter(m => {
    const matchSearch = m.nom.toLowerCase().includes(search.toLowerCase()) ||
                        m.forme.toLowerCase().includes(search.toLowerCase());
    const matchCat = categorieFilter === 'Tous' ? true : m.categorie === categorieFilter;
    return matchSearch && matchCat;
  });

  // Grouper par catégorie
  const grouped: Record<string, Medicament[]> = {};
  filtered.forEach(m => {
    if (!grouped[m.categorie]) grouped[m.categorie] = [];
    grouped[m.categorie].push(m);
  });

  const handleVente = () => {
    setError('');
    if (!selectedMed) {
      setError('Veuillez sélectionner un produit');
      return;
    }
    if (quantite <= 0) {
      setError('La quantité doit être supérieure à 0');
      return;
    }
    if (quantite > selectedMed.quantite) {
      setError(`Stock insuffisant. Il reste seulement ${selectedMed.quantite} unité(s)`);
      return;
    }

    const now = new Date();
    const vente: VenteType = {
      id: Date.now().toString(),
      medicamentId: selectedMed.id,
      nomMedicament: selectedMed.nom,
      quantite,
      prixUnitaire: selectedMed.prixUnitaire,
      montantTotal: quantite * selectedMed.prixUnitaire,
      date: now.toISOString().split('T')[0],
      heure: now.toTimeString().slice(0, 5),
    };

    enregistrerVente(vente);
    setMedicaments(getMedicaments().filter(m => m.quantite > 0));
    setSelectedMed(null);
    setQuantite(1);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const increment = () => {
    if (selectedMed && quantite < selectedMed.quantite) {
      setQuantite(q => q + 1);
    }
  };

  const decrement = () => {
    if (quantite > 1) {
      setQuantite(q => q - 1);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-800">Nouvelle Vente</h2>
        <p className="text-slate-500 mt-1">Sélectionnez un produit et enregistrez la vente</p>
      </div>

      {/* Success */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3"
          >
            <CheckCircle size={20} className="text-emerald-500 shrink-0" />
            <p className="text-emerald-700 font-medium">Vente enregistrée avec succès !</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3"
          >
            <AlertCircle size={20} className="text-red-500 shrink-0" />
            <p className="text-red-700 font-medium">{error}</p>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-6">
        {/* Filtres catégories */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Filtrer par catégorie</label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setCategorieFilter('Tous')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                categorieFilter === 'Tous'
                  ? 'border-sky-500 bg-sky-50 text-sky-700'
                  : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
              }`}
            >
              Tous
            </button>
            {CATEGORIES.map(cat => {
              const colors = getCategorieColor(cat);
              const active = categorieFilter === cat;
              const count = medicaments.filter(m => m.categorie === cat).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setCategorieFilter(active ? 'Tous' : cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border-2 transition-all ${
                    active
                      ? `${colors.border} ${colors.bg} ${colors.text}`
                      : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
          />
        </div>

        {/* Liste par catégorie */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Sélectionner un produit</label>
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-xl">
              <ShoppingCart size={32} className="mx-auto mb-2 opacity-50" />
              <p>Aucun produit disponible</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {Object.entries(grouped).map(([cat, meds]) => {
                const colors = getCategorieColor(cat as Categorie);
                return (
                  <div key={cat}>
                    <div className="flex items-center gap-2 mb-2 sticky top-0 bg-white py-1">
                      <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
                      <span className={`text-xs font-semibold uppercase tracking-wider ${colors.text}`}>{cat}</span>
                      <span className="text-xs text-slate-400">({meds.length})</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {meds.map(m => (
                        <button
                          key={m.id}
                          onClick={() => {
                            setSelectedMed(m);
                            setQuantite(1);
                            setError('');
                          }}
                          className={`text-left p-3 rounded-xl border-2 transition-all ${
                            selectedMed?.id === m.id
                              ? 'border-sky-500 bg-sky-50 shadow-md'
                              : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-slate-800 text-sm truncate pr-2">{m.nom}</span>
                            <span className="text-xs text-slate-500 shrink-0">{m.quantite} disp.</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-xs text-slate-400 truncate">
                              {m.forme}{m.forme && m.dosage ? ' / ' : ''}{m.dosage}
                            </span>
                            <span className="text-sm font-semibold text-sky-600 shrink-0">{m.prixUnitaire.toLocaleString('fr-FR')} FCFA</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quantité */}
        {selectedMed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <div className="bg-slate-50 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-slate-600">Produit sélectionné</span>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{selectedMed.nom}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${getCategorieColor(selectedMed.categorie).bg} ${getCategorieColor(selectedMed.categorie).text}`}>
                    {selectedMed.categorie}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Stock disponible</span>
                <span className="font-semibold text-emerald-600">{selectedMed.quantite} unité(s)</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Quantité à vendre</label>
              <div className="flex items-center gap-4">
                <button
                  onClick={decrement}
                  className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <Minus size={18} />
                </button>
                <input
                  type="number"
                  min="1"
                  max={selectedMed.quantite}
                  value={quantite}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 0;
                    if (val >= 1 && val <= selectedMed.quantite) {
                      setQuantite(val);
                    }
                  }}
                  className="flex-1 text-center text-2xl font-bold text-slate-800 py-2 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-sky-500"
                />
                <button
                  onClick={increment}
                  className="w-12 h-12 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
                >
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="bg-sky-50 rounded-xl p-5 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Prix unitaire</span>
                <span className="font-medium text-slate-800">{selectedMed.prixUnitaire.toLocaleString('fr-FR')} FCFA</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600">Quantité</span>
                <span className="font-medium text-slate-800">× {quantite}</span>
              </div>
              <div className="border-t border-sky-200 pt-2 flex items-center justify-between">
                <span className="font-semibold text-slate-800">Montant total</span>
                <span className="text-xl font-bold text-sky-600">
                  {(quantite * selectedMed.prixUnitaire).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <button
              onClick={handleVente}
              className="w-full bg-sky-500 hover:bg-sky-600 text-white py-3.5 rounded-xl font-semibold text-lg transition-colors shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Enregistrer la vente
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
