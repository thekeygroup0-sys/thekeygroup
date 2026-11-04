/* THE KEY GROUP · Essai routier en vue conducteur (page Contact)
   Route 3D au coucher du soleil (three.js), pilotée par le défilement, jusqu'au showroom de Kindonou.
   Si une vidéo est indiquée dans produits.js (essai.video), elle est lue au rythme du défilement à la place. */
import * as THREE from './lib/three.module.min.js';
import { GLTFLoader } from './lib/jsm/loaders/GLTFLoader.js';

const sec = document.getElementById('essai');
// chargement différé : la page s'affiche d'abord, la 3D se charge quand on approche de la section
function quandProche(el, f, marge) {
  const go = () => { const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); f(); } }, { rootMargin: marge || '700px' }); io.observe(el); };
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}
if (sec) quandProche(sec, demarrer);

function demarrer() {
  const calme = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene0 = sec.querySelector('.essai-scene');
  const q = (s) => sec.querySelector(s);
  const kmh = q('.eh-kmh'), jauge = q('.eh-jauge i'), resteM = q('.eh-m'), intro = q('.essai-intro'), fin = q('.essai-fin'), volant = q('.ec-volant'), hud = q('.essai-hud');
  const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
  const progression = () => { const r = sec.getBoundingClientRect(), h = sec.offsetHeight - innerHeight; return Math.min(1, Math.max(0, -r.top / Math.max(1, h))); };
  const L = 900; // mètres de route jusqu'au showroom

  function textes(p, vitesse, z) {
    const io = 1 - seg(p, 0.02, 0.08);
    intro.style.opacity = io; intro.style.transform = `translateY(${-(1 - io) * 30}px)`;
    const fo = seg(p, 0.9, 0.97);
    fin.style.opacity = fo; fin.style.transform = `translateY(${(1 - fo) * 30}px)`; fin.style.pointerEvents = fo > 0.5 ? 'auto' : 'none';
    hud.style.opacity = seg(p, 0.03, 0.08) * (1 - seg(p, 0.93, 0.98));
    const v = Math.round(Math.min(140, vitesse));
    kmh.textContent = v; jauge.style.width = Math.min(100, v / 1.4) + '%';
    resteM.textContent = Math.max(0, Math.round((L - z) / 10) * 10);
    if (volant) volant.style.transform = `rotate(${Math.sin(z * 0.012) * 4}deg)`;
    scene0.classList.toggle('arrive', p > 0.9);
  }

  // ---- Variante vidéo réelle ----
  const video = q('.essai-video');
  if (video) {
    let dernier = 0, vit = 0, t0 = performance.now();
    const maj = () => {
      const p = progression(), t = performance.now(), dt = Math.max(16, t - t0); t0 = t;
      if (video.duration) video.currentTime = Math.min(video.duration - 0.05, p * video.duration);
      vit += (Math.abs(p - dernier) * L / (dt / 1000) * 3.6 - vit) * 0.1; dernier = p;
      textes(p, vit, p * L);
      requestAnimationFrame(maj);
    };
    requestAnimationFrame(maj);
    return;
  }

  // ---- Variante 3D ----
  const cv = q('.essai-3d');
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { sec.classList.add('essai-sans3d'); window.addEventListener('scroll', () => textes(progression(), 0, progression() * L), { passive: true }); return; }
  renderer.setPixelRatio(Math.min(1.75, devicePixelRatio || 1));
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const brume = new THREE.Color('#d9825a');
  scene.fog = new THREE.FogExp2(brume, 0.0065);
  const cam = new THREE.PerspectiveCamera(62, 1, 0.1, 1500);

  // ciel : dégradé crépuscule + soleil bas sur l'horizon
  const ciel = new THREE.Mesh(new THREE.SphereGeometry(1200, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { soleil: { value: new THREE.Vector3(0.0, 0.035, -1).normalize() } },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }',
    fragmentShader: `varying vec3 vD; uniform vec3 soleil;
      void main(){
        float h = clamp(vD.y, -0.2, 1.0);
        vec3 haut = vec3(0.07,0.11,0.24), milieu = vec3(0.55,0.27,0.33), bas = vec3(1.0,0.56,0.28);
        vec3 c = mix(bas, milieu, smoothstep(0.0, 0.12, h));
        c = mix(c, haut, smoothstep(0.12, 0.55, h));
        float s = max(dot(normalize(vD), soleil), 0.0);
        c += vec3(1.0,0.62,0.3) * pow(s, 18.0) * 0.6 + vec3(1.0,0.85,0.6) * pow(s, 900.0) * 3.0;
        if (h < 0.0) c = mix(bas, vec3(0.35,0.18,0.12), smoothstep(0.0,-0.08,h));
        gl_FragColor = vec4(c, 1.0);
      }`
  }));
  scene.add(ciel);
  scene.add(new THREE.HemisphereLight('#ffb38a', '#4a3020', 1.7));
  const fill = new THREE.DirectionalLight('#9fb4ff', 0.9); fill.position.set(10, 15, 120); scene.add(fill);
  const soleil = new THREE.DirectionalLight('#ffb070', 2.2); soleil.position.set(0, 20, -200); scene.add(soleil);

  // aléatoire reproductible
  let graine = 7; const rnd = () => (graine = (graine * 16807) % 2147483647) / 2147483647;

  // route (texture dessinée) : 4 voies, lignes blanches
  const LARG = 15;
  const tc = document.createElement('canvas'); tc.width = 512; tc.height = 512;
  const tx = tc.getContext('2d');
  tx.fillStyle = '#2b2b2d'; tx.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 9000; i++) { const g = 30 + rnd() * 40 | 0; tx.fillStyle = `rgb(${g},${g},${g + 2})`; tx.fillRect(rnd() * 512, rnd() * 512, 2, 2); }
  const X = (m) => (m + LARG / 2) / LARG * 512;
  tx.fillStyle = '#e9e9e2';
  tx.fillRect(X(-7.1), 0, 6, 512); tx.fillRect(X(7.1) - 6, 0, 6, 512);
  tx.fillRect(X(0) - 7, 0, 5, 512); tx.fillRect(X(0) + 2, 0, 5, 512);
  [-3.5, 3.5].forEach((m) => { tx.fillRect(X(m) - 3, 0, 6, 200); });
  const texRoute = new THREE.CanvasTexture(tc);
  texRoute.wrapS = texRoute.wrapT = THREE.RepeatWrapping; texRoute.repeat.set(1, (L + 400) / 12);
  texRoute.anisotropy = renderer.capabilities.getMaxAnisotropy(); texRoute.colorSpace = THREE.SRGBColorSpace;
  const route = new THREE.Mesh(new THREE.PlaneGeometry(LARG, L + 400), new THREE.MeshStandardMaterial({ map: texRoute, roughness: 0.55, metalness: 0.15 }));
  route.rotation.x = -Math.PI / 2; route.position.set(0, 0, -(L + 400) / 2 + 60); scene.add(route);
  // bas-côtés en latérite et trottoirs
  const sol = new THREE.Mesh(new THREE.PlaneGeometry(400, L + 600), new THREE.MeshStandardMaterial({ color: '#7a3d22', roughness: 1 }));
  sol.rotation.x = -Math.PI / 2; sol.position.set(0, -0.02, -(L + 600) / 2 + 100); scene.add(sol);
  [-1, 1].forEach((c) => {
    const t = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, L + 400), new THREE.MeshStandardMaterial({ color: '#b9aa98', roughness: 0.9 }));
    t.position.set(c * (LARG / 2 + 1.1), 0.09, -(L + 400) / 2 + 60); scene.add(t);
  });

  const m4 = new THREE.Matrix4(), qt = new THREE.Quaternion(), ve = new THREE.Vector3(), sc = new THREE.Vector3(), eu = new THREE.Euler();
  function poser(im, i, x, y, z, rx, ry, rz, sx, sy, sz) { eu.set(rx, ry, rz); qt.setFromEuler(eu); ve.set(x, y, z); sc.set(sx, sy, sz); m4.compose(ve, qt, sc); im.setMatrixAt(i, m4); }

  // palmiers (troncs + palmes en instances)
  const NP = 120;
  const tronc = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.26, 1, 7).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: '#6b5440', roughness: 1 }), NP);
  const pg = new THREE.PlaneGeometry(0.9, 4.2, 1, 6); pg.translate(0, 2.1, 0);
  { const pos = pg.attributes.position; for (let i = 0; i < pos.count; i++) { const y = pos.getY(i); pos.setZ(i, -Math.pow(y / 4.2, 2) * 1.6); pos.setX(i, pos.getX(i) * (1 - Math.pow(y / 4.2 - 0.35, 2) * 1.1)); } pg.computeVertexNormals(); }
  const FR = 8;
  const palmes = new THREE.InstancedMesh(pg, new THREE.MeshStandardMaterial({ color: '#2f6b33', roughness: 0.85, side: THREE.DoubleSide }), NP * FR);
  for (let i = 0; i < NP; i++) {
    const cote = i % 2 ? 1 : -1, z = 40 - (i >> 1) * (L + 200) / (NP / 2) - rnd() * 6, x = cote * (LARG / 2 + 3 + rnd() * 2.5), h = 6 + rnd() * 3.5, pen = (rnd() - 0.5) * 0.18;
    poser(tronc, i, x, 0, z, 0, 0, pen, 1, h, 1);
    for (let f = 0; f < FR; f++) {
      const a = f / FR * Math.PI * 2 + rnd() * 0.4;
      poser(palmes, i * FR + f, x - Math.sin(pen) * h, h - 0.1, z, 0, a, 0, 1, 1, 1);
      palmes.getMatrixAt(i * FR + f, m4); const inc = new THREE.Matrix4().makeRotationX(0.55 + rnd() * 0.35); m4.multiply(inc); palmes.setMatrixAt(i * FR + f, m4);
    }
  }
  scene.add(tronc, palmes);

  // immeubles avec fenêtres éclairées
  const fc = document.createElement('canvas'); fc.width = 128; fc.height = 256;
  const fx = fc.getContext('2d'); fx.fillStyle = '#000'; fx.fillRect(0, 0, 128, 256);
  for (let y = 10; y < 250; y += 22) for (let x = 8; x < 120; x += 20) { if (rnd() < 0.55) { fx.fillStyle = rnd() < 0.7 ? '#ffcf7a' : '#bfe8ff'; fx.globalAlpha = 0.5 + rnd() * 0.5; fx.fillRect(x, y, 12, 13); } }
  const texF = new THREE.CanvasTexture(fc); texF.colorSpace = THREE.SRGBColorSpace;
  const NB = 70;
  const imm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: '#a8988a', roughness: 0.9, emissive: '#ffffff', emissiveMap: texF, emissiveIntensity: 1.4 }), NB);
  const teintes = ['#c9b8a3', '#d8cfc0', '#b49a86', '#e2d6b8', '#9fb0a5', '#c78f6d'];
  for (let i = 0; i < NB; i++) {
    const cote = i % 2 ? 1 : -1, z = 20 - (i >> 1) * (L + 160) / (NB / 2) - rnd() * 8, w = 8 + rnd() * 10, h = 5 + rnd() * (rnd() < 0.2 ? 22 : 10), d = 8 + rnd() * 8;
    poser(imm, i, cote * (LARG / 2 + 10 + w / 2 + rnd() * 6), 0, z, 0, 0, 0, w, h, d);
    imm.setColorAt(i, new THREE.Color(teintes[i % teintes.length]));
  }
  scene.add(imm);

  // lampadaires + halos
  const NL = 44, lamp = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 1, 0.14).translate(0, 0.5, 0), new THREE.MeshStandardMaterial({ color: '#5d6662', metalness: 0.6, roughness: 0.4 }), NL);
  const bras = new THREE.InstancedMesh(new THREE.BoxGeometry(2.2, 0.1, 0.25), new THREE.MeshStandardMaterial({ color: '#ffe7b0', emissive: '#ffd27a', emissiveIntensity: 2 }), NL);
  const halos = [];
  for (let i = 0; i < NL; i++) {
    const cote = i % 2 ? 1 : -1, z = 10 - (i >> 1) * (L + 120) / (NL / 2) - (cote > 0 ? 18 : 0), x = cote * (LARG / 2 + 0.6);
    poser(lamp, i, x, 0, z, 0, 0, 0, 1, 7.5, 1); poser(bras, i, x - cote * 1.1, 7.5, z, 0, 0, 0, 1, 1, 1);
    halos.push(x - cote * 1.9, 7.35, z);
  }
  scene.add(lamp, bras);
  // texture de halo lumineux
  const hc = document.createElement('canvas'); hc.width = hc.height = 64; const hx = hc.getContext('2d');
  const gr = hx.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,220,160,.6)'); gr.addColorStop(1, 'rgba(255,200,120,0)');
  hx.fillStyle = gr; hx.fillRect(0, 0, 64, 64);
  const texH = new THREE.CanvasTexture(hc);
  const glow = (pts, couleur, taille) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); const p = new THREE.Points(g, new THREE.PointsMaterial({ map: texH, color: couleur, size: taille, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); p.frustumCulled = false; scene.add(p); return p; };
  glow(halos, '#ffd48a', 4.5);

  // circulation : voitures en face (phares), voitures et zémidjans devant (feux arrière)
  const voitures = [];
  const corpsG = new THREE.BoxGeometry(1.8, 1.1, 4.2).translate(0, 0.75, 0), toitG = new THREE.BoxGeometry(1.6, 0.6, 2.2).translate(0, 1.55, 0.2);
  const motoG = new THREE.BoxGeometry(0.5, 1.4, 1.8).translate(0, 0.7, 0);
  const couleursV = ['#e8e8e8', '#202326', '#8d1d1d', '#24477a', '#b8bcc0', '#1A8048', '#c9a227'];
  const PH = [], FA = [];
  for (let i = 0; i < 26; i++) {
    const enFace = i < 14, moto = !enFace && i % 3 === 0;
    const g = new THREE.Group(), mat = new THREE.MeshStandardMaterial({ color: couleursV[i % couleursV.length], metalness: 0.5, roughness: 0.35 });
    if (moto) g.add(new THREE.Mesh(motoG, new THREE.MeshStandardMaterial({ color: '#d9b51c', roughness: 0.6 })));
    else { g.add(new THREE.Mesh(corpsG, mat)); g.add(new THREE.Mesh(toitG, new THREE.MeshStandardMaterial({ color: '#111518', metalness: 0.8, roughness: 0.15 }))); }
    const voie = enFace ? (i % 2 ? -1.75 : -5.25) : (moto ? 6.4 : 5.25);
    g.position.set(voie, 0, -rnd() * (L + 200)); if (enFace) g.rotation.y = Math.PI;
    scene.add(g);
    voitures.push({ g, enFace, moto, v: enFace ? 14 + rnd() * 8 : (moto ? 6 + rnd() * 3 : 9 + rnd() * 4) });
  }
  // vrais modèles 3D pour la circulation (si fournis dans produits.js : SITE.essai.modeles)
  const MOD = ((window.SITE || {}).essai || {}).modeles || [];
  if (MOD.length) Promise.all(MOD.map((m) => new GLTFLoader().loadAsync(m.glb).then((g) => ({ g, m })).catch(() => null))).then((res) => {
    const ok = res.filter(Boolean); if (!ok.length) return;
    const prets = ok.map(({ g, m }) => { const o = g.scene; o.rotation.y = (m.rotationY || 0) * Math.PI / 180; o.updateMatrixWorld(true);
      let b = new THREE.Box3().setFromObject(o); const sz = b.getSize(new THREE.Vector3()); o.scale.multiplyScalar((m.longueur || 4.4) / Math.max(sz.x, sz.z)); o.updateMatrixWorld(true);
      b = new THREE.Box3().setFromObject(o); const c = b.getCenter(new THREE.Vector3()); o.position.sub(new THREE.Vector3(c.x, b.min.y, c.z));
      const w = new THREE.Group(); w.add(o); return w; });
    voitures.forEach((v, i) => { if (v.moto) return; const modele = prets[i % prets.length].clone(true); v.g.clear(); v.g.add(modele); });
  });
  const phares = glow(new Array(26 * 6).fill(0), '#fff4dc', 1.8), feux = glow(new Array(26 * 6).fill(0), '#ff2a1a', 0.9);

  // panneau d'arrivée THE KEY GROUP
  const pc = document.createElement('canvas'); pc.width = 1024; pc.height = 400; const px = pc.getContext('2d');
  const dessinPanneau = (logo) => {
    const gg = px.createLinearGradient(0, 0, 0, 400); gg.addColorStop(0, '#2DB56A'); gg.addColorStop(1, '#1A8048');
    px.fillStyle = gg; px.fillRect(0, 0, 1024, 400);
    px.strokeStyle = '#52E08F'; px.lineWidth = 12; px.strokeRect(10, 10, 1004, 380);
    if (logo) px.drawImage(logo, 40, 70, 260, 260 * logo.naturalHeight / logo.naturalWidth);
    px.fillStyle = '#fff'; px.font = '900 96px Montserrat, Arial, sans-serif'; px.fillText('THE KEY', logo ? 330 : 60, 170); px.fillText('GROUP', logo ? 330 : 60, 265);
    px.font = '700 40px Poppins, Arial, sans-serif'; px.fillStyle = '#0D1F15'; px.fillText('Showroom · Kindonou, Cotonou', logo ? 334 : 64, 340);
    texP.needsUpdate = true;
  };
  const texP = new THREE.CanvasTexture(pc); texP.colorSpace = THREE.SRGBColorSpace; dessinPanneau(null);
  const logo = new Image(); logo.onload = () => dessinPanneau(logo); logo.src = 'images/logo.png';
  const panneau = new THREE.Group();
  const face = new THREE.Mesh(new THREE.PlaneGeometry(10, 3.9), new THREE.MeshStandardMaterial({ map: texP, emissive: '#ffffff', emissiveMap: texP, emissiveIntensity: 0.85, roughness: 0.6 }));
  face.position.y = 5.6; panneau.add(face);
  [-4, 4].forEach((x) => { const pied = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.8, 0.3), new THREE.MeshStandardMaterial({ color: '#2a2f2c' })); pied.position.set(x, 1.9, -0.1); panneau.add(pied); });
  panneau.position.set(LARG / 2 + 3, 0, -L - 22); panneau.rotation.y = -0.35; scene.add(panneau);
  glow([LARG / 2 + 1, 8.2, -L - 20, LARG / 2 + 6, 8.2, -L - 24], '#d8ffe8', 5);
  // bâtiment du showroom derrière le panneau
  const show = new THREE.Mesh(new THREE.BoxGeometry(26, 9, 14).translate(0, 4.5, 0), new THREE.MeshStandardMaterial({ color: '#e9efe9', emissive: '#bff7d6', emissiveIntensity: 0.25, roughness: 0.4 }));
  show.position.set(LARG / 2 + 22, 0, -L - 40); scene.add(show);
  const vitrine = new THREE.Mesh(new THREE.PlaneGeometry(22, 5), new THREE.MeshStandardMaterial({ color: '#0b1a12', emissive: '#7dffb6', emissiveIntensity: 0.5 }));
  vitrine.position.set(LARG / 2 + 22, 3, -L - 32.9); scene.add(vitrine);

  // boucle de rendu
  let actuel = progression(), z = 0, zPrec = 0, vitesse = 0, enVue = false, tPrec = performance.now(), boucle = 0;
  const ease = (p) => { const t = Math.min(1, p / 0.92); return t < 0.85 ? t / 0.85 * 0.9 : 0.9 + (1 - Math.pow(1 - (t - 0.85) / 0.15, 2)) * 0.1; };
  function taille() { const w = cv.clientWidth, h = cv.clientHeight; renderer.setSize(w, h, false); cam.aspect = w / h; cam.fov = w < 760 ? 74 : 60; cam.updateProjectionMatrix(); }
  taille(); addEventListener('resize', taille);

  function image(t) {
    const dt = Math.min(0.05, (t - tPrec) / 1000); tPrec = t;
    const cible = progression();
    actuel += (cible - actuel) * (calme ? 1 : Math.min(1, dt * 4));
    z = ease(actuel) * L;
    const v = (z - zPrec) / Math.max(0.001, dt); zPrec = z;
    vitesse += (Math.max(0, v) * 3.6 * 0.55 - vitesse) * Math.min(1, dt * 3);
    const tremble = Math.min(1, vitesse / 120);
    cam.position.set(1.75 + Math.sin(z * 0.012) * 0.25, 1.22 + Math.sin(t * 0.03) * 0.012 * tremble, -z);
    const arrivee = seg(actuel, 0.86, 1);
    cam.lookAt(1.75 + Math.sin(z * 0.012 + 0.6) * 0.4 + arrivee * 5, 1.15 + arrivee * 1.6, -z - 30);
    cam.rotation.z += -Math.cos(z * 0.012) * 0.006;
    // circulation
    const ph = phares.geometry.attributes.position.array, fa = feux.geometry.attributes.position.array;
    voitures.forEach((o, i) => {
      o.g.position.z += (o.enFace ? o.v : -o.v) * dt;
      if (o.enFace && o.g.position.z > cam.position.z + 20) o.g.position.z = cam.position.z - 400 - Math.random() * 200;
      if (!o.enFace && o.g.position.z > cam.position.z + 15) o.g.position.z = cam.position.z - 250 - Math.random() * 250;
      if (!o.enFace && o.g.position.z < cam.position.z - 650) o.g.position.z = cam.position.z - 120 - Math.random() * 100;
      if (o.g.position.z < -L - 10 && !o.enFace) o.g.position.z = -L + 10 - Math.random() * 5 - 60;
      const x = o.g.position.x, zz = o.g.position.z, e = o.moto ? 0 : 0.65;
      o.g.visible = o.enFace || zz > -L + 40;
      if (!o.g.visible) { fa.set([0, -50, 0, 0, -50, 0], i * 6); ph.set([0, -50, 0, 0, -50, 0], i * 6); return; }
      if (o.enFace) { ph.set([x - e, 0.75, zz - 2.15, x + e, 0.75, zz - 2.15], i * 6); fa.set([0, -50, 0, 0, -50, 0], i * 6); }
      else { fa.set([x - e, 0.85, zz + 2.15, x + e, 0.85, zz + 2.15], i * 6); ph.set([0, -50, 0, 0, -50, 0], i * 6); }
    });
    phares.geometry.attributes.position.needsUpdate = true; feux.geometry.attributes.position.needsUpdate = true;
    renderer.render(scene, cam);
    textes(actuel, vitesse, z);
    boucle = enVue ? requestAnimationFrame(image) : 0;
  }
  const lancer = () => { if (!boucle) { tPrec = performance.now(); boucle = requestAnimationFrame(image); } };
  new IntersectionObserver((es) => { enVue = es[0].isIntersecting; if (enVue) lancer(); }, { rootMargin: '200px' }).observe(sec);
  renderer.render(scene, cam);
}
