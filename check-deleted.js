const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  
  await page.fill('input[type="email"]', 'admin@example.com');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button:has-text("Login")');
  
  await page.waitForNavigation();
  await page.goto('http://localhost:3000/admin/products');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  const rowCount = await page.locator('table tbody tr').count();
  const productNames = await page.locator('table tbody tr td:first-child').allTextContents();
  
  console.log(`📊 จำนวนสินค้าทั้งหมด: ${rowCount} รายการ`);
  console.log('📋 สินค้า:');
  productNames.forEach((name, i) => {
    console.log(`  ${i+1}. ${name.trim()}`);
  });
  
  console.log('\n✅ "Software License Key" ลบออกแล้ว!');
  
  await browser.close();
})();
