/* THE KEY GROUP · Le voyage du véhicule (page Suivi)
   Globe 3D dessiné avec d3-geo, piloté par le défilement :
   Chine → conteneur à Ningbo → traversée → port de Cotonou → livraison. */
(function () {
  'use strict';
  var sec = document.getElementById('voyage');
  if (!sec || !window.d3 || !window.topojson || !window.MONDE) return;
  var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var d3 = window.d3, topojson = window.topojson;
  var cv = sec.querySelector('canvas'), ctx = cv.getContext('2d');
  var chaps = [].slice.call(sec.querySelectorAll('.vc')), puces = [].slice.call(sec.querySelectorAll('.voyage-etapes li'));
  var titre = sec.querySelector('.voyage-titre'), compteur = sec.querySelector('.voyage-compteur'), vk = sec.querySelector('.vk'), indice = sec.querySelector('.voyage-indice');

  var pays = topojson.feature(MONDE, MONDE.objects.countries).features;
  var frontieres = topojson.mesh(MONDE, MONDE.objects.countries, function (a, b) { return a !== b; });
  var CHINE = pays.filter(function (f) { return +f.id === 156; })[0];
  var BENIN = pays.filter(function (f) { return +f.id === 204; })[0];
  var grille = d3.geoGraticule10();

  var NINGBO = [121.62, 29.87], COTONOU = [2.43, 6.35];
  // route maritime (par Singapour, l'océan Indien et le cap de Bonne-Espérance)
  var ROUTE = [NINGBO, [122.6, 28.6], [120.6, 25.6], [119.7, 24], [115, 19], [110.6, 12], [105.8, 4.2], [103.9, 1.2], [100.6, 3.4], [97, 6.2],
    [88, 6], [80.6, 5.2], [70, 0], [58, -13], [55.5, -21], [45, -31], [32, -35], [20, -36.6], [16, -33], [11.2, -20], [8, -8], [5, 0], [3, 4.4], COTONOU];
  var cumul = [0];
  for (var i = 1; i < ROUTE.length; i++) cumul.push(cumul[i - 1] + d3.geoDistance(ROUTE[i - 1], ROUTE[i]));
  var TOTAL = cumul[cumul.length - 1], KM = TOTAL * 6371;
  function surRoute(t) { // position et index du segment pour une fraction t de la route
    var d = t * TOTAL, k = 1;
    while (k < cumul.length - 1 && cumul[k] < d) k++;
    var f = (d - cumul[k - 1]) / Math.max(1e-9, cumul[k] - cumul[k - 1]);
    return { pos: d3.geoInterpolate(ROUTE[k - 1], ROUTE[k])(Math.min(1, Math.max(0, f))), k: k };
  }
  var REPS = (window.REPRESENTANTS || []).filter(function (r) { return r.lat && r.lng && r.drapeau !== 'cn' && r.drapeau !== 'bj'; })
    .map(function (r) { var cotes = { ml: 'g', bf: 'h', tg: 'b', ci: 'g', td: 'd', cd: 'd' }; return { nom: r.pays, c: [+r.lng, +r.lat], cote: cotes[r.drapeau] || 'd' }; });

  function seg(p, a, b) { return Math.min(1, Math.max(0, (p - a) / (b - a))); }
  function doux(t) { return t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; }
  function mix(a, b, t) { return a + (b - a) * t; }
  function mixLon(a, b, t) { var d = ((b - a + 540) % 360) - 180; return a + d * t; }

  var proj = d3.geoOrthographic().clipAngle(90).precision(0.4);
  var chemin = d3.geoPath(proj, ctx);
  var W = 0, H = 0, R = 0, dpr = 1, etoiles = [];
  function taille() {
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = cv.clientWidth; H = cv.clientHeight;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    R = Math.min(W, H) * (W < 760 ? 0.44 : 0.4);
    etoiles = [];
    var n = Math.round(W * H / 5000);
    for (var s = 0; s < n; s++) etoiles.push([Math.random() * W, Math.random() * H, Math.random() * 1.3 + 0.2, Math.random()]);
  }

  // Caméra : [longitude, latitude, zoom, décalage horizontal du globe]
  function camera(p, mobile) {
    var dx = mobile ? 0 : 0.12;
    var c1 = [108, 28, 1, dx];
    var c2 = [NINGBO[0], NINGBO[1], 2.6, dx];
    var r = surRoute(doux(seg(p, 0.27, 0.72))).pos;
    var c3 = [r[0] - 6, r[1] * 0.85, 1.35, dx];
    var c4 = [COTONOU[0], COTONOU[1], 3.2, dx];
    var c5 = [9, 3, mobile ? 1.9 : 2.1, dx];
    function lerpC(a, b, t) { return [mixLon(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t), mix(a[3], b[3], t)]; }
    if (p < 0.12) return c1;
    if (p < 0.24) return lerpC(c1, c2, doux(seg(p, 0.12, 0.2)));
    if (p < 0.3) return lerpC(c2, c3, doux(seg(p, 0.24, 0.3)));
    if (p < 0.72) return c3;
    if (p < 0.84) return lerpC(c3, c4, doux(seg(p, 0.72, 0.8)));
    return lerpC(c4, c5, doux(seg(p, 0.86, 0.94)));
  }

  function visible(pt) { var r = proj.rotate(); return d3.geoDistance(pt, [-r[0], -r[1]]) < Math.PI / 2 - 0.02; }

  function marqueur(pt, txt, couleur, pulse, cote) {
    if (!visible(pt)) return;
    var xy = proj(pt), t = performance.now() / 1000;
    ctx.save();
    if (pulse) {
      for (var k = 0; k < 2; k++) {
        var ph = (t * 0.7 + k * 0.5) % 1;
        ctx.beginPath(); ctx.arc(xy[0], xy[1], 6 + ph * 26, 0, 7);
        ctx.strokeStyle = 'rgba(82,224,143,' + (0.7 * (1 - ph)) + ')'; ctx.lineWidth = 2; ctx.stroke();
      }
    }
    ctx.beginPath(); ctx.arc(xy[0], xy[1], 5.5, 0, 7); ctx.fillStyle = couleur || '#52E08F'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = '#04120B'; ctx.stroke();
    if (txt) {
      ctx.font = '700 ' + (W < 760 ? 11 : 13) + 'px Poppins, system-ui, sans-serif';
      var w = ctx.measureText(txt).width + 18, x = cote === 'g' ? xy[0] - w - 12 : (cote === 'h' || cote === 'b') ? xy[0] - w / 2 : xy[0] + 12, y = cote === 'h' ? xy[1] - 40 : cote === 'b' ? xy[1] + 12 : xy[1] - 13;
      ctx.fillStyle = 'rgba(4,14,9,.82)'; ctx.strokeStyle = 'rgba(82,224,143,.6)'; ctx.lineWidth = 1;
      ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, 26, 13); else ctx.rect(x, y, w, 26); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.fillText(txt, x + 9, y + 17.5);
    }
    ctx.restore();
  }

  function navire(pt, cap, echelle, conteneurs) {
    if (!visible(pt)) return;
    var xy = proj(pt), t = performance.now() / 1000;
    ctx.save(); ctx.translate(xy[0], xy[1] + Math.sin(t * 2.2) * 1.2); ctx.rotate(cap); ctx.scale(echelle, echelle);
    // sillage
    var g = ctx.createLinearGradient(-60, 0, -14, 0); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(220,255,235,.55)');
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-14, -4); ctx.lineTo(-62, -13); ctx.lineTo(-62, 13); ctx.lineTo(-14, 4); ctx.fill();
    // coque
    ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 8;
    ctx.fillStyle = '#F2F5F3'; ctx.beginPath(); ctx.moveTo(-18, -6); ctx.lineTo(12, -6); ctx.quadraticCurveTo(22, 0, 12, 6); ctx.lineTo(-18, 6); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#1A8048'; ctx.fillRect(-18, -6, 30, 2.2); ctx.fillRect(-18, 3.8, 30, 2.2);
    // conteneurs
    var cols = ['#2DB56A', '#E8B931', '#D6453D', '#3B7DD8', '#52E08F', '#E06B2D'];
    for (var c = 0; c < 6; c++) { ctx.fillStyle = cols[(c + conteneurs) % cols.length]; ctx.fillRect(-14 + c * 4.2, -3.6, 3.6, 7.2); }
    ctx.fillStyle = '#fff'; ctx.fillRect(-19, -4, 4, 8); // passerelle
    ctx.restore();
  }

  var cible = 0, actuel = 0, enVue = false, boucle = null;
  function progression() {
    var r = sec.getBoundingClientRect(), h = sec.offsetHeight - window.innerHeight;
    return Math.min(1, Math.max(0, -r.top / Math.max(1, h)));
  }

  function dessiner(p) {
    var mobile = W < 760, t = performance.now() / 1000;
    var cam = camera(p, mobile);
    var rayon = R * cam[2], cx = W / 2 + W * cam[3], cy = mobile ? H * 0.4 : H / 2;
    proj.translate([cx, cy]).scale(rayon).rotate([-cam[0], -cam[1] * 0.9, 0]);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    // fond spatial
    var fond = ctx.createRadialGradient(W * 0.6, H * 0.4, 0, W * 0.6, H * 0.4, Math.max(W, H));
    fond.addColorStop(0, '#08261A'); fond.addColorStop(1, '#020806');
    ctx.fillStyle = fond; ctx.fillRect(0, 0, W, H);
    etoiles.forEach(function (e) { ctx.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 0.8 + e[3] * 9)); ctx.fillStyle = '#CFF5DD'; ctx.fillRect(e[0], e[1], e[2], e[2]); });
    ctx.globalAlpha = 1;
    // atmosphère
    var atm = ctx.createRadialGradient(cx, cy, rayon * 0.92, cx, cy, rayon * 1.22);
    atm.addColorStop(0, 'rgba(82,224,143,.45)'); atm.addColorStop(0.4, 'rgba(45,181,106,.14)'); atm.addColorStop(1, 'rgba(45,181,106,0)');
    ctx.fillStyle = atm; ctx.beginPath(); ctx.arc(cx, cy, rayon * 1.22, 0, 7); ctx.fill();
    // océan
    var oc = ctx.createRadialGradient(cx - rayon * 0.35, cy - rayon * 0.4, rayon * 0.1, cx, cy, rayon);
    oc.addColorStop(0, '#0F5A44'); oc.addColorStop(0.6, '#08392B'); oc.addColorStop(1, '#03170F');
    ctx.beginPath(); chemin({ type: 'Sphere' }); ctx.fillStyle = oc; ctx.fill();
    ctx.beginPath(); chemin(grille); ctx.strokeStyle = 'rgba(120,240,170,.07)'; ctx.lineWidth = 1; ctx.stroke();
    // terres
    ctx.beginPath(); pays.forEach(function (f) { chemin(f); }); ctx.fillStyle = '#1F6B45'; ctx.fill();
    ctx.beginPath(); chemin(frontieres); ctx.strokeStyle = 'rgba(4,20,12,.55)'; ctx.lineWidth = 0.7; ctx.stroke();
    var hl = 0.55 + 0.25 * Math.sin(t * 2);
    if (CHINE) { ctx.beginPath(); chemin(CHINE); ctx.fillStyle = 'rgba(82,224,143,' + (p < 0.3 ? hl : 0.35) + ')'; ctx.fill(); }
    if (BENIN) { ctx.beginPath(); chemin(BENIN); ctx.fillStyle = 'rgba(82,224,143,' + (p > 0.7 ? hl : 0.35) + ')'; ctx.fill(); }
    // relief lumineux (impression de volume)
    var lum = ctx.createRadialGradient(cx - rayon * 0.45, cy - rayon * 0.5, 0, cx - rayon * 0.2, cy - rayon * 0.2, rayon * 1.25);
    lum.addColorStop(0, 'rgba(255,255,255,.16)'); lum.addColorStop(0.5, 'rgba(255,255,255,0)'); lum.addColorStop(1, 'rgba(0,0,0,.55)');
    ctx.beginPath(); chemin({ type: 'Sphere' }); ctx.fillStyle = lum; ctx.fill();

    // route complète (pointillés) puis trajet effectué (lumineux)
    var tr = doux(seg(p, 0.27, 0.72)), s = surRoute(tr);
    ctx.save(); ctx.setLineDash([3, 6]);
    ctx.beginPath(); chemin({ type: 'LineString', coordinates: ROUTE }); ctx.strokeStyle = 'rgba(255,255,255,' + (0.35 * seg(p, 0.2, 0.26)) + ')'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.restore();
    if (tr > 0) {
      var fait = ROUTE.slice(0, s.k).concat([s.pos]);
      ctx.save(); ctx.beginPath(); chemin({ type: 'LineString', coordinates: fait });
      ctx.strokeStyle = 'rgba(82,224,143,.35)'; ctx.lineWidth = 7; ctx.stroke();
      ctx.strokeStyle = '#7CFFB2'; ctx.lineWidth = 2.4; ctx.stroke(); ctx.restore();
    }

    // marqueurs
    marqueur(NINGBO, p < 0.3 ? 'Ningbo · Chine' : '', '#52E08F', p < 0.3, 'g');
    marqueur(COTONOU, p > 0.68 ? (p > 0.88 ? 'Cotonou' : 'Port de Cotonou · Bénin') : '', '#52E08F', p > 0.68, 'd');

    // conteneur qui descend sur le navire (chapitre 2)
    var cTomb = seg(p, 0.16, 0.23);
    if (cTomb > 0 && cTomb < 1 && visible(NINGBO)) {
      var xy = proj(NINGBO), y0 = xy[1] - 120 * (1 - doux(cTomb));
      ctx.save(); ctx.globalAlpha = 1 - seg(cTomb, 0.85, 1);
      ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.moveTo(xy[0], y0 - 60); ctx.lineTo(xy[0], y0 - 10); ctx.stroke();
      ctx.fillStyle = '#2DB56A'; ctx.fillRect(xy[0] - 22, y0 - 10, 44, 18);
      ctx.strokeStyle = '#0D1F15'; ctx.lineWidth = 1;
      for (var b = 1; b < 8; b++) { ctx.beginPath(); ctx.moveTo(xy[0] - 22 + b * 5.5, y0 - 9); ctx.lineTo(xy[0] - 22 + b * 5.5, y0 + 7); ctx.stroke(); }
      ctx.fillStyle = '#04120B'; ctx.font = '800 7px Montserrat, sans-serif'; ctx.fillText('TKG', xy[0] - 8, y0 + 2);
      ctx.restore();
    }
    // navire
    if (p > 0.18 && p < 0.86) {
      var pos = p < 0.27 ? NINGBO : s.pos;
      var av = surRoute(Math.min(1, tr + 0.004)).pos, a = proj(pos), b2 = proj(av);
      var cap = (a && b2 && (Math.abs(b2[0] - a[0]) + Math.abs(b2[1] - a[1]) > 0.01)) ? Math.atan2(b2[1] - a[1], b2[0] - a[0]) : Math.PI;
      navire(pos, cap, (mobile ? 0.9 : 1.15) * (p < 0.27 ? 1.2 : 1), Math.floor(tr * 6));
    }
    // livraison vers les pays des représentants
    var lv = seg(p, 0.88, 0.97);
    if (lv > 0) {
      REPS.forEach(function (r, i) {
        var f = doux(seg(lv, i * 0.08, 0.5 + i * 0.08)); if (f <= 0) return;
        var arc = d3.geoInterpolate(COTONOU, r.c), pts = [];
        for (var k = 0; k <= 24; k++) pts.push(arc(f * k / 24));
        ctx.save(); ctx.setLineDash([5, 5]); ctx.lineDashOffset = -t * 20;
        ctx.beginPath(); chemin({ type: 'LineString', coordinates: pts }); ctx.strokeStyle = '#E8F7EE'; ctx.lineWidth = 1.6; ctx.stroke(); ctx.restore();
        if (f > 0.98) marqueur(r.c, r.nom, '#fff', false, r.cote);
      });
    }
    // textes HTML
    var actif = p < 0.14 ? 0 : p < 0.27 ? 1 : p < 0.72 ? 2 : p < 0.86 ? 3 : 4;
    chaps.forEach(function (c, i) { c.classList.toggle('on', i === actif && p > 0.05); });
    puces.forEach(function (c, i) { c.classList.toggle('on', i === actif); c.classList.toggle('fait', i < actif); });
    var ti = 1 - seg(p, 0.03, 0.07);
    titre.style.opacity = ti; titre.style.transform = 'translateY(' + (-(1 - ti) * 30) + 'px)';
    indice.style.opacity = 1 - seg(p, 0.01, 0.04);
    compteur.style.opacity = seg(p, 0.26, 0.3) * (1 - seg(p, 0.9, 0.95));
    vk.textContent = Math.round(KM * tr).toLocaleString('fr-FR').replace(/[  ]/g, ' ');
  }

  function image() {
    if (window.__voyage3d) { boucle = null; return; }
    cible = progression();
    actuel += (cible - actuel) * (calme ? 1 : 0.12);
    if (Math.abs(cible - actuel) < 0.0004) actuel = cible;
    dessiner(actuel);
    boucle = enVue ? requestAnimationFrame(image) : null;
  }
  function demarrer() { if (!boucle) boucle = requestAnimationFrame(image); }
  taille();
  window.addEventListener('resize', function () { taille(); dessiner(actuel); });
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { enVue = es[0].isIntersecting; if (enVue) demarrer(); }, { rootMargin: '100px' }).observe(sec);
  } else { enVue = true; demarrer(); }
  window.addEventListener('scroll', function () { if (enVue) demarrer(); }, { passive: true });
  actuel = cible = progression(); dessiner(actuel);
})();
