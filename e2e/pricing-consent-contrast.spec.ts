import { test, expect } from '@playwright/test';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const fixture=JSON.parse(readFileSync(new URL('../__tests__/fixtures/published-policy-20261010.json',import.meta.url),'utf8'));
for(const [theme,width] of [['light',1440],['light',390],['dark',412]] as const) test(`${theme} consent stays readable at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:width===1440?1000:844});
  await page.addInitScript(theme=>{localStorage.setItem('sundae-theme',theme);document.cookie=`sundae_theme=${theme}; Path=/`;},theme);
  await page.route('**/api/pricing/catalog/active*',route=>route.fulfill({json:fixture}));
  await page.goto('/');
  const banner=page.getByRole('dialog',{name:'Cookie consent',exact:true});
  await expect(banner).toBeVisible();
  await expect(page.getByTestId('decision-total')).toContainText('$1,195');
  await page.evaluate(()=>document.fonts.ready);
  const readback=()=>banner.evaluate(element=>{
    const pixel=(css:string)=>{const c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d')!;ctx.fillStyle=css;ctx.fillRect(0,0,1,1);return Array.from(ctx.getImageData(0,0,1,1).data);};
    const background=pixel(getComputedStyle(element).backgroundColor);
    // White is the conservative backing colour for the existing 95% dark
    // translucent banner, so this does not overstate cream-text contrast.
    const bg=background.slice(0,3).map(c=>c*background[3]/255+255*(1-background[3]/255));
    const luminance=(rgb:number[])=>rgb.map(c=>c/255).map(c=>c<=.04045?c/12.92:((c+.055)/1.055)**2.4).reduce((sum,c,i)=>sum+c*[.2126,.7152,.0722][i],0);
    const elements=[element.querySelector('p')!,element.querySelector('a')!,element.querySelector('button')!];
    return {background:getComputedStyle(element).backgroundColor,effectiveBackground:bg,items:elements.map(node=>{const color=getComputedStyle(node).color;const ink=pixel(color);const a=luminance(ink.slice(0,3)),b=luminance(bg);return {text:node.textContent,color,contrast:(Math.max(a,b)+.05)/(Math.min(a,b)+.05)};}),height:element.getBoundingClientRect().height};
  });
  const normal=await readback();
  for(const item of normal.items) expect(item.contrast,item.text??'').toBeGreaterThanOrEqual(4.5);
  if(theme==='light')expect(normal.items[0].color).toBe('rgb(234, 224, 206)');
  else expect(normal.items[0].color).toBe('rgb(208, 198, 182)');
  await banner.getByRole('link',{name:'Privacy Policy'}).hover();
  const linkHover=await readback();expect(linkHover.items[1].contrast).toBeGreaterThanOrEqual(4.5);
  await banner.getByRole('button',{name:'Decline',exact:true}).hover();
  const declineHover=await readback();expect(declineHover.items[2].contrast).toBeGreaterThanOrEqual(4.5);
  await banner.getByRole('button',{name:'Decline',exact:true}).focus();
  const declineFocus=await readback();expect(declineFocus.items[2].contrast).toBeGreaterThanOrEqual(4.5);
  expect(declineFocus.height).toBe(normal.height);
  await page.mouse.move(0,0);await page.locator('h1').focus();
  await page.screenshot({path:`output/playwright/f11/consent-${theme}-${width}.png`,animations:'disabled'});
  mkdirSync('output/playwright/f11',{recursive:true});
  writeFileSync(`output/playwright/f11/consent-${theme}-${width}.json`,JSON.stringify({theme,width,normal,linkHover,declineHover,declineFocus},null,2)+'\n');
  await banner.getByRole('button',{name:'Decline',exact:true}).click();
  await expect(banner).toHaveCount(0);
  expect(await page.evaluate(()=>localStorage.getItem('sundae_cookie_consent'))).toBe('declined');
});

// These existing scenarios exercise a configured visitor; first-visit gating
// is covered separately by pricing-location-gate.spec.ts.
test.beforeEach(async ({page}) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('sundae-pricing-config-v1-7')) localStorage.setItem('sundae-pricing-config-v1-7', JSON.stringify({version:2,state:{layer:'core',corePackage:'core_foundation',locations:1,locationsConfirmed:true,addOns:[],crewSkus:[],watchtowerModules:[],crossIntelligence:'none',billingCycle:'monthly',operatingModels:[],employees:null,payrollCountry:''}}));
  });
});
