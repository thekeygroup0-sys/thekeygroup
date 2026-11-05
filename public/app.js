/* THE KEY GROUP — fonctionnement du site (pas besoin de modifier ce fichier) */
(function () {
  'use strict';
  var S = window.SITE || {}, CATS = window.CATEGORIES || [], MARQUES = window.MARQUES || [], PRODUITS = window.PRODUITS || [];
  var page = document.body.getAttribute('data-page');
  var params = new URLSearchParams(location.search);
  // pages fixes (référencement Google) : les paramètres sont écrits dans <body data-c / data-s / data-id>
  ['c', 's', 'id', 'd'].forEach(function (k) { var v = document.body.getAttribute('data-' + k); if (v && !params.get(k)) params.set(k, v); });
  var STAT = window.PAGES_STATIQUES || {};
  var BASE = String(S.url || '').replace(/\/?$/, '/');

  function esc(v) {
    return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function lienSur(u) { u = String(u || '').trim(); return /^(https?:)?\/\//i.test(u) || /^[\w\-./]+(#\d+\/\d+)?$/.test(u) ? u : ''; }

  var ICONES = {
    voiture: 'M3 15v-3l2-5h14l2 5v3zM3 15v2h3v-2M18 15v2h3v-2M7 12h.01M17 12h.01',
    camion: 'M2 7h11v9H2zM13 10h4l4 3v3h-8M6 18.5a1.5 1.5 0 1 0 0-.01M17 18.5a1.5 1.5 0 1 0 0-.01',
    moto: 'M5 17a3 3 0 1 0 0-.01M19 17a3 3 0 1 0 0-.01M5 17l4-7h5l5 7M14 10l-2-4h3',
    machine: 'M3 17h10v-4H3zM5 13V9h5l3 4M14 15l4-8 3 2-2 6M5 19.5a1.5 1.5 0 1 0 0-.01M11 19.5a1.5 1.5 0 1 0 0-.01',
    outil: 'M14 4l6 6-3 3-6-6zM11 7L3 15l3 3 8-8M7 21h10',
    casque: 'M4 14a8 8 0 0 1 16 0v3H4zM12 6v4M4 17h16',
    piece: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2',
    batterie: 'M3 7h16v10H3zM21 10v4M7 10v4M11 10v4',
    chaise: 'M7 3v8h10V3M5 11h14v3H5zM7 14v7M17 14v7',
    table: 'M3 8h18v3H3zM5 11v9M19 11v9M9 11v4h6v-4',
    bus: 'M4 4h16v12H4zM4 10h16M7 19.5a1.5 1.5 0 1 0 0-.01M17 19.5a1.5 1.5 0 1 0 0-.01M4 16v2h2M18 16v2h2',
    recherche: 'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-3.5-3.5',
    panier: 'M3 4h2l2.4 11.2a1.5 1.5 0 0 0 1.5 1.2h8.6a1.5 1.5 0 0 0 1.5-1.1L21 8H6M9.5 20h.01M17.5 20h.01',
    tel: 'M7 2h10v20H7zM11 18h2',
    livraison: 'M1 6h13v10H1zM14 10h4l3 3v3h-7M5 18.5a1.5 1.5 0 1 0 0-.01M17 18.5a1.5 1.5 0 1 0 0-.01',
    garantie: 'M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5zM8.5 12l2.5 2.5 4.5-5',
    bulle: 'M21 12a8 8 0 0 1-11.8 7L3 21l2-6A8 8 0 1 1 21 12z',
    pin: 'M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
    navire: 'M3 17l2 4h14l2-4H3zM5 17V9h14v8M9 9V5h6v4M12 2v3',
    check: 'M5 12.5l4.5 4.5L19 7',
    grue: 'M4 21V5h2v16M6 5h14l-3 3H6M15 8v5M13 13h4v3h-4zM2 21h8',
    brique: 'M3 6h18v12H3zM3 10h18M3 14h18M9 6v4M15 6v4M6 10v4M12 10v4M18 10v4M9 14v4M15 14v4',
    canape: 'M4 11V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v3M2 12a2 2 0 0 1 4 0v2h12v-2a2 2 0 0 1 4 0v5H2zM5 17v2M19 17v2',
    usine: 'M3 21V10l5 3V10l5 3V10l5 3V4h3v17zM7 17h2M12 17h2M17 17h2',
    engrenage: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM12 2v3M12 19v3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M2 12h3M19 12h3M4.9 19.1L7 17M17 7l2.1-2.1',
    oeuf: 'M12 3c3.5 0 6.5 5.5 6.5 10a6.5 6.5 0 0 1-13 0C5.5 8.5 8.5 3 12 3z',
    poule: 'M8 7a3 3 0 1 1 5 2.2c3.5.3 7 2.6 7 6.8 0 3-2.5 5-6 5h-3c-3.5 0-6-2.5-6-6 0-2 1-3.5 3-4.5zM6 6l-2 1 2 1M10 21v2M14 21v2',
    tracteur: 'M3 14V8h7l2 4h6l2 2M7 8V5h3M7 17.5a3.5 3.5 0 1 0 0-.01M18 18a2 2 0 1 0 0-.01',
    goutte: 'M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z',
    eclair: 'M13 2L4 14h7l-1 8 9-12h-7z',
    soleil: 'M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
    frigo: 'M6 2h12v20H6zM6 9h12M9 5v2M9 12v3',
    sac: 'M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2',
    chaussure: 'M3 17v-6l4-1 3 3 4 1 5 1a2 2 0 0 1 2 2v1zM3 20h19',
    bijou: 'M6 3h12l3 5-9 13L3 8zM3 8h18M9 3l3 5 3-5M12 8v13',
    lunettes: 'M2 12h2M20 12h2M10 12h4M7 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM17 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
    vetement: 'M8 3l4 2 4-2 5 4-3 3-2-1v12H8V9L6 10 3 7z',
    tasse: 'M4 8h12v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM16 10h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2',
    jouet: 'M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM6 21v-5a6 6 0 0 1 12 0v5zM9 16h.01M15 16h.01'
  };
  function svg(nom, taille, epaisseur) {
    return '<svg width="' + (taille || 24) + '" height="' + (taille || 24) + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="' + (epaisseur || 1.8) + '" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (ICONES[nom] || ICONES.piece) + '"></path></svg>';
  }
  var WA_SVG = '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.8-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.2c0-.1-.2-.2-.4-.3z"/></svg>';

  var SECTS = window.SECTEURS || [];
  // toutes les catégories rattachées à un secteur sont affichées (même vides : « sur commande »)
  var CATS_ON = CATS.filter(function (c) { return !SECTS.length || c.secteur || PRODUITS.some(function (p) { return p.categorie === c.id; }); });
  function secteur(id) { for (var i = 0; i < SECTS.length; i++) if (SECTS[i].id === id) return SECTS[i]; return null; }
  function catsDe(sid) { return CATS_ON.filter(function (c) { return c.secteur === sid; }); }
  function nbCat(cid) { return PRODUITS.filter(function (p) { return p.categorie === cid; }).length; }
  function nbSect(sid) { return catsDe(sid).reduce(function (n, c) { return n + nbCat(c.id); }, 0); }
  function lienSect(id) { return (STAT.s && STAT.s[id]) || 'categorie.html?s=' + encodeURIComponent(id); }
  var REAL = window.REALISATIONS || [], MODIFS = window.MODIFICATIONS || null, FAQ = window.FAQ || [], REPS = window.REPRESENTANTS || [], RETOURS = window.RETOURS_CLIENTS || [], DECH = window.DECHARGEMENTS || [], PRES = window.PRESENTATIONS || [], PRES_VID = window.PRESENTATIONS_VIDEOS || [], SUIVI = window.SUIVI || [], VID_CAT = window.VIDEOS_CATEGORIES || {};
  function cat(id) { for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i]; return null; }
  function wa(texte) { return 'https://wa.me/' + String(S.whatsapp || '').replace(/\D/g, '') + '?text=' + encodeURIComponent(texte); }
  function lienProduit(p) { return (STAT.p && STAT.p[p.id]) || 'produit.html?id=' + encodeURIComponent(p.id); }
  function lienCat(id) { return (STAT.c && STAT.c[id]) || 'categorie.html?c=' + encodeURIComponent(id); }
  function lienDyn(id) { return 'categorie.html?c=' + encodeURIComponent(id); }
  /* référencement : titre, description, adresse canonique, aperçu de partage, données structurées */
  function seo(titre, desc, image, donnees, chemin) {
    document.title = titre;
    function meta(attr, nom, val) { if (!val) return; var m = document.head.querySelector('meta[' + attr + '="' + nom + '"]'); if (!m) { m = document.createElement('meta'); m.setAttribute(attr, nom); document.head.appendChild(m); } m.setAttribute('content', val); }
    desc = String(desc || '').replace(/\s+/g, ' ').trim(); if (desc.length > 158) desc = desc.slice(0, 155).replace(/[\s,;:.]+\S*$/, '') + '…';
    meta('name', 'description', desc); meta('property', 'og:title', titre); meta('property', 'og:description', desc); meta('property', 'og:type', 'website');
    if (image) meta('property', 'og:image', BASE + String(image).replace(/#.*$/, ''));
    if (BASE.length > 1 && chemin !== undefined) { var l = document.head.querySelector('link[rel="canonical"]'); if (!l) { l = document.createElement('link'); l.rel = 'canonical'; document.head.appendChild(l); } l.href = BASE + chemin; meta('property', 'og:url', BASE + chemin); }
    if (donnees) { var s = document.getElementById('donnees-seo'); if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'donnees-seo'; document.head.appendChild(s); } s.textContent = JSON.stringify(donnees); }
  }
  function entreprise() {
    return { '@context': 'https://schema.org', '@type': 'AutoDealer', name: S.nom || 'THE KEY GROUP', url: BASE, logo: BASE + 'images/logo.png', image: BASE + 'images/logo.png',
      telephone: S.telephoneAffiche || '', email: S.email || '', priceRange: 'FCFA',
      address: { '@type': 'PostalAddress', streetAddress: 'Kindonou', addressLocality: 'Cotonou', addressCountry: 'BJ' },
      areaServed: ['Bénin', 'Togo', 'Côte d’Ivoire', 'Burkina Faso', 'Mali', 'Tchad', 'RD Congo'],
      sameAs: [S.facebook, S.instagram, S.tiktok].filter(lienSur),
      description: 'Import direct de Chine : voitures neuves et d’occasion, camions, bus, engins, groupes électrogènes, vente en gros (sacs, chaussures, vêtements, bijoux). Livraison au Bénin et en Afrique de l’Ouest.' };
  }
  function nombre(v) {
    var s = String(v == null ? '' : v).replace(/[\s  ]/g, '').replace(',', '.');
    return /^\d+(\.\d+)?$/.test(s) ? parseFloat(s) : null;
  }
  function coefFrais(p) {
    if (p.categorie !== 'voitures') return 1;
    var f = S.fraisVoitures || {};
    if (estOccasion(p)) return 1 + (nombre(f.transfert) || 0) / 100;   // occasions : pas de douane incluse
    return 1 + ((nombre(f.transfert) || 0) + (nombre(f.douane) || 0)) / 100;
  }
  function estOccasion(p) { return p.etat === 'occasion' || /occasion/i.test(p.badge || ''); }
  function estCotonou(p) { return p.categorie === 'voitures' && p.cotonou === true; }
  function estCommande(p) { return p.categorie === 'voitures' && p.cotonou !== true; }
  function prixCalcules(p) {
    var k = p.prixFixe ? 1 : coefFrais(p), fcfa = nombre(p.prix), usd = nombre(p.prixDollar), taux = nombre(S.tauxDollar);
    var usdCalc = false, fcfaCalc = false;
    if (usd == null && fcfa != null && taux) { usd = fcfa / taux; usdCalc = true; }
    if (fcfa == null && usd != null && taux) { fcfa = usd * taux; fcfaCalc = true; }
    fcfa = fcfa == null ? null : (fcfaCalc ? Math.round(fcfa * k / 1000) * 1000 : Math.round(fcfa * k));
    usd = usd == null ? null : (usdCalc ? Math.round(usd * k / 10) * 10 : Math.round(usd * k));
    if (estCotonou(p) && !p.prixFixe) {
      var sup = nombre(p.supplementCotonou != null ? p.supplementCotonou : S.supplementCotonou) || 0;
      var supUsd = nombre(p.supplementCotonouDollar != null ? p.supplementCotonouDollar : S.supplementCotonouDollar);
      if (!supUsd && sup && taux) supUsd = sup / taux;
      if (fcfa != null) fcfa += sup;
      if (usd != null) usd = (sup && !supUsd) ? null : Math.round(usd + (supUsd || 0));
    }
    return { fcfa: fcfa, usd: usd };
  }
  function noteGros(p) {
    var G = S.gros || {};
    return '<div class="note-gros"><b>Vente en gros</b> · prix à l’unité' + (p.minimum ? ', <strong>à partir de ' + esc(p.minimum) + '</strong>' : '') + '. ' +
      esc(G.conditions || 'Transport en sus : par avion (10 à 21 jours) ou par bateau (45 à 60 jours), calculé au poids ou au volume. Préparation de la commande : 5 à 7 jours.') + '</div>';
  }
  function noteOccasion(grand) {
    return '<span class="note-occ' + (grand ? ' note-occ-grand' : '') + '">' + (grand ? 'Prix affiché : achat + transport uniquement. La douane au Bénin pour les véhicules d’occasion (environ 50 % à 60 % de la valeur CIF) n’est pas incluse.' : 'Achat + transport · hors douane') + '</span>';
  }
  function dispoHtml(p, grand) {
    if (estCotonou(p)) return '<span class="dispo dispo-oui' + (grand ? ' dispo-grand' : '') + '">✓ Disponible immédiatement à Cotonou</span>';
    if (estCommande(p)) return '<span class="dispo dispo-cmd' + (grand ? ' dispo-grand' : '') + '">Sur commande · ' + esc(S.delaiCommande || '') + '</span>';
    return '';
  }
  function prixHtml(p) {
    var brut = String(p.prix || '').trim(), c = prixCalcules(p), apd = p.aPartirDe ? '<small style="display:block;font-size:12px;color:var(--texte-2)">À partir de</small>' : '';
    var ligneUsd = c.usd != null ? '<span style="display:block;font-size:14px;font-weight:700;color:var(--vert-fonce)">$ ' + c.usd.toLocaleString('en-US') + '</span>' : '';
    if (c.fcfa != null) return apd + c.fcfa.toLocaleString('fr-FR').replace(/[  ]/g, ' ') + ' <small>FCFA</small>' + ligneUsd;
    if (brut) return apd + esc(brut) + ' <small>FCFA</small>' + ligneUsd;
    if (c.usd != null) return apd + '$ ' + c.usd.toLocaleString('en-US') + ' <small>USD</small>';
    return '<small>Prix sur demande</small>';
  }
  function photo(src, alt, icone, clair) {
    var u = lienSur(src), m = /#(\d+)\/(\d+)$/.exec(String(src || ''));
    // planche de photos (plusieurs vues dans un seul fichier) : « fichier.jpg#0/3 »
    if (u && m) return '<span class="planche" role="img" aria-label="' + esc(alt) + '"><span data-bg="' + esc(u.replace(/#.*$/, '')) + '" style="--i:' + m[1] + ';--n:' + m[2] + '"></span></span>';
    if (u) return '<img src="' + esc(u) + '" alt="' + esc(alt) + '" loading="lazy">';
    return '<div class="ph' + (clair ? ' ph-clair' : '') + '">' + svg(icone, 64, 1.3) + '<span>[PHOTO]</span></div>';
  }
  function messageCommande(p) {
    var mode = estCotonou(p) ? ' [disponible à Cotonou]' : (estCommande(p) ? ' [sur commande]' : '');
    return 'Bonjour ' + (S.nom || '') + ', je suis intéressé(e) par : ' + p.nom + (p.marque ? ' (' + p.marque + ')' : '') + mode + '. Est-il disponible ? ' + new URL(lienProduit(p), document.baseURI).href;
  }

  function photoDe(id, icone) {
    var p = PRODUITS.filter(function (x) { return x.id === id; })[0];
    return photo(p ? p.image : '', p ? p.nom : '', icone);
  }
  function carteReal(r) {
    return '<article class="produit">' +
      '<div class="produit-photo">' + photo(r.image, r.titre, 'garantie') + '</div>' +
      '<div class="produit-infos"><span class="produit-marque">Réalisation</span><b class="produit-nom">' + esc(r.titre) + '</b>' +
      (r.texte ? '<span class="produit-resume">' + esc(r.texte) + '</span>' : '') + '</div></article>';
  }
  function blocModifs() {
    var m = MODIFS; if (!m) return '';
    var lignes = (m.options || []).map(function (o, i) {
      var n = nombre(o.prix);
      return '<tr><td style="width:44px;color:var(--texte-2)">' + (i + 1) + '</td><td>' + esc(o.nom) + '</td><td class="modif-prix">' + (n != null ? n.toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ') + ' FCFA' + (nombre(S.tauxDollar) ? '<span class="modif-usd">$ ' + (Math.round(n / nombre(S.tauxDollar) / 5) * 5).toLocaleString('en-US') + '</span>' : '') : esc(o.prix)) + '</td></tr>';
    }).join('');
    return '<section class="fiche modifs">' +
      (lienSur(m.affiche) ? '<div class="fiche-photos"><a href="' + esc(m.affiche) + '" target="_blank" rel="noopener" class="modif-affiche"><img src="' + esc(m.affiche) + '" alt="' + esc(m.titre) + '"></a></div>' : '') +
      '<div class="fiche-infos"><span class="produit-marque">Les modifications</span><h1>' + esc(m.titre) + '</h1>' +
      (m.sousTitre ? '<p>' + esc(m.sousTitre) + '</p>' : '') +
      '<table class="tableau"><thead><tr><th>N°</th><th>Modification</th><th style="text-align:right">Prix</th></tr></thead><tbody>' + lignes + '</tbody></table>' +
      '<div class="fiche-boutons"><a class="btn btn-wa" href="' + esc(wa('Bonjour, je souhaite des modifications pour mon véhicule.')) + '" target="_blank" rel="noopener">' + WA_SVG.replace('width="30" height="30"', 'width="22" height="22"') + ' Demander une modification</a></div>' +
      '<div class="rassurance"><span>Qualité premium</span><span>Installation professionnelle</span><span>Look unique</span></div>' +
      '</div></section>' + (m.videos && m.videos.length ? '<section style="margin-top:24px">' + grilleVideos(m.videos, 'Nos modifications en vidéo') + '</section>' : '');
  }
  function telLien(t) { return 'https://wa.me/' + String(t).replace(/\D/g, ''); }
  function drapeau(code, w) {
    var c = String(code || '').toLowerCase();
    return /^[a-z]{2}$/.test(c) ? '<img class="drapeau" src="https://flagcdn.com/w80/' + c + '.png" alt="" width="' + (w || 32) + '" height="' + Math.round((w || 32) * 0.75) + '" loading="lazy">' : '';
  }
  function listeReps() {
    return '<div class="reps">' + REPS.map(function (r) {
      return '<article class="rep' + (r.siege ? ' rep-siege' : '') + '"><div class="rep-tete"><div><b class="rep-pays">' + drapeau(r.drapeau, 30) + esc(r.pays) + '</b>' + (r.siege ? ' <span class="pastille-mini">Siège</span>' : '') + (r.ville ? '<span class="rep-ville">' + esc(r.ville) + '</span>' : '') + '</div></div>' +
        (r.contacts || []).map(function (c) {
          return '<div class="rep-contact"><span>' + esc(c.nom) + '</span><a class="rep-tel" href="' + esc(telLien(c.tel)) + '" target="_blank" rel="noopener">' + WA_SVG.replace('width="30" height="30"', 'width="16" height="16"') + ' ' + esc(c.tel) + '</a></div>';
        }).join('') + '</article>';
    }).join('') + '</div>';
  }
  function blocPres() {
    return '<section style="margin-bottom:24px"><div class="sec-tete"><h2>Présentation de quelques véhicules chinois</h2></div>' +
      '<p style="margin:-6px 0 16px;color:var(--texte-2)">Les marques chinoises ont fait d’énormes progrès : design, technologie, sécurité et fiabilité, à des prix bien plus accessibles. Voici les principales marques que nous importons.</p>' +
      '<div class="pres">' + PRES.map(function (b) {
        var liste = PRODUITS.filter(function (p) { return p.categorie === 'voitures' && String(p.marque || '').toLowerCase().indexOf(String(b.recherche || b.marque).toLowerCase()) === 0; });
        var avecPhoto = liste.filter(function (p) { return lienSur(p.image); })[0];
        var yt = youtubeId(b.video), ig = instaId(b.video);
        var media = ig ? '<div class="media-insta"><iframe src="https://www.instagram.com/reel/' + ig + '/embed" title="' + esc(b.marque) + '" loading="lazy" allowfullscreen scrolling="no"></iframe></div>' : yt ? '<div class="produit-photo media-video"><iframe src="https://www.youtube-nocookie.com/embed/' + yt + '" title="' + esc(b.marque) + '" loading="lazy" allowfullscreen></iframe></div>' : '<div class="produit-photo">' + photo(avecPhoto ? avecPhoto.image : '', b.marque, 'voiture') + '</div>';
        return '<article class="produit">' + media + '<div class="produit-infos"><b class="produit-nom" style="font-size:20px">' + esc(b.marque) + '</b><span class="produit-resume" style="font-size:14px">' + esc(b.texte) + '</span>' +
          (liste.length ? '<a class="btn btn-contour" style="margin-top:auto" href="categorie.html?q=' + encodeURIComponent(b.recherche || b.marque) + '">Voir les ' + liste.length + ' modèles ' + esc(b.marque) + '</a>' : '') + '</div></article>';
      }).join('') + '</div>' + grilleVideos(PRES_VID, 'Vidéos de présentation') + '</section>';
  }
  function blocReps() {
    if (!REPS.length) return '';
    return '<section class="bloc-blanc" style="margin-bottom:24px"><div class="sec-tete"><h2>Nos représentants</h2><span style="color:var(--texte-2)">' + REPS.length + ' pays</span></div>' +
      '<p style="margin:-6px 0 16px;color:var(--texte-2)">Nous sommes présents en Afrique et en Chine. Cliquez sur un point de la carte pour voir le représentant.</p>' +
      '<div id="carte" class="carte" role="region" aria-label="Carte de nos représentants"></div>' + listeReps() + '</section>';
  }
  function tiktokId(u) { var m = String(u || '').match(/tiktok\.com\/.*\/video\/(\d+)/); return m ? m[1] : ''; }
  function estMp4(u) { return /\.(mp4|webm)(\?|$)/i.test(String(u || '')); }
  function estVertical(u) { return !!(estMp4(u) || tiktokId(u) || instaId(u) || /youtube\.com\/shorts\//.test(String(u || ''))); }
  function embed(u, titre) {
    var t = esc(titre || 'Vidéo THE KEY GROUP'), id;
    // vidéo hébergée sur le site : lecteur simple, sans logo ni lien vers une autre plateforme
    if (estMp4(u)) return '<div class="media-insta"><video class="vid" src="' + esc(u) + '" poster="' + esc(String(u).replace(/\.\w+$/, '.jpg')) + '" preload="none" playsinline muted controls controlsList="nodownload noplaybackrate noremoteplayback" disablePictureInPicture oncontextmenu="return false" aria-label="' + t + '"></video></div>';
    // lecteur TikTok intégré : la vidéo se lit sur le site (pas de renvoi vers TikTok)
    // (le lecteur n'est créé qu'au moment de la lecture : le site reste rapide)
    if ((id = tiktokId(u))) return '<div class="media-insta tt-place" data-tt="' + id + '" data-titre="' + t + '"><button type="button" class="tt-vignette" aria-label="Lire la vidéo"><span class="tt-logo">' + esc(S.nom || '') + '</span><span class="tt-play" aria-hidden="true"></span><span class="tt-txt">Lire la vidéo</span></button></div>';
    if ((id = instaId(u))) return '<div class="media-insta"><iframe src="https://www.instagram.com/reel/' + id + '/embed" title="' + t + '" loading="lazy" allowfullscreen scrolling="no"></iframe></div>';
    if ((id = youtubeId(u))) return '<div class="' + (estVertical(u) ? 'media-insta' : 'video') + '"><iframe src="https://www.youtube-nocookie.com/embed/' + id + '?rel=0" title="' + t + '" loading="lazy" allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';
    return '';
  }
  function ttSrc(id, auto, boucle) { return 'https://www.tiktok.com/player/v1/' + id + '?autoplay=' + (auto ? 1 : 0) + '&muted=1&loop=' + (boucle ? 1 : 0) + '&controls=1&progress_bar=1&play_button=1&volume_control=1&fullscreen_button=1&timestamp=1&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0'; }
  function grilleVideos(liste, titre) {
    var ok = (liste || []).filter(function (u) { return embed(u); });
    if (!ok.length) return '';
    var vert = ok.every(estVertical);
    return (titre ? '<div class="sec-tete" style="margin-top:8px"><h2 style="font-size:22px">' + esc(titre) + '</h2></div>' : '') +
      '<div class="' + (vert ? 'videos-vert' : 'videos') + (ok.some(function (x) { return tiktokId(x) || estMp4(x); }) ? ' videos-suite' : '') + '" style="margin-bottom:24px">' + ok.map(function (u, i) { return '<div class="carte-video">' + embed(u) + ((tiktokId(u) || estMp4(u)) ? '<span class="cv-num">' + (i + 1) + ' / ' + ok.length + '</span>' : '') + '</div>'; }).join('') + '</div>';
  }
  function instaId(u) { var m = String(u || '').match(/instagram\.com\/(?:reel|p|tv)\/([\w-]+)/); return m ? m[1] : ''; }
  function youtubeId(u) { var m = String(u || '').match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/); return m ? m[1] : ''; }
  function blocMedias(liste, type) {
    var titre = type === 'retours' ? 'Avis clients' : 'Déchargements de voitures';
    var intro = type === 'retours' ? 'Nos clients qui ont réceptionné leur véhicule témoignent.' : 'Les véhicules que nous avons déchargés et livrés à nos clients.';
    if (!liste.length) return '<section class="bloc-blanc" style="margin-bottom:24px"><div class="sec-tete"><h2>' + titre + '</h2></div><div class="vide">' + intro + ' Bientôt en ligne.</div></section>';
    return '<section style="margin-bottom:24px"><div class="sec-tete"><h2>' + titre + '</h2></div><p style="margin:-6px 0 16px;color:var(--texte-2)">' + intro + '</p><div class="grille">' + liste.map(function (m) {
      var yt = youtubeId(m.video), ig = instaId(m.instagram || m.video), tk = tiktokId(m.video);
      var media = (tk || ig) ? embed(m.instagram || m.video, m.titre || titre) : ig ? '<div class="media-insta"><iframe src="https://www.instagram.com/reel/' + ig + '/embed" title="Vidéo Instagram" loading="lazy" allowfullscreen scrolling="no"></iframe></div>' : yt ? '<div class="produit-photo media-video"><iframe src="https://www.youtube-nocookie.com/embed/' + yt + '" title="' + esc(m.titre || m.client || titre) + '" loading="lazy" allowfullscreen></iframe></div>' : '<div class="produit-photo">' + photo(m.image, m.titre || m.client || '', 'voiture') + '</div>';
      return '<article class="produit">' + media + '<div class="produit-infos">' +
        (m.vehicule ? '<span class="produit-marque">' + esc(m.vehicule) + '</span>' : '') +
        ((m.titre || m.client) && !ig && !tk ? '<b class="produit-nom">' + esc(m.titre || m.client) + '</b>' : '') + (m.texte ? '<span class="produit-resume" style="white-space:pre-line">' + esc(m.texte) + '</span>' : '') + '</div></article>';
    }).join('') + '</div></section>';
  }
  function brancherCarte() {
    var el = document.getElementById('carte'); if (!el || !REPS.length) return;
    function init() {
      var L = window.L; if (!L) return;
      var map = L.map(el, { scrollWheelZoom: false }).setView([5, 20], 3);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '&copy; OpenStreetMap' }).addTo(map);
      var pts = [];
      REPS.forEach(function (r) {
        if (typeof r.lat !== 'number') return;
        var html = '<b>' + drapeau(r.drapeau, 22) + ' ' + esc(r.pays) + '</b>' + (r.ville ? '<br>' + esc(r.ville) : '') + (r.contacts || []).map(function (c) { return '<br>' + esc(c.nom) + '<br><a href="' + esc(telLien(c.tel)) + '" target="_blank" rel="noopener">' + esc(c.tel) + '</a>'; }).join('');
        L.circleMarker([r.lat, r.lng], { radius: r.siege ? 11 : 8, color: '#0D1F15', weight: 2, fillColor: r.siege ? '#52E08F' : '#1A8048', fillOpacity: 0.95 }).addTo(map).bindPopup(html);
        pts.push([r.lat, r.lng]);
      });
      if (pts.length) map.fitBounds(pts, { padding: [30, 30] });
    }
    if (window.L) return init();
    var css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css'; document.head.appendChild(css);
    var js = document.createElement('script'); js.src = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js'; js.onload = init;
    js.onerror = function () { el.style.height = 'auto'; el.innerHTML = '<div class="vide">La carte n’a pas pu se charger. La liste de nos représentants est ci-dessous.</div>'; };
    document.head.appendChild(js);
  }

  /* ===== 4. ESSAI ROUTIER EN VUE CONDUCTEUR (page Contact) ===== */
  function essaiHtml() {
    var E = S.essai || {}; if (E.actif === false) return '';
    var itin = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((S.nom || '') + ' ' + (S.adresse || 'Kindonou, Cotonou'));
    var video = lienSur(E.video);
    return '<section class="essai" id="essai" aria-label="Essai routier jusqu’à THE KEY GROUP"><div class="essai-scene">' +
      (video ? '<video class="essai-video" src="' + esc(video) + '" muted playsinline preload="auto"></video>' : '<canvas class="essai-3d" aria-hidden="true"></canvas>') +
      '<div class="essai-ciel" aria-hidden="true"></div>' +
      '<svg class="essai-cockpit" viewBox="0 0 1000 300" preserveAspectRatio="xMidYMax slice" aria-hidden="true">' +
        '<defs><linearGradient id="ec-g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1a211d"/><stop offset=".25" stop-color="#0a0e0c"/><stop offset="1" stop-color="#020302"/></linearGradient>' +
        '<linearGradient id="ec-v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b332e"/><stop offset="1" stop-color="#0b0f0d"/></linearGradient></defs>' +
        '<path d="M0 150 C 180 118 330 108 500 108 C 670 108 820 118 1000 150 L1000 300 L0 300 Z" fill="url(#ec-g)"/>' +
        '<path d="M0 150 C 180 118 330 108 500 108 C 670 108 820 118 1000 150" fill="none" stroke="rgba(160,255,200,.18)" stroke-width="1.5"/>' +
        '<g class="ec-volant"><path d="M120 300 C 130 200 220 160 300 160 C 380 160 470 200 480 300" fill="none" stroke="url(#ec-v)" stroke-width="34" stroke-linecap="round"/>' +
        '<path d="M120 300 C 130 200 220 160 300 160 C 380 160 470 200 480 300" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="2" transform="translate(0,-15)"/>' +
        '<circle cx="300" cy="300" r="46" fill="#0d1210"/><text x="300" y="292" text-anchor="middle" font-family="Montserrat,sans-serif" font-weight="900" font-size="15" fill="#52E08F">TKG</text></g>' +
      '</svg>' +
      '<div class="essai-hud" aria-hidden="true"><div class="eh-vitesse"><b class="eh-kmh">0</b><span>km/h</span></div><div class="eh-jauge"><i></i></div>' +
        '<div class="eh-gps"><small>Destination</small><b>' + esc(S.nom || 'THE KEY GROUP') + '</b><span><em class="eh-m">900</em> m · Kindonou</span></div></div>' +
      '<div class="essai-intro"><small>Essai routier</small><h2>Prenez<br><span>le volant</span></h2><p>Faites défiler pour accélérer jusqu’à notre showroom de Kindonou.</p></div>' +
      '<div class="essai-fin"><small>Vous êtes arrivé</small><h2>Bienvenue chez<br><span>' + esc(S.nom || 'THE KEY GROUP') + '</span></h2><p>' + esc(S.adresse || '') + ' · ' + esc(S.telephoneAffiche || '') + '</p>' +
        '<div class="boutons"><a class="btn btn-clair" href="' + esc(wa('Bonjour ' + (S.nom || '') + ', je voudrais venir faire un essai.')) + '" target="_blank" rel="noopener">Réserver un essai sur WhatsApp</a><a class="btn btn-contour-blanc" href="' + esc(itin) + '" target="_blank" rel="noopener">Itinéraire →</a></div></div>' +
    '</div></section>';
  }
  function contactPage() {
    document.title = 'Contact · ' + (S.nom || '');
    var plan = FAQ.filter(function (f) { return /Kindonou/i.test(f.question); })[0];
    return '<section><div class="fil"><a href="index.html">Accueil</a> › Contact</div>' +
      '<div class="sec-tete"><h2>Contactez-nous</h2></div>' +
      '<div class="fiche" style="margin-bottom:24px"><div class="fiche-infos"><span class="produit-marque">Siège au Bénin</span><h1 style="font-size:26px">' + esc(S.adresse || '') + '</h1>' +
      (plan ? '<p style="white-space:pre-line">' + esc(plan.reponse) + '</p>' : '') +
      '<div class="fiche-boutons"><a class="btn btn-wa" href="' + esc(wa('Bonjour ' + (S.nom || '') + ' !')) + '" target="_blank" rel="noopener">' + WA_SVG.replace('width="30" height="30"', 'width="22" height="22"') + ' Écrire sur WhatsApp</a>' + (S.email ? '<a class="btn btn-contour" href="mailto:' + esc(S.email) + '">Écrire un e-mail : ' + esc(S.email) + '</a>' : '') + '</div><div><b style="display:block;margin-bottom:8px">Suivez-nous</b>' + reseauxHtml('reseaux reseaux-clair') + '</div></div></div>' +
      essaiHtml() + blocReps() + '</section>';
  }
  function carteProduit(p) {
    var c = cat(p.categorie) || {};
    return '<article class="produit">' +
      '<a class="produit-photo" href="' + lienProduit(p) + '">' + (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') + photo(p.image, p.nom, p.icone || c.icone) + '</a>' +
      '<div class="produit-infos">' +
      '<span class="produit-marque">' + esc(p.marque || c.nom) + '</span>' +
      '<a class="produit-nom" href="' + lienProduit(p) + '">' + esc(p.nom) + '</a>' +
      (p.resume ? '<span class="produit-resume">' + esc(p.resume) + '</span>' : '') +
      dispoHtml(p) +
      '<span class="prix">' + prixHtml(p) + '</span>' + (p.categorie === 'voitures' && estOccasion(p) && !p.prixFixe ? noteOccasion() : '') +
      '<div class="produit-boutons">' +
      '<a class="btn btn-vert" href="' + esc(wa(messageCommande(p))) + '" target="_blank" rel="noopener">Commander</a>' +
      '<a class="btn btn-contour" href="' + lienProduit(p) + '">Détails</a>' +
      '</div></div></article>';
  }

  /* ---------- En-tête et pied communs ---------- */
  var CARTE_SVG = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2.5"/><path d="M2 10h20M6 15h4"/></svg>';

  /* ===== PAIEMENT PAR CARTE BANCAIRE / MOBILE MONEY (KkiaPay ou FedaPay, sans PayPal) ===== */
  function refDe(p) { return p.gros ? String(p.id).replace(/^tg/, '') : String(p.id).toUpperCase(); }
  function produitParRef(t) { // « p42 », « Réf. P42 », « 186764 »… → le produit
    var m = String(t || '').toLowerCase().match(/[a-z]{0,2}\d{2,}/g) || [];
    for (var i = 0; i < m.length; i++) { var v = m[i]; var p = PRODUITS.filter(function (x) { var id = String(x.id).toLowerCase(); return id === v || id === 'tg' + v; })[0]; if (p) return p; }
    return null;
  }
  function blocProduitPaie(p) {
    if (!p) return '';
    var pc = prixCalcules(p);
    return photo(p.image, p.nom, '🛒') + '<div><small>Vous payez pour · Réf. ' + esc(refDe(p)) + '</small><b>' + esc(p.nom.replace(/ · réf\. .*/, '')) + '</b>' + (pc.fcfa ? '<em>' + pc.fcfa.toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ') + ' FCFA</em>' : '') + (estCommande(p) ? '<span>Véhicule sur commande : indiquez le montant de l’acompte convenu avec nous.</span>' : p.gros ? '<span>Vente en gros : indiquez le montant total (prix × quantité).</span>' : '') + '</div>';
  }
  function paiementPage() {
    var PA = S.paiement || {}, ref = params.get('ref') || '', p = ref ? PRODUITS.filter(function (x) { return x.id === ref; })[0] : null;
    var montant = parseInt(params.get('montant'), 10) || (p && !p.gros && !estCommande(p) && prixCalcules(p).fcfa) || '';
    seo('Paiement par carte bancaire et Mobile Money · ' + (S.nom || ''), 'Payez votre commande ' + (S.nom || '') + ' en ligne par carte Visa, Mastercard ou Mobile Money (MTN, Moov). Paiement sécurisé, confirmation sur WhatsApp.', 'images/logo.png', null, 'paiement.html');
    var pret = !!String(PA.cle || '').trim();
    var CASH_BTN = '<button type="button" class="btn btn-cash" data-mode="cash">💵 Payer en cash (espèces)</button>';
    return '<nav class="fil"><a href="index.html">Accueil</a> › <span>Paiement</span></nav>' +
      '<section class="paie"><div class="paie-carte">' +
      '<div class="paie-tete"><span class="paie-ico">' + CARTE_SVG.replace(/22/g, '30') + '</span><div><h1>Paiement sécurisé</h1><p>Carte bancaire, Mobile Money ou cash</p></div></div>' +
      '<p class="paie-choix">Choisissez votre moyen de paiement :</p>' +
      '<div class="paie-moyens" role="group" aria-label="Moyen de paiement"><button type="button" data-mode="card" data-moyen="carte Visa" class="m-visa">VISA</button><button type="button" data-mode="card" data-moyen="carte Mastercard" class="m-mc"><i></i><i></i>Mastercard</button><button type="button" data-mode="momo" data-moyen="MTN MoMo" class="m-mtn">MTN MoMo</button><button type="button" data-mode="momo" data-moyen="Moov Money" class="m-moov">Moov Money</button><button type="button" data-mode="cash" data-moyen="cash" class="m-cash">💵 Cash</button></div>' +
      '<div class="paie-produit" id="paie-produit"' + (p ? '' : ' hidden') + '>' + blocProduitPaie(p) + '</div>' +
      '<form class="paie-form" id="paie-form" novalidate>' +
      '<label>Montant à payer (FCFA)<input name="montant" type="number" inputmode="numeric" min="100" step="1" required value="' + esc(montant) + '" placeholder="Ex. 250000"></label>' +
      '<label>Référence du produit ou de la commande<input name="ref" maxlength="80" value="' + esc(p ? 'Réf. ' + refDe(p) + ' · ' + p.nom.replace(/ · réf\. .*/, '') : ref) + '" placeholder="Ex. P42, 186764 (réf. sur la fiche produit)"></label>' +
      '<div class="paie-2"><label>Nom complet<input name="nom" autocomplete="name" required placeholder="Votre nom"></label>' +
      '<label>Téléphone<input name="tel" type="tel" autocomplete="tel" required placeholder="+229 …"></label></div>' +
      '<label>E-mail (pour recevoir le reçu de paiement)<input name="email" type="email" autocomplete="email" placeholder="vous@exemple.com"></label>' +
      '<p class="paie-erreur" id="paie-erreur" role="alert"></p>' +
      (pret ? '<div class="paie-boutons"><button type="button" class="btn btn-carte" data-mode="card">' + CARTE_SVG + ' Payer par carte bancaire</button><button type="button" class="btn btn-contour" data-mode="momo">Payer par Mobile Money</button>' + CASH_BTN + '</div>'
        : '<div class="paie-bientot"><b>Paiement en ligne bientôt disponible.</b> En attendant, envoyez-nous votre demande : nous vous transmettons un lien de paiement par carte ou Mobile Money.</div><div class="paie-boutons"><button type="button" class="btn btn-wa" data-mode="wa">' + WA_SVG.replace('width="30" height="30"', 'width="22" height="22"') + ' Demander le lien de paiement</button>' + CASH_BTN + '</div>') +
      '</form>' +
      '<p class="paie-note">🔒 Les données de votre carte sont saisies directement chez notre prestataire de paiement agréé (' + esc(PA.fournisseur === 'fedapay' ? 'FedaPay' : 'KkiaPay') + ') et ne passent jamais par notre site. Paiement cash : au bureau, ' + esc(S.adresse || 'Kindonou, Cotonou') + ', contre reçu. Après paiement, envoyez-nous la preuve sur WhatsApp : nous confirmons votre commande.</p>' +
      (pret && PA.sandbox !== false ? '<p class="paie-test">Mode test activé : aucun vrai débit.</p>' : '') +
      '</div><div class="paie-ok" id="paie-ok" hidden></div></section>';
  }
  /* Vidéos TikTok en enchaînement : la 1re démarre quand la section est visible (sans le son),
     à la fin de chaque vidéo la suivante démarre, puis on recommence. Une seule vidéo joue à la fois. */
  function brancherVideosSuite() {
    // vidéo d'accueil : chargée juste après l'affichage de la page
    var h = document.querySelector('.heros-tiktok iframe[data-src]');
    if (h) { var fait = false, go = function () { if (!fait) { fait = true; h.src = h.getAttribute('data-src'); } };
      if (document.readyState === 'complete') setTimeout(go, 200); else addEventListener('load', function () { setTimeout(go, 200); }); setTimeout(go, 3500); }
    var grilles = document.querySelectorAll('.videos-suite'); if (!grilles.length) return;
    // vidéos du site (mp4) : une seule joue à la fois, la suivante démarre à la fin
    grilles.forEach(function (g) {
      var V = [].slice.call(g.querySelectorAll('video.vid')); if (!V.length) return;
      var i = 0, vu = false;
      function marquer() { V.forEach(function (v, k) { v.closest('.carte-video').classList.toggle('lecture', k === i); }); }
      function jouer(k) {
        i = (k + V.length) % V.length; marquer();
        V.forEach(function (v, j) { if (j !== i && !v.paused) v.pause(); });
        var v = V[i]; if (v.preload === 'none') v.preload = 'auto';
        var p = v.play(); if (p && p.catch) p.catch(function () {});
        if (g.scrollWidth > g.clientWidth + 4) g.scrollTo({ left: v.closest('.carte-video').offsetLeft - (g.clientWidth - v.closest('.carte-video').clientWidth) / 2, behavior: 'smooth' });
      }
      V.forEach(function (v, k) {
        v.addEventListener('ended', function () { if (k === i) jouer(k + 1); });
        v.addEventListener('play', function () { if (k !== i) { i = k; marquer(); V.forEach(function (x, j) { if (j !== k && !x.paused) x.pause(); }); } });
      });
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
        var nv = es[0].isIntersecting; if (nv === vu) return; vu = nv;
        if (vu) jouer(i); else if (!V[i].paused) V[i].pause();
      }, { threshold: 0.35 }).observe(g);
    });
    var tous = [];
    function envoyer(f, type, val) { try { f.contentWindow.postMessage({ type: type, value: val, 'x-tiktok-player': true }, '*'); } catch (e) {} }
    grilles.forEach(function (g) {
      var L = [].slice.call(g.querySelectorAll('.tt-place')).map(function (el) { return { el: el, carte: el.closest('.carte-video'), vignette: el.innerHTML, f: null, fin: false }; });
      if (!L.length) return;
      var G = { L: L, i: 0, vu: false };
      L.forEach(function (o, k) { o.g = G; tous.push(o); o.el.addEventListener('click', function (e) { if (e.target.closest('.tt-vignette')) G.activer(k); }); });
      G.activer = function (k) {
        G.i = (k + L.length) % L.length;
        L.forEach(function (o, j) {
          o.carte.classList.toggle('lecture', j === G.i);
          if (j !== G.i && o.f) { o.el.innerHTML = o.vignette; o.f = null; } // on libère l'ancienne vidéo
        });
        var o = L[G.i]; o.fin = false;
        if (!o.f) { o.el.innerHTML = '<iframe class="tt-lecteur" src="' + ttSrc(o.el.getAttribute('data-tt'), true) + '" title="' + o.el.getAttribute('data-titre') + '" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe>'; o.f = o.el.firstChild; }
        if (g.scrollWidth > g.clientWidth + 4) g.scrollTo({ left: o.carte.offsetLeft - (g.clientWidth - o.carte.clientWidth) / 2, behavior: 'smooth' });
      };
      if ('IntersectionObserver' in window) new IntersectionObserver(function (es) {
        var v = es[0].isIntersecting; if (v === G.vu) return; G.vu = v; var o = L[G.i];
        if (v) { if (!o.f) G.activer(G.i); else { envoyer(o.f, 'play'); } } else if (o.f) envoyer(o.f, 'pause');
      }, { threshold: 0.35 }).observe(g);
    });
    window.addEventListener('message', function (e) {
      var d = e.data; if (typeof d === 'string') { try { d = JSON.parse(d); } catch (er) { return; } }
      if (!d || !d['x-tiktok-player']) return;
      var o = tous.filter(function (x) { return x.f && x.f.contentWindow === e.source; })[0]; if (!o) return;
      var G = o.g, k = G.L.indexOf(o); if (k !== G.i || o.fin) return;
      var fini = (d.type === 'onStateChange' && d.value === 0) || (d.type === 'onCurrentTime' && d.value && d.value.duration > 0 && d.value.currentTime >= d.value.duration - 0.25);
      if (fini) { o.fin = true; if (G.vu) G.activer(k + 1); else { G.i = (k + 1) % G.L.length; } }
    });
  }
  /* photos en planche : l'image n'est téléchargée que quand elle approche de l'écran */
  function brancherPlanches() {
    function charger(s) { s.style.backgroundImage = 'url("' + s.getAttribute('data-bg') + '")'; s.removeAttribute('data-bg'); }
    var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); charger(e.target); } }); }, { rootMargin: '400px 300px' }) : null;
    var attente = false;
    function scanner() { attente = false; document.querySelectorAll('span[data-bg]').forEach(function (s) { if (io) { if (!s.__vu) { s.__vu = 1; io.observe(s); } } else charger(s); }); }
    scanner();
    if ('MutationObserver' in window) new MutationObserver(function () { if (!attente) { attente = true; requestAnimationFrame(scanner); } }).observe(document.body, { childList: true, subtree: true });
  }
  function brancherBureau() {
    var b = document.getElementById('btn-bureau'), p = document.getElementById('bureau'); if (!b || !p) return;
    b.addEventListener('click', function () { var o = p.hidden; p.hidden = !o; b.setAttribute('aria-expanded', o); b.classList.toggle('on', o); });
  }
  function brancherPaiement() {
    var PA = S.paiement || {}, f = document.getElementById('paie-form'); if (!f) return;
    var err = document.getElementById('paie-erreur'), ok = document.getElementById('paie-ok');
    var fed = PA.fournisseur === 'fedapay', src = fed ? 'https://cdn.fedapay.com/checkout.js?v=1.1.7' : 'https://cdn.kkiapay.me/k.js', charge = null;
    function chargerScript() {
      if (!charge) charge = new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = function () { charge = null; rej(); }; document.head.appendChild(s); });
      return charge;
    }
    if (String(PA.cle || '').trim()) chargerScript().catch(function () {});
    function lire() {
      var d = { montant: parseInt(f.montant.value, 10), ref: f.ref.value.trim(), nom: f.nom.value.trim(), tel: f.tel.value.trim(), email: f.email.value.trim() };
      var m = !(d.montant >= 100) ? 'Indiquez le montant à payer (100 FCFA minimum).' : !d.nom ? 'Indiquez votre nom.' : d.tel.replace(/\D/g, '').length < 8 ? 'Indiquez un numéro de téléphone valide.' : d.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email) ? 'L’adresse e-mail semble incorrecte.' : '';
      err.textContent = m; return m ? null : d;
    }
    function fmt(n) { return Number(n).toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' '); }
    var boite = f.parentNode, bp = document.getElementById('paie-produit');
    f.ref.addEventListener('input', function () {
      var p = produitParRef(f.ref.value); bp.hidden = !p; bp.innerHTML = blocProduitPaie(p);
      if (p && !f.montant.value && !estCommande(p) && !p.gros && prixCalcules(p).fcfa) f.montant.value = prixCalcules(p).fcfa;
    });
    function reussi(d, id) {
      boite.hidden = true; ok.hidden = false;
      var date = new Date().toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' });
      ok.innerHTML = '<div class="paie-coche">✓</div><h2>Paiement reçu, merci !</h2><p>' + fmt(d.montant) + ' FCFA' + (d.ref ? ' · ' + esc(d.ref) : '') + '</p>' + (id ? '<p class="paie-id">N° de transaction : <b>' + esc(id) + '</b></p>' : '') +
        '<div class="paie-recu"><b>' + esc(S.nom || '') + '</b> · ' + esc(S.adresse || '') + '<br>Reçu de paiement du ' + esc(date) + '<br>Client : ' + esc(d.nom) + ' · ' + esc(d.tel) + (d.email ? ' · ' + esc(d.email) : '') + '<br>Payé par : ' + esc(d.moyen || '') + '</div>' +
        '<p>Envoyez-nous cette confirmation sur WhatsApp : nous vérifions le paiement et lançons votre commande.' + (d.email ? ' Le reçu du prestataire de paiement vous est aussi envoyé par e-mail.' : '') + '</p>' +
        '<div class="paie-boutons"><button type="button" class="btn btn-contour" onclick="window.print()">Imprimer / enregistrer le reçu (PDF)</button>' +
        '<a class="btn btn-wa" target="_blank" rel="noopener" href="' + esc(wa('Bonjour ' + (S.nom || '') + ', je viens de payer ' + fmt(d.montant) + ' FCFA par ' + (d.moyen || 'carte / Mobile Money') + (d.ref ? ' pour : ' + d.ref : '') + '. N° de transaction : ' + (id || '?') + '. Nom : ' + d.nom + ', tél. : ' + d.tel + '.')) + '">' + WA_SVG.replace('width="30" height="30"', 'width="22" height="22"') + ' Envoyer la preuve sur WhatsApp</a></div>';
      ok.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    boite.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-mode]'); if (!b) return;
      var mode = b.getAttribute('data-mode'), pret = !!String(PA.cle || '').trim();
      boite.querySelectorAll('.paie-moyens button').forEach(function (x) { x.classList.toggle('choisi', x === b); });
      var d = lire();
      if (!d) { var champ = [f.montant, f.nom, f.tel, f.email].filter(function (c) { return c.value.trim() === '' || (c === f.tel && c.value.replace(/\D/g, '').length < 8) || (c === f.montant && !(parseInt(c.value, 10) >= 100)); })[0] || f.email; champ.focus(); champ.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
      d.moyen = b.getAttribute('data-moyen') || (mode === 'card' ? 'carte bancaire' : mode === 'momo' ? 'Mobile Money' : mode === 'cash' ? 'cash' : '');
      if (!pret && (mode === 'card' || mode === 'momo')) mode = 'wa';
      if (mode === 'cash') { window.open(wa('Bonjour ' + (S.nom || '') + ', je voudrais payer ' + fmt(d.montant) + ' FCFA en cash (espèces)' + (d.ref ? ' pour : ' + d.ref : '') + '. Nom : ' + d.nom + ', tél. : ' + d.tel + '. Quand puis-je passer au bureau ?'), '_blank', 'noopener'); return; }
      if (mode === 'wa') { window.open(wa('Bonjour ' + (S.nom || '') + ', je voudrais payer ' + fmt(d.montant) + ' FCFA par ' + (d.moyen && d.moyen !== 'cash' ? d.moyen : 'carte bancaire') + (d.ref ? ' pour : ' + d.ref : '') + '. Nom : ' + d.nom + ', tél. : ' + d.tel + '. Pouvez-vous m’envoyer le lien de paiement ?'), '_blank', 'noopener'); return; }
      b.disabled = true; var t = b.innerHTML; b.textContent = 'Ouverture du paiement…';
      chargerScript().then(function () {
        b.disabled = false; b.innerHTML = t;
        var parts = d.nom.split(/\s+/), desc = (S.nom || 'Commande') + (d.ref ? ' · ' + d.ref : '');
        if (fed) {
          window.FedaPay.init({ public_key: PA.cle, environment: PA.sandbox === false ? 'live' : 'sandbox',
            transaction: { amount: d.montant, description: desc.slice(0, 200) },
            customer: { firstname: parts[0], lastname: parts.slice(1).join(' ') || parts[0], email: d.email || undefined, phone_number: { number: d.tel.replace(/\D/g, '').slice(-8), country: 'bj' } },
            onComplete: function (r) { if (r && r.reason === window.FedaPay.CHECKOUT_COMPLETED) reussi(d, r.transaction && r.transaction.id); } }).open();
        } else {
          if (!brancherPaiement.ecoute) { brancherPaiement.ecoute = true; window.addSuccessListener(function (r) { reussi(brancherPaiement.d, r && (r.transactionId || r.transaction_id)); }); }
          brancherPaiement.d = d;
          window.openKkiapayWidget({ amount: d.montant, key: PA.cle, sandbox: PA.sandbox !== false, position: 'center', theme: '#1A8048',
            name: d.nom, phone: d.tel.replace(/\D/g, ''), email: d.email || undefined, reason: desc.slice(0, 120), data: d.ref, paymentmethod: mode === 'card' ? 'card' : 'momo' });
        }
      }).catch(function () { b.disabled = false; b.innerHTML = t; err.textContent = 'Le service de paiement ne répond pas. Vérifiez votre connexion ou payez via WhatsApp.'; });
    });
  }

  function entete() {
    var opt = function (c) { return '<option value="' + esc(c.id) + '"' + (params.get('c') === c.id ? ' selected' : '') + '>' + esc(c.nom) + '</option>'; };
    var options = '<option value="">Toutes</option>' + (SECTS.length ? SECTS.map(function (s) {
      return '<optgroup label="' + esc(s.nom) + '">' + catsDe(s.id).map(opt).join('') + '</optgroup>';
    }).join('') : CATS_ON.map(opt).join(''));
    var sActif = params.get('s') || ((cat(params.get('c')) || {}).secteur);
    var menu = SECTS.length ? SECTS.map(function (s) {
      return '<a href="' + lienSect(s.id) + '"' + (sActif === s.id && page === 'categorie' ? ' class="actif"' : '') + '>' + esc(s.court || s.nom) + '</a>';
    }).join('') : CATS_ON.map(function (c) {
      return '<a href="' + lienCat(c.id) + '"' + (params.get('c') === c.id ? ' class="actif"' : '') + '>' + esc(c.nom) + '</a>';
    }).join('');
    return '<div class="bandeau"><div class="conteneur"><span>' + esc(S.bandeau) + '</span><span>WhatsApp : <b>' + esc(S.telephoneAffiche) + '</b> · Carte bancaire et Mobile Money</span></div></div>' +
      '<header class="entete"><div class="conteneur entete-haut">' +
      '<a class="logo" href="index.html" aria-label="' + esc(S.nom) + ', accueil"><img src="images/logo.png" alt="' + esc(S.nom) + '"></a>' +
      '<form class="recherche" action="categorie.html" role="search">' +
      '<label class="cache" for="r-cat">Catégorie</label><select id="r-cat" name="c">' + options + '</select>' +
      '<label class="cache" for="r-q">Rechercher</label><input id="r-q" type="search" name="q" value="' + esc(params.get('q') || '') + '" placeholder="Rechercher un véhicule, une machine, un outil…">' +
      '<button type="submit" aria-label="Rechercher">' + svg('recherche', 22, 2.4) + '</button></form>' +
      '<div class="actions"><a class="btn-suivi" href="suivi.html">' + svg('pin', 18, 2.2) + '<span>Suivre mon véhicule</span></a><a href="' + esc(wa('Bonjour ' + (S.nom || '') + ', j\'ai une question.')) + '" target="_blank" rel="noopener" style="color:var(--vert-fonce)">' + svg('bulle', 26, 2) + '<span class="texte">Nous écrire</span></a></div>' +
      '</div><nav class="menu" aria-label="Catégories"><div class="conteneur"><a class="tout" href="categorie.html">☰ Tout le catalogue</a>' + menu + (PRODUITS.some(estOccasion) ? '<a href="' + lienDyn('voitures') + '&d=occasion">Occasions</a>' : '') + (MODIFS ? '<a href="' + lienDyn('voitures') + '&d=modifications">Modifications</a>' : '') + (REAL.length ? '<a href="realisations.html"' + (page === 'realisations' ? ' class="actif"' : '') + '>Nos réalisations</a>' : '') + (FAQ.length ? '<a href="faq.html"' + (page === 'faq' ? ' class="actif"' : '') + '>FAQ</a>' : '') + '<a href="contact.html"' + (page === 'contact' ? ' class="actif"' : '') + '>Contact</a>' + '</div></nav></header>';
  }
  var RS_ICONES = {"Facebook": "<path d=\"M14 8h2.5V4.5H14A4 4 0 0 0 10 8.5V11H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V8.7c0-.4.3-.7.5-.7z\" fill=\"currentColor\"/>", "Instagram": "<rect x=\"3.5\" y=\"3.5\" width=\"17\" height=\"17\" rx=\"5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"12\" cy=\"12\" r=\"4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"/><circle cx=\"17.3\" cy=\"6.7\" r=\"1.2\" fill=\"currentColor\"/>", "TikTok": "<path d=\"M15.5 3c.3 2.2 1.7 3.8 4 4v3.2c-1.5 0-2.8-.4-4-1.2v6.3A5.6 5.6 0 1 1 10 9.7v3.3a2.4 2.4 0 1 0 2.2 2.4V3h3.3z\" fill=\"currentColor\"/>"};
  function reseauxHtml(cls) {
    var rs = [['Facebook', S.facebook], ['Instagram', S.instagram], ['TikTok', S.tiktok]].filter(function (r) { return lienSur(r[1]); });
    return rs.length ? '<div class="' + (cls || 'reseaux') + '">' + rs.map(function (r) { return '<a href="' + esc(r[1]) + '" target="_blank" rel="noopener" aria-label="' + r[0] + ' THE KEY GROUP" title="' + r[0] + '"><svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">' + RS_ICONES[r[0]] + '</svg></a>'; }).join('') + '</div>' : '';
  }
  function pied() {
    return '<footer class="pied"><div class="conteneur">' +
      '<div class="pied-marque"><span class="titre">' + esc(S.nom) + '</span><span>' + esc(S.slogan) + '</span><span>' + esc(S.adresse) + '</span><span>' + esc(S.telephoneAffiche) + ' · <a href="mailto:' + esc(S.email) + '">' + esc(S.email) + '</a></span>' + reseauxHtml() + '</div>' +
      '<div class="pied-col"><b>Nos secteurs</b>' + (SECTS.length ? SECTS.map(function (s) { return '<a href="' + lienSect(s.id) + '">' + esc(s.nom) + '</a>'; }) : CATS_ON.slice(0, 7).map(function (c) { return '<a href="' + lienCat(c.id) + '">' + esc(c.nom) + '</a>'; })).join('') + '</div>' +
      '<div class="pied-col"><b>Aide</b><a href="contact.html">Contact et représentants</a>' + (FAQ.length ? '<a href="faq.html">Questions fréquentes</a>' : '') + '<a href="' + esc(wa('Bonjour, je voudrais un devis.')) + '" target="_blank" rel="noopener">Demander un devis</a><a href="' + esc(wa('Bonjour, quels sont vos délais de livraison ?')) + '" target="_blank" rel="noopener">Livraison</a><a href="paiement.html">Payer par carte bancaire</a>' +
      '</div>' +
      '</div><div class="pied-bas">© ' + new Date().getFullYear() + ' ' + esc(S.nom) + '. Tous droits réservés.' + (S.credits3d ? '<br><small style="opacity:.7">' + esc(S.credits3d) + '</small>' : '') + '</div></footer>' +
      '<a class="wa-flottant" href="' + esc(wa('Bonjour ' + (S.nom || '') + ' !')) + '" target="_blank" rel="noopener" aria-label="Écrire sur WhatsApp">' + WA_SVG + '</a>';
  }

  /* ===== 1. SHOWROOM « MONTE À BORD » (accueil) ===== */
  function salonHtml() {
    var SL = S.salon || {}; if (SL.actif === false) return '';
    function prixDe(id) { var p = PRODUITS.filter(function (x) { return x.id === id; })[0]; if (!p) return ''; var c = prixCalcules(p); return c.fcfa ? 'À partir de ' + c.fcfa.toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ') + ' FCFA' : ''; }
    var actes = SL.actes || [
      { cat: 'Voitures', lien: lienCat('voitures'), img: 'images/show/p42.webp', ratio: 1.9, nom: 'Jetour T2 4x4', prix: prixDe('p42'),
        puces: ['SUV 4x4', '2.0 TD', 'Neuf · 0 km'], points: [[10, 44, 'Phares LED'], [53, 80, 'Jantes tout-terrain'], [66, 6, 'Barres de toit'], [82, 46, 'Transmission 4x4']] },
      { cat: 'Camions', lien: lienCat('camions'), img: 'images/show/p6.webp', ratio: 1.216, nom: 'Sinotruk HOWO benne', prix: prixDe('p6'),
        puces: ['10 roues · 6x4', 'Moteur 371 ch', 'Neuf ou occasion'], points: [[58, 28, 'Cabine HOWO'], [22, 22, 'Benne basculante'], [37, 84, '10 roues · 6x4'], [77, 62, 'Pare-chocs renforcé']] },
      { cat: 'Engins', lien: lienCat('machines'), img: 'images/show/p59.webp', ratio: 1.362, nom: (S.salon && S.salon.modeles3d ? 'Chargeuse sur pneus' : 'Niveleuse CAT 140G'), prix: prixDe(S.salon && S.salon.modeles3d ? 'p23' : 'p59'),
        puces: (S.salon && S.salon.modeles3d ? ['Engin de chantier', 'Godet grande capacité', 'Prix FOB Chine'] : ['Engin de chantier', 'Moteur 185 ch', 'Prix FOB Chine']), points: [[63, 14, 'Cabine vitrée'], [12, 74, 'Grande roue avant'], [44, 52, 'Lame de nivellement'], [87, 64, 'Tandem arrière']] }
    ];
    var interieur = lienSur(SL.interieur) || 'images/catalogue/p20.jpg';
    return '<section class="salon" id="salon" aria-label="Showroom THE KEY GROUP">' +
      '<div class="salon-scene">' +
        '<div class="salon-fond" aria-hidden="true"><span class="halo h1"></span><span class="halo h2"></span><span class="brume"></span></div>' +
        '<div class="salon-faisceaux" aria-hidden="true"><span></span><span></span><span></span></div>' +
        '<div class="salon-sol" aria-hidden="true"></div>' +
        '<div class="salon-plateau" aria-hidden="true"><span class="anneau"></span><span class="ombre"></span></div>' +
        '<div class="salon-intro"><small>THE KEY GROUP</small><h2>Bienvenue dans<br><span>notre showroom</span></h2></div>' +
        actes.map(function (a, i) {
          return '<div class="salon-acte" data-acte="' + i + '">' +
            '<div class="salon-geant" aria-hidden="true">' + esc(a.cat) + '</div>' +
            '<div class="salon-v" style="--r:' + a.ratio + '"><div class="salon-v-in">' +
              '<img class="sv-img" src="' + esc(a.img) + '" alt="' + esc(a.nom) + '" loading="lazy">' +
              '<span class="sv-eclat" style="-webkit-mask-image:url(' + esc(a.img) + ');mask-image:url(' + esc(a.img) + ')"></span>' +
              (a.points || []).map(function (pt, k) { return '<span class="sv-point" style="left:' + pt[0] + '%;top:' + pt[1] + '%;--k:' + k + '"><i></i><b>' + esc(pt[2]) + '</b></span>'; }).join('') +
            '</div><img class="sv-reflet" src="' + esc(a.img) + '" alt="" aria-hidden="true" loading="lazy"></div>' +
            '<div class="salon-info"><small>0' + (i + 1) + ' · ' + esc(a.cat) + '</small><h3>' + esc(a.nom) + '</h3>' +
              '<div class="salon-puces">' + (a.puces || []).map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('') + '</div>' +
              (a.prix ? '<p class="salon-prix">' + esc(a.prix) + '</p>' : '') +
              '<a class="btn btn-clair" href="' + esc(a.lien) + '">Voir les ' + esc(a.cat.toLowerCase()) + ' →</a></div>' +
          '</div>';
        }).join('') +
        '<div class="salon-bord" aria-label="Vue de l’intérieur">' +
          '<div class="bord-img" style="background-image:url(' + esc(interieur) + ')"></div><span class="bord-vignette" aria-hidden="true"></span>' +
          '<div class="bord-hud"><small>Vous êtes à bord</small><h3>Installez-vous.</h3><p>Sellerie cuir, écrans, finitions sur mesure : venez essayer nos véhicules à Kindonou ou commandez le vôtre depuis la Chine.</p>' +
            '<div class="boutons"><a class="btn btn-clair" href="' + lienCat('voitures') + '">Choisir mon véhicule →</a><a class="btn btn-contour-blanc" href="' + esc(wa('Bonjour ' + (S.nom || '') + ', je voudrais venir voir un véhicule.')) + '" target="_blank" rel="noopener">Prendre rendez-vous</a></div></div>' +
          '<span class="bord-glisser" aria-hidden="true">⟵ Glissez pour regarder autour ⟶</span>' +
        '</div>' +
        '<div class="salon-noir" aria-hidden="true"></div>' +
        '<nav class="salon-etapes" aria-hidden="true">' + actes.map(function (a, i) { return '<span data-e="' + i + '"><b>0' + (i + 1) + '</b>' + esc(a.cat) + '</span>'; }).join('') + '<span data-e="' + actes.length + '"><b>0' + (actes.length + 1) + '</b>À bord</span></nav>' +
        '<div class="salon-indice" aria-hidden="true">Faites défiler pour allumer le showroom <span>↓</span></div>' +
      '</div></section>';
  }

  /* Scène animée au défilement : croquis → photo → gamme → appel à l'action */
  function showHtml() {
    var SH = S.show || {}; if (SH.actif === false) return '';
    var vedette = PRODUITS.filter(function (x) { return x.id === (SH.vedette || 'p42'); })[0];
    var c = vedette ? prixCalcules(vedette) : {};
    var prix = c.fcfa ? c.fcfa.toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ') + ' FCFA' : '';
    var nom = SH.nom || (vedette ? vedette.nom : 'Jetour T2');
    var bande = (SH.bande || [nom, '2.0 TD · 4x4', '0 km', 'Import direct de Chine', 'Livré au Bénin', prix ? 'À partir de ' + prix : '']).filter(Boolean);
    var ligne = bande.map(function (t) { return '<span>' + esc(t) + '</span>'; }).join('<i>●</i>');
    var flotte = (SH.flotte || [['p14', 'Changan CS55 Plus'], ['w148', 'Jetour G700'], ['w143', 'Xiaomi YU7'], ['w146', 'BAW 212'], ['p34', 'BYD Sealion 05'], ['w73', 'Changan Q07']]);
    return '<section class="show" id="show" aria-label="Présentation animée de nos véhicules">' +
      '<div class="show-scene">' +
      '<div class="show-grille" aria-hidden="true"></div>' +
      '<div class="show-legendes">' +
        '<div class="show-leg" data-leg="1"><small>Étape 1</small><h2>Tout commence par<br><span>un croquis…</span></h2></div>' +
        '<div class="show-leg" data-leg="2"><small>Étape 2</small><h2>Puis il prend vie :<br><span>' + esc(nom) + '</span></h2></div>' +
        '<div class="show-leg" data-leg="3"><small>Étape 3</small><h2>Et toute une gamme<br><span>vous attend</span></h2></div>' +
      '</div>' +
      '<div class="show-voiture"><img class="show-croquis" src="images/show/p42-croquis.webp" alt="" aria-hidden="true">' +
        '<img class="show-photo" src="images/show/' + esc(SH.vedette || 'p42') + '.webp" alt="' + esc(nom) + '">' +
        '<span class="show-crayon" aria-hidden="true"><svg viewBox="0 0 24 24" width="34" height="34"><path d="M3 21l3.5-1 11-11-2.5-2.5-11 11L3 21z" fill="#2DB56A" stroke="#0D1F15" stroke-width="1.4" stroke-linejoin="round"/><path d="M14.5 5.5l2.5 2.5 2-2a1.8 1.8 0 0 0-2.5-2.5z" fill="#FFB4B4" stroke="#0D1F15" stroke-width="1.4"/></svg></span></div>' +
      '<div class="show-flotte">' + flotte.map(function (f, i) {
        return '<figure class="show-v" style="--k:' + i + '"><img src="images/show/' + esc(f[0]) + '.webp" alt="' + esc(f[1]) + '" loading="lazy"><figcaption>' + esc(f[1]) + '</figcaption></figure>';
      }).join('') + '</div>' +
      '<div class="show-bande" aria-hidden="true"><div class="show-defile">' + ligne + '<i>●</i>' + ligne + '<i>●</i>' + ligne + '</div></div>' +
      '<div class="show-split"><div class="show-panneau"><small>THE KEY GROUP</small><h2>Votre véhicule chinois, livré chez vous</h2><p>SUV, pick-up, électriques et hybrides : choisissez, on s’occupe de l’import, du transport et de la douane.</p>' +
        '<div class="boutons"><a class="btn btn-blanc" href="' + lienCat('voitures') + '">Voir les véhicules →</a><a class="btn btn-contour-blanc" href="' + esc(wa('Bonjour ' + (S.nom || '') + ', je voudrais un devis.')) + '" target="_blank" rel="noopener">Demander un devis</a></div></div></div>' +
      '<div class="show-indice" aria-hidden="true">Faites défiler <span>↓</span></div>' +
      '<div class="show-prog" aria-hidden="true"><span></span></div>' +
      '</div></section>';
  }

  /* Photos qui défilent derrière le texte d'accueil (téléphone uniquement) */
  function diapoMobile() {
    var imgs = (S.diaporamaMobile && S.diaporamaMobile.length ? S.diaporamaMobile : ['w148', 'p42', 'w143', 'p33', 'w146', 'w135'].map(function (id) {
      var p = PRODUITS.filter(function (x) { return x.id === id; })[0]; return p ? p.image : '';
    })).filter(lienSur).slice(0, 8);
    if (!imgs.length) return '';
    var n = imgs.length, p = 100 / n, f = function (x) { return x.toFixed(2) + '%'; };
    var kf = '<style>@keyframes diapoFondu{0%{opacity:0}' + f(p * .15) + '{opacity:1}' + f(p) + '{opacity:1}' + f(p * 1.25) + '{opacity:0}100%{opacity:0}}' +
      '@keyframes diapoZoom{0%{transform:scale(1) translate(0,0)}' + f(p * 1.25) + '{transform:scale(1.12) translate(-2%,-1%)}100%{transform:scale(1.12) translate(-2%,-1%)}}' +
      '@keyframes diapoPoint{0%{width:6px;background:rgba(255,255,255,.35)}' + f(p * .15) + ',' + f(p) + '{width:18px;background:#52E08F}' + f(p * 1.25) + ',100%{width:6px;background:rgba(255,255,255,.35)}}</style>';
    return kf + '<div class="heros-diapo" aria-hidden="true" style="--n:' + n + ';--duree:' + (n * 5) + 's">' + imgs.map(function (u, i) {
      return '<span class="diapo" style="--i:' + i + ';background-image:url(' + esc(u) + ')"></span>';
    }).join('') + '<span class="diapo-voile"></span><span class="diapo-points">' + imgs.map(function (u, i) { return '<i style="--i:' + i + '"></i>'; }).join('') + '</span></div>';
  }

  /* ---------- Vidéo de l'accueil (TikTok vertical ou YouTube) ---------- */
  function videoAccueil() {
    var u = S.videoAccueil || '', id;
    if (estMp4(u)) return '<div class="heros-image heros-video heros-tiktok"><span class="ht-fond" aria-hidden="true"></span><video class="vid-heros" src="' + esc(u) + '" poster="' + esc(u.replace(/\.\w+$/, '.jpg')) + '" autoplay muted loop playsinline preload="auto" controls controlsList="nodownload noplaybackrate noremoteplayback" disablePictureInPicture oncontextmenu="return false" aria-label="Vidéo THE KEY GROUP"></video></div>';
    if (!u) return '';
    if ((id = tiktokId(u))) return '<div class="heros-image heros-video heros-tiktok"><span class="ht-fond" aria-hidden="true"></span><iframe data-src="https://www.tiktok.com/player/v1/' + id + '?autoplay=1&muted=1&loop=1&controls=1&progress_bar=1&play_button=1&volume_control=1&fullscreen_button=1&music_info=0&description=0&rel=0&native_context_menu=0&closed_caption=0" title="Vidéo THE KEY GROUP" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div>';
    id = youtubeId(u);
    return '<div class="heros-image heros-video"><iframe src="https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&mute=1&playsinline=1" title="Vidéo THE KEY GROUP" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div>';
  }

  /* ---------- Secteurs ---------- */
  function cartesSecteurs(defile) {
    var html = SECTS.map(function (s, i) {
      var n = nbSect(s.id), cs = catsDe(s.id);
      return '<div class="secteur"><a class="secteur-tete" href="' + lienSect(s.id) + '"><span class="secteur-num">0' + (i + 1) + '</span><span class="rond">' + svg(s.icone, 30, 1.7) + '</span>' +
        '<b>' + esc(s.nom) + '</b><span class="secteur-info">' + (n ? n + ' produit' + (n > 1 ? 's' : '') + ' en ligne' : 'Sur commande') + '</span></a>' +
        '<div class="secteur-cats">' + cs.map(function (c) { return '<a href="' + lienCat(c.id) + '">' + esc(c.nom) + '</a>'; }).join('') + '</div></div>';
    }).join('');
    // accueil : bande qui défile en continu (contenu doublé pour une boucle sans à-coup)
    return defile ? '<div class="defile defile-secteurs"><div class="defile-piste">' + html + html + '</div></div>' : '<div class="secteurs">' + html + '</div>';
  }
  function cartesCats(cs) {
    return '<div class="cats-secteur">' + cs.map(function (c) {
      var n = nbCat(c.id);
      return '<a class="cat-s" href="' + lienCat(c.id) + '"><span class="rond">' + svg(c.icone, 28, 1.7) + '</span><span><b>' + esc(c.nom) + '</b><small>' + esc(c.info || '') + '</small></span><em' + (n ? '' : ' class="sur-cmd"') + '>' + (n ? n + ' produit' + (n > 1 ? 's' : '') : 'Sur commande') + '</em></a>';
    }).join('') + '</div>';
  }

  /* ---------- Accueil ---------- */
  function accueil() {
    seo((S.nom || 'THE KEY GROUP') + ' · Voitures chinoises, camions, engins et vente en gros à Cotonou (Bénin)',
      'THE KEY GROUP, Kindonou Cotonou : voitures chinoises neuves et d’occasion, camions, engins, et vente en gros (sacs, chaussures, bijoux) importés de Chine.',
      'images/logo.png', entreprise(), '');
    var vehCats = CATS_ON.filter(function (c) { return c.vehicule; });
    var catsCartes = CATS_ON.map(function (c) {
      return '<a class="carte-cat" href="' + lienCat(c.id) + '"><span class="rond">' + svg(c.icone, 38, 1.7) + '</span><b>' + esc(c.nom) + '</b><span>' + esc(c.info) + '</span></a>';
    }).join('');
    var marques = MARQUES.map(function (m) {
      var nom = (typeof m === 'object' && m) ? m.nom : m, lien = 'categorie.html?q=' + encodeURIComponent(String(nom).split(' ')[0]);
      if (typeof m === 'object' && m) return '<a class="marque" href="' + lien + '">' + (lienSur(m.logo) ? '<img src="' + esc(m.logo) + '" alt="' + esc(m.nom) + '">' : esc(m.nom)) + '</a>';
      return '<a class="marque" href="' + lien + '">' + esc(m) + '</a>';
    }).join('');
    var onglets = vehCats.map(function (c) {
        var nom = c.id === 'voitures' ? 'Voitures sur commande' : c.nom;
        var b = '<button type="button" class="onglet" role="tab" aria-selected="false" data-cat="' + esc(c.id) + '">' + esc(nom) + '</button>';
        if (c.id === 'voitures') b += '<button type="button" class="onglet onglet-cotonou" role="tab" aria-selected="false" data-cat="voitures-cotonou">✓ Dispo à Cotonou</button>' + (PRODUITS.some(estOccasion) ? '<button type="button" class="onglet" role="tab" aria-selected="false" data-cat="voitures-occasion">Occasions</button>' : '');
        return b;
      }).join('');
    var autres = PRODUITS.filter(function (p) { return p.categorie === 'machines' || p.categorie === 'groupes-electrogenes'; });
    var gros = PRODUITS.filter(function (p) { return p.gros; }).slice(0, 10);
    autres.sort(function (a, b) { return (b.vedette ? 1 : 0) - (a.vedette ? 1 : 0); });
    var heroImg = lienSur(S.imageAccueil);

    return '<section class="heros">' +
      '<div class="heros-principal"><div class="heros-texte">' + diapoMobile() +
      '<span class="pastille">Nouvel arrivage de Chine</span>' +
      '<h1>Véhicules &amp; machines<br><span>au meilleur prix.</span></h1>' +
      '<p>Voitures neuves et d’occasion, camions, bus et engins importés directement de Chine, livrés chez vous.</p>' +
      '<div class="boutons"><a class="btn btn-clair" href="categorie.html">Voir le catalogue</a><a class="btn btn-contour-vif" href="' + esc(wa('Bonjour, je voudrais un devis.')) + '" target="_blank" rel="noopener">Demander un devis</a>' +
        '<button type="button" class="btn btn-bureau" id="btn-bureau" aria-expanded="false" aria-controls="bureau">' + svg('pin', 20, 2.2) + ' Je veux passer au bureau</button></div>' +
      '<div class="bureau" id="bureau" hidden><b>Notre bureau</b><span>' + esc(S.adresse || 'Kindonou, Cotonou (Bénin)') + '</span><small>Paiement par carte, Mobile Money ou cash sur place.</small>' +
        '<div class="bureau-boutons"><a class="btn btn-wa" href="' + esc(wa('Bonjour ' + (S.nom || '') + ', je veux passer au bureau à ' + (S.adresse || 'Kindonou') + '. Quand puis-je venir ?')) + '" target="_blank" rel="noopener">' + WA_SVG.replace('width="30" height="30"', 'width="20" height="20"') + ' Prévenir de ma visite</a>' +
        '<a class="btn btn-contour-vif" href="https://www.google.com/maps/search/?api=1&amp;query=' + encodeURIComponent(S.adresse || 'Kindonou, Cotonou, Bénin') + '" target="_blank" rel="noopener">Itinéraire</a></div></div>' +
      '</div>' + videoAccueil() + '</div>' +
      '<div class="heros-cotes">' +
      '<a class="tuile tuile-vert" href="' + lienDyn('voitures') + '&d=commande"><small>Voitures sur commande</small><b>Livrées en 2 mois depuis la Chine</b><span>Voir les voitures →</span></a>' +
      '<a class="tuile tuile-pale" href="' + lienDyn('voitures') + '&d=cotonou"><small>Disponibles à Cotonou</small><b>Repartez avec votre véhicule aujourd’hui</b><span>Voir le stock →</span></a>' +
      '</div></section>' +

      '<div class="route-secteurs" id="route-secteurs" aria-hidden="true"><span class="rs-texte">Embarquez : découvrez nos ' + (SECTS.length || '') + ' secteurs</span><a class="rs-panneau" href="#secteurs" tabindex="-1"><b>Nos secteurs</b><span>↓</span></a></div>' +
      (SECTS.length ? '<section id="secteurs" class="sec-secteurs"><div class="sec-tete"><h2>Nos ' + SECTS.length + ' secteurs</h2><a class="lien-vert" href="categorie.html">Tout le catalogue →</a></div>' + cartesSecteurs(true) + '</section>' :
      '<section><div class="sec-tete"><h2>Nos catégories</h2><a class="lien-vert" href="categorie.html">Tout voir →</a></div>' +
      '<div class="defile"><div class="defile-piste">' + (CATS_ON.length < 6 ? catsCartes + catsCartes : catsCartes) + (CATS_ON.length < 6 ? catsCartes + catsCartes : catsCartes) + '</div></div></section>') +
      showHtml() +
      ((S.videos || []).length ? '<section class="sec-videos"><div class="sec-tete"><h2>Nos vidéos</h2></div>' + grilleVideos(S.videos) + '</section>' : '') +


      '<section class="bloc-blanc"><div class="sec-tete"><h2>Véhicules</h2><div class="onglets" role="tablist">' + onglets + '</div></div>' +
      '<div class="marques"><span class="marques-titre">Nos marques chinoises</span><div class="defile"><div class="defile-piste defile-rapide">' + marques + marques + '</div></div></div>' +
      '<div class="grille" id="grille-vehicules"></div>' +
      '<div style="text-align:center;margin-top:22px"><a class="btn btn-contour" id="voir-cat" href="#">Voir tous</a></div></section>' +

      '<section class="bannieres">' +
      '<a class="banniere ban-fonce" href="' + lienCat('machines') + '"><div class="banniere-texte"><small>Engins lourds</small><b>Chargeuses, bulldozers, pelles, niveleuses</b><span>Voir les engins →</span></div>' + photoDe('p23', 'machine') + '</a>' +
      (MODIFS ? '<a class="banniere ban-vif" href="' + lienDyn('voitures') + '&d=modifications"><div class="banniere-texte"><small>Les modifications</small><b>' + esc(MODIFS.sousTitre || 'Personnalisez votre véhicule') + '</b><span>Voir les options →</span></div>' + photoDe('p42', 'outil') + '</a>' : '') +
      '</section>' +

      '<section><div class="sec-tete"><h2>Engins &amp; groupes électrogènes</h2><a class="lien-vert" href="' + lienCat('machines') + '">Tout voir →</a></div>' +
      '<div class="grille grille-petite">' + autres.slice(0, 8).map(carteProduit).join('') + '</div></section>' +
      (gros.length ? '<section><div class="sec-tete"><h2>Vente en gros · nouveautés</h2><a class="lien-vert" href="' + lienSect('commerce') + '">Tout voir →</a></div>' +
      '<p style="margin:-6px 0 14px;color:var(--texte-2)">Mode, maison, beauté et jouets importés de Chine, prix de gros à l’unité.</p>' +
      '<div class="grille grille-petite">' + gros.map(carteProduit).join('') + '</div></section>' : '') +

      (cat('evenementiel') && PRODUITS.some(function (p) { return p.categorie === 'evenementiel'; }) ?
        '<section><div class="sec-tete"><h2>Événementiel</h2><a class="lien-vert" href="' + lienCat('evenementiel') + '">Tout voir →</a></div>' +
        '<p style="margin:-8px 0 18px;color:var(--texte-2)">Tables et chaises pour enfants et adultes : mariages, anniversaires, cérémonies, conférences.</p>' +
        '<div class="grille grille-petite">' + PRODUITS.filter(function (p) { return p.categorie === 'evenementiel'; }).slice(0, 4).map(carteProduit).join('') + '</div></section>' : '') +
      (REAL.length ? '<section><div class="sec-tete"><h2>Nos réalisations</h2><a class="lien-vert" href="realisations.html">Tout voir →</a></div><div class="grille grille-petite">' + REAL.slice(0, 4).map(carteReal).join('') + '</div></section>' : '') +
      '<section class="cta"><h2>Prêt à importer votre véhicule ?</h2><p>Obtenez un devis détaillé en FCFA sous 24 h, avec le délai de livraison estimé jusqu’au port de votre pays.</p>' +
      '<div class="boutons" style="justify-content:center"><a class="btn btn-blanc" href="' + lienCat('voitures') + '">Choisir votre véhicule →</a><a class="btn btn-contour-blanc" href="' + esc(wa('Bonjour ' + (S.nom || '') + ', je voudrais un devis pour un véhicule.')) + '" target="_blank" rel="noopener">Demander un devis →</a></div></section>' +
      '<section class="atouts">' +
      [['tel', 'Carte, Mobile Money ou cash', 'Visa, Mastercard, MTN, Moov, espèces'], ['livraison', 'Livraison rapide', 'Bénin et sous-région'], ['garantie', 'Garantie', 'Véhicules et machines'], ['bulle', 'Conseil WhatsApp', 'Réponse rapide']]
        .map(function (a) { return '<div class="atout"><i>' + svg(a[0], 24, 2) + '</i><div><b>' + a[1] + '</b><span>' + a[2] + '</span></div></div>'; }).join('') +
      '</section>';
  }
  function brancherOnglets() {
    var grille = document.getElementById('grille-vehicules'), voir = document.getElementById('voir-cat');
    var boutons = document.querySelectorAll('.onglet');
    function montrer(id) {
      var liste = PRODUITS.filter(function (p) {
        if (id === 'voitures-cotonou') return estCotonou(p);
        if (id === 'voitures-occasion') return estOccasion(p);
        if (id === 'voitures') return estCommande(p);
        return p.categorie === id;
      });
      liste.sort(function (a, b) { return (b.vedette ? 1 : 0) - (a.vedette ? 1 : 0); });
      grille.innerHTML = liste.length ? liste.slice(0, 6).map(carteProduit).join('') : (id === 'voitures-cotonou' ? '<div class="vide">Stock à Cotonou en cours de mise à jour. <a class="lien-vert" href="' + esc(wa('Bonjour, quelles voitures sont disponibles immédiatement à Cotonou ?')) + '" target="_blank" rel="noopener">Demandez-nous les véhicules disponibles sur WhatsApp</a>.</div>' : '<div class="vide">Produits bientôt disponibles.</div>');
      if (id === 'voitures-cotonou') { voir.href = lienDyn('voitures') + '&d=cotonou'; voir.textContent = 'Voir toutes les voitures disponibles à Cotonou'; }
      else if (id === 'voitures-occasion') { voir.href = lienDyn('voitures') + '&d=occasion'; voir.textContent = 'Voir toutes les occasions'; }
      else if (id === 'voitures') { voir.href = lienDyn('voitures') + '&d=commande'; voir.textContent = 'Voir toutes les voitures sur commande'; }
      else { voir.href = lienCat(id); voir.textContent = 'Voir tous : ' + ((cat(id) || {}).nom || ''); }
      boutons.forEach(function (b) { b.setAttribute('aria-selected', String(b.getAttribute('data-cat') === id)); });
    }
    boutons.forEach(function (b) { b.addEventListener('click', function () { montrer(b.getAttribute('data-cat')); }); });
    if (boutons[0]) montrer(boutons[0].getAttribute('data-cat'));
  }

  /* ---------- Catégorie / recherche ---------- */

  /* ===== 3. CONFIGURATEUR 360° (page Voitures) ===== */
  function configHtml() {
    var C = S.configurateur || {}; if (C.actif === false) return '';
    var modeles = (C.modeles || []).map(function (m) { var p = PRODUITS.filter(function (x) { return x.id === m.id; })[0]; return p ? { m: m, p: p } : null; }).filter(Boolean);
    if (!modeles.length) return '';
    var couleurs = C.couleurs || [];
    window.__config = { modeles: modeles.map(function (o) { var c = prixCalcules(o.p); return { id: o.p.id, nom: o.p.nom, image: o.m.image, masque: o.m.masque || '', vues: o.m.vues360 || [], fcfa: c.fcfa, usd: c.usd, lien: 'produit.html?id=' + encodeURIComponent(o.p.id) }; }), couleurs: couleurs, wa: S.whatsapp || '' };
    return '<section class="config" id="config" aria-label="Configurateur">' +
      '<div class="config-tete"><div><small>Configurateur</small><h2>Choisissez votre couleur</h2></div>' +
        '<div class="config-modeles" role="tablist">' + modeles.map(function (o, i) { return '<button type="button" role="tab" class="cm' + (i ? '' : ' on') + '" data-i="' + i + '">' + esc(o.p.nom.replace(/ (2025|2026|électrique.*|3e génération.*)$/i, '')) + '</button>'; }).join('') + '</div></div>' +
      '<div class="config-studio">' +
        '<div class="cs-mur" aria-hidden="true"></div><div class="cs-sol" aria-hidden="true"></div>' +
        '<div class="cs-scene"><div class="cs-voiture"><canvas class="cs-a"></canvas><canvas class="cs-b"></canvas><span class="cs-spray" aria-hidden="true"></span></div><canvas class="cs-reflet" aria-hidden="true"></canvas><span class="cs-ombre" aria-hidden="true"></span></div>' +
        '<div class="cs-glisser" aria-hidden="true"><span>⟵</span> Glissez pour tourner <span>⟶</span></div>' +
        '<div class="cs-nom"><b class="cs-modele"></b><span class="cs-couleur"></span></div>' +
      '</div>' +
      '<div class="config-bas"><div class="config-teintes" role="radiogroup" aria-label="Couleur">' + couleurs.map(function (c, i) {
          return '<button type="button" role="radio" aria-checked="' + (i ? 'false' : 'true') + '" class="ct' + (i ? '' : ' on') + '" data-i="' + i + '" title="' + esc(c[0]) + '"><i style="background:' + esc(c[1] || '#F4F5F2') + '"></i><span>' + esc(c[0]) + '</span></button>';
        }).join('') + '</div>' +
        '<div class="config-action"><div class="cs-prix"></div><a class="btn btn-vert cs-commander" target="_blank" rel="noopener">Commander cette couleur</a><a class="lien-vert cs-fiche">Voir la fiche →</a></div></div>' +
      '<p class="config-note">Couleurs proposées selon disponibilité du constructeur : nous confirmons avec vous sur WhatsApp avant la commande. Aperçu de couleur indicatif.</p>' +
    '</section>';
  }
  function categorie() {
    var c = cat(params.get('c')), q = (params.get('q') || '').trim().toLowerCase(), d = params.get('d');
    var sp = !c ? secteur(params.get('s')) : null, s = sp || (c ? secteur(c.secteur) : null);
    var liste = PRODUITS.filter(function (p) {
      if (c && p.categorie !== c.id) return false;
      if (sp && (cat(p.categorie) || {}).secteur !== sp.id) return false;
      if (c && c.id === 'voitures' && d === 'cotonou' && !estCotonou(p)) return false;
      if (c && c.id === 'voitures' && d === 'commande' && !estCommande(p)) return false;
      if (d === 'modifications' || d === 'representants' || d === 'retours' || d === 'dechargements' || d === 'presentation') return false;
      if (d === 'occasion' && !estOccasion(p)) return false;
      if (q) return [p.nom, p.marque, p.resume, p.badge, (cat(p.categorie) || {}).nom].join(' ').toLowerCase().indexOf(q) > -1;
      return true;
    });
    var titre = q ? 'Résultats pour « ' + esc(params.get('q')) + ' »' : (c ? esc(c.nom) : sp ? esc(sp.nom) : 'Tout le catalogue');
    var nomPage = c ? c.nom : sp ? sp.nom : 'Catalogue';
    seo(nomPage + (c || sp ? ' · import de Chine à Cotonou, Bénin' : ' : véhicules, engins et vente en gros') + ' · ' + (S.nom || ''),
      (c ? c.nom + ' : ' + (c.info || '') + '. ' : sp ? sp.nom + ' : ' + (sp.info || '') + '. ' : '') + (liste.length ? liste.length + ' produits en ligne, prix' : 'Prix') + ' en FCFA et en dollars. Import direct de Chine, livraison à Cotonou et en Afrique de l’Ouest. Commande sur WhatsApp.',
      (liste[0] || {}).image, null, c ? lienCat(c.id) : sp ? lienSect(sp.id) : 'categorie.html');
    var puces = s && SECTS.length ? '<a class="puce' + (!c ? ' actif' : '') + '" href="' + lienSect(s.id) + '">Tout le secteur</a>' + catsDe(s.id).map(function (k) {
      return '<a class="puce' + (c && c.id === k.id ? ' actif' : '') + '" href="' + lienCat(k.id) + '">' + esc(k.nom) + '</a>';
    }).join('') : SECTS.length ? '<a class="puce actif" href="categorie.html">Tout</a>' + SECTS.map(function (k) {
      return '<a class="puce" href="' + lienSect(k.id) + '">' + esc(k.court || k.nom) + '</a>';
    }).join('') : '<a class="puce' + (!c ? ' actif' : '') + '" href="categorie.html">Tout</a>' + CATS_ON.map(function (k) {
      return '<a class="puce' + (c && c.id === k.id ? ' actif' : '') + '" href="' + lienCat(k.id) + '">' + esc(k.nom) + '</a>';
    }).join('');
    var vide = c && !q ? '<div class="vide vide-cmd"><b>Pas encore de produit en ligne dans « ' + esc(c.nom) + ' ».</b> Nous l’importons sur commande depuis la Chine : envoyez-nous votre besoin (photo, modèle, quantité) et nous vous faisons un devis.<br><a class="btn btn-vert" style="margin-top:12px" href="' + esc(wa('Bonjour ' + (S.nom || '') + ', je cherche : ' + c.nom + '. Pouvez-vous me faire un devis ?')) + '" target="_blank" rel="noopener">Demander un devis sur WhatsApp</a></div>' : '';
    var marques = [];
    liste.forEach(function (p) { if (p.marque && marques.indexOf(p.marque) < 0) marques.push(p.marque); });
    window.__liste = liste;
    return '<section><div class="fil"><a href="index.html">Accueil</a> › ' + (c && s ? '<a href="' + lienSect(s.id) + '">' + esc(s.nom) + '</a> › ' : '') + titre + '</div>' +
      '<div class="sec-tete"><h2>' + titre + '</h2>' + (/^(modifications|representants|retours|dechargements|presentation)$/.test(d || '') ? '' : '<span style="color:var(--texte-2)">' + liste.length + ' produit(s)</span>') + '</div>' +
      '<div class="puces">' + puces + '</div>' +
      (sp && !q ? cartesCats(catsDe(sp.id)) : '') +
      (!c && !sp && !q && !d && SECTS.length ? cartesSecteurs() : '') +
      (c && c.id === 'voitures' ? '<div class="onglets" role="tablist" style="margin-bottom:20px">' +
        '<a class="onglet onglet-lien' + (!d ? ' actif' : '') + '" href="' + lienCat('voitures') + '">Toutes les voitures</a>' +
        '<a class="onglet onglet-lien onglet-cotonou' + (d === 'cotonou' ? ' actif' : '') + '" href="' + lienDyn('voitures') + '&d=cotonou">✓ Véhicules immédiatement disponibles à Cotonou</a>' +
        '<a class="onglet onglet-lien' + (d === 'commande' ? ' actif' : '') + '" href="' + lienDyn('voitures') + '&d=commande">Sur commande (2 mois)</a>' +
        '<a class="onglet onglet-lien" href="suivi.html">📍 Suivre ma commande</a>' +
        '<a class="onglet onglet-lien' + (d === 'occasion' ? ' actif' : '') + '" href="' + lienDyn('voitures') + '&d=occasion">Occasions</a>' +
        (PRES.length ? '<a class="onglet onglet-lien' + (d === 'presentation' ? ' actif' : '') + '" href="' + lienDyn('voitures') + '&d=presentation">Présentation des véhicules chinois</a>' : '') +
        '<a class="onglet onglet-lien' + (d === 'representants' ? ' actif' : '') + '" href="' + lienDyn('voitures') + '&d=representants">Nos représentants</a>' +
        '<a class="onglet onglet-lien' + (d === 'retours' ? ' actif' : '') + '" href="' + lienDyn('voitures') + '&d=retours">Avis clients</a>' +
        '<a class="onglet onglet-lien' + (d === 'dechargements' ? ' actif' : '') + '" href="' + lienDyn('voitures') + '&d=dechargements">Déchargements</a>' +
        (MODIFS ? '<a class="onglet onglet-lien' + (d === 'modifications' ? ' actif' : '') + '" href="' + lienDyn('voitures') + '&d=modifications">Les modifications</a>' : '') +
        '</div>' +
        (d === 'modifications' ? blocModifs() : '') +
        (d === 'representants' ? blocReps() : '') +
        (d === 'presentation' ? blocPres() : '') +
        (d === 'retours' ? blocMedias(RETOURS, 'retours') : '') +
        (d === 'dechargements' ? blocMedias(DECH, 'dechargements') : '') +
        (d === 'commande' ? '<div class="info-delai">' + esc(S.delaiCommande) + '. Commande et paiement via WhatsApp ou Mobile Money. Déjà client ? <a href="suivi.html" style="text-decoration:underline;font-weight:700">Suivez votre commande</a>.</div>' : '') +
        (d === 'occasion' ? '<div class="info-delai info-oui">Véhicules d’occasion importés de Chine. Les prix affichés comprennent uniquement l’achat et le transport. La douane au Bénin pour les véhicules d’occasion (environ 50 % à 60 % de la valeur CIF) n’est pas incluse.</div>' : '') +
        (d === 'cotonou' ? '<div class="info-delai info-oui">Ces véhicules sont déjà à Cotonou : vous pouvez les voir et repartir avec immédiatement.</div>' : '') +
        (!d && !q ? configHtml() : '') : '') +
      (c && !q && !d && VID_CAT[c.id] ? grilleVideos(VID_CAT[c.id], c.id === 'machines' ? 'Nos engins en action' : 'Vidéos') : '') +
      (/^(modifications|representants|retours|dechargements|presentation)$/.test(d || '') ? '' : (marques.length > 1 ? '<div class="filtres"><label for="f-marque">Marque</label><select id="f-marque"><option value="">Toutes</option>' + marques.map(function (m) { return '<option>' + esc(m) + '</option>'; }).join('') + '</select></div>' : '') +
      '<div class="grille" id="grille-cat">' + (liste.length ? liste.map(carteProduit).join('') : vide || (sp ? '<div class="vide vide-cmd"><b>Ce secteur arrive bientôt en ligne.</b> Nous importons déjà sur commande : <a class="lien-vert" href="' + esc(wa('Bonjour ' + (S.nom || '') + ', je cherche des produits du secteur ' + sp.nom + '.')) + '" target="_blank" rel="noopener">dites-nous ce que vous cherchez sur WhatsApp</a>.</div>' : '') || '<div class="vide">Aucun produit trouvé. <a class="lien-vert" href="' + esc(wa('Bonjour, je cherche : ' + (params.get('q') || ''))) + '" target="_blank" rel="noopener">Demandez-nous sur WhatsApp</a>, nous pouvons le faire venir.</div>') + '</div>') + '</section>';
  }
  function brancherFiltres() {
    var f = document.getElementById('f-marque');
    if (!f) return;
    f.addEventListener('change', function () {
      var l = window.__liste.filter(function (p) { return !f.value || p.marque === f.value; });
      document.getElementById('grille-cat').innerHTML = l.map(carteProduit).join('');
    });
  }

  /* ---------- Fiche produit ---------- */
  function fiche() {
    var p = null, id = params.get('id');
    for (var i = 0; i < PRODUITS.length; i++) if (PRODUITS[i].id === id) p = PRODUITS[i];
    if (!p) return '<div class="vide">Ce produit n\'existe pas ou plus. <a class="lien-vert" href="categorie.html">Voir le catalogue</a></div>';
    var c = cat(p.categorie) || {};
    (function () {
      var pc = prixCalcules(p), lieu = estCotonou(p) ? 'disponible à Cotonou' : 'importé de Chine';
      var desc = p.nom + (p.marque ? ' (' + p.marque + ')' : '') + ', ' + lieu + '. ' + (pc.fcfa ? 'Prix : ' + pc.fcfa.toLocaleString('fr-FR').replace(/[\u202f\u00a0]/g, ' ') + ' FCFA. ' : '') + (p.resume ? String(p.resume).trim().replace(/[\s.!]*$/, '. ') : '') + 'Livraison au Bénin et en Afrique de l’Ouest.';
      var img = String(p.image || '').replace(/#.*$/, '');
      var d = { '@context': 'https://schema.org', '@type': 'Product', name: p.nom, description: desc, image: img ? [BASE + img] : undefined, sku: p.id, brand: p.marque ? { '@type': 'Brand', name: p.marque } : undefined,
        category: (cat(p.categorie) || {}).nom, offers: pc.fcfa ? { '@type': 'Offer', priceCurrency: 'XOF', price: pc.fcfa, availability: 'https://schema.org/' + (estCotonou(p) ? 'InStock' : 'PreOrder'), url: BASE + lienProduit(p), seller: { '@type': 'Organization', name: S.nom } } : undefined };
      seo(p.nom + ' · prix à Cotonou · ' + (S.nom || ''), desc, img, d, lienProduit(p));
    })();
    var photos = (p.galerie && p.galerie.length ? p.galerie : [p.image].concat(p.images || [])).filter(lienSur);
    var carac = p.caracteristiques || {};
    var lignes = Object.keys(carac).map(function (k) { return '<tr><th>' + esc(k) + '</th><td>' + esc(carac[k]) + '</td></tr>'; }).join('');
    var similaires = PRODUITS.filter(function (x) { return x.categorie === p.categorie && x.id !== p.id; }).slice(0, 4);
    window.__photos = photos; window.__p = p;
    return '<div class="fil"><a href="index.html">Accueil</a> › ' + (secteur(c.secteur) ? '<a href="' + lienSect(c.secteur) + '">' + esc(secteur(c.secteur).nom) + '</a> › ' : '') + '<a href="' + lienCat(c.id) + '">' + esc(c.nom) + '</a> › ' + esc(p.nom) + '</div>' +
      '<section class="fiche"><div class="fiche-photos"><div class="fiche-grande" id="grande">' + (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') + photo(photos[0], p.nom, p.icone || c.icone) + '</div>' +
      (photos.length > 1 ? '<div class="miniatures">' + photos.map(function (u, i) { return '<button type="button" data-i="' + i + '" aria-current="' + (i === 0) + '" aria-label="Photo ' + (i + 1) + '">' + photo(u, '') + '</button>'; }).join('') + '</div>' : '') +
      '</div><div class="fiche-infos">' +
      '<span class="produit-marque">' + esc(p.marque) + ' · ' + esc(c.nom) + '</span>' +
      '<h1>' + esc(p.nom) + '</h1>' + (p.gros ? '' : '<span class="fiche-ref">Réf. produit : <b>' + esc(refDe(p)) + '</b></span>') +
      (p.resume ? '<p>' + esc(p.resume) + '</p>' : '') +
      '<span class="prix">' + prixHtml(p) + '</span>' +
      (p.categorie === 'voitures' && estOccasion(p) && !p.prixFixe ? noteOccasion(true) : '') +
      (p.gros ? noteGros(p) : dispoHtml(p, true)) +
      '<div class="fiche-boutons">' +
      '<a class="btn btn-wa" href="' + esc(wa(messageCommande(p))) + '" target="_blank" rel="noopener">' + WA_SVG.replace('width="30" height="30"', 'width="22" height="22"') + ' Commander sur WhatsApp</a>' +
      (lienSur(p.lienPaiement) ? '<a class="btn btn-vert" href="' + esc(p.lienPaiement) + '" target="_blank" rel="noopener">Payer en ligne (Mobile Money / carte)</a>' : '') +
      '<a class="btn btn-carte" href="paiement.html?ref=' + encodeURIComponent(p.id) + (prixCalcules(p).fcfa && !estCommande(p) && !p.gros ? '&montant=' + prixCalcules(p).fcfa : '') + '">' + CARTE_SVG + ' Payer par carte bancaire</a>' +
      '<a class="btn btn-contour" href="' + esc(wa('Bonjour, je voudrais un devis pour : ' + p.nom)) + '" target="_blank" rel="noopener">Demander un devis</a>' +
      '</div><div class="rassurance"><span>Carte bancaire et Mobile Money</span><span>Livraison Bénin et sous-région</span><span>Conseil avant achat</span></div>' +
      (p.description ? '<div><h3 style="margin:8px 0 6px;font-size:18px">Description</h3><p style="white-space:pre-line">' + esc(p.description) + '</p></div>' : '') +
      (lignes ? '<div><h3 style="margin:8px 0 6px;font-size:18px">Caractéristiques</h3><table class="tableau">' + lignes + '</table></div>' : '') +
      '</div></section>' +
      (similaires.length ? '<section><div class="sec-tete"><h2>Dans la même catégorie</h2><a class="lien-vert" href="' + lienCat(c.id) + '">Tout voir →</a></div><div class="grille">' + similaires.map(carteProduit).join('') + '</div></section>' : '');
  }
  function brancherMiniatures() {
    var g = document.getElementById('grande');
    document.querySelectorAll('.miniatures button').forEach(function (b) {
      b.addEventListener('click', function () {
        var i = +b.getAttribute('data-i'), p = window.__p;
        g.innerHTML = (p.badge ? '<span class="badge">' + esc(p.badge) + '</span>' : '') + photo(window.__photos[i], p.nom);
        document.querySelectorAll('.miniatures button').forEach(function (x) { x.setAttribute('aria-current', String(x === b)); });
      });
    });
  }

  function realisations() {
    document.title = 'Nos réalisations · ' + (S.nom || '');
    return '<section><div class="fil"><a href="index.html">Accueil</a> › Nos réalisations</div>' +
      '<div class="sec-tete"><h2>Nos réalisations</h2></div>' +
      '<p style="margin:-6px 0 20px;color:var(--texte-2)">Véhicules livrés et personnalisations faites pour nos clients au Bénin et dans la sous-région.</p>' +
      '<div class="grille">' + REAL.map(carteReal).join('') + '</div>' +
      (MODIFS ? '<div style="text-align:center;margin-top:24px"><a class="btn btn-vert" href="' + lienDyn('voitures') + '&d=modifications">Voir les options de modification</a></div>' : '') +
      '</section>';
  }

  function faqPage() {
    document.title = 'Questions fréquentes · ' + (S.nom || '');
    return '<section><div class="fil"><a href="index.html">Accueil</a> › Questions fréquentes</div>' +
      '<div class="sec-tete"><h2>Questions fréquentes</h2></div>' +
      '<div class="faq">' + FAQ.map(function (f, i) {
        return '<details class="faq-item"' + (i === 0 ? ' open' : '') + '><summary>' + esc(f.question) + '</summary><div class="faq-rep">' + esc(f.reponse) + '</div></details>';
      }).join('') + '</div>' +
      '<div class="vide" style="margin-top:24px">Vous ne trouvez pas votre réponse ? <a class="lien-vert" href="' + esc(wa('Bonjour, j’ai une question.')) + '" target="_blank" rel="noopener">Posez-nous la question sur WhatsApp</a>.</div>' +
      '</section>';
  }

  /* ---------- Suivi de commande ---------- */
  var ETAPES = [
    ['Commande confirmée', 'Acompte reçu, commande lancée auprès de l’usine'],
    ['Préparation à l’usine', 'Le véhicule est produit et préparé'],
    ['Formalités d’export', 'Arrivée à notre parc en Chine, documents d’exportation'],
    ['En mer', 'Chargé sur le navire, en route vers votre pays'],
    ['Arrivé au port', 'Le navire est arrivé au port de destination'],
    ['Dédouanement', 'Formalités de douane et d’immatriculation'],
    ['Livré', 'Le véhicule vous a été remis']
  ];
  function norm(x) { return String(x || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function chercherSuivi(q) {
    var n = norm(q); if (!n) return null;
    return SUIVI.filter(function (c) { return [c.reference, c.conteneur].concat(c.codes || []).some(function (r) { return norm(r) && norm(r) === n; }); })[0] || null;
  }
  /* Compagnies maritimes reconnues grâce aux 3 premières lettres du conteneur */
  var COMPAGNIES = [
    ['MSC', ['MSC', 'MED', 'MSD', 'MSM', 'MSN'], 'https://www.msc.com/en/track-a-shipment?agencyPath=msc&trackingNumber={n}'],
    ['Maersk', ['MAE', 'MRK', 'MSK', 'MRS', 'SUD'], 'https://www.maersk.com/tracking/{n}'],
    ['CMA CGM', ['CMA', 'CGM', 'ECM', 'APZ', 'APH', 'CNC'], 'https://www.cma-cgm.com/ebusiness/tracking/search?SearchBy=Container&Reference={n}'],
    ['Hapag-Lloyd', ['HLC', 'HLX', 'HAM', 'UAC'], 'https://www.hapag-lloyd.com/en/online-business/track/track-by-container-solution.html?container={n}'],
    ['COSCO', ['CBH', 'CCL', 'CSN', 'CSL'], 'https://elines.coscoshipping.com/ebusiness/cargoTracking?trackingType=CONTAINER&number={n}'],
    ['OOCL', ['OOL', 'OOC'], 'https://www.oocl.com/eng/ourservices/eservices/cargotracking/Pages/cargotracking.aspx'],
    ['ONE', ['ONE', 'NYK', 'MOL', 'KKF'], 'https://ecomm.one-line.com/one-ecom/manage-shipment/cargo-tracking'],
    ['Evergreen', ['EGH', 'EIS', 'EMC', 'EIT', 'EGS'], 'https://ct.shipmentlink.com/servlet/TDB1_CargoTracking.do'],
    ['Yang Ming', ['YML', 'YMM'], 'https://www.yangming.com/e-service/track_trace/track_trace_cargo_tracking.aspx'],
    ['ZIM', ['ZIM', 'ZCS'], 'https://www.zim.com/tools/track-a-shipment?consnumber={n}'],
    ['PIL', ['PCI'], 'https://www.pilship.com/'],
    ['Wan Hai', ['WHL', 'WHS'], 'https://www.wanhai.com/views/cargoTrack/CargoTrack.xhtml']
  ];
  function compagnieDe(cont) { var p = cont.slice(0, 3); return COMPAGNIES.filter(function (c) { return c[1].indexOf(p) > -1; })[0] || null; }
  function conteneurValide(n) {
    if (!/^[A-Z]{3}[UJZ]\d{7}$/.test(n)) return false;
    var v = function (ch) { if (/\d/.test(ch)) return +ch; var x = ch.charCodeAt(0) - 55; return x + Math.floor((x - 1) / 10); };
    var s = 0; for (var i = 0; i < 10; i++) s += v(n[i]) * Math.pow(2, i);
    return (s % 11) % 10 === +n[10];
  }
  function lienSuiviConteneur(n) { var c = compagnieDe(n); return { nom: c ? c[0] : '', url: c ? c[2].replace('{n}', n) : 'https://www.searates.com/container/tracking/?number=' + n }; }
  function carteNavire(imo, mmsi, titre) {
    if (!imo && !mmsi) return '';
    var cfg = 'var width="100%";var height="380";var names=true;var zoom="4";' + (imo ? 'var imo="' + imo + '";' : '') + (mmsi ? 'var mmsi="' + mmsi + '";' : '') + 'var show_track=true;';
    var doc = '<!doctype html><html><head><meta charset="utf-8"><style>html,body{margin:0;height:100%;font-family:sans-serif}</style></head><body><script>' + cfg + '<\/script><script src="https://www.vesselfinder.com/aismap.js"><\/script></body></html>';
    var id = imo ? 'imo=' + imo : 'mmsi=' + mmsi;
    return '<div class="navire-carte"><div class="navire-tete">' + svg('navire', 18, 2) + ' <b>' + esc(titre || 'Position du navire en mer') + '</b><span>Mise à jour automatique (AIS)</span></div>' +
      '<iframe title="Position du navire" loading="lazy" srcdoc="' + esc(doc) + '"></iframe>' +
      '<div class="navire-liens"><a href="https://www.vesselfinder.com/vessels/details/' + (imo || mmsi) + '" target="_blank" rel="noopener">Ouvrir dans VesselFinder ↗</a>' +
      '<a href="https://www.marinetraffic.com/en/ais/details/ships/' + (imo ? 'imo:' + imo : 'mmsi:' + mmsi) + '" target="_blank" rel="noopener">Ouvrir dans MarineTraffic ↗</a></div>' +
      '<small>Au milieu de l’océan, la position peut avoir quelques heures de retard. Près des côtes et des ports, elle est quasiment en temps réel.</small></div>';
  }
  function blocConteneur(n) {
    var l = lienSuiviConteneur(n), ok = conteneurValide(n);
    return '<div class="cont-bloc"><div class="cont-num"><span>Conteneur</span><b>' + esc(n.slice(0, 4) + ' ' + n.slice(4, 10) + ' ' + n.slice(10)) + '</b>' + (l.nom ? '<em>' + esc(l.nom) + '</em>' : '') + '</div>' +
      (!ok ? '<p class="cont-alerte">Ce numéro ne semble pas valide (vérifiez les lettres et les chiffres). Le suivi peut ne rien trouver.</p>' : '') +
      '<p>' + (l.nom ? 'Ce conteneur appartient à <strong>' + esc(l.nom) + '</strong>. Son site indique en direct les étapes du transport, le navire, les ports et la date d’arrivée prévue.' : 'Le suivi du conteneur s’ouvre sur un site gratuit qui interroge toutes les compagnies maritimes.') + '</p>' +
      '<div class="boutons"><a class="btn btn-vert" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + svg('navire', 18, 2) + ' Suivre ce conteneur' + (l.nom ? ' chez ' + esc(l.nom) : '') + '</a>' +
      '<button type="button" class="btn btn-contour" data-copier="' + esc(n) + '">Copier le numéro</button></div>' +
      '<small>Astuce : le site de la compagnie affiche le nom du navire et son numéro IMO. Tapez ensuite ce numéro IMO ici pour voir le bateau sur la carte.</small></div>';
  }
  function resultatLibre(q) {
    var n = norm(q), d = n.replace(/^IMO/, '');
    if (/^[A-Z]{3}[UJZ]\d{7}$/.test(n)) return '<section class="suivi-res"><div class="suivi-tete"><div><span class="produit-marque">Suivi maritime</span><h2>Votre conteneur</h2></div></div>' + blocConteneur(n) + '</section>';
    if (/^\d{7}$/.test(d)) return '<section class="suivi-res"><div class="suivi-tete"><div><span class="produit-marque">Suivi maritime</span><h2>Navire IMO ' + esc(d) + '</h2></div></div>' + carteNavire(d, '', 'Position du navire IMO ' + d) + '</section>';
    if (/^\d{9}$/.test(n)) return '<section class="suivi-res"><div class="suivi-tete"><div><span class="produit-marque">Suivi maritime</span><h2>Navire MMSI ' + esc(n) + '</h2></div></div>' + carteNavire('', n, 'Position du navire MMSI ' + n) + '</section>';
    if (/^[A-Z][A-Z0-9 .\-]{2,}$/i.test(String(q).trim()) && /[A-Z]{3,}/i.test(q) && !/\d{5,}/.test(n))
      return '<section class="suivi-res"><div class="suivi-tete"><div><span class="produit-marque">Suivi maritime</span><h2>Navire « ' + esc(String(q).trim()) + ' »</h2></div></div>' +
        '<p>Nous cherchons ce navire par son nom. Pour afficher sa carte directement ici, tapez plutôt son <strong>numéro IMO</strong> (7 chiffres).</p>' +
        '<div class="boutons"><a class="btn btn-vert" href="https://www.vesselfinder.com/vessels?name=' + encodeURIComponent(String(q).trim()) + '" target="_blank" rel="noopener">' + svg('navire', 18, 2) + ' Trouver ce navire</a>' +
        '<a class="btn btn-contour" href="https://www.marinetraffic.com/en/ais/index/search/all/keyword:' + encodeURIComponent(String(q).trim()) + '" target="_blank" rel="noopener">Chercher sur MarineTraffic</a></div></section>';
    return '';
  }
  function resultatSuivi(c) {
    var et = Math.min(Math.max(nombre(c.etape) || 1, 1), ETAPES.length), dates = c.dates || {};
    var pct = Math.round((et - 1) / (ETAPES.length - 1) * 100);
    var cont = norm(c.conteneur);
    var infos = [['Référence', c.reference], ['Véhicule', c.vehicule], ['Conteneur', c.conteneur], ['Navire', c.navire], ['Port d’arrivée', c.portArrivee], ['Arrivée estimée', c.arriveeEstimee]]
      .filter(function (x) { return x[1] && !/^\[/.test(x[1]); });
    return '<section class="suivi-res">' +
      (/EXEMPLE/i.test(c.reference) ? '<div class="info-delai">Ceci est une commande d’exemple pour tester la page.</div>' : '') +
      '<div class="suivi-tete"><div><span class="produit-marque">Commande ' + esc(c.reference) + '</span><h2>' + esc(c.vehicule || 'Votre véhicule') + '</h2></div>' +
      '<span class="suivi-statut' + (et === ETAPES.length ? ' fini' : '') + '">' + esc(ETAPES[et - 1][0]) + '</span></div>' +
      '<div class="suivi-barre" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '" aria-label="Avancement de la commande"><span style="width:' + pct + '%"></span></div>' +
      (c.message ? '<p class="suivi-msg">' + esc(c.message) + '</p>' : '') +
      (et >= 4 && et <= 5 ? carteNavire(String(c.imo || '').replace(/\D/g, ''), String(c.mmsi || '').replace(/\D/g, ''), c.navire && !/^\[/.test(c.navire) ? 'Position du navire ' + c.navire : '') : '') +
      '<div class="suivi-grille"><ol class="suivi-etapes">' + ETAPES.map(function (e, i) {
        var n = i + 1, etat = n < et ? 'fait' : (n === et ? 'encours' : 'avenir');
        return '<li class="' + etat + '"><span class="pt">' + (etat === 'fait' ? svg('check', 16, 3) : (n === 4 && etat === 'encours' ? svg('navire', 16, 2) : n)) + '</span><div><b>' + esc(e[0]) + '</b><small>' + esc(e[1]) + '</small>' + (dates[n] ? '<em>' + esc(dates[n]) + '</em>' : (etat === 'encours' ? '<em>En cours</em>' : '')) + '</div></li>';
      }).join('') + '</ol>' +
      '<aside class="suivi-infos">' + infos.map(function (x) { return '<div><span>' + esc(x[0]) + '</span><b>' + esc(x[1]) + '</b></div>'; }).join('') +
      (/^[A-Z]{3}[UJZ]\d{7}$/.test(cont) ? '<a class="btn btn-vert" href="' + esc(lienSuiviConteneur(cont).url) + '" target="_blank" rel="noopener">' + svg('navire', 18, 2) + ' Suivre le conteneur</a>' : '') +
      (lienSur(c.lienSuivi) ? '<a class="btn btn-contour" href="' + esc(c.lienSuivi) + '" target="_blank" rel="noopener">Suivi du transporteur</a>' : '') +
      '<a class="btn btn-wa" href="' + esc(wa('Bonjour ' + (S.nom || '') + ', j’ai une question sur ma commande ' + c.reference + '.')) + '" target="_blank" rel="noopener">' + WA_SVG.replace('width="30" height="30"', 'width="20" height="20"') + ' Une question ? Écrivez-nous</a></aside></div></section>';
  }

  /* ===== 2. LE VOYAGE DU VÉHICULE (page Suivi) : globe 3D piloté par le défilement ===== */
  function voyageHtml() {
    var V = S.voyage || {}; if (V.actif === false) return '';
    var ch = [
      ['01', 'En Chine', 'Achat et vérification', 'Votre véhicule est choisi, contrôlé et payé directement chez le constructeur, puis rejoint notre parc à Ningbo.'],
      ['02', 'Port de Ningbo', 'Mise en conteneur', 'Il est sanglé dans son conteneur, plombé, puis chargé sur le navire. Le numéro de conteneur vous est transmis.'],
      ['03', 'En mer', 'La traversée', 'Mer de Chine, Singapour, océan Indien, cap de Bonne-Espérance puis golfe de Guinée. Suivez le navire en direct avec son numéro.'],
      ['04', 'Port de Cotonou', 'Arrivée et dédouanement', 'Le navire accoste à Cotonou. Nous gérons le déchargement, la douane et les papiers du véhicule.'],
      ['05', 'Chez vous', 'Livraison', 'Remise des clés à Kindonou, ou acheminement vers votre pays avec nos représentants.']
    ];
    return '<section class="voyage" id="voyage" aria-label="Le voyage de votre véhicule"><div class="voyage-scene">' +
      '<canvas class="voyage-globe" aria-hidden="true"></canvas>' +
      '<div class="voyage-titre"><small>De la Chine jusqu’à vous</small><h2>Le voyage de<br><span>votre véhicule</span></h2></div>' +
      '<div class="voyage-chap">' + ch.map(function (c, i) {
        return '<div class="vc" data-i="' + i + '"><small>' + c[0] + ' · ' + esc(c[1]) + '</small><h3>' + esc(c[2]) + '</h3><p>' + esc(c[3]) + '</p></div>';
      }).join('') + '</div>' +
      '<div class="voyage-compteur" aria-hidden="true"><small>Distance parcourue</small><b><span class="vk">0</span> km</b></div>' +
      '<ol class="voyage-etapes" aria-hidden="true">' + ch.map(function (c, i) { return '<li data-i="' + i + '"><span>' + c[0] + '</span>' + esc(c[1]) + '</li>'; }).join('') + '</ol>' +
      '<div class="salon-indice voyage-indice" aria-hidden="true">Faites défiler pour suivre le trajet <span>↓</span></div>' +
    '</div></section>';
  }
  function suiviPage() {
    document.title = 'Suivre mon véhicule · ' + (S.nom || '');
    var q = params.get('ref') || '';
    return '<section class="suivi-heros"><span class="promo2-tag">' + svg('navire', 16, 2) + ' Suivi maritime</span><h1>Suivre mon véhicule</h1>' +
      '<p>Saisissez votre <strong>numéro de conteneur</strong> (ex. MSCU1234567), le <strong>numéro IMO du navire</strong> ou votre <strong>référence de commande</strong> : le suivi s’affiche automatiquement, avec la position du bateau en mer.</p></section>' +
      '<form class="suivi-form" id="suivi-form" role="search"><label class="cache" for="suivi-q">Référence, code ou numéro de conteneur</label>' +
      '<span class="suivi-ico" aria-hidden="true">' + svg('navire', 20, 1.8) + '</span><input id="suivi-q" name="ref" value="' + esc(q) + '" placeholder="N° de conteneur, IMO du navire ou référence…" autocomplete="off">' +
      '<button type="submit" class="btn btn-vert">' + svg('recherche', 18, 2.4) + ' Suivre</button></form>' +
      '<div id="suivi-res"></div>' + voyageHtml() +
      '<section class="suivi-aide"><h2>Que puis-je saisir ?</h2><div class="suivi-types"><div><b>Numéro de conteneur</b><span>4 lettres + 7 chiffres, sur votre connaissement (B/L). Ex. MSCU1234567</span></div><div><b>Numéro IMO du navire</b><span>7 chiffres. Affiche le bateau en direct sur la carte. Ex. 9506291</span></div><div><b>Référence de commande</b><span>Fournie par THE KEY GROUP. Affiche les étapes de votre commande.</span></div></div>' +
      '<form class="suivi-form suivi-form-2" id="suivi-form-2" role="search"><label class="cache" for="suivi-q2">Numéro de conteneur, IMO ou référence</label>' +
      '<span class="suivi-ico" aria-hidden="true">' + svg('navire', 20, 1.8) + '</span><input id="suivi-q2" name="ref" placeholder="Saisissez votre numéro ici…" autocomplete="off">' +
      '<button type="submit" class="btn btn-vert">' + svg('recherche', 18, 2.4) + ' Suivre</button></form>' +
      '<h2 style="margin-top:22px">Les étapes de votre commande</h2><div class="suivi-mini">' + ETAPES.map(function (e, i) { return '<div><span>' + (i + 1) + '</span><b>' + esc(e[0]) + '</b></div>'; }).join('') + '</div>' +
      '<p>Vous n’avez pas encore commandé ? <a class="lien-vert" href="' + lienDyn('voitures') + '&d=commande">Découvrez nos véhicules sur commande</a>.</p></section>';
  }
  function brancherSuivi() {
    var f = document.getElementById('suivi-form'), out = document.getElementById('suivi-res'); if (!f) return;
    function go(q, maj) {
      if (!q.trim()) { out.innerHTML = ''; return; }
      var c = chercherSuivi(q), libre = c ? '' : resultatLibre(q);
      out.innerHTML = c ? resultatSuivi(c) : libre ? libre : '<div class="vide">Aucune commande trouvée pour « ' + esc(q) + ' ». Vérifiez la référence reçue, ou <a class="lien-vert" href="' + esc(wa('Bonjour ' + (S.nom || '') + ', je n’arrive pas à suivre ma commande ' + q + '.')) + '" target="_blank" rel="noopener">contactez-nous sur WhatsApp</a>.</div>';
      if (maj) try { history.replaceState(null, '', 'suivi.html?ref=' + encodeURIComponent(q.trim())); } catch (e) {}
    }
    f.addEventListener('submit', function (e) { e.preventDefault(); go(document.getElementById('suivi-q').value, true); });
    var f2 = document.getElementById('suivi-form-2');
    if (f2) f2.addEventListener('submit', function (e) { e.preventDefault(); var v = document.getElementById('suivi-q2').value; document.getElementById('suivi-q').value = v; go(v, true); if (v.trim()) out.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
    out.addEventListener('click', function (e) {
      var b = e.target.closest('[data-copier]'); if (!b) return;
      var t = b.getAttribute('data-copier');
      try { navigator.clipboard.writeText(t).then(function () { b.textContent = 'Numéro copié ✓'; }); } catch (er) { b.textContent = t; }
    });
    if (params.get('ref')) go(params.get('ref'), false);
  }

  /* ---------- Offre de bienvenue (compte à rebours) ---------- */
  function promoInit() {
    var P = S.promo || {}; if (!P.actif || page === 'paiement') return;
    var heures = nombre(P.heures) || 8, duree = heures * 3600000, cle = 'tkg_promo_debut', debut = null, premiere = false;
    try { debut = parseInt(localStorage.getItem(cle), 10) || null; if (!debut) { debut = Date.now(); localStorage.setItem(cle, String(debut)); premiere = true; } }
    catch (e) { debut = window.__tkgDebut || (window.__tkgDebut = Date.now()); premiere = !window.__tkgVu; window.__tkgVu = true; }
    var fin = debut + duree;
    if (Date.now() >= fin) return;
    var montant = esc(P.montant || '200 000'), image = lienSur(P.image) || 'images/catalogue/w148.jpg';
    var df = new Date(fin), heureFin = ('0' + df.getHours()).slice(-2) + 'h' + ('0' + df.getMinutes()).slice(-2);
    var msg = 'Bonjour ' + (S.nom || '') + ', je souhaite profiter de l’offre de bienvenue de ' + (P.montant || '200 000') + ' FCFA de réduction (valable jusqu’à ' + heureFin + ' le ' + df.toLocaleDateString('fr-FR') + ').';
    var waIco = WA_SVG.replace('width="30" height="30"', 'width="20" height="20"');
    var cadeau = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 12v9H4v-9M2 7h20v5H2zM12 21V7M12 7H7.5a2.5 2.5 0 1 1 0-5C11 2 12 7 12 7zM12 7h4.5a2.5 2.5 0 1 0 0-5C13 2 12 7 12 7z"/></svg>';
    function chrono() {
      return '<div class="chrono2" role="timer" aria-label="Temps restant pour profiter de l’offre">' +
        '<div class="c2"><b data-u="h">00</b><span>Heures</span></div><i>:</i>' +
        '<div class="c2"><b data-u="m">00</b><span>Minutes</span></div><i>:</i>' +
        '<div class="c2"><b data-u="s">00</b><span>Secondes</span></div></div>' +
        '<div class="jauge" aria-hidden="true"><span></span></div>';
    }
    var zone = document.getElementById('contenu');
    if (page === 'accueil' && zone) {
      var band = document.createElement('section'); band.className = 'promo2-bande';
      band.innerHTML = '<div class="pb-fond" style="background-image:url(' + esc(image) + ')"></div>' +
        '<div class="pb-gauche"><span class="promo2-tag">' + cadeau + ' Offre de bienvenue · temps limité</span>' +
        '<div class="pb-montant"><b>−' + montant + ' <em>FCFA</em></b><small>de réduction sur votre véhicule</small></div>' +
        '<p>si vous commandez avant <strong>' + heureFin + '</strong>. Ne laissez pas passer cette offre !</p></div>' +
        '<div class="pb-droite">' + chrono() + '<a class="btn promo2-btn" href="' + esc(wa(msg)) + '" target="_blank" rel="noopener">' + waIco + ' Profiter de l’offre</a></div>';
      var apres = zone.querySelector('#secteurs') || zone.querySelector('.heros'); if (apres) apres.insertAdjacentElement('afterend', band); else zone.prepend(band);
    }
    if (premiere) {
      var fond = document.createElement('div'); fond.className = 'promo2-fond';
      fond.innerHTML = '<div class="promo2" role="dialog" aria-modal="true" aria-labelledby="promo2-titre">' +
        '<div class="p2-photo" style="background-image:url(' + esc(image) + ')"><span class="promo2-tag">' + cadeau + ' Offre de bienvenue</span>' +
        '<button type="button" class="promo2-fermer" aria-label="Fermer l’offre">×</button></div>' +
        '<div class="p2-ticket"><small>Votre réduction</small><b>−' + montant + ' <em>FCFA</em></b></div>' +
        '<div class="p2-corps"><h2 id="promo2-titre">Une surprise pour votre première visite</h2>' +
        '<p>Commandez votre véhicule dans les <strong>' + heures + ' prochaines heures</strong> et économisez <strong class="nw">' + montant + ' FCFA</strong>.</p>' +
        chrono() +
        '<a class="btn promo2-btn" href="' + esc(wa(msg)) + '" target="_blank" rel="noopener">' + waIco + ' Profiter de l’offre sur WhatsApp</a>' +
        '<a class="promo2-lien" href="' + lienCat('voitures') + '">Découvrir les véhicules →</a>' +
        '<span class="p2-note">Offre valable jusqu’à ' + heureFin + ' aujourd’hui</span></div></div>';
      if (df.toDateString() !== new Date().toDateString()) fond.querySelector('.p2-note').textContent = 'Offre valable jusqu’à ' + heureFin + ' le ' + df.toLocaleDateString('fr-FR');
      document.body.appendChild(fond); document.body.style.overflow = 'hidden';
      function fermer() { fond.classList.add('sort'); setTimeout(function () { fond.remove(); }, 250); document.body.style.overflow = ''; document.removeEventListener('keydown', echap); }
      function echap(e) { if (e.key === 'Escape') fermer(); }
      fond.addEventListener('click', function (e) { if (e.target === fond || e.target.closest('.promo2-fermer')) fermer(); });
      document.addEventListener('keydown', echap);
      setTimeout(function () { var b = fond.querySelector('.promo2-fermer'); if (b) b.focus(); }, 60);
    }
    function tic() {
      var r = Math.max(0, fin - Date.now()), h = Math.floor(r / 3600000), m = Math.floor(r % 3600000 / 60000), s = Math.floor(r % 60000 / 1000);
      var v = { h: ('0' + h).slice(-2), m: ('0' + m).slice(-2), s: ('0' + s).slice(-2) };
      document.querySelectorAll('.chrono2 b').forEach(function (b) { b.textContent = v[b.getAttribute('data-u')]; });
      document.querySelectorAll('.jauge span').forEach(function (x) { x.style.width = (r / duree * 100).toFixed(2) + '%'; });
      if (r <= 0) {
        clearInterval(t);
        document.querySelectorAll('.promo2-bande').forEach(function (x) { x.remove(); });
        document.querySelectorAll('.p2-corps').forEach(function (x) { x.innerHTML = '<h2>Offre terminée</h2><p>Le délai est écoulé. Contactez-nous pour connaître nos prochaines promotions.</p>'; });
      }
    }
    var t = setInterval(tic, 1000); tic();
  }

  /* ---------- Démarrage ---------- */
  document.getElementById('entete').innerHTML = entete();
  document.getElementById('pied').innerHTML = pied();
  var zone = document.getElementById('contenu');
  if (page === 'accueil') { zone.innerHTML = accueil(); brancherOnglets(); brancherBureau(); }
  else if (page === 'categorie') { zone.innerHTML = categorie(); brancherFiltres(); }
  else if (page === 'produit') { zone.innerHTML = fiche(); brancherMiniatures(); }
  else if (page === 'realisations') { zone.innerHTML = realisations(); }
  else if (page === 'faq') { zone.innerHTML = faqPage(); }
  else if (page === 'contact') { zone.innerHTML = contactPage(); }
  else if (page === 'suivi') { zone.innerHTML = suiviPage(); brancherSuivi(); }
  else if (page === 'paiement') { zone.innerHTML = paiementPage(); brancherPaiement(); }
  brancherCarte();
  brancherPlanches();
  brancherVideosSuite();
  // vidéos TikTok isolées (ex. « Avis clients ») : le lecteur se charge au clic sur la vignette
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.tt-vignette'); if (!b) return;
    var el = b.closest('.tt-place'); if (!el || el.closest('.videos-suite')) return;
    e.preventDefault();
    el.innerHTML = '<iframe src="' + ttSrc(el.getAttribute('data-tt'), true, false) + '" title="' + (el.getAttribute('data-titre') || '') + '" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
  });
  promoInit();
})();
