// Visual + behavioral verification of the small-viewport responsive pass.
// Real hit-tested pointer input (per project memory on synthetic clicks).
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const URL = 'http://localhost:4200';
const OUT = '/tmp';

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const log = (label, v) => console.log(label.padEnd(38), JSON.stringify(v));
let failures = 0;
const check = (name, cond) => { if (!cond) { failures++; console.log('  ✗ FAIL:', name); } else { console.log('  ✓', name); } };

try {
  // ---------- MOBILE 375px ----------
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812 });
  page.on('console', (m) => { if (m.type() === 'error') console.log('PAGE ERROR:', m.text()); });
  await page.goto(URL, { waitUntil: 'networkidle0' });

  console.log('\n=== MOBILE 375px — header collapsed ===');
  const headerState = await page.evaluate(() => {
    const disp = (s) => { const el = document.querySelector(s); return el ? getComputedStyle(el).display : 'MISSING'; };
    return {
      hamburgerDisplay: disp('.header-hamburger'),
      navDisplay: disp('.header-nav'),
      titleDisplay: disp('.app-title'),
      tabsJustify: getComputedStyle(document.querySelector('.tab-bar')).justifyContent,
      actionDir: getComputedStyle(document.querySelector('.save-action-bar')).flexDirection,
    };
  });
  log('header/tab/action state', headerState);
  check('hamburger visible', headerState.hamburgerDisplay === 'inline-flex');
  check('nav hidden', headerState.navDisplay === 'none');
  check('title visible', headerState.titleDisplay !== 'none' && headerState.titleDisplay !== 'MISSING');
  check('tabs centered', headerState.tabsJustify === 'center');
  check('action bar column', headerState.actionDir === 'column');

  const btnW = await page.evaluate(() => {
    const b = document.querySelector('.btn-save-url');
    const bar = document.querySelector('.save-action-bar');
    const r = b.getBoundingClientRect();
    return { btnWidth: Math.round(r.width), barInner: Math.round(bar.clientWidth - 32), height: Math.round(r.height) };
  });
  log('save button box', btnW);
  check('save button ~full width', Math.abs(btnW.btnWidth - btnW.barInner) <= 2);
  check('save button 48px tall', btnW.height === 48);
  await page.screenshot({ path: `${OUT}/resp-1-mobile-header.png` });

  console.log('\n=== MOBILE — open hamburger menu (real click) ===');
  const ham = await (await page.$('.header-hamburger')).boundingBox();
  await page.mouse.click(ham.x + ham.width / 2, ham.y + ham.height / 2);
  await new Promise((r) => setTimeout(r, 350));
  const sheet = await page.evaluate(() => {
    const s = document.querySelector('.menu-sheet');
    const items = [...document.querySelectorAll('.menu-sheet-item')].map((b) => b.textContent.trim());
    const bd = document.querySelector('.menu-sheet-backdrop');
    const r = s ? s.getBoundingClientRect() : null;
    return {
      sheetPresent: !!s, items,
      handlePresent: !!document.querySelector('.menu-sheet-handle'),
      bottomAnchored: r ? Math.round(r.bottom) === window.innerHeight : null,
      fullWidth: r ? Math.round(r.width) === window.innerWidth : null,
      backdropDisplay: bd ? getComputedStyle(bd).display : 'MISSING',
    };
  });
  log('menu sheet', sheet);
  check('sheet present', sheet.sheetPresent);
  check('four items', sheet.items.length === 4 && sheet.items.join(',') === 'Saved,History,Field Guide,Templates');
  check('grab-handle present', sheet.handlePresent);
  check('sheet bottom-anchored', sheet.bottomAnchored === true);
  check('sheet full width', sheet.fullWidth === true);
  await page.screenshot({ path: `${OUT}/resp-2-mobile-menu.png` });

  console.log('\n=== MOBILE — tap "Saved": sheet closes, drawer opens as bottom sheet ===');
  const savedItem = await page.evaluate(() => {
    const b = [...document.querySelectorAll('.menu-sheet-item')].find((x) => x.textContent.trim() === 'Saved');
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.click(savedItem.x, savedItem.y);
  await new Promise((r) => setTimeout(r, 400));
  const drawer = await page.evaluate(() => {
    const d = document.querySelector('.drawer');
    const r = d ? d.getBoundingClientRect() : null;
    const cs = d ? getComputedStyle(d) : null;
    return {
      menuSheetClosed: !document.querySelector('.menu-sheet'),
      drawerOpen: !!d,
      bottomAnchored: r ? Math.round(r.bottom) === window.innerHeight : null,
      fullWidth: r ? Math.round(r.width) === window.innerWidth : null,
      maxHeightLeqViewport: r ? r.height <= window.innerHeight * 0.85 + 1 : null,
      topRadius: cs ? cs.borderTopLeftRadius : null,
      hasSavedTab: !!document.querySelector('.drawer-tab.active'),
    };
  });
  log('drawer (bottom sheet)', drawer);
  check('menu sheet closed', drawer.menuSheetClosed);
  check('drawer opened', drawer.drawerOpen);
  check('drawer bottom-anchored', drawer.bottomAnchored === true);
  check('drawer full width', drawer.fullWidth === true);
  check('drawer max-height <= 85vh', drawer.maxHeightLeqViewport === true);
  check('drawer rounded top (16px)', drawer.topRadius === '16px');
  await page.screenshot({ path: `${OUT}/resp-3-mobile-drawer.png` });

  // ---------- DESKTOP 1280px ----------
  console.log('\n=== DESKTOP 1280px — unchanged ===');
  const page2 = await browser.newPage();
  await page2.setViewport({ width: 1280, height: 800 });
  await page2.goto(URL, { waitUntil: 'networkidle0' });
  const desk = await page2.evaluate(() => {
    const disp = (s) => { const el = document.querySelector(s); return el ? getComputedStyle(el).display : 'MISSING'; };
    return {
      hamburgerDisplay: disp('.header-hamburger'),
      navDisplay: disp('.header-nav'),
      navButtons: document.querySelectorAll('.header-nav .nav-btn').length,
      tabsJustify: getComputedStyle(document.querySelector('.tab-bar')).justifyContent,
      actionDir: getComputedStyle(document.querySelector('.save-action-bar')).flexDirection,
    };
  });
  log('desktop state', desk);
  check('hamburger hidden', desk.hamburgerDisplay === 'none');
  check('nav visible', desk.navDisplay === 'flex');
  check('four nav buttons', desk.navButtons === 4);
  check('tabs not centered', desk.tabsJustify !== 'center');
  check('action bar row', desk.actionDir === 'row');
  await page2.screenshot({ path: `${OUT}/resp-4-desktop.png` });

  console.log(`\n==== ${failures === 0 ? 'ALL CHECKS PASSED' : failures + ' CHECK(S) FAILED'} ====`);
} finally {
  await browser.close();
}
