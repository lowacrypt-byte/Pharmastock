import { useState, useEffect } from 'react';
import { FileText, Calendar, TrendingUp, Package, DollarSign, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { Vente } from '../types';
import { getVentes } from '../store';
import { motion } from 'framer-motion';

export default function Rapport() {
  const [ventes, setVentes] = useState<Vente[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    setVentes(getVentes());
  }, []);

  const dateStr = currentDate.toISOString().split('T')[0];
  const dateLabel = currentDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  const ventesJour = ventes.filter(v => v.date === dateStr);
  const totalVentes = ventesJour.length;
  const totalUnites = ventesJour.reduce((s, v) => s + v.quantite, 0);
  const totalMontant = ventesJour.reduce((s, v) => s + v.montantTotal, 0);

  // Agréger par médicament
  const parMedicament: Record<string, { nom: string; quantite: number; montant: number; prixUnitaire: number }> = {};
  ventesJour.forEach(v => {
    if (!parMedicament[v.nomMedicament]) {
      parMedicament[v.nomMedicament] = { nom: v.nomMedicament, quantite: 0, montant: 0, prixUnitaire: v.prixUnitaire };
    }
    parMedicament[v.nomMedicament].quantite += v.quantite;
    parMedicament[v.nomMedicament].montant += v.montantTotal;
  });

  const medicamentsVendus = Object.values(parMedicament).sort((a, b) => b.montant - a.montant);

  const prevDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() - 1);
    setCurrentDate(d);
  };

  const nextDay = () => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + 1);
    setCurrentDate(d);
  };

  const goToToday = () => setCurrentDate(new Date());

  const isToday = dateStr === new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rapport Journalier</h2>
          <p className="text-slate-500 mt-1">Analysez vos ventes par jour</p>
        </div>
        <button
          onClick={goToToday}
          className="inline-flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Calendar size={16} />
          Aujourd'hui
        </button>
      </div>

      {/* Navigation date */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevDay}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-slate-600" />
          </button>
          <div className="text-center">
            <p className="text-sm text-slate-500">Rapport du</p>
            <p className="text-lg font-bold text-slate-800 capitalize">{dateLabel}</p>
            {isToday && <span className="text-xs bg-sky-100 text-sky-600 px-2 py-0.5 rounded-full font-medium">Aujourd'hui</span>}
          </div>
          <button
            onClick={nextDay}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
              <FileText size={18} className="text-sky-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Nombre de ventes</p>
              <p className="text-2xl font-bold text-slate-800">{totalVentes}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl p-5 shadow-sm border border-slate-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
              <Package size={18} className="text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-slate-500">Unités vendues</p>
              <p className="text-2xl font-bold text-slate-800">{totalUnites}</p>
            </div>
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-emerald-50 rounded-xl p-5 border border-emerald-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
              <DollarSign size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-emerald-600">Montant total</p>
              <p className="text-2xl font-bold text-emerald-700">{totalMontant.toLocaleString('fr-FR')} FCFA</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Détail par médicament */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-sky-500" />
            <h3 className="font-semibold text-slate-800">Détail des ventes par médicament</h3>
          </div>
        </div>

        {medicamentsVendus.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <FileText size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-lg">Aucune vente ce jour</p>
            <p className="text-sm mt-1">Sélectionnez une autre date ou enregistrez des ventes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Médicament</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Prix unit.</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Qté vendue</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medicamentsVendus.map((m, i) => (
                  <motion.tr
                    key={m.nom}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-4 font-medium text-slate-800">{m.nom}</td>
                    <td className="px-5 py-4 text-right text-sm text-slate-500">{m.prixUnitaire.toLocaleString('fr-FR')} FCFA</td>
                    <td className="px-5 py-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-sky-100 text-sky-700">
                        {m.quantite}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-800">{m.montant.toLocaleString('fr-FR')} FCFA</td>
                  </motion.tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200">
                  <td colSpan={2} className="px-5 py-4 font-semibold text-slate-700">Total</td>
                  <td className="px-5 py-4 text-right font-bold text-sky-600">{totalUnites}</td>
                  <td className="px-5 py-4 text-right font-bold text-emerald-600">{totalMontant.toLocaleString('fr-FR')} FCFA</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* Conseil comptage */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="bg-amber-50 border border-amber-200 rounded-xl p-5"
      >
        <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
          <TrendingUp size={18} />
          Conseil pour le comptage du matin
        </h4>
        <ul className="space-y-2 text-sm text-amber-700">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
            Comparez le montant total des ventes ({totalMontant.toLocaleString('fr-FR')} FCFA) avec l'argent en caisse
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
            Vérifiez que chaque médicament vendu correspond bien à la quantité indiquée ci-dessus
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-1.5 shrink-0" />
            En cas d'écart, consultez l'historique détaillé pour identifier l'erreur
          </li>
        </ul>
      </motion.div>
    </div>
  );
}
