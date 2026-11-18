from pathlib import Path
import subprocess,json,tempfile,shutil,statistics,os
root=Path(__file__).resolve().parent
out=root/'final-matched';out.mkdir(exist_ok=True)
rows=[]
for run in range(1,4):
 for stage in ['before','after']:
  (root/'active-root.txt').write_text('/tmp/pricing-f11-'+stage+'-dist')
  profile=tempfile.mkdtemp(prefix='pricing-f11-paired-')
  file=out/f'lighthouse-{stage}-{run}.json';log=out/f'lighthouse-{stage}-{run}.log'
  cmd=['node','/Users/robertlaryea/.npmcache/_npx/0f94ee7615faf582/node_modules/lighthouse/cli/index.js','http://127.0.0.1:5190/?utm_source=internal_qa&utm_medium=qa&utm_campaign=f11_matched_20261118','--only-categories=performance','--disable-storage-reset',f'--chrome-flags=--headless --disable-gpu --user-data-dir={profile}','--quiet','--output=json',f'--output-path={file}']
  before=os.getloadavg()
  with log.open('w') as f:p=subprocess.run(cmd,stdout=f,stderr=subprocess.STDOUT,timeout=150)
  if p.returncode:print(json.dumps({'stage':stage,'run':run,'error':p.returncode}),flush=True);continue
  d=json.loads(file.read_text());a=d['audits'];row={'stage':stage,'run':run,'version':d['lighthouseVersion'],'fetchTime':d['fetchTime'],'score':d['categories']['performance']['score'],'CLS':a['cumulative-layout-shift']['numericValue'],'LCP':a['largest-contentful-paint']['numericValue'],'FCP':a['first-contentful-paint']['numericValue'],'TBT':a['total-blocking-time']['numericValue'],'warnings':d.get('runWarnings'),'runtimeError':d.get('runtimeError'),'loadBefore':before,'loadAfter':os.getloadavg(),'config':d['configSettings'],'lcpCandidate':a['lcp-breakdown-insight'].get('details')};rows.append(row)
  print(json.dumps({k:v for k,v in row.items() if k not in ['config','lcpCandidate']}),flush=True)
  shutil.rmtree(profile,ignore_errors=True)
summary={'method':'Three sequential before/after pairs on the same gzip local server, same URL and live API proxy, Lighthouse13.6 mobile simulated throttling. Every run uses a unique empty Chrome profile; storage reset is disabled because profiles are already fresh, avoiding cache-clear timeouts. No concurrent agent Lighthouse run. This is lab comparison, not deployed or field/CrUX evidence. Unrelated machine load is recorded and qualifies absolute timing.','rows':rows,'medians':{stage:{k:statistics.median(r[k] for r in rows if r['stage']==stage) for k in ['score','CLS','LCP','FCP','TBT']} for stage in ['before','after'] if len([r for r in rows if r['stage']==stage])==3}}
(out/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
