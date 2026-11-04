/* THE KEY GROUP · Configurateur de couleur (page Voitures)
   Repeint la carrosserie d'une photo détourée de véhicule blanc, avec rotation au glisser.
   Si des vues 360° sont fournies (vues360 dans produits.js), le glisser fait tourner le véhicule. */
(function () {
  'use strict';
  var sec = document.getElementById('config'), D = window.__config;
  if (!sec || !D || !D.modeles.length) return;
  var calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var q = function (s) { return sec.querySelector(s); };
  var cvA = q('.cs-a'), cvB = q('.cs-b'), reflet = q('.cs-reflet'), voiture = q('.cs-voiture'), scene = q('.cs-scene'), spray = q('.cs-spray');
  var nomM = q('.cs-modele'), nomC = q('.cs-couleur'), prix = q('.cs-prix'), btn = q('.cs-commander'), fiche = q('.cs-fiche'), studio = q('.config-studio');
  var iModele = 0, iCouleur = 0, cache = {}, images = {}, vue = 0, anim = null;

  function hex(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16) / 255, parseInt(h.substr(2, 2), 16) / 255, parseInt(h.substr(4, 2), 16) / 255]; }
  function lisse(a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); }
  function nombre(n) { return n == null ? '' : Math.round(n).toLocaleString('fr-FR').replace(/[  ]/g, ' '); }

  function charger(src, cb) {
    if (images[src]) { if (images[src].complete) cb(images[src]); else images[src].addEventListener('load', function () { cb(images[src]); }); return; }
    var im = new Image(); images[src] = im; im.decoding = 'async';
    im.onload = function () { cb(im); }; im.src = src;
  }

  // Peinture : les zones claires et peu saturées (la carrosserie blanche) prennent la teinte,
  // en conservant ombres et reflets ; pneus, vitres, phares colorés et plaque restent d'origine.
  function peindre(im, couleur, masque) {
    var cle = im.src + '|' + couleur;
    if (cache[cle]) return cache[cle];
    var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight;
    var x = c.getContext('2d'); x.drawImage(im, 0, 0);
    if (!couleur) return (cache[cle] = c);
    try {
      var d = x.getImageData(0, 0, c.width, c.height), px = d.data, k = hex(couleur), mk = null;
      if (masque && masque.naturalWidth) {
        var cm = document.createElement('canvas'); cm.width = c.width; cm.height = c.height;
        var xm = cm.getContext('2d'); xm.drawImage(masque, 0, 0, c.width, c.height); mk = xm.getImageData(0, 0, c.width, c.height).data;
      }
      var lumC = 0.2126 * k[0] + 0.7152 * k[1] + 0.0722 * k[2], sombre = lumC < 0.15;
      for (var i = 0; i < px.length; i += 4) {
        if (px[i + 3] < 8) continue;
        var r = px[i] / 255, g = px[i + 1] / 255, b = px[i + 2] / 255;
        var mx = Math.max(r, g, b), mn = Math.min(r, g, b), L = 0.2126 * r + 0.7152 * g + 0.0722 * b;
        var w = mk ? mk[i] / 255 : lisse(0.42, 0.62, L) * (1 - lisse(0.12, 0.3, mx > 0 ? (mx - mn) / mx : 0));
        if (w <= 0.003) continue;
        // ombrage de la peinture : contraste renforcé, reflets conservés
        var t = Math.min(1.1, L / 0.9), base = Math.pow(t, 2.1);
        var spec = Math.pow(Math.max(0, (L - 0.84) / 0.16), 2.2) * (sombre ? 0.5 : 0.55);
        var amb = sombre ? 0.015 + 0.035 * t : 0.02;
        for (var j = 0; j < 3; j++) {
          var v = Math.min(1, k[j] * base * (sombre ? 1.3 : 1) + spec + amb);
          var o = j === 0 ? r : j === 1 ? g : b;
          px[i + j] = Math.round((o + (v - o) * w) * 255);
        }
      }
      x.putImageData(d, 0, 0);
    } catch (e) { // page ouverte hors ligne (file://) : teinte par simple filtre
      x.globalCompositeOperation = 'multiply'; x.fillStyle = couleur; x.fillRect(0, 0, c.width, c.height);
      x.globalCompositeOperation = 'destination-in'; x.drawImage(im, 0, 0);
    }
    return (cache[cle] = c);
  }

  function copier(src, dst) {
    dst.width = src.width; dst.height = src.height;
    var x = dst.getContext('2d'); x.clearRect(0, 0, dst.width, dst.height); x.drawImage(src, 0, 0);
  }

  function sourceActuelle() { var m = D.modeles[iModele]; return m.vues && m.vues.length ? m.vues[vue % m.vues.length] : m.image; }

  function rendre(transition) {
    var m = D.modeles[iModele], col = D.couleurs[iCouleur] || ['', ''];
    voiture.style.setProperty('--r', '');
    var src = sourceActuelle(), masqueSrc = m.vues && m.vues.length ? '' : (m.masque || '');
    charger(src, function (im) {
      if (masqueSrc && col[1]) { charger(masqueSrc, function (mq) { suite(im, mq); }); } else suite(im, null);
    });
    function suite(im, mq) {
      if (src !== sourceActuelle()) return;
      voiture.style.aspectRatio = im.naturalWidth + '/' + im.naturalHeight;
      var peint = peindre(im, col[1], mq);
      if (transition && !calme) {
        copier(cvB, cvA); cvA.style.opacity = 1;
        copier(peint, cvB);
        voiture.classList.remove('peint'); void voiture.offsetWidth; voiture.classList.add('peint');
        clearTimeout(anim); anim = setTimeout(function () { voiture.classList.remove('peint'); cvA.style.opacity = 0; }, 1000);
      } else { copier(peint, cvB); cvA.style.opacity = 0; }
      copier(peint, reflet);
    }
    nomM.textContent = m.nom; nomC.textContent = col[0];
    prix.innerHTML = m.fcfa ? '<small>Prix</small><b>' + nombre(m.fcfa) + ' FCFA</b>' + (m.usd ? '<span>≈ ' + nombre(m.usd) + ' $</span>' : '') : '<b>Prix sur demande</b>';
    btn.href = 'https://wa.me/' + D.wa + '?text=' + encodeURIComponent('Bonjour THE KEY GROUP, je voudrais commander le ' + m.nom + ' en couleur « ' + col[0] + ' ». Est-elle disponible ?');
    btn.textContent = 'Commander en ' + col[0];
    fiche.href = m.lien;
  }

  // choix du modèle / de la couleur
  sec.addEventListener('click', function (e) {
    var t = e.target.closest('.cm, .ct'); if (!t) return;
    if (t.classList.contains('cm-3d')) return;
    var i = +t.getAttribute('data-i');
    if (t.classList.contains('cm')) {
      iModele = i; vue = 0;
      sec.querySelectorAll('.cm').forEach(function (b) { b.classList.toggle('on', b === t); });
      scene.classList.remove('arrive'); void scene.offsetWidth; scene.classList.add('arrive');
      rendre(false);
    } else {
      if (i === iCouleur) return; iCouleur = i;
      sec.querySelectorAll('.ct').forEach(function (b) { var on = b === t; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
      rendre(true);
    }
  });

  // glisser pour tourner : vues 360° si disponibles, sinon inclinaison 3D avec reflet mobile
  var x0 = null, rot = 0, rot0 = 0, vue0 = 0, aGlisse = false;
  function appliquer() {
    voiture.style.transform = 'perspective(1600px) rotateY(' + rot.toFixed(2) + 'deg)';
    reflet.style.transform = 'scaleY(-1) perspective(1600px) rotateY(' + (-rot).toFixed(2) + 'deg)';
    studio.style.setProperty('--lx', (50 + rot * 2).toFixed(1) + '%');
  }
  studio.addEventListener('pointerdown', function (e) { x0 = e.clientX; rot0 = rot; vue0 = vue; studio.classList.add('tient'); try { studio.setPointerCapture(e.pointerId); } catch (er) {} });
  studio.addEventListener('pointermove', function (e) {
    if (x0 === null) return;
    var dx = e.clientX - x0, m = D.modeles[iModele];
    if (Math.abs(dx) > 4 && !aGlisse) { aGlisse = true; studio.classList.add('a-glisse'); }
    if (m.vues && m.vues.length > 1) {
      var n = m.vues.length, nv = ((vue0 - Math.round(dx / 14)) % n + n) % n;
      if (nv !== vue) { vue = nv; rendre(false); }
    } else { rot = Math.max(-24, Math.min(24, rot0 + dx * 0.12)); appliquer(); }
  });
  function lacher() {
    if (x0 === null) return; x0 = null; studio.classList.remove('tient');
    if (!(D.modeles[iModele].vues || []).length && !calme) { // retour en douceur
      (function ressort() { rot *= 0.86; appliquer(); if (Math.abs(rot) > 0.05 && x0 === null) requestAnimationFrame(ressort); else if (x0 === null) { rot = 0; appliquer(); } })();
    }
  }
  studio.addEventListener('pointerup', lacher); studio.addEventListener('pointercancel', lacher);
  // petit mouvement d'invitation à l'arrivée à l'écran
  if (!calme && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      if (!es[0].isIntersecting) return; io.disconnect();
      var t0 = performance.now();
      (function balance(t) { var k = (t - t0) / 1600; if (k > 1 || aGlisse) { if (!aGlisse) { rot = 0; appliquer(); } return; } rot = Math.sin(k * Math.PI * 2) * 14 * (1 - k); appliquer(); requestAnimationFrame(balance); })(t0);
    }, { threshold: 0.5 });
    io.observe(studio);
  }
  rendre(false);
})();
