import { chromium } from 'playwright';

async function takeScreenshot() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  await page.goto('http://localhost:3000');
  await page.waitForTimeout(2000); // Wait for page to fully load

  await page.screenshot({ path: 'tools/screenshot-main.png', fullPage: true });
  console.log('Screenshot saved to tools/screenshot-main.png');

  // Also check if FloatingAuth element exists
  const floatingAuth = await page.$('.fixed.top-4.right-4');
  console.log('FloatingAuth element found:', !!floatingAuth);

  // Check what's in the top-right area
  const topRightContent = await page.evaluate(() => {
    const el = document.querySelector('.fixed.top-4.right-4');
    return el ? el.innerHTML : 'Element not found';
  });
  console.log('Top-right content:', topRightContent);

  await browser.close();
}

takeScreenshot().catch(console.error);
