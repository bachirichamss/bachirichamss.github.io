/* =========================================================
   site.js — le seul fichier à modifier pour :
   - changer le nom, le contact ou les rubriques
   - ajouter un article (liste ARTICLES, le plus récent en haut)
   L'en-tête, le pied de page et toutes les listes d'articles
   sont fabriqués à partir d'ici.
   ========================================================= */

const SITE = {
  nom: "Chamss Bachiri",
  sousTitre: "Physique",
  contact: "",      // ex. "mailto:prenom@exemple.fr" ; laissé vide, la ligne n'apparaît pas
  github: "",       // ex. "https://github.com/pseudo"

  // Statistiques de visite (goatcounter.com). Mettez le code choisi à l'inscription :
  // si votre tableau de bord est https://chamss.goatcounter.com, écrivez "chamss".
  goatcounter: "",

  // Commentaires (giscus.app). Recopiez les quatre valeurs données par giscus.app.
  // Tant que repoId est vide, aucun cadre de commentaires n'apparaît.
  giscus: {
    repo: "",         // ex. "pseudo/pseudo.github.io"
    repoId: "",       // ex. "R_kgDO…"
    category: "",     // ex. "Announcements"
    categoryId: ""    // ex. "DIC_kwDO…"
  }
};

const RUBRIQUES = [
  { id: "simulations", nom: "Simulations et démonstrations", court: "Simulations",
    desc: "Partir d'une question précise et la rendre visible. Des figures qu'on manipule, pour les curieux qui veulent voir la physique bouger.",
    vide: "La première simulation arrive bientôt." },
  { id: "recherche", nom: "Recherche et réflexions", court: "Recherche",
    desc: "Notes de lecture, sujets de recherche qui m'occupent, questions ouvertes et idées en cours de maturation.",
    vide: "Les premières notes sont en cours d'écriture." },
  { id: "projets", nom: "Projets",
    desc: "Mes projets de physique au long cours : calculs, codes, montages, avec leurs impasses et leurs résultats.",
    vide: "Le premier projet sera documenté ici dès qu'il aura quelque chose à montrer." },
  { id: "recreations", nom: "Récréations",
    desc: "De la physique pour le plaisir : histoires, paradoxes, énigmes. Rigoureux sur le fond, pas forcément sérieux sur la forme.",
    vide: "Rien pour l'instant." },
  { id: "podcast", nom: "Podcast", page: "podcast.html",
    desc: "La chronique de physique : des épisodes courts sur l'actualité de la physique et sur des travaux de recherche, produits avec l'aide de l'intelligence artificielle.",
    vide: "Le premier épisode est en préparation." }
];

/* Vignettes : petits dessins SVG de 200 × 140, couleurs écrites en dur. */
const V_ETOILES = `<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" fill="#fff"/>
<ellipse cx="100" cy="66" rx="62" ry="26" fill="none" stroke="#b9c2cc" stroke-dasharray="4 5"/>
<path d="M100 100v16" stroke="#9aa4b0" fill="none"/><path d="M95 112l5 9 5-9z" fill="#9aa4b0"/>
<circle cx="45.6" cy="53.5" r="4" fill="#4a86cf"/>
<circle cx="58.7" cy="85.4" r="8" fill="#e09a2e" opacity=".42"/>
<circle cx="69.6" cy="43.4" r="8" fill="#e09a2e" opacity=".42"/>
<circle cx="154.4" cy="78.5" r="9" fill="#e09a2e"/></svg>`;

const V_AIMANT = `<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" fill="#fff"/>
<defs><linearGradient id="gA" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2c72c7"/><stop offset="44%" stop-color="#7fb2e8"/><stop offset="56%" stop-color="#ef8a78"/><stop offset="1" stop-color="#c8372d"/></linearGradient></defs>
<g fill="none" stroke="#7d8da0" stroke-width="1.2">__LOOPS__</g>
<rect x="48" y="52" width="104" height="36" rx="3" fill="#eef2f6" stroke="#a9b6c5"/>
<path d="M57 65H70L70 60L79 70L70 80L70 75H57Z" fill="url(#gA)"/>
<path d="M90 65H103L103 60L112 70L103 80L103 75H90Z" fill="url(#gA)"/>
<path d="M123 65H136L136 60L145 70L136 80L136 75H123Z" fill="url(#gA)"/>
<rect x="48" y="52" width="7" height="36" rx="2" fill="#2c72c7"/>
<rect x="145" y="52" width="7" height="36" rx="2" fill="#c8372d"/></svg>`;

const V_RICOCHETS = `<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" fill="#fff"/>
<path d="M6 100H194" stroke="#9aa4b0" stroke-dasharray="3 5"/>
<path d="M12 100 Q43 48 74 100 Q96.9 61.5 119.9 100 Q136.9 71.5 153.8 100 Q166.4 78.9 179 100 Q188.3 84.4 197.5 100" fill="none" stroke="#1f4f8f" stroke-width="1.8"/>
<ellipse cx="74" cy="100" rx="9" ry="2.6" fill="none" stroke="#1f4f8f" opacity=".45"/>
<ellipse cx="120" cy="100" rx="7" ry="2.2" fill="none" stroke="#1f4f8f" opacity=".45"/>
<ellipse cx="154" cy="100" rx="5.5" ry="1.8" fill="none" stroke="#1f4f8f" opacity=".45"/>
<circle cx="12" cy="100" r="3.4" fill="#1b1f24"/></svg>`;

const V_PESER = `<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" fill="#fff"/>
<path d="M22 110A82 82 0 0 1 186 110Z" fill="#f3f0fa"/>
<path d="M22 110A22 22 0 0 1 66 110" fill="none" stroke="#9b8ad0" stroke-dasharray="3 3"/>
<path d="M22 110A44 44 0 0 1 110 110" fill="none" stroke="#9b8ad0" stroke-dasharray="3 3"/>
<path d="M22 110A70 70 0 0 1 162 110" fill="none" stroke="#9b8ad0" stroke-dasharray="3 3"/>
<rect x="40" y="110" width="152" height="5" fill="#3a414b"/>
<ellipse cx="66" cy="106" rx="5" ry="3.5" fill="#d9730d"/>
<ellipse cx="110" cy="106" rx="5" ry="3.5" fill="#d9730d"/>
<ellipse cx="162" cy="106" rx="5" ry="3.5" fill="#d9730d" opacity=".6"/>
<circle cx="111" cy="50" r="4.5" fill="#d9730d" stroke="#8a4a08"/>
<rect x="12" y="116" width="20" height="14" rx="2" fill="#5d6672"/></svg>`;

const V_CONST = `<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" fill="#fff"/>
<path d="M96.0 70.0L105.8 74.3L105.2 78.6L94.5 79.9L93.4 83.0L100.8 90.7L98.6 94.4L88.3 91.6L86.0 94.0L89.9 104.0L86.4 106.6L78.0 100.0L75.0 101.4L74.8 112.1L70.6 113.2L65.3 103.8L62.0 104.0L57.7 113.8L53.4 113.2L52.1 102.5L49.0 101.4L41.3 108.8L37.6 106.6L40.4 96.3L38.0 94.0L28.0 97.9L25.4 94.4L32.0 86.0L30.6 83.0L19.9 82.8L18.8 78.6L28.2 73.3L28.0 70.0L18.2 65.7L18.8 61.4L29.5 60.1L30.6 57.0L23.2 49.3L25.4 45.6L35.7 48.4L38.0 46.0L34.1 36.0L37.6 33.4L46.0 40.0L49.0 38.6L49.2 27.9L53.4 26.8L58.7 36.2L62.0 36.0L66.3 26.2L70.6 26.8L71.9 37.5L75.0 38.6L82.7 31.2L86.4 33.4L83.6 43.7L86.0 46.0L96.0 42.1L98.6 45.6L92.0 54.0L93.4 57.0L104.1 57.2L105.2 61.4L95.8 66.7Z" fill="#5d6672"/><circle cx="62" cy="70" r="9" fill="#fff"/>
<path d="M18 36H186" stroke="#e3a21a" stroke-width="2.4" stroke-dasharray="5 4"/>
<rect x="186" y="22" width="6" height="28" fill="#9fb0c3"/>
<circle cx="14" cy="36" r="6" fill="#e3a21a"/></svg>`;

const V_DOPPLER = `<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" fill="#fff"/>
<g fill="none" stroke="#7d8da0" stroke-width="1.4">
<circle cx="58" cy="70" r="52"/><circle cx="72" cy="70" r="39"/><circle cx="86" cy="70" r="27"/><circle cx="100" cy="70" r="15"/></g>
<circle cx="114" cy="70" r="7" fill="#e3a21a" stroke="#a8790a"/>
<path d="M126 70h24" stroke="#5d6672" stroke-width="2"/><path d="M146 66l8 4l-8 4z" fill="#5d6672"/></svg>`;

const V_LASER = `<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" fill="#fff"/>
<rect x="34" y="50" width="96" height="40" fill="#f0f3f7" stroke="#c3c9d1"/>
<rect x="28" y="42" width="8" height="56" fill="#5d6672"/><rect x="128" y="42" width="8" height="56" fill="#9aa4b0"/>
<g fill="#e3a21a"><rect x="52" y="68" width="14" height="4" rx="2"/><rect x="76" y="68" width="14" height="4" rx="2"/><rect x="100" y="68" width="14" height="4" rx="2"/></g>
<g fill="#7a5fc0"><circle cx="52" cy="58" r="4"/><circle cx="78" cy="58" r="4"/><circle cx="104" cy="58" r="4"/><circle cx="66" cy="82" r="4"/><circle cx="92" cy="82" r="4"/></g>
<path d="M136 70h50" stroke="#c8372d" stroke-width="7" opacity=".85"/></svg>`;

const V_SIMULT = `<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" fill="#fff"/>
<rect x="24" y="34" width="152" height="30" rx="5" fill="#eef2f6" stroke="#1f4f8f" stroke-width="2"/>
<circle cx="40" cy="49" r="6" fill="#e3a21a"/><circle cx="160" cy="49" r="6" fill="#e3a21a"/>
<rect x="36" y="86" width="128" height="30" rx="5" fill="#eef2f6" stroke="#c8372d" stroke-width="2"/>
<circle cx="50" cy="101" r="6" fill="#e3a21a"/><circle cx="50" cy="101" r="13" fill="none" stroke="#e3a21a" stroke-width="2"/>
<circle cx="150" cy="101" r="6" fill="#1b1f24"/>
<path d="M14 72h172" stroke="#e2e0da"/></svg>`;

const V_JUMEAUX = `<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" fill="#fff"/>
<path d="M18 124h164" stroke="#e2e0da"/>
<path d="M70 118V22" stroke="#1f4f8f" stroke-width="4"/>
<path d="M70 118L150 70L70 22" fill="none" stroke="#c8372d" stroke-width="4"/>
<path d="M70 118L168 20" stroke="#e3a21a" stroke-width="1.6" stroke-dasharray="5 5"/>
<circle cx="70" cy="118" r="6" fill="#1b1f24"/><circle cx="70" cy="22" r="6" fill="#1b1f24"/>
<circle cx="150" cy="70" r="7" fill="#fff" stroke="#c8372d" stroke-width="3"/></svg>`;

const ARTICLES = [
  { titre: "Alice et Bob n'ont plus le même âge : le vrai sens du temps propre",
    url: "jumeaux.html", rubrique: "simulations",
    date: "2026-09-25", duree: "9 min",
    resume: "Le paradoxe des jumeaux, sans paradoxe : le temps vécu est la longueur du chemin dans l'espace-temps, et la ligne droite est celle qui fait vieillir le plus. À déplacer soi-même.",
    vignette: V_JUMEAUX },
  { titre: "Les cigares de Gamow : quand le désaccord devient visible",
    url: "simultaneite.html", rubrique: "simulations",
    date: "2026-09-23", duree: "9 min",
    resume: "Deux cigares allumés ensemble dans un train ne le sont pas pour le quai. De combien exactement, et à partir de quelle vitesse et de quelle taille cela devient mesurable.",
    vignette: V_SIMULT },
  { titre: "Le laser, ou comment obliger la lumière à marcher au pas",
    url: "laser.html", rubrique: "simulations",
    date: "2026-09-23", duree: "9 min",
    resume: "Émission stimulée, inversion de population, seuil laser : une cavité à faire démarrer soi-même, et pourquoi cet instrument est devenu le cœur de la physique de précision.",
    vignette: V_LASER },
  { titre: "L'effet Doppler, de la sirène des pompiers aux galaxies",
    url: "doppler.html", rubrique: "simulations",
    date: "2026-09-23", duree: "8 min",
    resume: "Une source qui avance tasse ses ondes devant elle. Ça change la note d'une sirène, la couleur d'une étoile, et ça se manipule ici du mur du son au décalage vers le rouge.",
    vignette: V_DOPPLER },
  { titre: "Comment on a mesuré les réglages de l'Univers",
    url: "constantes.html", rubrique: "simulations",
    date: "2026-09-22", duree: "10 min",
    resume: "Vitesse de la lumière, gravitation, constante de Planck : aucune théorie ne donne leur valeur. La roue de Fizeau, la balance de Cavendish et la balance de Kibble, à manipuler.",
    vignette: V_CONST },
  { titre: "Manuel pour peser un atome (balance non fournie)",
    url: "peser-un-atome.html", rubrique: "simulations",
    date: "2026-09-21", duree: "8 min",
    resume: "Aucune balance ne sent un électron. On l'a pesé quand même, comme les atomes et le neutron : quatre expériences à refaire ici, du tube à électrons au billard de Chadwick.",
    vignette: V_PESER },
  { titre: "Les étoiles doubles interdisent d'aller plus vite que la lumière",
    url: "etoiles-doubles.html", rubrique: "simulations",
    date: "2026-09-20", duree: "5 min",
    resume: "Si la lumière allait plus vite quand l'étoile avance vers nous, on verrait les étoiles doubles à plusieurs endroits à la fois. On ne les voit pas, et c'est une preuve.",
    vignette: V_ETOILES },
  { titre: "Couper un aimant en deux pour séparer le pôle nord du pôle sud",
    url: "aimant.html", rubrique: "simulations",
    date: "2026-09-20", duree: "7 min",
    resume: "Pourquoi on obtient toujours deux aimants complets. On coupe, on regarde à l'intérieur, on compte les pôles.",
    vignette: V_AIMANT },
  { titre: "L'homme qui ricochait",
    url: "ricochets.html", rubrique: "recreations",
    date: "2026-09-20", duree: "9 min",
    resume: "Une nouvelle en sept chapitres. Un passager rentre à terre en ricochet, et tout ce qui suit repose sur de la physique réelle, sauf ce qui est signalé.",
    vignette: V_RICOCHETS }
];

/* =========================================================
   Mécanique du site : pas besoin de toucher en dessous
   ========================================================= */
(function () {
  const LOOPS = `<path d="M152.0 70 C161.8 59.2 157.4 34.1 100 34.1 C42.6 34.1 38.3 59.2 48.0 70"/><path d="M152.0 70 C161.8 80.8 157.4 105.9 100 105.9 C42.6 105.9 38.3 80.8 48.0 70"/><path d="M152.0 70 C183.2 53.2 169.2 14.0 100 14.0 C30.8 14.0 16.8 53.2 48.0 70"/><path d="M152.0 70 C183.2 86.8 169.2 126.0 100 126.0 C30.8 126.0 16.8 86.8 48.0 70"/>`;
  ARTICLES.forEach(a => { a.vignette = a.vignette.replace("__LOOPS__", LOOPS); });

  const $ = id => document.getElementById(id);
  const rub = id => RUBRIQUES.find(r => r.id === id);
  const lien = r => r.page || `rubrique.html?c=${r.id}`;
  const V_PODCAST = `<svg viewBox="0 0 200 140" aria-hidden="true"><rect width="200" height="140" fill="#fff"/>` +
    [18,34,52,30,64,44,80,56,38,70,48,26,58,36,20,42,30,16].map((h, i) =>
      `<rect x="${22 + i * 9}" y="${70 - h / 2}" width="5" height="${h}" rx="2.5" fill="#1f4f8f" opacity="${0.45 + (i % 3) * 0.2}"/>`).join("") + `</svg>`;
  const episodes = () => fetch("podcast/episodes.json?" + Date.now()).then(r => r.ok ? r.json() : []).catch(() => []);
  const fmt = iso => {
    const [y, m, d] = iso.split("-").map(Number);
    return new Date(y, m - 1, d).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };
  const here = location.pathname.split("/").pop() || "index.html";
  const param = new URLSearchParams(location.search).get("c");
  const current = document.body.dataset.rubrique || (here === "rubrique.html" ? param : null);

  /* en-tête */
  const h = $("site-header");
  if (h) {
    let nav = RUBRIQUES.map(r =>
      `<a href="${lien(r)}"${current === r.id ? ' class="on"' : ""}>${r.court || r.nom}</a>`
    ).join("");
    nav += `<a href="a-propos.html"${here === "a-propos.html" ? ' class="on"' : ""}>À propos</a>`;
    h.innerHTML = `<div class="shell">
      <a class="brand" href="index.html"><span class="brand-name">${SITE.nom}</span><span class="brand-sub">${SITE.sousTitre}</span></a>
      <nav class="site-nav" aria-label="Rubriques">${nav}</nav></div>`;
  }

  /* pied de page */
  const f = $("site-footer");
  if (f) {
    let links = `<a href="a-propos.html">À propos</a>`;
    if (SITE.contact) links += `<a href="${SITE.contact}">Contact</a>`;
    if (SITE.github) links += `<a href="${SITE.github}">GitHub</a>`;
    f.innerHTML = `<div class="shell"><span>© ${new Date().getFullYear()} ${SITE.nom}</span><nav>${links}</nav></div>`;
  }

  /* statistiques de visite */
  if (SITE.goatcounter) {
    const g = document.createElement("script");
    g.async = true;
    g.src = "https://gc.zgo.at/count.js";
    g.setAttribute("data-goatcounter", `https://${SITE.goatcounter}.goatcounter.com/count`);
    document.head.appendChild(g);
  }
  const evenement = (chemin, titre) => {
    try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: chemin, title: titre, event: true }); } catch (e) {}
  };

  /* commentaires */
  const gc = SITE.giscus || {};
  const commentairesActifs = () => !!(gc.repo && gc.repoId && gc.categoryId);
  function commentaires(conteneur, terme) {
    if (!commentairesActifs() || !conteneur) return false;
    document.querySelectorAll(".giscus, .giscus-frame, script[src*='giscus.app/client.js']").forEach(n => n.remove());
    const boite = document.createElement("div");
    boite.className = "giscus";
    conteneur.appendChild(boite);
    const sc = document.createElement("script");
    sc.src = "https://giscus.app/client.js";
    sc.async = true;
    sc.crossOrigin = "anonymous";
    const attr = { repo: gc.repo, "repo-id": gc.repoId, category: gc.category, "category-id": gc.categoryId,
      mapping: terme ? "specific" : "pathname", strict: "1", "reactions-enabled": "1", "emit-metadata": "0",
      "input-position": "top", theme: "light", lang: "fr", loading: "lazy" };
    if (terme) attr.term = terme;
    Object.entries(attr).forEach(([k, v]) => sc.setAttribute("data-" + k, v));
    conteneur.appendChild(sc);
    return true;
  }
  if (commentairesActifs()) {
    const st = document.createElement("style");
    st.textContent = ".comments{max-width:680px;margin:3rem auto 0}.comments .note{font-family:var(--sans);font-size:.84rem;color:var(--muted);margin:0 0 1rem}";
    document.head.appendChild(st);
    const nav = document.querySelector(".post-nav");
    if (nav) {
      const sec = document.createElement("section");
      sec.className = "comments";
      sec.innerHTML = '<h2 class="sec">Commentaires</h2><p class="note">Pour commenter, il faut un compte GitHub, gratuit. Les messages sont publics.</p>';
      nav.parentNode.insertBefore(sec, nav);
      commentaires(sec);
    }
  }

  /* figures plus larges que l'écran : on le signale une fois */
  function indiceFigures() {
    document.querySelectorAll(".scene").forEach(sc => {
      const large = sc.scrollWidth > sc.clientWidth + 4;
      const note = sc.nextElementSibling && sc.nextElementSibling.classList.contains("scene-hint")
        ? sc.nextElementSibling : null;
      if (large && !note) {
        const p = document.createElement("p");
        p.className = "scene-hint";
        p.textContent = "Figure plus large que l'écran : faites-la glisser horizontalement.";
        sc.parentNode.insertBefore(p, sc.nextSibling);
      } else if (!large && note) {
        note.remove();
      }
    });
  }
  addEventListener("load", () => setTimeout(indiceFigures, 400));
  setTimeout(indiceFigures, 900);
  let minuteur;
  addEventListener("resize", () => { clearTimeout(minuteur); minuteur = setTimeout(indiceFigures, 250); });

  /* barre de lecture */
  const p = $("prog");
  if (p) {
    const up = () => {
      const d = document.documentElement, m = d.scrollHeight - d.clientHeight;
      p.style.width = (m > 0 ? d.scrollTop / m * 100 : 0) + "%";
    };
    addEventListener("scroll", up, { passive: true }); addEventListener("resize", up); up();
  }

  /* listes */
  function item(a) {
    const r = rub(a.rubrique);
    return `<article class="feed-item">
      <a class="thumb" href="${a.url}" tabindex="-1" aria-hidden="true">${a.vignette || ""}</a>
      <div>
        ${r ? `<a class="rub" href="rubrique.html?c=${r.id}">${r.nom}</a>` : ""}
        <h3><a href="${a.url}">${a.titre}</a></h3>
        <p>${a.resume}</p>
        <div class="meta"><span>${fmt(a.date)}</span><span>${a.duree}</span></div>
      </div></article>`;
  }

  window.Site = {
    latest(id, n) {
      const el = $(id); if (!el) return;
      const montrer = liste => { el.innerHTML = liste.slice(0, n || 6).map(item).join(""); };
      montrer(ARTICLES);
      episodes().then(eps => {
        if (!eps.length) return;
        const e2 = eps.map(e => ({ titre: e.titre, url: "podcast.html#" + e.slug, rubrique: "podcast", date: e.date,
          duree: Math.max(1, Math.round(e.duree / 60)) + " min d'écoute", resume: e.resume, vignette: V_PODCAST }));
        const tout = ARTICLES.map((a, i) => ({ a, i })).concat(e2.map((a, i) => ({ a, i: i + 0.5 })))
          .sort((x, y) => (y.a.date > x.a.date) - (y.a.date < x.a.date) || x.i - y.i).map(x => x.a);
        montrer(tout);
      });
    },
    toc(id) {
      const el = $(id); if (!el) return;
      el.innerHTML = RUBRIQUES.map(r => {
        const n = ARTICLES.filter(a => a.rubrique === r.id).length;
        return `<a class="toc-row" href="${lien(r)}">
          <h3>${r.nom}</h3><p>${r.desc}</p>
          <span class="count" id="count-${r.id}">${n ? n + " article" + (n > 1 ? "s" : "") : "bientôt"}</span></a>`;
      }).join("");
      episodes().then(eps => {
        const c = $("count-podcast");
        if (c && eps.length) c.textContent = eps.length + " épisode" + (eps.length > 1 ? "s" : "");
      });
    },
    rubrique(titleId, descId, listId) {
      const r = rub(param);
      if (!r) { location.replace("index.html"); return; }
      if (r.page) { location.replace(r.page); return; }
      document.title = r.nom + " · " + SITE.nom;
      $(titleId).textContent = r.nom;
      $(descId).textContent = r.desc;
      const list = ARTICLES.filter(a => a.rubrique === r.id);
      $(listId).innerHTML = list.length ? list.map(item).join("")
        : `<div class="empty"><p>${r.vide}</p></div>`;
    },
    commentairesActifs,
    commentaires,
    evenement,
    contact(id) {
      const el = $(id); if (!el || !SITE.contact) return;
      el.innerHTML = `Pour me contacter : <a href="${SITE.contact}">${SITE.contact.replace("mailto:", "")}</a>.`;
    }
  };
})();
