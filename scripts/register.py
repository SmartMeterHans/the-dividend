"""Eén register, één bron van waarheid. Draai na ELKE wijziging aan data/:
    python scripts/register.py
1. Valideert data/figures.json tegen data/sources.csv (beleid: alleen officiële/institutionele
   primaire bronnen, met vindplaats).
2. Controleert elke data-fig="id" in *.html: bestaat het cijfer en voldoet het aan het beleid?
3. Genereert data/figures.csv, data/retracted.csv en sources.html (openbare bronnenlijst).
Exit 1 als een pagina een cijfer toont dat niet voldoet."""
import csv, json, re, glob, html, sys, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
ALLOWED = {'official', 'institute'}          # official = overheid/VN/Wereldbank/EU/IMF/statistiekbureau
d = json.load(open('data/figures.json', encoding='utf-8'))
S = {r['source_id']: r for r in csv.DictReader(open('data/sources.csv', encoding='utf-8'))}

def problems(f):
    p, s = [], S.get(f.get('source_id', ''))
    if not s: p.append('geen source_id in catalogus')
    else:
        if s['publisher_type'] not in ALLOWED: p.append(f"brontype '{s['publisher_type']}' niet toegestaan")
    if not f.get('locator'): p.append('geen vindplaats (pagina/tabel/alinea)')
    if f.get('cls') != 'A': p.append(f"klasse {f.get('cls')} (alleen A mag op de site)")
    return p

for f in d['figures']:                       # deep_url standaard = document-URL
    if f.get('source_id') in S and not f.get('deep_url'): f['deep_url'] = S[f['source_id']]['url']
    if f.get('source_id') in S:
        f['source'] = f.get('source') or f"{S[f['source_id']]['publisher']}, {S[f['source_id']]['title']}"
        f['url'] = f.get('url') or S[f['source_id']]['url']
json.dump(d, open('data/figures.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=2)

F = {f['id']: f for f in d['figures']}
bad = {i: problems(f) for i, f in F.items() if problems(f)}
used = {}
for page in glob.glob('*.html'):
    for i in re.findall(r'data-fig="([^"]+)"', open(page, encoding='utf-8').read()):
        used.setdefault(i, set()).add(page)
fail = 0
print(f"== {len(F)} cijfers, {len(F)-len(bad)} voldoen, {len(bad)} voldoen niet")
for i, p in bad.items(): print(f"  [{'OP PAGINA ' + ','.join(sorted(used[i])) if i in used else 'niet gebruikt'}] {i}: {'; '.join(p)}")
for i, pages in used.items():
    if i not in F: print(f"  FOUT: {','.join(pages)} gebruikt onbekend cijfer '{i}'"); fail = 1
    elif i in bad: fail = 1

cols = ['id','claim','value','unit','period','cls','source_id','locator','deep_url','note','retrieved']
with open('data/figures.csv','w',newline='',encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(cols)
    for f in d['figures']: w.writerow([f.get(c, S.get(f.get('source_id'),{}).get('retrieved','') if c=='retrieved' else '') for c in cols])
with open('data/retracted.csv','w',newline='',encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['id','earlier_claim','what_sources_show','action','pages'])
    for r in d['retracted']: w.writerow([r['id'], r['earlier'], r['finding'], r['action'], r['pages']])

e = html.escape
fmt = lambda v: f'{v:,}' if isinstance(v,(int,float)) and not isinstance(v,bool) else str(v)
rows = []
for sid, s in S.items():
    figs = [f for f in d['figures'] if f.get('source_id') == sid]
    ok = s['publisher_type'] in ALLOWED
    items = ''.join(f"<li><a href=\"{e(f['deep_url'])}\">{e(f['claim'])}: <b>{e(fmt(f['value']))} {e(f['unit'])}</b></a> <span class=loc>{e(' · '.join(x for x in (f['period'], f['locator'] or 'location not yet recorded') if x))}</span></li>" for f in figs)
    rows.append(f"<section class=\"src{'' if ok else ' no'}\"><h2><a href=\"{e(s['url'])}\">{e(s['title'])}</a></h2>"
                f"<p class=meta>{e(s['publisher'])} · {e(s['published'])} · type: {e(s['publisher_type'])}{'' if ok else ' — does not meet the sourcing policy; figures to be replaced'} · retrieved {e(s['retrieved'])}</p><ul>{items}</ul></section>")
unsourced = [f for f in d['figures'] if f.get('source_id') not in S]
tpl = open('scripts/sources.template.html', encoding='utf-8').read()
open('sources.html','w',encoding='utf-8').write(tpl.replace('{{SOURCES}}', '\n'.join(rows))
    .replace('{{COUNT}}', f"{len(S)} sources · {len(F)-len(bad)} figures meet the policy · {len(unsourced)} awaiting a primary source")
    .replace('{{RETRIEVED}}', d['meta']['retrieved']))
print("== gegenereerd: data/figures.csv, data/retracted.csv, sources.html")
sys.exit(fail)
