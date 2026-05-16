/**
 * Capture les écrans de l'app déployée en versions desktop + mobile.
 * Utilisé pour générer les maquettes (livrable jury : 3 desktop + 3 mobile).
 *
 * Usage : node capture.js
 */
import puppeteer from 'puppeteer';
import { mkdir } from 'node:fs/promises';

const APP = 'https://vite-et-gourmand-drab.vercel.app';

const pages = [
  { path: '/', name: '01-home', desc: 'Accueil — hero éditorial' },
  { path: '/menus', name: '02-menus', desc: 'Liste menus + filtres dynamiques' },
  { path: '/menus/1', name: '03-menu-detail', desc: 'Détail menu Bordelais d\'Été' },
  { path: '/auth/login', name: '04-login', desc: 'Connexion' },
  { path: '/auth/signup', name: '05-signup', desc: 'Inscription + politique MDP' },
  { path: '/contact', name: '06-contact', desc: 'Contact' },
];

const viewports = [
  { name: 'desktop', w: 1440, h: 900, scale: 2 },
  { name: 'mobile', w: 390, h: 844, scale: 3 },
];

async function main() {
  await mkdir('./out', { recursive: true });
  const browser = await puppeteer.launch({ headless: 'new' });

  for (const vp of viewports) {
    const page = await browser.newPage();
    await page.setViewport({ width: vp.w, height: vp.h, deviceScaleFactor: vp.scale });

    for (const p of pages) {
      console.log(`📸 ${vp.name} → ${p.path}`);
      await page.goto(`${APP}${p.path}`, { waitUntil: 'networkidle2', timeout: 45000 });
      // Attendre que les images chargent et l'API réponde
      await new Promise((r) => setTimeout(r, 4500));
      // Scroller pour déclencher les animations whileInView puis revenir en haut
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await new Promise((r) => setTimeout(r, 800));
      await page.evaluate(() => window.scrollTo(0, 0));
      await new Promise((r) => setTimeout(r, 800));
      await page.screenshot({
        path: `./out/${vp.name}-${p.name}.png`,
        fullPage: true,
      });
    }
    await page.close();
  }

  await browser.close();
  console.log('✅ Captures générées dans ./out/');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
