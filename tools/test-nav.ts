import { chromium } from 'playwright';

async function test() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('Navigating to homepage...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // Find and click the Get Started link
  const getStarted = await page.locator('a[href="/signup"]').first();
  const isVisible = await getStarted.isVisible();
  console.log('Get Started link visible:', isVisible);

  if (isVisible) {
    console.log('Clicking Get Started...');
    await getStarted.click();

    // Wait for navigation to complete
    await page.waitForURL('**/signup', { timeout: 15000 }).catch(() => {
      console.log('URL did not change to /signup');
    });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    console.log('Current URL:', page.url());
    await page.screenshot({ path: 'tools/signup-page.png' });
    console.log('Screenshot saved: signup-page.png');
  }

  await browser.close();
}

test().catch(console.error);
