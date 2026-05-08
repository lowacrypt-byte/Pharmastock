import { Medicament, Vente, Categorie } from './types';

const MEDICAMENTS_KEY = 'pharmastock_medicaments';
const VENTES_KEY = 'pharmastock_ventes';

// Migration : déduire la catégorie depuis l'ancien champ forme si absent
function deduireCategorie(ancienneForme: string): Categorie {
  const f = ancienneForme.toLowerCase();
  if (f.includes('comprimé') || f.includes('comprime') || f.includes('gélule') || f.includes('gelule')) return 'Comprimé';
  if (f.includes('sirop') || f.includes('suspension')) return 'Sirop';
  if (f.includes('inject') || f.includes('injection') || f.includes('perfusion')) return 'Injectable';
  if (f.includes('suppo')) return 'Suppositoire';
  if (f.includes('seringue') || f.includes('gant') || f.includes('catheter') || f.includes('cathéter') || f.includes('sérum') || f.includes('serum') || f.includes('pansement') || f.includes('bande') || f.includes('compress') || f.includes('aiguille') || f.includes('epicrani') || f.includes('épicrani') || f.includes('stérile') || f.includes('sterile')) return 'Substitut';
  return 'Autre';
}

export function getMedicaments(): Medicament[] {
  const data = localStorage.getItem(MEDICAMENTS_KEY);
  if (!data) return [];
  const meds: Medicament[] = JSON.parse(data);
  // Migration : ajouter categorie si manquant
  let modified = false;
  const migrated = meds.map(m => {
    if (!m.categorie) {
      modified = true;
      return { ...m, categorie: deduireCategorie(m.forme || '') };
    }
    return m;
  });
  if (modified) {
    localStorage.setItem(MEDICAMENTS_KEY, JSON.stringify(migrated));
  }
  return migrated;
}

export function saveMedicaments(medicaments: Medicament[]): void {
  localStorage.setItem(MEDICAMENTS_KEY, JSON.stringify(medicaments));
}

export function getVentes(): Vente[] {
  const data = localStorage.getItem(VENTES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveVentes(ventes: Vente[]): void {
  localStorage.setItem(VENTES_KEY, JSON.stringify(ventes));
}

export function ajouterMedicament(medicament: Medicament): void {
  const medicaments = getMedicaments();
  medicaments.push(medicament);
  saveMedicaments(medicaments);
}

export function modifierMedicament(id: string, updates: Partial<Medicament>): void {
  const medicaments = getMedicaments();
  const index = medicaments.findIndex(m => m.id === id);
  if (index !== -1) {
    medicaments[index] = { ...medicaments[index], ...updates };
    saveMedicaments(medicaments);
  }
}

export function supprimerMedicament(id: string): void {
  const medicaments = getMedicaments().filter(m => m.id !== id);
  saveMedicaments(medicaments);
}

export function enregistrerVente(vente: Vente): void {
  const ventes = getVentes();
  ventes.push(vente);
  saveVentes(ventes);

  // Mettre à jour le stock
  const medicaments = getMedicaments();
  const index = medicaments.findIndex(m => m.id === vente.medicamentId);
  if (index !== -1) {
    medicaments[index].quantite -= vente.quantite;
    saveMedicaments(medicaments);
  }
}

export function supprimerVente(id: string): void {
  const ventes = getVentes();
  const vente = ventes.find(v => v.id === id);
  if (vente) {
    // Remettre le stock
    const medicaments = getMedicaments();
    const index = medicaments.findIndex(m => m.id === vente.medicamentId);
    if (index !== -1) {
      medicaments[index].quantite += vente.quantite;
      saveMedicaments(medicaments);
    }
  }
  saveVentes(ventes.filter(v => v.id !== id));
}

export function reinitialiserDonnees(): void {
  localStorage.removeItem(MEDICAMENTS_KEY);
  localStorage.removeItem(VENTES_KEY);
}
