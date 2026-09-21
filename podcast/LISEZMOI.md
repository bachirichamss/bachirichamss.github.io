# La chronique de physique : mode d'emploi

Tout est gratuit : Gemini (palier gratuit de Google AI Studio) écrit le texte, edge-tts
fabrique la voix, GitHub Actions fait tourner le tout et GitHub Pages l'héberge.

## Ce que contient le dossier

| Fichier | Rôle |
|---|---|
| `podcast/generate.py` | Le programme : écrit la chronique, puis fabrique l'audio |
| `podcast/config.json` | Les réglages : nom, voix, sources, formules d'ouverture et de fin |
| `podcast/requirements.txt` | La bibliothèque de voix à installer |
| `podcast/episodes.json` | La liste des épisodes publiés (mise à jour automatiquement) |
| `podcast/cover.jpg` | La pochette, pour les applications de podcast |
| `podcast.html` | La page Podcast du site |
| `.github/workflows/podcast-preparer.yml` | Le bouton « préparer un épisode » et le rendez-vous du lundi |
| `.github/workflows/podcast-publier.yml` | La fabrication de l'audio une fois le texte validé |

Les dossiers `podcast/scripts/` (les textes) et `podcast/episodes/` (les MP3) se créent tout
seuls au premier épisode.

---

## Installation, une seule fois

### 1. Obtenir une clé Gemini gratuite

1. Allez sur **aistudio.google.com** et connectez-vous avec un compte Google.
2. Cliquez sur **Get API key**, puis **Create API key**.
3. Copiez la clé. Ne la collez jamais dans un fichier du site : elle doit rester secrète.

Aucune carte bancaire n'est demandée. Tant que vous n'activez pas la facturation, vous ne
pouvez rien payer.

### 2. Donner la clé à GitHub

Dans votre dépôt : **Settings**, puis **Secrets and variables**, puis **Actions**, puis
**New repository secret**.

- Name : `GEMINI_API_KEY`
- Secret : la clé copiée

### 3. Autoriser les robots à écrire

Toujours dans **Settings** : **Actions**, puis **General**, tout en bas, section
**Workflow permissions** :

- cochez **Read and write permissions** ;
- cochez **Allow GitHub Actions to create and approve pull requests** ;
- **Save**.

### 4. Envoyer les fichiers

- Le dossier `podcast`, `podcast.html` et `site.js` : **Add file**, puis **Upload files**,
  glissez-les d'un coup. Glisser le dossier entier conserve sa structure.
- Les deux fichiers de `.github/workflows/` : les dossiers qui commencent par un point sont
  souvent invisibles sur l'ordinateur et se glissent mal. Faites plutôt **Add file**, puis
  **Create new file**, tapez comme nom `.github/workflows/podcast-preparer.yml` (les `/`
  créent les dossiers), collez le contenu du fichier, **Commit changes**. Recommencez pour
  `podcast-publier.yml`.

### 5. Indiquer l'adresse du site

Ouvrez `podcast/config.json` sur GitHub (icône crayon) et remplacez
`https://PSEUDO.github.io` par l'adresse réelle de votre site. Sans ça, le flux
d'abonnement ne fonctionne pas.

---

## Faire un épisode

Onglet **Actions**, à gauche **Podcast : préparer un épisode**, puis bouton **Run workflow**.
Un petit formulaire s'ouvre :

| Champ | Ce qu'on y met |
|---|---|
| Type d'épisode | `actus`, `arxiv`, `pdf` ou `sujet` |
| precision | Voir ci-dessous |
| Durée visée | En minutes |
| Consigne supplémentaire | Facultatif, par exemple « insiste sur la méthode expérimentale » |
| Publier tout de suite | Laissez décoché pour relire avant publication |

Ce qu'il faut mettre dans **precision** selon le type :

- **actus** : vide pour les sources par défaut, ou une liste séparée par des virgules :
  `quant-ph,prl`, `nature-physics`, `astro-ph.CO,gr-qc`. Toute catégorie arXiv fonctionne,
  même absente de la configuration, ainsi que n'importe quelle adresse de flux RSS.
- **arxiv** : l'identifiant de l'article, par exemple `2409.01234`, ou son lien.
- **pdf** : le lien direct vers un PDF, par exemple une thèse sur HAL ou TEL. Le PDF doit
  faire moins de 18 Mo.
- **sujet** : le sujet en toutes lettres, par exemple `l'effet Hall quantique`. Attention :
  dans ce mode, aucune source n'est fournie à l'IA, la relecture est d'autant plus importante.

Au bout d'une à trois minutes, une **proposition de modification** (onglet
**Pull requests**) contient le texte de la chronique.

### Relire et publier

1. Ouvrez la proposition, onglet **Files changed**.
2. Pour corriger : les trois points en haut à droite du fichier, puis **Edit file**, corrigez,
   **Commit changes**.
3. Pour publier : onglet **Conversation**, bouton **Merge pull request**, puis **Confirm merge**.

L'audio est alors fabriqué, la page Podcast et le flux se mettent à jour, et l'épisode
apparaît dans les derniers ajouts de l'accueil. Comptez deux ou trois minutes.

Pour refuser un brouillon : **Close pull request**.

### Le rendez-vous du lundi

Chaque lundi à 6 h (heure universelle), un épisode d'actualités est préparé automatiquement
avec les sources par défaut et vous attend dans les propositions. Pour changer le jour ou
l'heure, modifiez la ligne `cron` de `podcast-preparer.yml`. Pour le supprimer, effacez les
deux lignes `schedule:` et `- cron: ...`.

GitHub met en pause les tâches programmées d'un dépôt resté 60 jours sans aucune
modification. Si les épisodes du lundi s'arrêtent, il suffit de relancer à la main une fois.

---

## Modifier ou retirer un épisode déjà publié

- **Corriger le texte** : modifiez le fichier dans `podcast/scripts/`. L'audio est refabriqué
  automatiquement.
- **Retirer un épisode** : supprimez son fichier dans `podcast/scripts/`. Le MP3 et l'entrée
  de la liste disparaissent automatiquement.

---

## Réglages utiles dans `config.json`

- `ouverture` et `cloture` : les phrases dites au début et à la fin de chaque épisode.
- `voix` : `fr-FR-RemyMultilingualNeural` prononce bien les noms anglais. Autres voix
  françaises : `fr-FR-HenriNeural` (homme), `fr-FR-DeniseNeural` (femme).
- `vitesse` : `-10%` pour ralentir, `+10%` pour accélérer.
- `actus_par_defaut` : les sources du lundi.
- `sources` : ajoutez une revue en recopiant une ligne, avec l'adresse de son flux RSS.
- `modeles` : Google renomme régulièrement ses modèles. Le programme essaie la liste dans
  l'ordre. Si tout échoue, regardez dans AI Studio le nom d'un modèle « Flash » gratuit et
  ajoutez-le en tête de liste.

---

## Si quelque chose ne marche pas

Onglet **Actions**, cliquez sur l'exécution en rouge, puis sur l'étape en échec : le message
explique ce qui manque (clé absente, modèle indisponible, PDF trop gros, source illisible).

- **« GEMINI_API_KEY manquante »** : l'étape 2 de l'installation.
- **Erreur 403 à la création de la proposition** : l'étape 3.
- **« Aucun modèle Gemini n'a répondu »** : quota du jour épuisé (réessayez demain) ou noms de
  modèles périmés (voir `modeles` ci-dessus).
- **La voix échoue** : edge-tts n'est pas un service officiel de Microsoft et peut changer.
  Le programme bascule d'abord sur une seconde voix. Chaque exécution installe la dernière
  version de la bibliothèque : si le problème persiste, attendre sa mise à jour et relancer
  suffit en général.

## Place disponible

Un épisode de 8 minutes pèse environ 3 Mo. GitHub Pages accepte un site d'environ 1 Go, soit
plusieurs centaines d'épisodes. Bien avant d'en arriver là, on pourra déplacer les anciens
MP3 ailleurs sans rien changer pour les auditeurs.
