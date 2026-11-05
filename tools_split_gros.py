"""Découpe les articles de gros : liste légère (produits-gros.js) + fiches détaillées par paquets (gros/dN.js).
Source complète : data/produits-gros.json"""
import json, os, sys, glob
R = os.path.dirname(os.path.abspath(__file__))
data = json.load(open(R + '/data/produits-gros.json'))
LEGER = ['id', 'categorie', 'nom', 'marque', 'prix', 'prixDollar', 'badge', 'gros', 'minimum', 'resume', 'image', 'etat', 'prixFixe', 'cotonou']
os.makedirs(R + '/public/gros', exist_ok=True)
for f in glob.glob(R + '/public/gros/d*.js'): os.remove(f)
N = 120; legers = []; paquets = {}
for i, p in enumerate(data):
    k = i // N
    l = {c: p[c] for c in LEGER if c in p and p[c] not in ('', None, [], {})}; l['d'] = k
    legers.append(l)
    paquets.setdefault(k, {})[p['id']] = {c: p[c] for c in p if c not in LEGER}
for k, v in paquets.items():
    open(R + '/public/gros/d%d.js' % k, 'w').write('window.GROS_DETAILS=Object.assign(window.GROS_DETAILS||{},' + json.dumps(v, ensure_ascii=False, separators=(',', ':')) + ');\n')
# format compact : [id, categorie, nom, prix, prixDollar, minimum, image, paquet] pour les articles de gros simples
rows = []
for l in legers:
    simple = l.get('gros') and l.get('badge') == 'Prix de gros' and not set(l) - {'id','categorie','nom','prix','prixDollar','minimum','resume','image','d','gros','badge'}
    if simple:
        nom = l['nom'].replace(' · réf. ' + l['id'][2:], '\u00a7') if l['id'].startswith('tg') else l['nom']
        img = l.get('image', '').replace('images/lots/', '')
        rows.append([l['id'][2:] if l['id'].startswith('tg') else l['id'], l['categorie'], nom, l.get('prix', ''), l.get('prixDollar', ''), l.get('minimum', ''), img, l['d']])
    else: rows.append(l)
js = ('/* Articles de vente en gros (liste compacte). Ne pas modifier à la main : source data/produits-gros.json */\n'
      '(function(){var G=' + json.dumps(rows, ensure_ascii=False, separators=(',', ':')) + ';\n'
      'window.PRODUITS=(window.PRODUITS||[]).concat(G.map(function(r){if(!Array.isArray(r))return r;var id=/^\\d+$/.test(r[0])?"tg"+r[0]:r[0];'
      'return{id:id,categorie:r[1],nom:r[2].replace("\u00a7"," \u00b7 r\u00e9f. "+r[0]),prix:r[3],prixDollar:r[4],minimum:r[5],image:"images/lots/"+r[6],d:r[7],gros:true,badge:"Prix de gros",'
      'resume:(r[5]?"D\u00e8s "+r[5]+" \u00b7 ":"")+"Prix de gros \u00e0 l\u2019unit\u00e9"};}));})();\n')
open(R + '/public/produits-gros.js', 'w').write(js)
print(len(data), 'articles ·', len(paquets), 'paquets ·', os.path.getsize(R + '/public/produits-gros.js') // 1024, 'Ko pour la liste')
