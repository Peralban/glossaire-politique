# Glossaire politique

Glossaire partagé des termes de la vie politique et parlementaire française, pensé comme une base commune pour plusieurs sites (le premier : [scrutins](https://github.com/Peralban/scrutins)).

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

## Vérifier

```
bun scripts/validate.ts
```

Contrôle les identifiants uniques, les catégories, les renvois `voir`, et que tout statut autre que `à sourcer` s'appuie sur une source officielle.

## Licence

[CC BY 4.0](LICENSE) : réutilisation libre, y compris commerciale, à condition de citer « Glossaire politique » et de donner le lien vers ce dépôt, en indiquant les modifications éventuelles.
