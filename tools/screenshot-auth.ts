import { chromium } from 'playwright';

async function screenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  // Login page
  console.log('Taking login page screenshot...');
  await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/login-redesign.png' });
  console.log('Saved: tools/login-redesign.png');

  // Signup page
  console.log('Taking signup page screenshot...');
  await page.goto('http://localhost:3000/signup', { waitUntil: 'networkidle' });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: 'tools/signup-redesign.png' });
  console.log('Saved: tools/signup-redesign.png');

  console.log('Done!');
  await browser.close();
}

screenshots().catch(console.error);
