import { Categorie } from '../types';

export const CATEGORIES: Categorie[] = ['Comprimé', 'Sirop', 'Injectable', 'Suppositoire', 'Substitut', 'Autre'];

export const CATEGORIE_COLORS: Record<Categorie, { bg: string; text: string; border: string; dot: string }> = {
  'Comprimé':   { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200',   dot: 'bg-blue-500' },
  'Sirop':      { bg: 'bg-violet-50', text: 'text-violet-700', border: 'border-violet-200', dot: 'bg-violet-500' },
  'Injectable': { bg: 'bg-rose-50',   text: 'text-rose-700',   border: 'border-rose-200',   dot: 'bg-rose-500' },
  'Suppositoire':{ bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', dot: 'bg-orange-500' },
  'Substitut':  { bg: 'bg-emerald-50',text: 'text-emerald-700',border: 'border-emerald-200',dot: 'bg-emerald-500' },
  'Autre':      { bg: 'bg-slate-100', text: 'text-slate-600',  border: 'border-slate-200',  dot: 'bg-slate-400' },
};

export const CATEGORIE_ICONS: Record<Categorie, string> = {
  'Comprimé': '💊',
  'Sirop': '🍶',
  'Injectable': '💉',
  'Suppositoire': '🔷',
  'Substitut': '🧤',
  'Autre': '📦',
};

export function getCategorieColor(categorie: Categorie) {
  return CATEGORIE_COLORS[categorie] || CATEGORIE_COLORS['Autre'];
}
