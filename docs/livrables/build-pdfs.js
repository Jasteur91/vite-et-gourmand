import puppeteer from 'puppeteer';
import { readdir } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function htmlToPdf(browser, htmlPath, pdfPath) {
  const page = await browser.newPage();
  const url = pathToFileURL(htmlPath).href;
  await page.goto(url, { waitUntil: 'networkidle0' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  await page.close();
}

async function main() {
  const files = (await readdir(__dirname))
    .filter((f) => f.endsWith('.html'));

  const browser = await puppeteer.launch({ headless: 'new' });
  for (const f of files) {
    const html = join(__dirname, f);
    const pdf = join(__dirname, basename(f, '.html') + '.pdf');
    console.log(`📄 ${f} → ${basename(pdf)}`);
    await htmlToPdf(browser, html, pdf);
  }
  await browser.close();
  console.log('✅ Tous les PDFs générés.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
