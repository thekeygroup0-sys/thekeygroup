/* THE KEY GROUP · Le voyage du véhicule en vraie 3D (three.js)
   Terre texturée (images NASA), atmosphère, route maritime lumineuse, navire porte-conteneurs,
   arrivée à Cotonou et livraison vers les pays des représentants. Piloté par le défilement.
   Si la 3D n'est pas disponible, la version 2D (voyage.js) reste affichée. */
import * as THREE from './lib/three.module.min.js';

const sec = document.getElementById('voyage');
// chargement différé : la page s'affiche d'abord, la 3D se charge quand on approche de la section
function quandProche(el, f, marge) {
  const go = () => { const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); f(); } }, { rootMargin: marge || '700px' }); io.observe(el); };
  if (document.readyState === 'complete') go(); else addEventListener('load', go, { once: true });
}
if (sec) quandProche(sec, () => { try { lancer(); } catch (e) { console.warn('Voyage 3D indisponible', e); } });

function lancer() {
  const scene0 = sec.querySelector('.voyage-scene');
  const cv = document.createElement('canvas'); cv.className = 'voyage-3d'; cv.setAttribute('aria-hidden', 'true');
  scene0.insertBefore(cv, scene0.firstChild.nextSibling);
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: false });
  window.__voyage3d = true; sec.classList.add('v3d');
  renderer.setPixelRatio(Math.min(2, devicePixelRatio || 1));
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const calme = matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#020806');
  const cam = new THREE.PerspectiveCamera(36, 1, 0.01, 100);
  const chaps = [...sec.querySelectorAll('.vc')], puces = [...sec.querySelectorAll('.voyage-etapes li')];
  const titre = sec.querySelector('.voyage-titre'), compteur = sec.querySelector('.voyage-compteur'), vk = sec.querySelector('.vk'), indice = sec.querySelector('.voyage-indice');

  const seg = (p, a, b) => Math.min(1, Math.max(0, (p - a) / (b - a)));
  const doux = (t) => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
  const mix = (a, b, t) => a + (b - a) * t;
  const mixLon = (a, b, t) => a + ((((b - a + 540) % 360) - 180) * t);
  const D2R = Math.PI / 180;
  function xyz(lon, lat, r = 1) { const f = lat * D2R, l = lon * D2R; return new THREE.Vector3(r * Math.cos(f) * Math.cos(l), r * Math.sin(f), -r * Math.cos(f) * Math.sin(l)); }

  // ---------- Terre ----------
  const tl = new THREE.TextureLoader();
  const jour = tl.load('images/terre/jour.jpg'), nuit = tl.load('images/terre/nuit.jpg'), eau = tl.load('images/terre/eau.jpg'), relief = tl.load('images/terre/relief.jpg');
  [jour, nuit].forEach((t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = renderer.capabilities.getMaxAnisotropy(); });
  const soleil = new THREE.Vector3(-0.6, 0.45, 1).normalize();
  const terreMat = new THREE.ShaderMaterial({
    uniforms: { jour: { value: jour }, nuit: { value: nuit }, eau: { value: eau }, relief: { value: relief }, soleil: { value: soleil.clone() }, accent: { value: 0 } },
    vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){ vUv=uv; vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
    fragmentShader: `uniform sampler2D jour,nuit,eau,relief; uniform vec3 soleil; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
      void main(){
        vec3 n=normalize(vN);
        // relief : légère perturbation de la normale
        float h=texture2D(relief,vUv).r; float hx=texture2D(relief,vUv+vec2(.0008,0.)).r-h; float hy=texture2D(relief,vUv+vec2(0.,.0008)).r-h;
        n=normalize(n+vec3(-hx,-hy,0.)*1.6);
        float d=dot(n,soleil); float lum=smoothstep(-.18,.35,d);
        vec3 day=texture2D(jour,vUv).rgb; vec3 night=texture2D(nuit,vUv).rgb;
        float w=texture2D(eau,vUv).r;
        vec3 c=mix(night*vec3(1.4,1.2,.8)*.9+day*.04, day*(.25+.95*max(d,0.)), lum);
        vec3 r=reflect(-soleil,n); float sp=pow(max(dot(r,normalize(vV)),0.),220.)*w*lum;
        c+=vec3(1.,.95,.85)*sp*.18;
        float fr=pow(1.-max(dot(normalize(vN),normalize(vV)),0.),3.);
        c+=vec3(.25,.85,.55)*fr*.55*lum + vec3(.1,.4,.25)*fr*.2;
        gl_FragColor=vec4(c,1.);
        #include <colorspace_fragment>
      }`
  });
  const terre = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 96), terreMat);
  scene.add(terre);
  // atmosphère
  const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.035, 96, 48), new THREE.ShaderMaterial({
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vN=normalize(normalMatrix*normal); vec4 mv=modelViewMatrix*vec4(position,1.); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float i=pow(clamp(.6-dot(vN,vV),0.,1.),2.6)*1.15; gl_FragColor=vec4(vec3(.32,.95,.6)*i,i); }'
  }));
  scene.add(atmo);
  // étoiles
  { const n = 2500, pos = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const v = new THREE.Vector3().randomDirection().multiplyScalar(30 + Math.random() * 20); pos.set([v.x, v.y, v.z], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    scene.add(new THREE.Points(g, new THREE.PointsMaterial({ color: '#cff5dd', size: 0.06, sizeAttenuation: true, transparent: true, opacity: .8 }))); }

  // frontières (Chine et Bénin en vert)
  if (window.topojson && window.MONDE) {
    const pays = topojson.feature(MONDE, MONDE.objects.countries).features;
    const toutes = [], vertes = [];
    pays.forEach((f) => {
      const cible = (+f.id === 156 || +f.id === 204) ? vertes : toutes;
      const polys = f.geometry ? (f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates) : [];
      polys.forEach((poly) => poly.forEach((ring) => { for (let i = 1; i < ring.length; i++) { const a = xyz(ring[i - 1][0], ring[i - 1][1], 1.0015), b = xyz(ring[i][0], ring[i][1], 1.0015); cible.push(a.x, a.y, a.z, b.x, b.y, b.z); } }));
    });
    const lignes = (arr, c, o) => { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3)); const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: o })); scene.add(m); return m; };
    lignes(toutes, '#bfffd8', 0.12); lignes(vertes, '#52E08F', 0.95);
  }

  // ---------- Route maritime ----------
  const NINGBO = [121.62, 29.87], COTONOU = [2.43, 6.35];
  const ROUTE = [NINGBO, [122.6, 28.6], [120.6, 25.6], [119.7, 24], [115, 19], [110.6, 12], [105.8, 4.2], [103.9, 1.2], [100.6, 3.4], [97, 6.2],
    [88, 6], [80.6, 5.2], [70, 0], [58, -13], [55.5, -21], [45, -31], [32, -35], [20, -36.6], [16, -33], [11.2, -20], [8, -8], [5, 0], [3, 4.4], COTONOU];
  // densifier le long des grands cercles
  const pts = [];
  for (let i = 1; i < ROUTE.length; i++) {
    const a = xyz(...ROUTE[i - 1]), b = xyz(...ROUTE[i]), n = Math.max(2, Math.ceil(a.angleTo(b) / 0.02));
    for (let k = (i === 1 ? 0 : 1); k <= n; k++) pts.push(new THREE.Vector3().copy(a).lerp(b, k / n).normalize().multiplyScalar(1.004));
  }
  const courbe = new THREE.CatmullRomCurve3(pts, false, 'centripetal');
  const LONG = courbe.getLength(), KM = LONG / 1.004 * 6371;
  const tube = new THREE.TubeGeometry(courbe, 900, 0.0032, 8, false);
  const routeMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, uniforms: { prog: { value: 0 }, temps: { value: 0 }, vue: { value: 0 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: `uniform float prog,temps,vue; varying vec2 vUv;
      void main(){ float x=vUv.x;
        if(x>prog){ float tiret=step(.5,fract(x*260.)); gl_FragColor=vec4(1.,1.,1.,.28*tiret*vue); return; }
        float tete=smoothstep(prog-.02,prog,x); float flux=.55+.45*sin(x*900.-temps*6.);
        gl_FragColor=vec4(mix(vec3(.32,.88,.56),vec3(.85,1.,.9),tete)*(.85+.3*flux),1.); }`
  });
  scene.add(new THREE.Mesh(tube, routeMat));

  // navire porte-conteneurs
  const navire = new THREE.Group();
  { const coque = new THREE.Mesh(new THREE.BoxGeometry(0.009, 0.0035, 0.034), new THREE.MeshStandardMaterial({ color: '#e9eef0', roughness: .5 }));
    const bande = new THREE.Mesh(new THREE.BoxGeometry(0.0092, 0.0012, 0.0342), new THREE.MeshStandardMaterial({ color: '#1A8048' })); bande.position.y = -0.0012;
    const proue = new THREE.Mesh(new THREE.ConeGeometry(0.0046, 0.009, 4, 1), coque.material); proue.rotation.x = Math.PI / 2; proue.rotation.y = Math.PI / 4; proue.position.z = 0.021; proue.scale.set(1, 1, .5);
    navire.add(coque, bande, proue);
    const cols = ['#2DB56A', '#E8B931', '#D6453D', '#3B7DD8', '#52E08F', '#E06B2D'];
    for (let r = 0; r < 6; r++) for (let c = 0; c < 2; c++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.0038, 0.0026, 0.0042), new THREE.MeshStandardMaterial({ color: cols[(r + c * 2) % 6], roughness: .6 })); b.position.set((c - .5) * 0.0041, 0.003, -0.012 + r * 0.0047); navire.add(b); }
    const pont = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.005, 0.004), new THREE.MeshStandardMaterial({ color: '#ffffff' })); pont.position.set(0, 0.004, -0.0165); navire.add(pont);
  }
  scene.add(navire);
  // sillage
  const sillage = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.06), new THREE.ShaderMaterial({ transparent: true, depthWrite: false,
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying vec2 vUv; void main(){ float a=vUv.y*(1.-abs(vUv.x-.5)*2.); gl_FragColor=vec4(.85,1.,.93,a*.55); }' }));
  sillage.rotation.x = -Math.PI / 2; sillage.position.z = -0.045; navire.add(sillage);
  scene.add(new THREE.HemisphereLight('#ffffff', '#335544', 1.3));
  const dl = new THREE.DirectionalLight('#ffffff', 1.6); scene.add(dl);

  // conteneur THE KEY qui descend sur le navire
  const cont = new THREE.Mesh(new THREE.BoxGeometry(0.011, 0.0055, 0.022), new THREE.MeshStandardMaterial({ color: '#2DB56A', roughness: .4, metalness: .3 }));
  scene.add(cont);

  // marqueurs pulsants
  function marqueur(lon, lat, couleur) {
    const g = new THREE.Group(), n = xyz(lon, lat, 1.002);
    const point = new THREE.Mesh(new THREE.CircleGeometry(0.006, 24), new THREE.MeshBasicMaterial({ color: couleur }));
    const anneau = new THREE.Mesh(new THREE.RingGeometry(0.008, 0.0105, 40), new THREE.MeshBasicMaterial({ color: couleur, transparent: true }));
    g.add(point, anneau); g.position.copy(n); g.lookAt(n.clone().multiplyScalar(2)); scene.add(g);
    return { g, anneau };
  }
  const mN = marqueur(...NINGBO, '#52E08F'), mC = marqueur(...COTONOU, '#52E08F');

  // arcs de livraison vers les pays des représentants
  const REPS = (window.REPRESENTANTS || []).filter((r) => r.lat && r.lng && r.drapeau !== 'cn' && r.drapeau !== 'bj').map((r) => ({ nom: r.pays, c: [+r.lng, +r.lat] }));
  const arcs = REPS.map((r) => {
    const a = xyz(...COTONOU, 1.003), b = xyz(...r.c, 1.003), m = a.clone().add(b).normalize().multiplyScalar(1.003 + a.angleTo(b) * 0.35);
    const c = new THREE.QuadraticBezierCurve3(a, m, b);
    const mat = routeMat.clone(); mat.uniforms = { prog: { value: 0 }, temps: routeMat.uniforms.temps, vue: { value: 0 } };
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(c, 60, 0.0022, 6, false), mat); scene.add(mesh);
    const mk = marqueur(...r.c, '#ffffff'); mk.g.visible = false;
    return { r, mat, mk };
  });

  // étiquettes HTML
  const calque = document.createElement('div'); calque.className = 'v3-labels'; scene0.appendChild(calque);
  function etiquette(txt) { const d = document.createElement('span'); d.className = 'v3-lab'; d.textContent = txt; calque.appendChild(d); return d; }
  const lN = etiquette('Ningbo · Chine'), lC = etiquette('Port de Cotonou · Bénin'), lR = arcs.map((a) => etiquette(a.r.nom));
  const tmp = new THREE.Vector3();
  function placer(el, lon, lat, visible) {
    const p = xyz(lon, lat, 1.01); const face = p.clone().normalize().dot(cam.position.clone().normalize()) > 0.15;
    p.project(cam);
    el.style.opacity = visible && face ? 1 : 0;
    el.style.transform = `translate(${(p.x * .5 + .5) * W}px, ${(-p.y * .5 + .5) * H}px)`;
  }

  // ---------- Caméra pilotée par le défilement ----------
  function surRoute(t) { return courbe.getPointAt(Math.min(1, Math.max(0, t))); }
  function lonlat(v) { const n = v.clone().normalize(); return [Math.atan2(-n.z, n.x) / D2R, Math.asin(n.y) / D2R]; }
  function camera(p, mobile) {
    const c1 = [108, 22, 1], c2 = [NINGBO[0], NINGBO[1] - 4, 3.2];
    const ll = lonlat(surRoute(doux(seg(p, 0.27, 0.72))));
    const c3 = [ll[0] - 8, ll[1] * 0.7 - 6, 1.75], c4 = [COTONOU[0] + 1, COTONOU[1] - 3, 4.2], c5 = [10, 0, 2.3];
    const L = (a, b, t) => [mixLon(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
    if (p < 0.12) return c1;
    if (p < 0.24) return L(c1, c2, doux(seg(p, 0.12, 0.2)));
    if (p < 0.3) return L(c2, c3, doux(seg(p, 0.24, 0.3)));
    if (p < 0.72) return c3;
    if (p < 0.84) return L(c3, c4, doux(seg(p, 0.72, 0.8)));
    return L(c4, c5, doux(seg(p, 0.86, 0.94)));
  }

  let W = 1, H = 1;
  function taille() { W = cv.clientWidth; H = cv.clientHeight; renderer.setSize(W, H, false); cam.aspect = W / H; cam.updateProjectionMatrix(); }
  taille(); addEventListener('resize', taille);
  const progression = () => { const r = sec.getBoundingClientRect(), h = sec.offsetHeight - innerHeight; return Math.min(1, Math.max(0, -r.top / Math.max(1, h))); };
  let actuel = progression(), enVue = false, boucle = 0, t0 = performance.now(), camLL = null;

  function image(now) {
    const t = (now - t0) / 1000;
    actuel += (progression() - actuel) * (calme ? 1 : 0.1);
    const p = actuel, mobile = W < 760;
    let c = camera(p, mobile);
    if (!camLL) camLL = c.slice(); else { camLL[0] = mixLon(camLL[0], c[0], 0.12); camLL[1] = mix(camLL[1], c[1], 0.12); camLL[2] = mix(camLL[2], c[2], 0.12); }
    const hf = 2 * Math.atan(Math.tan(cam.fov * D2R / 2) * cam.aspect);
    const base = mobile ? Math.max(2.6, 1.12 / Math.sin(Math.min(hf, cam.fov * D2R) / 2) - 1) : 2.6;
    const dist = 1 + base / camLL[2];
    const dir = xyz(camLL[0], camLL[1], 1);
    cam.position.copy(dir.multiplyScalar(dist));
    cam.up.set(0, 1, 0); cam.lookAt(0, 0, 0);
    // décaler le globe vers la droite sur ordinateur (texte à gauche)
    cam.setViewOffset(W, H, mobile ? 0 : -W * 0.14, mobile ? H * 0.1 : 0, W, H);
    // soleil fixé par rapport à la caméra (face visible éclairée, terminateur sur le bord)
    const sv = new THREE.Vector3(-0.55, 0.5, 0.85).normalize();
    terreMat.uniforms.soleil.value.copy(sv);
    dl.position.copy(sv.clone().applyQuaternion(cam.quaternion)).multiplyScalar(5);
    terre.rotation.y = 0;
    // route
    const tr = doux(seg(p, 0.27, 0.72));
    routeMat.uniforms.prog.value = tr; routeMat.uniforms.temps.value = t; routeMat.uniforms.vue.value = seg(p, 0.2, 0.26);
    // navire
    navire.visible = p > 0.18 && p < 0.87;
    const tn = p < 0.27 ? 0 : tr, pos = surRoute(tn), av = surRoute(Math.min(1, tn + 0.003));
    navire.position.copy(pos.clone().normalize().multiplyScalar(1.0035 + Math.sin(t * 2.2) * 0.0003));
    const up = pos.clone().normalize(), fwd = av.clone().sub(pos); if (fwd.lengthSq() < 1e-10) fwd.set(0, 1, 0).cross(up);
    fwd.sub(up.clone().multiplyScalar(fwd.dot(up))).normalize();
    const m = new THREE.Matrix4().lookAt(new THREE.Vector3(), fwd.clone().negate(), up); navire.quaternion.setFromRotationMatrix(m);
    navire.scale.setScalar(p < 0.3 ? 0.9 : 1.35);
    // conteneur qui tombe
    const ct = seg(p, 0.15, 0.23);
    cont.visible = ct > 0 && ct < 1;
    if (cont.visible) { const base = xyz(...NINGBO, 1.0035); cont.position.copy(base.clone().normalize().multiplyScalar(1.0035 + 0.06 * (1 - doux(ct)))); cont.quaternion.copy(navire.quaternion); }
    // marqueurs
    [mN, mC].forEach((mk, i) => { const k = (t * 0.8 + i * .4) % 1; mk.anneau.scale.setScalar(1 + k * 2.2); mk.anneau.material.opacity = 1 - k; });
    // livraison
    const lv = seg(p, 0.88, 0.97);
    arcs.forEach((a, i) => { const f = doux(seg(lv, i * 0.08, 0.5 + i * 0.08)); a.mat.uniforms.prog.value = f; a.mat.uniforms.vue.value = 0; a.mk.g.visible = f > 0.98; });
    renderer.render(scene, cam);
    // étiquettes
    placer(lN, NINGBO[0], NINGBO[1], p < 0.3);
    placer(lC, COTONOU[0], COTONOU[1], p > 0.68);
    arcs.forEach((a, i) => placer(lR[i], a.r.c[0], a.r.c[1], a.mk.g.visible));
    // textes
    const actif = p < 0.14 ? 0 : p < 0.27 ? 1 : p < 0.72 ? 2 : p < 0.86 ? 3 : 4;
    chaps.forEach((c, i) => c.classList.toggle('on', i === actif && p > 0.05));
    puces.forEach((c, i) => { c.classList.toggle('on', i === actif); c.classList.toggle('fait', i < actif); });
    const ti = 1 - seg(p, 0.03, 0.07); titre.style.opacity = ti; titre.style.transform = `translateY(${-(1 - ti) * 30}px)`;
    indice.style.opacity = 1 - seg(p, 0.01, 0.04);
    compteur.style.opacity = seg(p, 0.26, 0.3) * (1 - seg(p, 0.9, 0.95));
    vk.textContent = Math.round(KM * tr).toLocaleString('fr-FR').replace(/[  ]/g, ' ');
    boucle = enVue ? requestAnimationFrame(image) : 0;
  }
  new IntersectionObserver((es) => { enVue = es[0].isIntersecting; if (enVue && !boucle) boucle = requestAnimationFrame(image); }, { rootMargin: '150px' }).observe(sec);
  requestAnimationFrame(image);
}
