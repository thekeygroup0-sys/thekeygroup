/* THE KEY GROUP — petites animations (pas besoin de modifier ce fichier) */
(function () {
  'use strict';
  var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('anim-on');
  if (calme) document.documentElement.classList.add('anim-calme');

  /* 1. Apparition des cartes et sections au défilement */
  var cibles = '.produit, .carte-cat, .tuile, .banniere, .atout, .rep, .faq-item, .carte-video, .suivi-res, .cta, .promo2-bande, .bloc-blanc, .sec-tete h2, .video';
  function preparer(racine) {
    (racine || document).querySelectorAll(cibles).forEach(function (el) {
      if (el.dataset.anim) return; el.dataset.anim = '1';
      if (calme || !('IntersectionObserver' in window)) { el.classList.add('vu'); return; }
      var freres = el.parentElement ? [].indexOf.call(el.parentElement.children, el) : 0;
      el.style.setProperty('--retard', (Math.min(freres, 8) * 70) + 'ms');
      el.classList.add('a-reveler'); obs.observe(el);
    });
  }
  var obs = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { var t = e.target; t.classList.add('vu'); obs.unobserve(t); setTimeout(function () { t.classList.remove('a-reveler'); }, 1400); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }) : null;
  preparer();
  // contenus ajoutés plus tard (onglets, recherche, suivi…)
  if ('MutationObserver' in window) new MutationObserver(function (ms) {
    ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) { if (n.matches && n.matches(cibles)) preparer(n.parentElement); else preparer(n); } }); });
  }).observe(document.body, { childList: true, subtree: true });

  /* 2. Petite voiture qui roule puis éclate comme une bulle */
  var VOITURE = '<svg viewBox="0 0 120 56" width="120" height="56" aria-hidden="true">' +
    '<path d="M8 38c0-6 3-9 9-10l14-3 13-11c3-2 6-3 10-3h22c5 0 8 1 11 4l11 11 11 2c5 1 7 4 7 9v6c0 2-1 3-3 3H11c-2 0-3-1-3-3z" fill="#2DB56A"/>' +
    '<path d="M48 16c2-2 4-3 7-3h10v13H38zM70 13h10c3 0 5 1 7 3l9 10H70z" fill="#DDF7E7"/>' +
    '<rect x="100" y="33" width="9" height="4" rx="2" fill="#FFE27A"/><rect x="9" y="34" width="6" height="4" rx="2" fill="#FF7A7A"/>' +
    '<g class="roue"><circle cx="33" cy="46" r="9" fill="#0D1F15"/><circle cx="33" cy="46" r="4" fill="#B9D3C4"/><path d="M33 38v16M25 46h16" stroke="#0D1F15" stroke-width="2"/></g>' +
    '<g class="roue"><circle cx="92" cy="46" r="9" fill="#0D1F15"/><circle cx="92" cy="46" r="4" fill="#B9D3C4"/><path d="M92 38v16M84 46h16" stroke="#0D1F15" stroke-width="2"/></g></svg>';
  function eclater(x, y, conteneur) {
    var couleurs = ['#52E08F', '#2DB56A', '#B6F7CF', '#FFFFFF', '#FFE27A'];
    for (var i = 0; i < 26; i++) {
      var b = document.createElement('span'); b.className = 'bulle';
      var t = 12 + Math.random() * 22, ang = Math.random() * Math.PI * 2, dist = 50 + Math.random() * 90;
      b.style.cssText = 'left:' + x + 'px;top:' + y + 'px;width:' + t + 'px;height:' + t + 'px;background:' + couleurs[i % couleurs.length] + ';--dx:' + Math.cos(ang) * dist + 'px;--dy:' + (Math.sin(ang) * dist - 40) + 'px;animation-delay:' + (Math.random() * 80) + 'ms';
      conteneur.appendChild(b); setTimeout(function (el) { el.remove(); }.bind(null, b), 1300);
    }
    var mot = document.createElement('span'); mot.className = 'pop-mot'; mot.textContent = ['Pop !', 'Vroum !', 'Bienvenue !', 'Hop !'][Math.floor(Math.random() * 4)];
    mot.style.cssText = 'left:' + x + 'px;top:' + y + 'px'; conteneur.appendChild(mot); setTimeout(function () { mot.remove(); }, 1200);
  }
  function lancerVoiture() {
    // la petite voiture roule sur la page blanche, sous la vidéo, et nous emmène vers les secteurs
    var route = document.getElementById('route-secteurs'); if (!route) return;
    var cible = document.getElementById('secteurs');
    var aller = function (e) { if (e) e.preventDefault(); if (cible) cible.scrollIntoView({ behavior: calme ? 'auto' : 'smooth', block: 'start' }); };
    route.querySelector('.rs-panneau').addEventListener('click', aller);
    if (calme) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'voiture'; b.setAttribute('aria-label', 'Petite voiture : cliquez pour aller aux secteurs');
    b.innerHTML = VOITURE + '<span class="fumee"></span>'; route.appendChild(b);
    var timer, enRoute = false;
    function boom() {
      if (b.classList.contains('boum')) return;
      clearTimeout(timer);
      var r = b.getBoundingClientRect(), s = route.getBoundingClientRect();
      eclater(r.left - s.left + r.width / 2, r.top - s.top + r.height / 2, route);
      b.classList.add('boum'); route.classList.add('arrivee');
      setTimeout(function () { b.classList.remove('boum', 'roule'); route.classList.remove('arrivee'); void b.offsetWidth; demarrer(); }, 3800);
    }
    function demarrer() { b.classList.add('roule'); timer = setTimeout(boom, 6200); }
    b.addEventListener('click', function () { aller(); boom(); });
    // démarre quand la route est visible
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { if (es[0].isIntersecting && !enRoute) { enRoute = true; setTimeout(demarrer, 300); } }, { threshold: 0.6 }).observe(route);
    else demarrer();
  }
  lancerVoiture();

  /* 2 bis. Scène pilotée par le défilement (croquis → photo → gamme → panneau) */
  (function () {
    var sec = document.getElementById('show'); if (!sec) return;
    var sc = sec.querySelector('.show-scene');
    if (calme) { sec.classList.add('show-statique'); return; }
    var q = function (s) { return sc.querySelector(s); };
    var croquis = q('.show-croquis'), photo = q('.show-photo'), crayon = q('.show-crayon'), voiture = q('.show-voiture'),
      bande = q('.show-bande'), defile = q('.show-defile'), split = q('.show-split'), panneau = q('.show-panneau'),
      grille = q('.show-grille'), indice = q('.show-indice'), prog = q('.show-prog span'),
      legs = sc.querySelectorAll('.show-leg'), vs = sc.querySelectorAll('.show-v');
    function seg(p, a, b) { return Math.min(1, Math.max(0, (p - a) / (b - a))); }
    function doux(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    function leg(i, v) { var el = legs[i]; el.style.opacity = v; el.style.transform = 'translateY(' + ((1 - v) * 24) + 'px)'; }
    var mobile = false, ticking = false;
    function maj() {
      ticking = false;
      mobile = window.innerWidth <= 760;
      var r = sec.getBoundingClientRect(), h = sec.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, -r.top / Math.max(1, h)));
      prog.style.width = (p * 100) + '%';
      indice.style.opacity = 1 - seg(p, 0.01, 0.06);
      // 1. croquis qui se dessine
      var d = seg(p, 0.03, 0.22);
      croquis.style.clipPath = 'inset(0 ' + ((1 - d) * 100) + '% 0 0)';
      crayon.style.left = (d * 100) + '%'; crayon.style.top = (35 + Math.sin(d * 40) * 22) + '%';
      crayon.style.opacity = (d > 0 && d < 1) ? 1 : 0;
      grille.style.opacity = 1 - seg(p, 0.24, 0.34);
      // 2. la photo remplace le croquis (balayage)
      var ph = doux(seg(p, 0.22, 0.34));
      photo.style.clipPath = 'inset(0 ' + ((1 - ph) * 100) + '% 0 0)';
      croquis.style.opacity = 1 - seg(p, 0.3, 0.38);
      // bande de couleur avec texte qui défile
      var b = doux(seg(p, 0.26, 0.38)), sortieB = seg(p, 0.7, 0.8);
      bande.style.transform = 'translateY(' + ((1 - b) * 120 + sortieB * 120) + '%)';
      defile.style.transform = 'translateX(' + (-p * (mobile ? 1600 : 2400)) + 'px)';
      // 3. la vedette recule, la gamme arrive
      var f = doux(seg(p, 0.44, 0.62)), s = doux(seg(p, 0.72, 0.86));
      var sc1 = 1 - f * (mobile ? 0.42 : 0.5), ty = -f * (mobile ? 14 : 10);
      var tx = s * (mobile ? 0 : -24), tyS = s * (mobile ? -8 : 6);
      voiture.style.transform = 'translate(calc(-50% + ' + tx + 'vw), calc(-50% + ' + (ty + tyS) + 'vh)) scale(' + (sc1 + s * (mobile ? 0.12 : 0.15)) + ')';
      vs.forEach(function (v, i) {
        var t = doux(seg(p, 0.46 + i * 0.025, 0.6 + i * 0.025)), cote = i % 2 ? 1 : -1;
        v.style.opacity = t * (1 - s);
        v.style.transform = 'translateX(' + ((1 - t) * cote * 110) + 'vw) translateY(' + ((1 - t) * 20) + 'px) scale(' + (0.9 + t * 0.1) + ')';
      });
      // 4. écran coupé en deux
      split.style.clipPath = mobile ? 'inset(' + ((1 - s) * 100) + '% 0 0 0)' : 'inset(0 0 0 ' + ((1 - s) * 100) + '%)';
      panneau.style.opacity = seg(p, 0.8, 0.9); panneau.style.transform = 'translateY(' + ((1 - seg(p, 0.8, 0.9)) * 30) + 'px)';
      // légendes
      leg(0, 1 - seg(p, 0.2, 0.25));
      leg(1, seg(p, 0.28, 0.34) * (1 - seg(p, 0.42, 0.47)));
      leg(2, seg(p, 0.5, 0.56) * (1 - seg(p, 0.7, 0.75)));
    }
    function demande() { if (!ticking) { ticking = true; requestAnimationFrame(maj); } }
    window.addEventListener('scroll', demande, { passive: true });
    window.addEventListener('resize', demande);
    maj();
  })();

  /* 2 ter. SHOWROOM « Monte à bord » : lumières, voiture, camion, engin, puis intérieur */
  (function () {
    var sec = document.getElementById('salon'); if (!sec) return;
    var sc = sec.querySelector('.salon-scene');
    var actes = [].slice.call(sc.querySelectorAll('.salon-acte')), n = actes.length;
    var intro = sc.querySelector('.salon-intro'), indice = sc.querySelector('.salon-indice'), etapes = sc.querySelector('.salon-etapes'),
      puces = [].slice.call(etapes.querySelectorAll('span')), bord = sc.querySelector('.salon-bord'), bimg = sc.querySelector('.bord-img'),
      hud = sc.querySelector('.bord-hud'), glisser = sc.querySelector('.bord-glisser');
    if (calme) {
      sec.classList.add('salon-statique'); sec.style.setProperty('--lum', 1);
      if (actes[0]) { actes[0].classList.add('vis', 'points'); actes[0].querySelector('.salon-info').style.opacity = 1; }
      return;
    }
    function seg(p, a, b) { return Math.min(1, Math.max(0, (p - a) / (b - a))); }
    function doux(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
    var DEB = 0.08, L = 0.2, FIN = DEB + n * L, glisse = 0, aGlisse = false, ticking = false;
    var parts = actes.map(function (a) { return { a: a, v: a.querySelector('.salon-v'), vin: a.querySelector('.salon-v-in'), g: a.querySelector('.salon-geant'), e: a.querySelector('.sv-eclat'), i: a.querySelector('.salon-info') }; });
    function maj() {
      ticking = false;
      var mobile = window.innerWidth <= 760;
      var r = sec.getBoundingClientRect(), h = sec.offsetHeight - window.innerHeight;
      var p = Math.min(1, Math.max(0, -r.top / Math.max(1, h)));
      // les projecteurs s'allument (avec un petit grésillement)
      var t = seg(p, 0.005, 0.07), lum = t < 1 ? t * (0.65 + 0.35 * Math.abs(Math.sin(t * 41))) : 1;
      sec.style.setProperty('--lum', lum.toFixed(3));
      sec.style.setProperty('--rot', (p * 900).toFixed(1) + 'deg');
      sec.style.setProperty('--sol', (p * 1400).toFixed(0) + 'px');
      var io = 1 - seg(p, 0.06, 0.1);
      intro.style.opacity = io; intro.style.transform = 'translateY(calc(-50% - ' + ((1 - io) * 40) + 'px)) scale(' + (1 + (1 - io) * 0.15) + ')';
      indice.style.opacity = 1 - seg(p, 0.01, 0.05);
      etapes.style.opacity = seg(p, 0.07, 0.1);
      var cur = p < FIN - 0.02 ? Math.max(0, Math.min(n - 1, Math.floor((p - DEB) / L))) : n;
      puces.forEach(function (s, i) { s.classList.toggle('actif', i === cur); });
      parts.forEach(function (o, i) {
        var A = DEB + i * L, B = A + L, dernier = i === n - 1;
        var tin = doux(seg(p, A - 0.02, A + 0.06)), tout = doux(seg(p, B - 0.045, B + 0.01));
        var vis = p > A - 0.025 && p < B + 0.02;
        o.a.classList.toggle('vis', vis);
        if (!vis) return;
        var hold = seg(p, A + 0.06, B - 0.045);
        var x, sc2, rot, op = 1;
        if (dernier) { x = (1 - tin) * 70; sc2 = 0.82 + tin * 0.18 + hold * 0.06 + tout * 2.2; rot = (1 - tin) * -22; op = 1 - seg(p, B - 0.02, B + 0.01); }
        else { x = (1 - tin) * 70 - tout * 85; sc2 = 0.82 + tin * 0.18 + hold * 0.06; rot = (1 - tin) * -22 + tout * 22; }
        o.v.style.transform = 'translate(calc(-50% + ' + x.toFixed(2) + 'vw), -50%) perspective(1400px) rotateY(' + rot.toFixed(2) + 'deg) scale(' + sc2.toFixed(3) + ')';
        o.v.style.opacity = op;
        var flou = (1 - tin) * 5 + (dernier ? 0 : tout * 5);
        o.vin.style.filter = flou > 0.1 ? 'blur(' + flou.toFixed(1) + 'px)' : '';
        o.g.style.transform = 'translate(calc(-50% + ' + ((0.5 - seg(p, A - 0.02, B + 0.02)) * (mobile ? 50 : 40)).toFixed(2) + 'vw), -50%)';
        o.g.style.opacity = tin * (1 - tout);
        o.e.style.setProperty('--sweep', (150 - seg(p, A + 0.05, A + 0.12) * 200).toFixed(1) + '%');
        o.a.classList.toggle('points', p > A + 0.065 && p < B - 0.05);
        var io2 = seg(p, A + 0.045, A + 0.085) * (1 - seg(p, B - 0.06, B - 0.035));
        o.i.style.opacity = io2; o.i.style.transform = (mobile ? '' : 'translateY(-50%) ') + 'translateY(' + ((1 - io2) * 30).toFixed(1) + 'px)';
        o.i.style.pointerEvents = io2 > 0.5 ? 'auto' : 'none';
      });
      // on monte à bord : l'intérieur s'ouvre en cercle depuis le centre
      var c = doux(seg(p, FIN - 0.03, FIN + 0.07));
      bord.classList.toggle('vis', c > 0);
      bord.style.clipPath = 'circle(' + (c * 150).toFixed(2) + '% at 50% 52%)';
      var zoom = 1.3 - doux(seg(p, FIN - 0.03, FIN + 0.12)) * 0.25 - seg(p, FIN + 0.12, 1) * 0.04;
      var pan = 6 - seg(p, FIN + 0.06, 1) * 12 + glisse;
      bimg.style.transform = 'translateX(' + pan.toFixed(2) + '%) scale(' + zoom.toFixed(3) + ')';
      var hu = seg(p, FIN + 0.08, FIN + 0.13);
      hud.style.opacity = hu; hud.style.transform = 'translateY(' + ((1 - hu) * 30) + 'px)';
      glisser.style.opacity = aGlisse ? 0 : seg(p, FIN + 0.1, FIN + 0.14);
    }
    function demande() { if (!ticking) { ticking = true; requestAnimationFrame(maj); } }
    window.addEventListener('scroll', demande, { passive: true });
    window.addEventListener('resize', demande);
    // glisser pour regarder autour dans l'habitacle
    var x0 = null, g0 = 0;
    bord.addEventListener('pointerdown', function (e) { if (e.target.closest('a')) return; x0 = e.clientX; g0 = glisse; bord.style.cursor = 'grabbing'; });
    window.addEventListener('pointermove', function (e) { if (x0 === null) return; glisse = Math.max(-9, Math.min(9, g0 + (e.clientX - x0) / window.innerWidth * 30)); aGlisse = true; demande(); });
    window.addEventListener('pointerup', function () { x0 = null; bord.style.cursor = ''; });
    maj();
  })();

  /* 3. Reflet brillant sur les cartes au survol (suit la souris) */
  document.addEventListener('pointermove', function (e) {
    var c = e.target.closest && e.target.closest('.produit, .tuile, .carte-cat, .rep');
    if (!c) return; var r = c.getBoundingClientRect();
    c.style.setProperty('--mx', (e.clientX - r.left) + 'px'); c.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });
})();
