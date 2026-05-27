#!/usr/bin/env node
// Capture the homepage (full-page) with Playwright and generate cropped/resized WebP images with sharp.
// Usage:
//   node scripts/screenshot-homepage.js --url http://localhost:3000 --outDir public/template

const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith('--')) {
      const key = args[i].slice(2);
      const val = args[i + 1] && !args[i + 1].startsWith('--') ? args[i + 1] : true;
      out[key] = val;
      if (val !== true) i++;
    }
  }
  return out;
}

async function run() {
  const argv = parseArgs();
  const url = argv.url || 'http://localhost:3000/';
  const outDir = path.resolve(process.cwd(), argv.outDir || 'public/template');

  fs.mkdirSync(outDir, { recursive: true });

  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  console.log(`Navigating to ${url}`);
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);

  const tmpPng = path.join(outDir, 'homepage-full.png');
  console.log(`Taking full-page screenshot -> ${tmpPng}`);
  await page.screenshot({ path: tmpPng, fullPage: true });

  await browser.close();

  const sizes = [
    { name: 'og', width: 1200, height: 630 },
    { name: 'mid', width: 800, height: 420 },
    { name: 'thumb', width: 400, height: 225 }
  ];

  for (const s of sizes) {
    const outPath = path.join(outDir, `homepage-${s.name}.webp`);
    console.log(`Generating ${s.width}x${s.height} -> ${outPath}`);
    await sharp(tmpPng)
      .resize(s.width, s.height, { fit: 'cover', position: 'center' })
      .webp({ quality: 75 })
      .toFile(outPath);
  }

  // Generate a tiny LQIP (low-quality image placeholder)
  const lqipBuf = await sharp(tmpPng).resize(20).webp({ quality: 20 }).toBuffer();
  const lqipData = `data:image/webp;base64,${lqipBuf.toString('base64')}`;
  const lqipPath = path.join(outDir, 'homepage-lqip.txt');
  fs.writeFileSync(lqipPath, lqipData);
  console.log(`Wrote LQIP to ${lqipPath}`);

  console.log('Cleaning up temporary files...');
  try { fs.unlinkSync(tmpPng); } catch (e) { /* ignore */ }

  console.log('Done. Files written to:', outDir);
}

run().catch(err => {
  console.error('Screenshot script failed:', err);
  process.exit(1);
});
