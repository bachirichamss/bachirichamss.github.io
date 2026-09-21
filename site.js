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
  github: ""        // ex. "https://github.com/pseudo"
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
  { id: "podcast", nom: "Podcast",
    desc: "Des épisodes courts sur l'actualité de la physique qui m'intéresse, produits avec l'aide de l'intelligence artificielle.",
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

const ARTICLES = [
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
      `<a href="rubrique.html?c=${r.id}"${current === r.id ? ' class="on"' : ""}>${r.court || r.nom}</a>`
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
      el.innerHTML = ARTICLES.slice(0, n || 6).map(item).join("");
    },
    toc(id) {
      const el = $(id); if (!el) return;
      el.innerHTML = RUBRIQUES.map(r => {
        const n = ARTICLES.filter(a => a.rubrique === r.id).length;
        return `<a class="toc-row" href="rubrique.html?c=${r.id}">
          <h3>${r.nom}</h3><p>${r.desc}</p>
          <span class="count">${n ? n + " article" + (n > 1 ? "s" : "") : "bientôt"}</span></a>`;
      }).join("");
    },
    rubrique(titleId, descId, listId) {
      const r = rub(param);
      if (!r) { location.replace("index.html"); return; }
      document.title = r.nom + " · " + SITE.nom;
      $(titleId).textContent = r.nom;
      $(descId).textContent = r.desc;
      const list = ARTICLES.filter(a => a.rubrique === r.id);
      $(listId).innerHTML = list.length ? list.map(item).join("")
        : `<div class="empty"><p>${r.vide}</p></div>`;
    },
    contact(id) {
      const el = $(id); if (!el || !SITE.contact) return;
      el.innerHTML = `Pour me contacter : <a href="${SITE.contact}">${SITE.contact.replace("mailto:", "")}</a>.`;
    }
  };
})();
