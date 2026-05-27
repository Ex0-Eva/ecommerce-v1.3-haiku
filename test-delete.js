const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();
  
  console.log('🔷 ไปที่ login...');
  await page.goto('http://localhost:3000/login');
  await page.waitForLoadState('networkidle');
  
  console.log('🔷 กรอก admin@example.com');
  await page.fill('input[type="email"]', 'admin@example.com');
  
  console.log('🔷 กรอก admin123');
  await page.fill('input[type="password"]', 'admin123');
  
  console.log('🔷 กดปุ่ม Login');
  await page.click('button:has-text("Login")');
  
  console.log('⏳ รอโหลด...');
  await page.waitForNavigation();
  await page.waitForLoadState('networkidle');
  
  console.log('🔷 ไปที่ admin/products');
  await page.goto('http://localhost:3000/admin/products');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
  
  console.log('🔷 หาปุ่มลบ...');
  const deleteBtn = await page.locator('button:has-text("ลบถาวร")').first();
  const exists = await deleteBtn.isVisible();
  
  if (exists) {
    console.log('✅ พบปุ่มลบ');
    console.log('🔷 กดปุ่มลบ...');
    await deleteBtn.click();
    
    await page.waitForTimeout(1000);
    
    const dialog = await page.waitForEvent('dialog');
    console.log(`💬 Alert 1: ${dialog.message()}`);
    await dialog.accept();
    
    const dialog2 = await page.waitForEvent('dialog');
    console.log(`💬 Alert 2: ${dialog2.message()}`);
    await dialog2.accept();
    
    console.log('⏳ รอลบเสร็จ...');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    console.log('✅ ลบสำเร็จ!');
  } else {
    console.log('❌ ไม่พบปุ่มลบ');
  }
  
  await browser.close();
})();
