#!/usr/bin/env python3
"""
La chronique de physique : écriture du texte avec Gemini, voix avec edge-tts.

    python podcast/generate.py ecrire        écrit un brouillon dans podcast/scripts/
    python podcast/generate.py enregistrer   fabrique les MP3 manquants, la liste des
                                             épisodes et le flux RSS

Les réglages sont dans podcast/config.json.
Les paramètres d'un épisode arrivent par variables d'environnement :
    MODE       actus | arxiv | pdf | sujet
    PRECISION  actus : sources séparées par des virgules (vide = sources par défaut)
               arxiv : identifiant, par exemple 2409.01234
               pdf   : lien direct vers le PDF
               sujet : le sujet à expliquer
    DUREE      durée visée en minutes
    CONSIGNE   consigne supplémentaire, facultative
    GEMINI_API_KEY  clé Google AI Studio (seulement pour « ecrire »)
"""
import os, sys, re, json, time, base64, hashlib, datetime, unicodedata, html
import urllib.request, urllib.parse, urllib.error
import xml.etree.ElementTree as ET
from email.utils import format_datetime
from xml.sax.saxutils import escape

ICI = os.path.dirname(os.path.abspath(__file__))
SCRIPTS = os.path.join(ICI, "scripts")
EPISODES = os.path.join(ICI, "episodes")
INDEX = os.path.join(ICI, "episodes.json")
FLUX = os.path.join(ICI, "feed.xml")
UA = "Mozilla/5.0 (chronique-physique; +https://github.com)"
MOTS_PAR_MINUTE = 150
DEBIT_MP3 = 48000  # bits par seconde, format par défaut d'edge-tts


# ---------------------------------------------------------------- outils

def config():
    with open(os.path.join(ICI, "config.json"), encoding="utf-8") as f:
        return json.load(f)

def dire(*a):
    print(*a, flush=True)

def telecharger(url, donnees=None, entetes=None, delai=60, essais=3):
    h = {"User-Agent": UA}
    h.update(entetes or {})
    derniere = None
    for i in range(essais):
        try:
            req = urllib.request.Request(url, data=donnees, headers=h)
            with urllib.request.urlopen(req, timeout=delai) as r:
                return r.read()
        except urllib.error.HTTPError:
            raise
        except Exception as e:  # réseau capricieux : on réessaie
            derniere = e
            time.sleep(3 * (i + 1))
    raise derniere

def nettoyer_html(t):
    t = re.sub(r"<[^>]+>", " ", t or "")
    t = html.unescape(t)
    return re.sub(r"\s+", " ", t).strip()

def slugifier(t):
    t = unicodedata.normalize("NFKD", t).encode("ascii", "ignore").decode()
    t = re.sub(r"[^a-zA-Z0-9]+", "-", t).strip("-").lower()
    return t[:60].strip("-") or "episode"

def local(tag):
    return tag.rsplit("}", 1)[-1]

def sortie_github(**kv):
    f = os.environ.get("GITHUB_OUTPUT")
    if not f:
        return
    with open(f, "a", encoding="utf-8") as o:
        for k, v in kv.items():
            o.write(f"{k}={str(v).replace(chr(10), ' ')}\n")


# ---------------------------------------------------------------- sources

def arxiv_recents(categorie, n, jours):
    q = urllib.parse.urlencode({"search_query": f"cat:{categorie}", "sortBy": "submittedDate",
                                "sortOrder": "descending", "max_results": n})
    brut = telecharger(f"https://export.arxiv.org/api/query?{q}")
    time.sleep(3)  # règle de politesse de l'API arXiv
    racine = ET.fromstring(brut)
    limite = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=jours)
    res = []
    for e in racine:
        if local(e.tag) != "entry":
            continue
        d = {local(c.tag): (c.text or "") for c in e}
        try:
            pub = datetime.datetime.fromisoformat(d.get("published", "").replace("Z", "+00:00"))
            if pub < limite:
                continue
        except ValueError:
            pass
        res.append({"titre": nettoyer_html(d.get("title")), "url": d.get("id", "").strip(),
                    "resume": nettoyer_html(d.get("summary"))[:900]})
    return res

def rss(url, n):
    racine = ET.fromstring(telecharger(url))
    res = []
    for el in racine.iter():
        if local(el.tag) not in ("item", "entry"):
            continue
        d, lien = {}, ""
        for c in el:
            nom = local(c.tag)
            if nom == "link":
                lien = lien or (c.text or "").strip() or c.attrib.get("href", "")
            elif nom in ("title", "description", "summary", "content", "encoded") and nom not in d:
                d[nom] = c.text or ""
        resume = d.get("description") or d.get("summary") or d.get("encoded") or d.get("content") or ""
        res.append({"titre": nettoyer_html(d.get("title")), "url": lien,
                    "resume": nettoyer_html(resume)[:900]})
        if len(res) >= n:
            break
    return res

def collecter(cles, cfg):
    tout = []
    n, jours = cfg.get("max_par_source", 25), cfg.get("fenetre_jours", 7)
    for cle in cles:
        cle = cle.strip()
        if not cle:
            continue
        src = cfg["sources"].get(cle)
        if src is None:
            if cle.startswith("http"):
                src = {"nom": urllib.parse.urlparse(cle).netloc, "type": "rss", "url": cle}
            elif re.fullmatch(r"[a-z\-]+(\.[A-Za-z\-]+)?", cle):
                src = {"nom": f"arXiv {cle}", "type": "arxiv", "categorie": cle}
            else:
                dire(f"  source inconnue ignorée : {cle}")
                continue
        try:
            if src["type"] == "arxiv":
                items = arxiv_recents(src["categorie"], n, jours)
            else:
                items = rss(src["url"], n)
        except Exception as e:
            dire(f"  impossible de lire {src['nom']} : {e}")
            continue
        dire(f"  {src['nom']} : {len(items)} éléments")
        for it in items:
            it["source"] = src["nom"]
        tout += items
    return tout

def pdf_depuis(url):
    brut = telecharger(url, delai=120)
    if not brut.startswith(b"%PDF"):
        raise SystemExit(f"Le lien ne renvoie pas un PDF : {url}")
    if len(brut) > 18 * 1024 * 1024:
        return None
    return brut

def arxiv_article(ident):
    ident = re.sub(r"^(https?://arxiv\.org/(abs|pdf)/|arxiv:)", "", ident.strip(), flags=re.I).replace(".pdf", "")
    brut = telecharger("https://export.arxiv.org/api/query?" + urllib.parse.urlencode({"id_list": ident}))
    for e in ET.fromstring(brut):
        if local(e.tag) == "entry":
            d = {local(c.tag): (c.text or "") for c in e}
            auteurs = [nettoyer_html(a[0].text) for a in e if local(a.tag) == "author" and len(a)]
            return ident, {"titre": nettoyer_html(d.get("title")), "resume": nettoyer_html(d.get("summary")),
                           "auteurs": auteurs, "url": f"https://arxiv.org/abs/{ident}"}
    raise SystemExit(f"Article arXiv introuvable : {ident}")


# ---------------------------------------------------------------- Gemini

def gemini(parties, systeme, cfg):
    cle = os.environ.get("GEMINI_API_KEY", "").strip()
    if not cle:
        raise SystemExit("GEMINI_API_KEY manquante. Ajoutez-la dans les secrets du dépôt.")
    corps = {"systemInstruction": {"parts": [{"text": systeme}]},
             "contents": [{"role": "user", "parts": parties}],
             "generationConfig": {"temperature": 0.6, "responseMimeType": "application/json"}}
    donnees = json.dumps(corps).encode()
    for modele in cfg["modeles"]:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/{modele}:generateContent"
        for essai in range(4):
            try:
                brut = telecharger(url, donnees, {"x-goog-api-key": cle, "Content-Type": "application/json"},
                                   delai=300, essais=1)
            except urllib.error.HTTPError as e:
                msg = e.read().decode(errors="ignore")[:300]
                if e.code in (429, 500, 503):
                    attente = 30 * (essai + 1)
                    dire(f"  {modele} occupé ({e.code}), nouvel essai dans {attente} s")
                    time.sleep(attente)
                    continue
                dire(f"  {modele} indisponible ({e.code}) : {msg}")
                break
            except Exception as e:
                dire(f"  {modele} : erreur réseau {e}")
                time.sleep(15)
                continue
            rep = json.loads(brut)
            try:
                morceaux = rep["candidates"][0]["content"]["parts"]
            except (KeyError, IndexError):
                dire(f"  {modele} : réponse vide, {json.dumps(rep)[:300]}")
                break
            texte = "".join(p.get("text", "") for p in morceaux if not p.get("thought"))
            texte = re.sub(r"^```(json)?|```$", "", texte.strip()).strip()
            try:
                return json.loads(texte), modele
            except json.JSONDecodeError:
                dire(f"  {modele} : JSON illisible, nouvel essai")
                continue
    raise SystemExit("Aucun modèle Gemini n'a répondu. Vérifiez la clé et la liste « modeles » de config.json.")

def consignes_generales(cfg):
    return f"""Tu écris le texte d'une chronique audio de physique en français, lue par une seule voix de synthèse.
Elle est publiée sur le site de {cfg['auteur']}. Public : des curieux, pas forcément spécialistes.

Règles d'écriture :
- Le texte est fait pour l'oreille : phrases courtes, pas de listes, pas de titres, pas de markdown, pas d'émojis, pas de longues parenthèses.
- Ne lis jamais une équation. Écris les unités en toutes lettres. Arrondis les nombres pour l'oral quand c'est possible.
- Explique chaque terme technique la première fois qu'il apparaît, si possible avec une image concrète.
- N'invente rien. N'utilise que les informations des documents fournis. Aucun chiffre, aucun nom, aucun résultat qui n'y figure pas. Si un point est incertain, dis-le ou laisse-le de côté.
- Précise quand un article arXiv est une prépublication, pas encore relue par d'autres chercheurs.
- Cite à l'oral l'origine de chaque sujet : la revue ou arXiv, et l'équipe ou le premier auteur quand il est connu.
- Ton clair, vivant et précis. Pas de superlatifs publicitaires, pas de formules creuses comme « révolutionnaire », « fascinant » ou « plongeons ».
- N'écris ni salutation d'ouverture ni formule de fin : elles sont ajoutées automatiquement.

Réponds uniquement avec un objet JSON de cette forme :
{{"titre": "titre de l'épisode, 70 caractères au plus",
  "resume": "une ou deux phrases qui présentent l'épisode sur la page web",
  "texte": "le texte à lire, paragraphes séparés par une ligne vide",
  "sources": [{{"titre": "…", "url": "…"}}]}}
Dans « sources », ne mets que des documents fournis que tu as réellement utilisés, avec leur lien exact."""


# ---------------------------------------------------------------- écrire

def ecrire():
    cfg = config()
    mode = (os.environ.get("MODE") or "actus").strip()
    precision = (os.environ.get("PRECISION") or "").strip()
    duree = int(os.environ.get("DUREE") or cfg.get("duree_par_defaut", 8))
    consigne = (os.environ.get("CONSIGNE") or "").strip()
    mots = duree * MOTS_PAR_MINUTE
    systeme = consignes_generales(cfg)
    parties = []
    sources_fournies = []

    if mode == "actus":
        cles = [c for c in precision.split(",") if c.strip()] or cfg["actus_par_defaut"]
        dire(f"Collecte des actualités : {', '.join(cles)}")
        items = collecter(cles, cfg)
        if not items:
            raise SystemExit("Aucune actualité récupérée. Vérifiez les sources de config.json.")
        liste = "\n\n".join(f"[{i+1}] {it['source']} : {it['titre']}\nLien : {it['url']}\nRésumé : {it['resume']}"
                            for i, it in enumerate(items))
        demande = (f"Voici des articles et actualités parus ces derniers jours.\n\n{liste}\n\n"
                   f"Choisis les 3 à 5 sujets les plus intéressants pour un public curieux, en variant les domaines. "
                   f"Centres d'intérêt de l'auteur, à privilégier à intérêt égal : {', '.join(cfg['centres_interet'])}. "
                   f"Écris une chronique d'environ {mots} mots qui les présente l'un après l'autre, "
                   f"avec une transition naturelle entre chaque sujet.")
        parties.append({"text": demande})

    elif mode in ("arxiv", "pdf"):
        if not precision:
            raise SystemExit("Indiquez un identifiant arXiv ou un lien vers le PDF dans le champ « precision ».")
        if mode == "arxiv":
            ident, meta = arxiv_article(precision)
            pdf = pdf_depuis(f"https://arxiv.org/pdf/{ident}")
            entete = (f"Article arXiv {ident} : « {meta['titre']} », par {', '.join(meta['auteurs'][:6])}"
                      f"{' et al.' if len(meta['auteurs']) > 6 else ''}.\nLien : {meta['url']}\nRésumé : {meta['resume']}")
        else:
            pdf = pdf_depuis(precision)
            entete = f"Document PDF (peut-être une thèse ou un article) : {precision}"
        if pdf:
            parties.append({"inline_data": {"mime_type": "application/pdf", "data": base64.b64encode(pdf).decode()}})
        else:
            dire("  PDF trop volumineux : seul le résumé sera utilisé.")
        parties.append({"text": f"{entete}\n\nExplique ce travail dans une chronique d'environ {mots} mots : "
                                f"le contexte, la question posée, la méthode dans ses grandes lignes, les résultats "
                                f"principaux, leurs limites, et pourquoi c'est intéressant. S'il s'agit d'une thèse, "
                                f"concentre-toi sur la question centrale et les deux ou trois résultats majeurs."})
    elif mode == "sujet":
        if not precision:
            raise SystemExit("Indiquez le sujet dans le champ « precision ».")
        systeme += ("\n\nIci, aucun document n'est fourni. Appuie-toi uniquement sur des connaissances établies et "
                    "consensuelles. Évite les chiffres précis dont tu n'es pas certain. Pour « sources », ne propose "
                    "que des références que tu es sûr d'exister, sinon laisse la liste vide.")
        parties.append({"text": f"Sujet : {precision}\n\nExplique ce sujet dans une chronique d'environ {mots} mots."})
    else:
        raise SystemExit(f"Mode inconnu : {mode}")

    if consigne:
        parties.append({"text": f"Consigne supplémentaire de l'auteur : {consigne}"})

    dire("Écriture par Gemini…")
    rep, modele = gemini(parties, systeme, cfg)
    titre = (rep.get("titre") or "Chronique de physique").strip()
    texte = (rep.get("texte") or "").strip()
    if len(texte.split()) < 80:
        raise SystemExit("Le texte reçu est trop court, rien n'a été enregistré.")

    auj = datetime.date.today().isoformat()
    slug = f"{auj}-{slugifier(titre)}"
    os.makedirs(SCRIPTS, exist_ok=True)
    chemin = os.path.join(SCRIPTS, slug + ".md")
    n = 2
    while os.path.exists(chemin):
        slug = f"{auj}-{slugifier(titre)}-{n}"; chemin = os.path.join(SCRIPTS, slug + ".md"); n += 1

    sources = [s for s in rep.get("sources", []) if s.get("url")]
    lignes = ["---", f"titre: {titre}", f"date: {auj}", f"resume: {(rep.get('resume') or '').strip()}",
              f"mode: {mode}", f"modele: {modele}", "---", "",
              cfg["ouverture"], "", texte, "", cfg["cloture"], "", "## Sources", ""]
    lignes += [f"- {s.get('titre', s['url']).strip()} | {s['url'].strip()}" for s in sources]
    with open(chemin, "w", encoding="utf-8") as f:
        f.write("\n".join(lignes) + "\n")

    nb = len(texte.split())
    dire(f"Brouillon écrit : podcast/scripts/{slug}.md ({nb} mots, environ {round(nb / MOTS_PAR_MINUTE)} min, modèle {modele})")
    corps_pr = (f"## {titre}\n\n{rep.get('resume', '')}\n\n"
                f"Brouillon : `podcast/scripts/{slug}.md`, environ {round(nb / MOTS_PAR_MINUTE)} minutes.\n\n"
                "**Pour relire :** onglet *Files changed*, puis les trois points du fichier et *Edit file*. "
                "Corrigez, enregistrez avec *Commit changes*.\n\n"
                "**Pour publier :** bouton *Merge pull request*. L'audio est alors fabriqué et mis en ligne "
                "automatiquement.\n\n**Pour abandonner :** *Close pull request*.")
    tmp = os.environ.get("RUNNER_TEMP", "/tmp")
    with open(os.path.join(tmp, "pr.md"), "w", encoding="utf-8") as f:
        f.write(corps_pr)
    sortie_github(slug=slug, titre=titre, pr=os.path.join(tmp, "pr.md"))


# ---------------------------------------------------------------- enregistrer

def lire_script(chemin):
    with open(chemin, encoding="utf-8") as f:
        brut = f.read()
    meta, corps = {}, brut
    m = re.match(r"^---\s*\n(.*?)\n---\s*\n(.*)$", brut, re.S)
    if m:
        for ligne in m.group(1).splitlines():
            if ":" in ligne:
                k, v = ligne.split(":", 1)
                meta[k.strip()] = v.strip()
        corps = m.group(2)
    parts = re.split(r"^##\s*Sources\s*$", corps, maxsplit=1, flags=re.M | re.I)
    texte = parts[0].strip()
    sources = []
    if len(parts) > 1:
        for ligne in parts[1].splitlines():
            ligne = ligne.strip()
            if ligne.startswith("-") and "|" in ligne:
                t, u = ligne[1:].rsplit("|", 1)
                sources.append({"titre": t.strip(), "url": u.strip()})
    return meta, texte, sources

def pour_la_voix(texte):
    t = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", texte)
    t = re.sub(r"[#*_`>]+", "", t)
    t = re.sub(r"[ \t]+", " ", t)
    return re.sub(r"\n{3,}", "\n\n", t).strip()

def synthese(texte, voix, vitesse, sortie):
    import asyncio
    import edge_tts
    async def go_voix(v):
        await edge_tts.Communicate(texte, v, rate=vitesse).save(sortie)
    for v in [voix, "fr-FR-HenriNeural"]:
        for i in range(3):
            try:
                asyncio.run(go_voix(v))
                if os.path.getsize(sortie) > 1000:
                    return
            except Exception as e:
                dire(f"  voix {v} : erreur {e}, nouvel essai")
                time.sleep(10 * (i + 1))
    raise SystemExit("La synthèse vocale a échoué.")

def enregistrer():
    cfg = config()
    os.makedirs(EPISODES, exist_ok=True)
    os.makedirs(SCRIPTS, exist_ok=True)
    ancien = {}
    if os.path.exists(INDEX):
        with open(INDEX, encoding="utf-8") as f:
            ancien = {e["slug"]: e for e in json.load(f)}

    episodes = []
    for nom in sorted(os.listdir(SCRIPTS)):
        if not nom.endswith(".md"):
            continue
        slug = nom[:-3]
        meta, texte, sources = lire_script(os.path.join(SCRIPTS, nom))
        voix_texte = pour_la_voix(texte)
        empreinte = hashlib.sha1(f"{cfg['voix']}|{cfg['vitesse']}|{voix_texte}".encode()).hexdigest()[:12]
        mp3 = os.path.join(EPISODES, slug + ".mp3")
        deja = ancien.get(slug)
        if not (os.path.exists(mp3) and deja and deja.get("empreinte") == empreinte):
            dire(f"Enregistrement : {slug}")
            synthese(voix_texte, cfg["voix"], cfg["vitesse"], mp3)
        taille = os.path.getsize(mp3)
        episodes.append({
            "slug": slug,
            "titre": meta.get("titre", slug),
            "date": meta.get("date", slug[:10]),
            "resume": meta.get("resume", ""),
            "audio": f"podcast/episodes/{slug}.mp3",
            "taille": taille,
            "duree": round(taille * 8 / DEBIT_MP3),
            "empreinte": empreinte,
            "sources": sources,
            "texte": voix_texte,
        })

    garder = {e["slug"] + ".mp3" for e in episodes}
    for nom in os.listdir(EPISODES):
        if nom.endswith(".mp3") and nom not in garder:
            os.remove(os.path.join(EPISODES, nom))
            dire(f"Supprimé (script retiré) : {nom}")

    episodes.sort(key=lambda e: (e["date"], e["slug"]), reverse=True)
    with open(INDEX, "w", encoding="utf-8") as f:
        json.dump(episodes, f, ensure_ascii=False, indent=1)
    ecrire_flux(episodes, cfg)
    dire(f"{len(episodes)} épisode(s) dans la liste.")

def ecrire_flux(episodes, cfg):
    base = cfg["site_url"].rstrip("/")
    if "PSEUDO" in base:
        dire("Attention : renseignez « site_url » dans podcast/config.json pour que le flux RSS fonctionne.")
    maintenant = format_datetime(datetime.datetime.now(datetime.timezone.utc))
    items = []
    for e in episodes:
        d = datetime.datetime.fromisoformat(e["date"]).replace(hour=8, tzinfo=datetime.timezone.utc)
        desc = e["resume"]
        if e["sources"]:
            desc += "\n\nSources :\n" + "\n".join(f"- {s['titre']} : {s['url']}" for s in e["sources"])
        items.append(f"""  <item>
   <title>{escape(e['titre'])}</title>
   <description>{escape(desc)}</description>
   <link>{escape(base)}/podcast.html#{e['slug']}</link>
   <guid isPermaLink="false">{e['slug']}</guid>
   <pubDate>{format_datetime(d)}</pubDate>
   <enclosure url="{escape(base)}/{e['audio']}" length="{e['taille']}" type="audio/mpeg"/>
   <itunes:duration>{e['duree']}</itunes:duration>
   <itunes:explicit>false</itunes:explicit>
  </item>""")
    flux = f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd">
 <channel>
  <title>{escape(cfg['titre_podcast'])}</title>
  <link>{escape(base)}/podcast.html</link>
  <description>{escape(cfg['description'])}</description>
  <language>fr</language>
  <lastBuildDate>{maintenant}</lastBuildDate>
  <itunes:author>{escape(cfg['auteur'])}</itunes:author>
  <itunes:image href="{escape(base)}/podcast/cover.jpg"/>
  <itunes:category text="Science"><itunes:category text="Physics"/></itunes:category>
  <itunes:explicit>false</itunes:explicit>
{chr(10).join(items)}
 </channel>
</rss>
"""
    with open(FLUX, "w", encoding="utf-8") as f:
        f.write(flux)


if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else ""
    if action == "ecrire":
        ecrire()
    elif action == "enregistrer":
        enregistrer()
    else:
        print(__doc__)
        sys.exit(1)
