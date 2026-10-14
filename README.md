# Glossaire politique

Glossaire partagé des termes de la vie politique et parlementaire française (procédure parlementaire, mais aussi fiscalité, économie, protection sociale, élections, collectivités, Europe, droits et libertés : les mots qu'emploient les responsables politiques), pensé comme une base commune pour plusieurs sites (le premier : [scrutins](https://github.com/Peralban/scrutins)).

Une définition ici est **spécialisée** : « Assemblée » veut dire l'Assemblée nationale, « scrutin » un vote enregistré, et pas le sens d'un dictionnaire général.

## Règles

1. **Pas d'entrée relue sans source officielle.** Une entrée `sourcé` ou `relu` a au moins une source de type `officiel` : assemblee-nationale.fr, senat.fr, vie-publique.fr, legifrance.gouv.fr, conseil-constitutionnel.fr, service-public.fr… Un dictionnaire (Académie française, CNRTL) peut s'ajouter pour le sens général, jamais seul.
2. **On reformule, on ne recopie pas.** Les dictionnaires sont protégés ; on y renvoie par un lien. Les textes officiels sont en Licence Ouverte et peuvent être repris avec leur source. Le Wiktionnaire (CC BY-SA) n'est pas utilisé, pour ne pas imposer le partage à l'identique.
3. **Une source se lit avant de s'écrire.** Chaque source porte sa date de consultation (`consulte`). Une définition qu'on n'a pas pu vérifier reste `à sourcer`.
4. **Neutralité.** Une définition dit ce que c'est et comment ça fonctionne, pas ce qu'il faut en penser.

## Statuts

| statut | sens |
|---|---|
| `à sourcer` | écrite, pas encore adossée à une source officielle |
| `sourcé` | au moins une source officielle consultée |
| `relu` | sourcée et relue par une personne |

## Format

`glossaire.json`, décrit par `glossaire.schema.json`. Champs d'une entrée : `id`, `mot`, `cat`, `def`, `contexte` (facultatif, le sens précis en France), `voir` (liens vers d'autres entrées), `sources` (`nom`, `url`, `type`, `consulte`), `statut`.

Les notes propres à un site (« sur ce site… », exemples chiffrés) n'ont pas leur place ici : chaque site les garde de son côté, indexées par `id`.

## Utiliser la librairie

Le dépôt est aussi un paquet TypeScript sans dépendance (`src/index.ts`), importable depuis Bun, Node (via un bundler) ou Next.js. Il lit `glossaire.json` tel quel : mettre à jour le glossaire, c'est mettre à jour la dépendance.

Installation, au choix :

```jsonc
// package.json du site
"dependencies": {
  "glossaire-politique": "file:../glossaire-politique",                          // checkout voisin
  "glossaire-politique": "github:Peralban/glossaire-politique#v0.1.0"            // ou un tag du dépôt
}
```

Avec Next.js, ajouter `transpilePackages: ["glossaire-politique"]` (le paquet est livré en TypeScript) et, pour un lien local hors du projet, un `turbopack.root` qui couvre les deux dossiers.

```ts
import { avecNotes, categories, mots, parId, trouver, normaliser, type Mot } from "glossaire-politique";

trouver("amendements");   // → l'entrée « Amendement » (pluriel, casse et accents ignorés)
trouver("TVA");           // → « TVA (taxe sur la valeur ajoutée) », par son sigle
trouver("49.3");          // → « Article 49.3 » (id 49-3)
trouver("taxe");          // → undefined : correspondance exacte seulement
parId("cmp");             // → « Commission mixte paritaire (CMP) »

// Les notes propres à un site, superposées par id. Un id inconnu est signalé (console.warn par défaut).
const g = avecNotes<{ site?: string; ex?: string }>({ amendement: { site: "Voter contre un amendement n'est pas voter contre la loi." } });
g.trouver("amendement")?.site;
```

| export | rôle |
|---|---|
| `Mot`, `Source`, `Statut`, `Glossaire`, `Vue` | types |
| `glossaire`, `version`, `categories`, `mots` | les données |
| `parId(id, liste?)` | une entrée par identifiant |
| `trouver(mot, liste?)` | correspondance exacte : id, nom, nom sans parenthèse, contenu de la parenthèse (sigle), pluriel en « s », « 49.3 » = « 49-3 » |
| `cles(mot)` | les formes normalisées auxquelles une entrée répond |
| `normaliser(texte)`, `nettoyer(mot)` | minuscules sans accents ; guillemets et ponctuation autour d'un mot sélectionné retirés |
| `avecNotes(notes, avertir?)` | `{ categories, mots, parId, trouver }` sur les entrées enrichies des notes du site |

## Signaler un problème

Une définition fausse, incomplète, pas neutre, une source cassée ou un mot qui manque : ouvrir une issue avec le formulaire [« Signaler un problème sur une définition »](https://github.com/Peralban/glossaire-politique/issues/new?template=signalement.yml). Les signalements portent le label `signalement`.

Les sites qui utilisent le glossaire peuvent aussi créer ces issues eux-mêmes, depuis un formulaire sur leurs pages, avec le même label : c'est le cas de scrutins, où le lecteur n'a pas besoin de compte GitHub.

## Vérifier

```
bun scripts/validate.ts   # le contenu
bun test                  # la librairie
```

`validate.ts` contrôle les identifiants uniques, les catégories, les renvois `voir`, et que tout statut autre que `à sourcer` s'appuie sur une source officielle.

## Licence

[CC BY 4.0](LICENSE) : réutilisation libre, y compris commerciale, à condition de citer « Glossaire politique » et de donner le lien vers ce dépôt, en indiquant les modifications éventuelles.
