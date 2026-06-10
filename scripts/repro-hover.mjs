// Diagnostic: reproduce the date-picker hover flow with REAL hit-tested
// mouse input via CDP against the running dev server on localhost:4200.
import puppeteer from 'puppeteer-core';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: true,
  args: ['--window-size=1400,1000'],
});

try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1400, height: 1000 });
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.log('PAGE ERROR:', msg.text());
  });
  await page.goto('http://localhost:4200', { waitUntil: 'networkidle0' });

  // 1. Switch to Search tab
  await page.evaluate(() => {
    const tabs = [...document.querySelectorAll('.tab')];
    const search = tabs.find((t) => t.textContent.trim().toLowerCase().includes('search'));
    if (!search) throw new Error('Search tab not found: ' + tabs.map((t) => t.textContent.trim()).join(','));
    search.click();
  });
  await new Promise((r) => setTimeout(r, 300));

  // 2. Expand Itinerary Details
  await page.evaluate(() => {
    const headers = [...document.querySelectorAll('.section-header')];
    const itin = headers.find((h) => h.textContent.includes('Itinerary Details'));
    if (!itin) throw new Error('Itinerary section not found');
    itin.click();
  });
  await new Promise((r) => setTimeout(r, 500)); // wait for expand animation

  // 3. REAL click on the trigger (coordinates, hit-tested)
  const trigger = await page.$('.drp-trigger');
  if (!trigger) throw new Error('trigger not found');
  await trigger.scrollIntoView();
  const tb = await trigger.boundingBox();
  await page.mouse.click(tb.x + tb.width / 2, tb.y + tb.height / 2);
  await new Promise((r) => setTimeout(r, 300));

  const panelOpen = await page.$('.drp-panel');
  console.log('STEP 1 - picker open after real click:', !!panelOpen);
  if (!panelOpen) throw new Error('picker did not open');

  // Helper: center of nth non-empty day button in the LEFT month
  async function dayBox(n) {
    return page.evaluate((i) => {
      const days = [...document.querySelectorAll('.drp-day:not(.empty)')];
      const r = days[i].getBoundingClientRect();
      return { x: r.x + r.width / 2, y: r.y + r.height / 2, label: days[i].getAttribute('aria-label') };
    }, n);
  }

  // 4. REAL click on a start date
  const start = await dayBox(10);
  await page.mouse.click(start.x, start.y);
  await new Promise((r) => setTimeout(r, 200));
  const afterStart = await page.evaluate(() => ({
    panelOpen: !!document.querySelector('.drp-panel'),
    startMarked: !!document.querySelector('.drp-day.start'),
  }));
  console.log(`STEP 2 - real click on "${start.label}":`, JSON.stringify(afterStart));

  // 5. REAL mouse movement across cells toward an end date (many steps = real mousemove/enter)
  const mid = await dayBox(13);
  const end = await dayBox(16);
  await page.mouse.move(start.x, start.y);
  await page.mouse.move(mid.x, mid.y, { steps: 15 });
  await new Promise((r) => setTimeout(r, 150));
  const hoverMid = await page.evaluate(() => ({
    hoverEnd: document.querySelectorAll('.drp-day.hover-end').length,
    hoverRange: document.querySelectorAll('.drp-day.hover-range').length,
    nightsTip: !!document.querySelector('.nights-tip'),
    tipText: document.querySelector('.nights-tip')?.textContent?.trim() ?? null,
  }));
  console.log(`STEP 3 - real hover over "${mid.label}":`, JSON.stringify(hoverMid));

  await page.mouse.move(end.x, end.y, { steps: 15 });
  await new Promise((r) => setTimeout(r, 150));
  const hoverEnd = await page.evaluate(() => ({
    hoverEnd: document.querySelectorAll('.drp-day.hover-end').length,
    hoverRange: document.querySelectorAll('.drp-day.hover-range').length,
    nightsTip: !!document.querySelector('.nights-tip'),
    tipText: document.querySelector('.nights-tip')?.textContent?.trim() ?? null,
  }));
  console.log(`STEP 4 - real hover over "${end.label}":`, JSON.stringify(hoverEnd));

  // 6. REAL click on the end date, then Apply
  await page.mouse.click(end.x, end.y);
  await new Promise((r) => setTimeout(r, 200));
  const afterEnd = await page.evaluate(() => ({
    endMarked: !!document.querySelector('.drp-day.end'),
    inRange: document.querySelectorAll('.drp-day.in-range').length,
    applyEnabled: !document.querySelector('.drp-btn-apply')?.disabled,
  }));
  console.log(`STEP 5 - real click on "${end.label}":`, JSON.stringify(afterEnd));

  console.log('\nVERDICT:', hoverMid.hoverEnd > 0 || hoverEnd.hoverEnd > 0
    ? 'HOVER WORKS with real pointer input — could not reproduce'
    : 'HOVER BROKEN with real pointer input — REPRODUCED');
} finally {
  await browser.close();
}
