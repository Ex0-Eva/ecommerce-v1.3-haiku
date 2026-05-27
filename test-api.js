const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // ตรวจสอบ network
  let deleteResponse = null;
  page.on('response', response => {
    if (response.url().includes('admin/products') && response.request().method() === 'DELETE') {
      deleteResponse = response;
    }
  });
  
  await page.goto('http://localhost:3000/login');
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Login")');
  await page.waitForNavigation();
  
  await page.goto('http://localhost:3000/admin/products');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  await page.click('button:has-text("ลบถาวร")');
  
  const d1 = await page.waitForEvent('dialog');
  console.log(`💬 ${d1.message()}`);
  await d1.accept();
  
  const d2 = await page.waitForEvent('dialog');
  console.log(`💬 ${d2.message()}`);
  await d2.accept();
  
  await page.waitForTimeout(3000);
  
  if (deleteResponse) {
    const status = deleteResponse.status();
    const body = await deleteResponse.text();
    console.log(`\n📊 DELETE Response:`);
    console.log(`   Status: ${status}`);
    console.log(`   Body: ${body}`);
  }
  
  await browser.close();
})();
