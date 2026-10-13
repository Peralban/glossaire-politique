// Checks glossaire.json: bun scripts/validate.ts
// Rule: an entry marked "sourcé" or "relu" has at least one official source; ids are unique and every "voir" resolves.
const OFFICIEL = /(^|\.)(gouv\.fr|assemblee-nationale\.fr|senat\.fr|conseil-constitutionnel\.fr|conseil-etat\.fr|courdescomptes\.fr|europa\.eu|elysee\.fr|vie-publique\.fr|legifrance\.gouv\.fr|service-public\.fr)$/;
const g = await Bun.file(new URL("../glossaire.json", import.meta.url)).json();
const errors: string[] = [];
const ids = new Set<string>();
for (const m of g.mots) {
  if (ids.has(m.id)) errors.push(`${m.id}: id en double`);
  ids.add(m.id);
  if (!g.categories.includes(m.cat)) errors.push(`${m.id}: catégorie inconnue « ${m.cat} »`);
  if (!m.def?.trim()) errors.push(`${m.id}: définition vide`);
  for (const s of m.sources) {
    let host = "";
    try { host = new URL(s.url).hostname; } catch { errors.push(`${m.id}: URL invalide ${s.url}`); continue; }
    if (s.type === "officiel" && !OFFICIEL.test(host)) errors.push(`${m.id}: « officiel » mais ${host} n'est pas un domaine officiel connu`);
  }
  if (m.statut !== "à sourcer" && !m.sources.some((s: { type: string }) => s.type === "officiel")) errors.push(`${m.id}: statut « ${m.statut} » sans source officielle`);
}
for (const m of g.mots) for (const v of m.voir ?? []) if (!ids.has(v)) errors.push(`${m.id}: voir → « ${v} » n'existe pas`);
const by = (s: string) => g.mots.filter((m: { statut: string }) => m.statut === s).length;
console.log(`${g.mots.length} entrées : ${by("relu")} relues, ${by("sourcé")} sourcées, ${by("à sourcer")} à sourcer`);
if (errors.length) { console.log(errors.map((e) => `  ✗ ${e}`).join("\n")); process.exit(1); }
console.log("ok");
