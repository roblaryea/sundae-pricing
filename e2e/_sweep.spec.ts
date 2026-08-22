import { test } from '@playwright/test';
const BASE='https://pricing.sundae.io';
const findings: string[] = [];

async function toLayer(page:any, context:any){
  await context.addCookies([{name:'sundae_locale',value:'en',url:BASE}]);
  await page.goto(`${BASE}/simulator`,{waitUntil:'domcontentloaded'});
  await page.waitForTimeout(3500);
  const acc=page.getByRole('button',{name:'Accept'}); if(await acc.count()) await acc.click().catch(()=>{});
  const marker=page.getByRole('button',{name:/^Select CORE$/i});
  for(let i=0;i<14 && !(await marker.count());i++){
    const o=page.locator('button:visible').filter({hasText:/^(?!Back$|Continue|Accept$|Decline$|Skip).{3,}/});
    if(await o.count()) await o.first().click({timeout:4000}).catch(()=>{});
    await page.waitForTimeout(300);
    const c=page.getByRole('button',{name:/^(Continue|Get started|Start)/i}).first();
    if(await c.count()) await c.click({timeout:4000}).catch(()=>{});
    await page.waitForTimeout(900);
  }
}

for (const path of ['CORE','CREW','CORE + CREW'] as const) {
  test(`pathway: ${path}`, async ({page,context}) => {
    test.setTimeout(240000);
    const errs:string[]=[]; page.on('pageerror',e=>errs.push(String(e)));
    const bad:string[]=[]; page.on('response',r=>{ if(r.status()>=400) bad.push(`${r.status()} ${r.url().slice(0,80)}`); });
    await toLayer(page,context);
    await page.getByRole('button',{name:new RegExp(`^Select ${path.replace('+','\\+')}$`,'i')}).first().click();
    await page.waitForTimeout(2000);
    for(let step=0; step<9; step++){
      const h=((await page.locator('h1,h2').first().textContent().catch(()=> ''))??'').trim();
      const body=await page.locator('body').innerText();
      // slider probes
      const slider=page.locator('input[type=range]').first();
      if(await slider.count()){
        const max=await slider.getAttribute('max');
        const ticks=(await page.locator('input[type=range] ~ div, input[type=range] + div').allTextContents()).join('|').slice(0,80);
        const numeric=await page.locator('input[type=number]').count();
        console.log(`  [${path}] "${h}" slider max=${max} numericInput=${numeric} ticks=${ticks}`);
        if(max && Number(max)<250) findings.push(`${path}/${h}: slider max=${max} (<250)`);
        if(!numeric) findings.push(`${path}/${h}: no numeric location entry`);
      } else {
        console.log(`  [${path}] "${h}"`);
      }
      if(/summary|review|launch|your sundae/i.test(h)){
        const hasRelief=/anchor relief|year 1|year 2/i.test(body);
        const hasTerms=/Paid quarterly|Paid upfront/i.test(body);
        const hasLock=/24-month price lock/i.test(body);
        console.log(`  [${path}] SUMMARY relief=${hasRelief} terms=${hasTerms} priceLock=${hasLock}`);
        if(!hasTerms) findings.push(`${path}: summary missing commitment terms`);
        break;
      }
      const c=page.getByRole('button',{name:/^(Continue|Next|Skip|Review)/i}).first();
      if(await c.count()) await c.click({timeout:5000}).catch(()=>{}); else break;
      await page.waitForTimeout(1300);
    }
    await page.screenshot({path:`/tmp/shots/sweep-${path.replace(/[^A-Z]/g,'')}.png`,fullPage:true});
    console.log(`  [${path}] pageErrors=${errs.length} httpErrors=${bad.slice(0,3).join(';')||'none'}`);
    if(errs.length) findings.push(`${path}: ${errs.length} page errors`);
  });
}
test.afterAll(()=>{ console.log('FINDINGS:', findings.length?JSON.stringify(findings,null,1):'none'); });
