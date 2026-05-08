export type Categorie = 'Comprimé' | 'Sirop' | 'Injectable' | 'Suppositoire' | 'Substitut' | 'Autre';

export interface Medicament {
  id: string;
  nom: string;
  categorie: Categorie;
  forme: string; // détail spécifique : effervescent, pelliculé, seringue 5ml, etc.
  dosage: string;
  quantite: number;
  prixUnitaire: number;
  seuilAlerte: number;
  dateAjout: string;
}

export interface Vente {
  id: string;
  medicamentId: string;
  nomMedicament: string;
  quantite: number;
  prixUnitaire: number;
  montantTotal: number;
  date: string;
  heure: string;
}

export interface RapportJournalier {
  date: string;
  totalVentes: number;
  totalMontant: number;
  medicamentsVendus: { nom: string; quantite: number; montant: number }[];
}

export type View = 'dashboard' | 'stock' | 'vente' | 'historique' | 'rapport';
