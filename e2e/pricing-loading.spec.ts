import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { encodePricingIntent, type PricingIntent } from '../src/lib/pricingIntent';
const fixture = JSON.parse(readFileSync(new URL('../__tests__/fixtures/published-policy-20261010.json', import.meta.url), 'utf8'));

type ShiftWindow = Window & { pricingShifts: number[]; pendingFooter: Element | null };
for (const width of [320,412,1440]) test(`delayed authoritative prices preserve structure at ${width}px`, async ({page}) => {
  await page.setViewportSize({width,height:width===320?640:width===412?823:1000});
  await page.addInitScript(() => {
    const state = window as ShiftWindow; state.pricingShifts=[];
    new PerformanceObserver(list => { for (const raw of list.getEntries()) {
      const e=raw as PerformanceEntry & {hadRecentInput:boolean;value:number};
      if(!e.hadRecentInput) state.pricingShifts.push(e.value);
    }}).observe({type:'layout-shift',buffered:true});
  });
  let release!:()=>void;
  const pending = new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/pricing/catalog/active*',async route=>{await pending;await route.fulfill({json:fixture});});
  await page.goto('/');
  await expect(page.getByTestId('pricing-pending')).toBeVisible();
  await expect(page.locator('h1')).toHaveText('Pricing that fits your business.');
  await expect(page.getByTestId('decision-total')).toHaveCount(0);
  await page.evaluate(async()=>{await document.fonts.ready;(window as ShiftWindow).pendingFooter=document.querySelector('footer');});
  expect((await page.locator('footer').boundingBox())!.y).toBeGreaterThan(width===320?640:width===412?823:1000);
  expect(await page.locator('footer').evaluate(e=>getComputedStyle(e).visibility)).toBe('visible');
  const before=await page.locator('h1').boundingBox();
  await page.screenshot({path:`output/playwright/f11/pending-${width}.png`});
  release();
  await expect(page.getByTestId('decision-total')).toContainText('$1,195');
  await expect(page.getByTestId('pricing-pending')).toHaveCount(0);
  const after=await page.locator('h1').boundingBox();
  expect(after!.y).toBeCloseTo(before!.y,0);
  expect(await page.evaluate(()=>(window as ShiftWindow).pendingFooter===document.querySelector('footer'))).toBe(true);
  const shifts=await page.evaluate(()=>(window as ShiftWindow).pricingShifts.reduce((a,b)=>a+b,0));
  expect(shifts).toBeLessThan(.1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth)).toBe(false);
  await page.screenshot({path:`output/playwright/f11/ready-${width}.png`});
});

test('catalogue fetch starts while the page chunk is still loading',async({page})=>{
  let started=false,release!:()=>void;
  const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/src/pages/PricingOverview.tsx*',async route=>{await pending;await route.continue();});
  await page.route('**/api/pricing/catalog/active*',async route=>{started=true;await route.fulfill({json:fixture});});
  await page.goto('/',{waitUntil:'domcontentloaded'});
  await expect(page.getByTestId('pricing-pending')).toBeVisible();
  await expect.poll(()=>started).toBe(true);
  release();
  await expect(page.getByTestId('decision-total')).toContainText('$1,195');
});

test('a catalogue failure blocks all prices and retry recovers',async({page})=>{
  let calls=0;
  await page.route('**/api/pricing/catalog/active*',route=>++calls===1?route.fulfill({status:503,body:'unavailable'}):route.fulfill({json:fixture}));
  await page.goto('/');
  await expect(page.getByRole('heading',{name:'Pricing is temporarily unavailable'})).toBeVisible();
  await expect(page.getByTestId('decision-total')).toHaveCount(0);
  await page.getByRole('button',{name:'Try again',exact:true}).click();
  await expect(page.getByTestId('decision-total')).toContainText('$1,195');
});

test('a delayed simulator preserves the incoming quote, language and attribution',async({page})=>{
  const intent:PricingIntent={v:2,layer:'core',corePackage:'core_growth',locations:7,addOns:[],crewSkus:[],watchtowerModules:[],crossIntelligence:'none',billingCycle:'annual_quarterly',operatingModels:[],employees:null,payrollCountry:''};
  let release!:()=>void;const pending=new Promise<void>(resolve=>{release=resolve;});
  await page.route('**/api/pricing/catalog/active*',async route=>{await pending;await route.fulfill({json:fixture});});
  await page.goto(`/simulator/?lang=ar&cfg=${encodePricingIntent(intent)}&utm_source=f11_review`);
  await expect(page.getByTestId('pricing-pending')).toBeVisible();
  await expect(page.getByTestId('basket-total')).toHaveCount(0);
  release();
  await expect(page.getByTestId('basket-total')).toContainText('3,310.75');
  await expect(page.locator('html')).toHaveAttribute('dir','rtl');
  expect(new URL(page.url()).searchParams.get('lang')).toBe('ar');
  expect(new URL(page.url()).searchParams.get('utm_source')).toBe('f11_review');
});
