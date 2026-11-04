/* THE KEY GROUP · Configurateur en vraie 3D (three.js) : rotation 360° à la souris ou au doigt,
   peinture qui change de couleur sur le modèle 3D. Modèle indiqué dans produits.js
   (SITE.configurateur.modele3d). Les vues photo restent disponibles dans les autres onglets. */
import * as THREE from 'three';
import { GLTFLoader } from './lib/jsm/loaders/GLTFLoader.js';
import { RoomEnvironment } from './lib/jsm/environments/RoomEnvironment.js';
import { OrbitControls } from './lib/jsm/controls/OrbitControls.js';

const sec = document.getElementById('config');
const M = ((window.SITE || {}).configurateur || {}).modele3d;
// chargement différé : la page s'affiche d'abord, la 3D se charge quand on approche de la section
function quandProche(el, f, marge) {
  const go = () => { const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); f(); } }, { rootMargin: marge || '700px' }); io.observe(el); };
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}
if (sec && M && M.glb) quandProche(sec, () => lancer().catch((e) => console.warn('Configurateur 3D indisponible', e)));

async function lancer() {
  const studio = sec.querySelector('.config-studio'), onglets = sec.querySelector('.config-modeles');
  const gltf = await new GLTFLoader().loadAsync(M.glb);
  const cv = document.createElement('canvas'); cv.className = 'cs-3d'; studio.insertBefore(cv, studio.querySelector('.cs-glisser'));
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const scene = new THREE.Scene();
  const pm = new THREE.PMREMGenerator(renderer);
  scene.environment = pm.fromScene(new RoomEnvironment(), 0.03).texture; scene.environmentIntensity = 0.55;
  const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const ctl = new OrbitControls(cam, cv);
  ctl.enableDamping = true; ctl.enablePan = false; ctl.minDistance = 6.5; ctl.maxDistance = 12;
  ctl.minPolarAngle = 0.9; ctl.maxPolarAngle = 1.48; ctl.autoRotate = true; ctl.autoRotateSpeed = 0.8;
  ctl.target.set(0, 0.75, 0);
  ctl.addEventListener('start', () => { ctl.autoRotate = false; studio.classList.add('a-glisse'); clearTimeout(ctl._t); });
  ctl.addEventListener('end', () => { ctl._t = setTimeout(() => { ctl.autoRotate = true; }, 4000); });

  const sol = new THREE.Mesh(new THREE.CircleGeometry(9, 64), new THREE.ShadowMaterial({ opacity: 0.28 }));
  sol.rotation.x = -Math.PI / 2; sol.receiveShadow = true; scene.add(sol);
  const soleil = new THREE.DirectionalLight('#ffffff', 1.8); soleil.position.set(4, 8, 5); soleil.castShadow = true;
  soleil.shadow.mapSize.set(1024, 1024); Object.assign(soleil.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5 }); soleil.shadow.radius = 8; scene.add(soleil);
  scene.add(new THREE.HemisphereLight('#ffffff', '#c9d6cf', 0.45));

  // voiture : échelle, centrage, matériau de peinture
  const m = gltf.scene; m.rotation.y = (M.rotationY || 0) * Math.PI / 180; m.updateMatrixWorld(true);
  let b = new THREE.Box3().setFromObject(m); const s = b.getSize(new THREE.Vector3());
  m.scale.multiplyScalar((M.longueur || 4.6) / Math.max(s.x, s.z)); m.updateMatrixWorld(true);
  b = new THREE.Box3().setFromObject(m); const c = b.getCenter(new THREE.Vector3()); m.position.sub(new THREE.Vector3(c.x, b.min.y, c.z));
  const motif = M.peinture ? new RegExp(M.peinture, 'i') : null, surfaces = new Map();
  m.traverse((o) => {
    if (!o.isMesh) return; o.castShadow = true; o.receiveShadow = true;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    mats.forEach((mt) => { const bb = new THREE.Box3().setFromObject(o).getSize(new THREE.Vector3()); surfaces.set(mt, (surfaces.get(mt) || 0) + bb.x * bb.y + bb.y * bb.z + bb.x * bb.z); });
  });
  let peintures = [...surfaces.keys()].filter((mt) => motif && motif.test(mt.name || ''));
  if (!peintures.length) { // sinon : le plus grand matériau opaque et clair
    const cand = [...surfaces.entries()].filter(([mt]) => !mt.transparent && (mt.opacity === undefined || mt.opacity > 0.95)).sort((a, b) => b[1] - a[1]);
    if (cand.length) peintures = [cand[0][0]];
  }
  const peinture = new THREE.MeshPhysicalMaterial({ color: '#f4f5f2', metalness: 0.35, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.05 });
  const origine = peintures.map((mt) => ({ mt, map: mt.map }));
  m.traverse((o) => { if (!o.isMesh || /^wheel/i.test(o.name)) return; if (Array.isArray(o.material)) o.material = o.material.map((mt) => peintures.includes(mt) ? peinture : mt); else if (peintures.includes(o.material)) { o.material = peinture; } });
  // vitres : verre teinté transparent
  m.traverse((o) => { if (o.isMesh && o.material && /glass|vitre|window/i.test(o.material.name + o.name)) { o.material = new THREE.MeshPhysicalMaterial({ color: '#0b1410', metalness: 0, roughness: 0.05, transparent: true, opacity: 0.55, clearcoat: 1, depthWrite: false }); o.castShadow = false; } });
  scene.add(m);
  const haut = new THREE.Box3().setFromObject(m).getSize(new THREE.Vector3()).y;
  ctl.target.set(0, haut * 0.45, 0); cam.position.set(6.2, haut * 0.95 + 1, 6.2);

  // onglet « Vue 3D 360° » en premier, actif par défaut
  const bouton = document.createElement('button'); bouton.type = 'button'; bouton.className = 'cm cm-3d on'; bouton.textContent = M.nom || 'Vue 3D 360°';
  onglets.querySelectorAll('.cm').forEach((x) => x.classList.remove('on')); onglets.insertBefore(bouton, onglets.firstChild);
  let actif = true;
  const nomM = sec.querySelector('.cs-modele'), prix = sec.querySelector('.cs-prix'), fiche = sec.querySelector('.cs-fiche');
  function mode3d(on) {
    actif = on; studio.classList.toggle('mode-3d', on); bouton.classList.toggle('on', on);
    if (on) {
      onglets.querySelectorAll('.cm:not(.cm-3d)').forEach((x) => x.classList.remove('on')); taille();
      nomM.textContent = M.titre || 'SUV · vue 3D 360°';
      prix.innerHTML = '<small>Modèle 3D d’illustration</small><b style="font-size:15px">Choisissez la couleur, puis votre véhicule</b>';
      fiche.href = 'categorie.html?c=voitures'; fiche.textContent = 'Voir les voitures →';
      const coul = (sec.querySelector('.ct.on span') || {}).textContent || '', btn = sec.querySelector('.cs-commander'), wa = String((window.SITE || {}).whatsapp || '').replace(/\D/g, '');
      btn.href = 'https://wa.me/' + wa + '?text=' + encodeURIComponent('Bonjour THE KEY GROUP, je cherche un SUV en couleur « ' + coul + ' ». Quels modèles avez-vous ?');
    } else fiche.textContent = 'Voir la fiche →';
  }
  bouton.addEventListener('click', () => mode3d(true));
  onglets.addEventListener('click', (e) => { const t = e.target.closest('.cm'); if (t && t !== bouton) mode3d(false); });
  // couleurs
  const COUL = ((window.SITE || {}).configurateur || {}).couleurs || [];
  const cible = new THREE.Color('#f4f5f2'), courante = new THREE.Color('#f4f5f2');
  sec.addEventListener('click', (e) => { const t = e.target.closest('.ct'); if (!t) return; const col = (COUL[+t.dataset.i] || [])[1] || '#f2f3f0'; cible.set(col); peinture.map = null; peinture.needsUpdate = true; if (actif) setTimeout(() => mode3d(true), 0); });
  sec.querySelector('.cs-modele') && (sec.querySelector('.cs-modele').dataset.nom3d = M.titre || 'SUV · vue 3D');

  function taille() { const w = studio.clientWidth, h = studio.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < 560 ? 40 : 30; cam.updateProjectionMatrix(); }
  taille(); addEventListener('resize', taille);
  mode3d(true);
  let vu = false;
  new IntersectionObserver((es) => { vu = es[0].isIntersecting; }, { rootMargin: '100px' }).observe(studio);
  (function boucle() {
    requestAnimationFrame(boucle);
    if (!vu || !actif) return;
    courante.lerp(cible, 0.15); peinture.color.copy(courante);
    ctl.update(); renderer.render(scene, cam);
  })();
}
