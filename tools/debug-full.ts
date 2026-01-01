import { chromium } from 'playwright';

async function debug() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Capture console errors
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('Navigating to http://localhost:3000...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);

  // Take screenshot
  await page.screenshot({ path: 'tools/debug-full.png', fullPage: true });
  console.log('Screenshot saved to tools/debug-full.png');

  // Check for FloatingAuth
  const floatingAuthByClass = await page.$('[style*="position: fixed"]');
  const floatingAuthByZIndex = await page.$('[style*="z-index: 9999"]');

  console.log('\n--- Debug Info ---');
  console.log('FloatingAuth by fixed position:', !!floatingAuthByClass);
  console.log('FloatingAuth by z-index:', !!floatingAuthByZIndex);

  // Get all fixed position elements
  const fixedElements = await page.evaluate(() => {
    const all = document.querySelectorAll('*');
    const fixed: string[] = [];
    all.forEach(el => {
      const style = window.getComputedStyle(el);
      if (style.position === 'fixed') {
        fixed.push(`${el.tagName}.${el.className} - ${el.innerHTML.slice(0, 100)}`);
      }
    });
    return fixed;
  });

  console.log('\nFixed position elements:');
  fixedElements.forEach(el => console.log(' -', el));

  // Check body children
  const bodyChildren = await page.evaluate(() => {
    const body = document.body;
    return Array.from(body.children).map(child => {
      return `${child.tagName}#${child.id}.${child.className}`;
    });
  });

  console.log('\nBody children:');
  bodyChildren.forEach(child => console.log(' -', child));

  // Get page HTML structure
  const htmlStructure = await page.evaluate(() => {
    return document.body.innerHTML.slice(0, 2000);
  });

  console.log('\nFirst 2000 chars of body HTML:');
  console.log(htmlStructure);

  // Console errors
  if (consoleErrors.length > 0) {
    console.log('\nConsole errors:');
    consoleErrors.forEach(err => console.log(' -', err));
  } else {
    console.log('\nNo console errors');
  }

  await browser.close();
}

debug().catch(console.error);
