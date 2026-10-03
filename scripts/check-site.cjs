// Run with Node.js. Add --browser when Playwright is available.
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
const site = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]));
let checked = 0;
function checkReference(reference, base) {
  if (/^(?:https?:|mailto:|tel:|data:)/.test(reference)) return;
  if (reference.startsWith('#')) {
    assert(ids.has(reference.slice(1)), `Missing anchor: ${reference}`);
    return;
  }
  const file = path.resolve(base, reference.split(/[?#]/)[0]);
  assert(file.startsWith(site + path.sep), `Path outside site: ${reference}`);
  assert(fs.existsSync(file), `Missing asset: ${reference}`);
  // Windows tolerates case differences; GitHub Pages does not.
  let parent = site;
  for (const part of path.relative(site, file).split(path.sep)) {
    assert(fs.readdirSync(parent).includes(part), `Incorrect filename case: ${reference}`);
    parent = path.join(parent, part);
  }
  checked++;
}
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) checkReference(match[1], site);
const cssDir = path.join(site, 'assets/css');
for (const name of fs.readdirSync(cssDir)) {
  const css = fs.readFileSync(path.join(cssDir, name), 'utf8');
  for (const match of css.matchAll(/url\(['"]?([^)'"\s]+)['"]?\)/g)) checkReference(match[1], cssDir);
}
console.log(`Passed: ${checked} local asset references and all internal anchors, including filename case.`);

async function browserCheck() {
  const { chromium } = require('playwright');
  const types = { '.html':'text/html', '.css':'text/css', '.js':'text/javascript', '.svg':'image/svg+xml', '.png':'image/png' };
  const server = http.createServer((req, res) => {
    const requestPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = path.resolve(site, '.' + (requestPath === '/' ? '/index.html' : requestPath));
    if (!file.startsWith(site + path.sep) || !fs.existsSync(file) || !fs.statSync(file).isFile()) {
      res.writeHead(404); res.end(); return;
    }
    res.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
    fs.createReadStream(file).pipe(res);
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ channel: 'chrome', headless: true });
    const base = `http://127.0.0.1:${server.address().port}`;
    for (const viewport of [{width:1280,height:900}, {width:390,height:844}]) {
      const page = await browser.newPage({ viewport });
      // Test local loading and font fallbacks without depending on Google Fonts.
      await page.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, route => route.abort());
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('response', response => {
        if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
      });
      await page.goto(base, {waitUntil:'domcontentloaded'});
      await page.waitForFunction(() => [...document.images].every(img => img.complete));
      assert(await page.locator('.bund-scene').evaluate(img => img.complete && img.naturalWidth > 0), 'Background did not load');
      const spriteURL = await page.locator('.sprite').evaluate(el => getComputedStyle(el).backgroundImage.match(/url\("?([^"\)]+)/)[1]);
      assert((await page.request.get(spriteURL)).ok(), 'Sprite did not load');
      assert(await page.locator('.rattle-snake').evaluate(el => el.width > 0 && el.height > 0 && !el.hidden), 'Snake did not initialize');
      assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'Page overflows horizontally');
      await page.screenshot({ path: path.join(require('node:os').tmpdir(), `britny-portfolio-${viewport.width}.png`), timeout: 10000 });
      await page.locator('#motion-toggle').click();
      assert(await page.locator('html').evaluate(el => el.classList.contains('motion-paused')), 'Pause control failed');
      await page.locator('#motion-toggle').click();
      await page.locator('#theme-toggle').click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark');
      await page.locator('[data-filter="award"]').click();
      assert.equal(await page.locator('.project-card:visible').count(), 3);
      await page.locator('[data-filter="all"]').click();
      await page.locator('a[href="#patent"]').click();
      await page.waitForFunction(() => location.hash === '#patent');
      await page.waitForTimeout(700);
      const patentTop = await page.locator('#patent').evaluate(el => el.getBoundingClientRect().top);
      assert(patentTop >= 0 && patentTop < viewport.height, 'Patent scroll failed');
      assert.deepEqual(errors, [], 'Browser errors or missing assets');
      console.log(`Passed browser checks at ${viewport.width}px: images, snake, layout, pause, theme, filters, and patent link.`);
      await page.close();
    }
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
if (process.argv.includes('--browser')) browserCheck().catch(error => { console.error(error); process.exitCode = 1; });
