import { useEffect, useState } from 'react';
import { Package, ShoppingCart, AlertTriangle, TrendingUp, Pill, Layers } from 'lucide-react';
import { Medicament, Vente, Categorie } from '../types';
import { getMedicaments, getVentes } from '../store';
import { CATEGORIES, getCategorieColor } from '../lib/categories';
import { motion } from 'framer-motion';

export default function Dashboard() {
  const [medicaments, setMedicaments] = useState<Medicament[]>([]);
  const [ventes, setVentes] = useState<Vente[]>([]);

  useEffect(() => {
    setMedicaments(getMedicaments());
    setVentes(getVentes());
  }, []);

  const totalStock = medicaments.reduce((sum, m) => sum + m.quantite, 0);
  const totalVentes = ventes.length;
  const alertes = medicaments.filter(m => m.quantite <= m.seuilAlerte).length;

  const aujourdhui = new Date().toISOString().split('T')[0];
  const ventesAujourdhui = ventes.filter(v => v.date === aujourdhui);
  const montantAujourdhui = ventesAujourdhui.reduce((sum, v) => sum + v.montantTotal, 0);

  const medicamentsAlerte = medicaments
    .filter(m => m.quantite <= m.seuilAlerte)
    .sort((a, b) => a.quantite - b.quantite)
    .slice(0, 5);

  const dernieresVentes = [...ventes]
    .sort((a, b) => new Date(b.date + 'T' + b.heure).getTime() - new Date(a.date + 'T' + a.heure).getTime())
    .slice(0, 5);

  // Répartition par catégorie
  const repartition: { categorie: Categorie; count: number; stock: number }[] = CATEGORIES
    .map(cat => ({
      categorie: cat,
      count: medicaments.filter(m => m.categorie === cat).length,
      stock: medicaments.filter(m => m.categorie === cat).reduce((s, m) => s + m.quantite, 0),
    }))
    .filter(r => r.count > 0);

  const stats = [
    { label: 'Produits en stock', value: medicaments.length, icon: <Package size={22} />, color: 'bg-emerald-500' },
    { label: 'Unités en stock', value: totalStock, icon: <Pill size={22} />, color: 'bg-sky-500' },
    { label: 'Ventes totales', value: totalVentes, icon: <ShoppingCart size={22} />, color: 'bg-violet-500' },
    { label: 'Alertes stock', value: alertes, icon: <AlertTriangle size={22} />, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Tableau de bord</h2>
        <p className="text-slate-500 mt-1">Vue d'ensemble de votre pharmacie</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl p-5 shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</p>
              </div>
              <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center text-white`}>
                {stat.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Ventes du jour */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <TrendingUp size={20} className="text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">Ventes du jour</h3>
            <p className="text-sm text-slate-500">{new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-500">Nombre de ventes</p>
            <p className="text-2xl font-bold text-slate-800">{ventesAujourdhui.length}</p>
          </div>
          <div className="bg-slate-50 rounded-lg p-4 text-center">
            <p className="text-sm text-slate-500">Unités vendues</p>
            <p className="text-2xl font-bold text-slate-800">{ventesAujourdhui.reduce((s, v) => s + v.quantite, 0)}</p>
          </div>
          <div className="bg-emerald-50 rounded-lg p-4 text-center">
            <p className="text-sm text-emerald-600">Montant total</p>
            <p className="text-2xl font-bold text-emerald-700">{montantAujourdhui.toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>
      </motion.div>

      {/* Répartition par catégorie */}
      {repartition.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-2 mb-4">
            <Layers size={18} className="text-sky-500" />
            <h3 className="font-semibold text-slate-800">Répartition par catégorie</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {repartition.map(r => {
              const colors = getCategorieColor(r.categorie);
              return (
                <div key={r.categorie} className={`${colors.bg} border ${colors.border} rounded-xl p-4 text-center`}>
                  <p className={`text-2xl font-bold ${colors.text}`}>{r.count}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{r.categorie}</p>
                  <p className="text-[10px] text-slate-400">{r.stock} unités</p>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Deux colonnes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertes stock */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              <h3 className="font-semibold text-slate-800">Alertes stock faible</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {medicamentsAlerte.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Package size={40} className="mx-auto mb-3 opacity-50" />
                <p>Aucune alerte pour le moment</p>
              </div>
            ) : (
              medicamentsAlerte.map(m => {
                const colors = getCategorieColor(m.categorie);
                return (
                  <div key={m.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-slate-800">{m.nom}</p>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text}`}>
                          {m.categorie}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{m.forme} {m.dosage && `- ${m.dosage}`}</p>
                    </div>
                    <div className="text-right">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        m.quantite === 0
                          ? 'bg-red-100 text-red-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {m.quantite} restant{m.quantite > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Dernières ventes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <ShoppingCart size={18} className="text-sky-500" />
              <h3 className="font-semibold text-slate-800">Dernières ventes</h3>
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {dernieresVentes.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <ShoppingCart size={40} className="mx-auto mb-3 opacity-50" />
                <p>Aucune vente enregistrée</p>
              </div>
            ) : (
              dernieresVentes.map(v => (
                <div key={v.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{v.nomMedicament}</p>
                    <p className="text-sm text-slate-500">{v.quantite} unité{v.quantite > 1 ? 's' : ''} × {v.prixUnitaire.toLocaleString('fr-FR')} FCFA</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-800">{v.montantTotal.toLocaleString('fr-FR')} FCFA</p>
                    <p className="text-xs text-slate-400">{v.heure}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
