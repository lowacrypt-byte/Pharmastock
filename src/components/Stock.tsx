import { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Package, X, AlertTriangle, Check, SlidersHorizontal } from 'lucide-react';
import { Medicament, Categorie } from '../types';
import { getMedicaments, ajouterMedicament, modifierMedicament, supprimerMedicament } from '../store';
import { CATEGORIES, getCategorieColor } from '../lib/categories';
import { motion, AnimatePresence } from 'framer-motion';

export default function Stock() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [search, setSearch] = useState('');
  const [categorieFilter, setCategorieFilter] = useState<Categorie | 'Tous'>('Tous');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nom: '',
    categorie: 'Comprimé' as Categorie,
    forme: '',
    dosage: '',
    quantite: 0,
    prixUnitaire: 0,
    seuilAlerte: 10,
  });

  useEffect(() => {
    setMedicaments(getMedicaments());
  }, []);

  const filtered = medicaments.filter(m => {
    const matchSearch = m.nom.toLowerCase().includes(search.toLowerCase()) ||
                        m.forme.toLowerCase().includes(search.toLowerCase()) ||
                        m.categorie.toLowerCase().includes(search.toLowerCase());
    const matchCat = categorieFilter === 'Tous' ? true : m.categorie === categorieFilter;
    return matchSearch && matchCat;
  });

  // Stats par catégorie
  const statsParCategorie = CATEGORIES.map(cat => ({
    categorie: cat,
    count: medicaments.filter(m => m.categorie === cat).length,
    total: medicaments.filter(m => m.categorie === cat).reduce((s, m) => s + m.quantite, 0),
  })).filter(s => s.count > 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      modifierMedicament(editingId, formData);
      setEditingId(null);
    } else {
      const newMed: Medicament = {
        id: Date.now().toString(),
        ...formData,
        dateAjout: new Date().toISOString().split('T')[0],
      };
      ajouterMedicament(newMed);
    }
    setMedicaments(getMedicaments());
    setShowForm(false);
    setFormData({ nom: '', categorie: 'Comprimé', forme: '', dosage: '', quantite: 0, prixUnitaire: 0, seuilAlerte: 10 });
  };

  const handleEdit = (m: Medicament) => {
    setFormData({
      nom: m.nom,
      categorie: m.categorie,
      forme: m.forme,
      dosage: m.dosage,
      quantite: m.quantite,
      prixUnitaire: m.prixUnitaire,
      seuilAlerte: m.seuilAlerte,
    });
    setEditingId(m.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Supprimer ce médicament ?')) {
      supprimerMedicament(id);
      setMedicaments(getMedicaments());
    }
  };

  // Suggestions de forme selon la catégorie
  const getFormePlaceholder = (cat: Categorie) => {
    switch (cat) {
      case 'Comprimé': return 'Ex: Effervescent, Pelliculé, Sachet...';
      case 'Sirop': return 'Ex: Flacon 100ml, Flacon 200ml...';
      case 'Injectable': return 'Ex: Ampoule, Fiole, Perfusion...';
      case 'Suppositoire': return 'Ex: Adulte, Enfant, Nourrisson...';
      case 'Substitut': return 'Ex: Seringue 5ml, Gants stériles T7, Cathéter...';
      default: return 'Ex: Détail de la forme...';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Stock Médicaments</h2>
          <p className="text-slate-500 mt-1">Gérez votre inventaire par catégorie</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({ nom: '', categorie: 'Comprimé', forme: '', dosage: '', quantite: 0, prixUnitaire: 0, seuilAlerte: 10 });
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-sky-500/25"
        >
          <Plus size={18} />
          Ajouter un produit
        </button>
      </div>

      {/* Stats par catégorie */}
      {statsParCategorie.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button
            onClick={() => setCategorieFilter('Tous')}
            className={`p-3 rounded-xl border-2 text-center transition-all ${
              categorieFilter === 'Tous'
                ? 'border-sky-500 bg-sky-50 shadow-md'
                : 'border-slate-100 bg-white hover:border-slate-200'
            }`}
          >
            <p className="text-lg font-bold text-slate-800">{medicaments.length}</p>
            <p className="text-xs text-slate-500">Tous</p>
          </button>
          {statsParCategorie.map(s => {
            const colors = getCategorieColor(s.categorie);
            const active = categorieFilter === s.categorie;
            return (
              <button
                key={s.categorie}
                onClick={() => setCategorieFilter(active ? 'Tous' : s.categorie)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  active
                    ? `${colors.border} ${colors.bg} shadow-md`
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <p className={`text-lg font-bold ${active ? colors.text : 'text-slate-800'}`}>{s.count}</p>
                <p className="text-xs text-slate-500">{s.categorie}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{s.total} unités</p>
              </button>
            );
          })}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      {/* Filtres actifs */}
      {(categorieFilter !== 'Tous' || search) && (
        <div className="flex items-center gap-2 flex-wrap">
          <SlidersHorizontal size={14} className="text-slate-400" />
          <span className="text-sm text-slate-500">Filtres actifs :</span>
          {categorieFilter !== 'Tous' && (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium ${getCategorieColor(categorieFilter).bg} ${getCategorieColor(categorieFilter).text}`}>
              {categorieFilter}
              <button onClick={() => setCategorieFilter('Tous')} className="hover:opacity-70"><X size={12} /></button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
              &ldquo;{search}&rdquo;
              <button onClick={() => setSearch('')} className="hover:opacity-70"><X size={12} /></button>
            </span>
          )}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-800">
                  {editingId ? 'Modifier le produit' : 'Nouveau produit'}
                </h3>
                <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Nom */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nom du produit *</label>
                  <input
                    required
                    type="text"
                    value={formData.nom}
                    onChange={e => setFormData({ ...formData, nom: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    placeholder="Ex: Paracétamol, Seringue 5ml..."
                  />
                </div>

                {/* Catégorie */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Catégorie *</label>
                  <div className="grid grid-cols-3 gap-2">
                    {CATEGORIES.map(cat => {
                      const colors = getCategorieColor(cat);
                      const active = formData.categorie === cat;
                      return (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setFormData({ ...formData, categorie: cat })}
                          className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-all text-center ${
                            active
                              ? `${colors.border} ${colors.bg} ${colors.text}`
                              : 'border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200'
                          }`}
                        >
                          {cat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Forme spécifique + Dosage */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Forme / Détail</label>
                    <input
                      type="text"
                      value={formData.forme}
                      onChange={e => setFormData({ ...formData, forme: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder={getFormePlaceholder(formData.categorie)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Dosage / Taille</label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                      placeholder="Ex: 500mg, T7, 100ml..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Quantité initiale *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.quantite}
                      onChange={e => setFormData({ ...formData, quantite: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prix unitaire (FCFA) *</label>
                    <input
                      required
                      type="number"
                      min="0"
                      value={formData.prixUnitaire}
                      onChange={e => setFormData({ ...formData, prixUnitaire: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seuil d'alerte</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.seuilAlerte}
                    onChange={e => setFormData({ ...formData, seuilAlerte: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <p className="text-xs text-slate-400 mt-1">Alerte quand le stock est inférieur ou égal à cette valeur</p>
                </div>
                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2.5 border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 font-medium transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
                  >
                    {editingId ? 'Enregistrer' : 'Ajouter'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Produit</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Catégorie</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Forme / Dosage</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Stock</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix unit.</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-slate-400">
                    <Package size={40} className="mx-auto mb-3 opacity-50" />
                    <p>Aucun produit trouvé</p>
                  </td>
                </tr>
              ) : (
                filtered.map(m => {
                  const colors = getCategorieColor(m.categorie);
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${m.quantite <= m.seuilAlerte ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                          <span className="font-medium text-slate-800">{m.nom}</span>
                          {m.quantite <= m.seuilAlerte && (
                            <AlertTriangle size={14} className="text-amber-500" />
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          {m.categorie}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {m.forme}{m.forme && m.dosage ? ' / ' : ''}{m.dosage}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-sm font-medium ${
                          m.quantite === 0
                            ? 'bg-red-100 text-red-700'
                            : m.quantite <= m.seuilAlerte
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {m.quantite}
                          {m.quantite > 0 && <Check size={12} />}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right text-sm font-medium text-slate-700">{m.prixUnitaire.toLocaleString('fr-FR')} FCFA</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEdit(m)}
                            className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors"
                          >
                            <Edit3 size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
