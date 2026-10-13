// Shared political glossary as a library: the data in glossaire.json plus lookups.
// No dependency and no filesystem access, so it runs in Bun, Node and the browser (Next.js bundles it).
import data from "../glossaire.json";

export type Statut = "à sourcer" | "sourcé" | "relu";
export type Source = { nom: string; url: string; type: "officiel" | "dictionnaire"; consulte: string };
export type Mot = {
  id: string;
  mot: string;
  cat: string;
  def: string;
  contexte?: string;
  voir?: string[];
  sources: Source[];
  statut: Statut;
};
export type Glossaire = { version: 1; categories: string[]; mots: Mot[] };

/** A list of entries (possibly carrying a site's own notes) with its lookups. */
export type Vue<M extends Mot = Mot> = {
  categories: string[];
  mots: M[];
  parId(id: string): M | undefined;
  trouver(mot: string): M | undefined;
};

export const glossaire = data as unknown as Glossaire;
export const version = glossaire.version;
export const categories: string[] = glossaire.categories;
export const mots: Mot[] = glossaire.mots;

/** Lowercase, accents removed: "Hémicycle" -> "hemicycle". */
export const normaliser = (texte: string) => texte.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

// Every form an entry answers to, normalised and without a trailing "s": its id, its name, its name without
// the parenthesis, and what is inside the parenthesis ("TVA (taxe sur la valeur ajoutée)" -> "tva", "taxe sur la valeur ajoutee").
export function cles(m: Pick<Mot, "id" | "mot">): string[] {
  const nu = normaliser(m.mot.replace(/\s*\([^)]*\)/g, ""));
  const parentheses = [...m.mot.matchAll(/\(([^)]+)\)/g)].map((x) => normaliser(x[1]!));
  return [m.id, normaliser(m.mot), nu, ...parentheses].map((k) => k.replace(/s$/, ""));
}

/**
 * Exact match of a word on an entry: id, name, name without parenthesis, acronym in parenthesis,
 * ignoring case, accents, surrounding quotes and punctuation, and a plural in "s" ("amendements" -> Amendement).
 * "49.3" also finds "49-3". No loose match: "taxe" does not find the TVA.
 */
export function trouver<M extends Mot>(mot: string, liste: readonly M[]): M | undefined;
export function trouver(mot: string): Mot | undefined;
export function trouver(mot: string, liste: readonly Mot[] = mots): Mot | undefined {
  const w = normaliser(nettoyer(mot)).replace(/s$/, "");
  if (!w) return undefined;
  return liste.find((m) => cles(m).some((k) => k === w || k === w.replace(/\./g, "-")));
}

/** Drops surrounding spaces, quotes and punctuation from a selected word; a closing parenthesis stays if it closes one. */
export function nettoyer(mot: string): string {
  const t = mot.trim().replace(/^[\s«"'’]+|[\s»"'’.,;:!?]+$/g, "");
  return t.includes("(") && t.endsWith(")") && !t.startsWith("(") ? t : t.replace(/^[\s«"'’(]+|[\s»"'’).,;:!?]+$/g, "");
}

export function parId<M extends Mot>(id: string, liste: readonly M[]): M | undefined;
export function parId(id: string): Mot | undefined;
export function parId(id: string, liste: readonly Mot[] = mots): Mot | undefined {
  return liste.find((m) => m.id === id);
}

/**
 * Lays a site's own notes over the shared entries, keyed by id: `avecNotes({ amendement: { site: "…" } })`.
 * Each note's fields are added to its entry (and win over the shared ones of the same name).
 * A note whose id is not in the glossary is reported through `avertir` (console.warn by default), never silently dropped.
 */
export function avecNotes<N extends object>(
  notes: Readonly<Record<string, N>>,
  avertir: (id: string) => void = (id) => console.warn(`glossaire-politique: note « ${id} » ignorée, cet id n'existe pas dans le glossaire`),
  base: readonly Mot[] = mots,
): Vue<Mot & Partial<N>> {
  const ids = new Set(base.map((m) => m.id));
  for (const id of Object.keys(notes)) if (!ids.has(id)) avertir(id);
  const liste = base.map((m) => ({ ...m, ...notes[m.id] }) as Mot & Partial<N>);
  const index = new Map(liste.map((m) => [m.id, m]));
  return { categories, mots: liste, parId: (id) => index.get(id), trouver: (mot) => trouver(mot, liste) };
}
