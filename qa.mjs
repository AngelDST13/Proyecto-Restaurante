 export default async function run(page, ui) {
  const out = {};
  await page.setViewportSize({ width: 1600, height: 1000 });
  await page.goto('http://localhost:5199/', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('#cacique-app-root', { timeout: 15000 });
  await page.waitForTimeout(1200);

  out.title = await page.title();

  // Navbar: solo navegacion + branding.
  out.navbar = await page.evaluate(() => {
    const header = document.querySelector('header');
    const labels = Array.from(header.querySelectorAll('button, a, select')).map((el) =>
      (el.getAttribute('aria-label') || el.textContent || el.tagName).trim().slice(0, 40),
    );
    return {
      labels,
      hasSelect: Boolean(header.querySelector('select')),
      logoSrc: document.querySelector('.cacique-logo')?.getAttribute('src'),
      logoFilter: getComputedStyle(document.querySelector('.cacique-logo')).filter,
    };
  });

  // Dock flotante.
  const snap = await ui.snapshot();
  out.dock = { hasTrigger: snap.includes('Abrir accesibilidad') };

  const dockRef = snap.match(/@(e\d+) button "Abrir accesibilidad"/)?.[1];
  if (dockRef) {
    await ui.click(dockRef);
    await page.waitForTimeout(500);
    out.dock.tabs = await page.$$eval('[role="tab"]', (els) => els.map((e) => e.textContent.trim()));
    out.dock.whatsapp = await page.evaluate(() => {
      const wa = document.querySelector('[data-testid="whatsapp-float"]');
      const dockBtn = document.querySelector('button[aria-controls="accessibility-panel"]');
      const wr = wa?.getBoundingClientRect();
      const dr = dockBtn?.getBoundingClientRect();
      return {
        exists: Boolean(wa),
        size: wr ? `${Math.round(wr.width)}x${Math.round(wr.height)}` : null,
        overlapsDock: wr && dr ? !(wr.right < dr.left || wr.left > dr.right || wr.bottom < dr.top || wr.top > dr.bottom) : null,
        color: wa ? getComputedStyle(wa).backgroundColor : null,
      };
    });
    await page.screenshot({ path: 'qa-dock.png' });

    // Pestana Vision: contraste del selector.
    const tabs = await page.$$('[role="tab"]');
    for (const tab of tabs) {
      const label = await tab.textContent();
      if (label.trim() === 'Visión') {
        await tab.click();
        await page.waitForTimeout(300);
      }
    }
    out.select = await page.evaluate(() => {
      const sel = document.querySelector('select.cacique-select');
      const opt = sel?.querySelector('option');
      return {
        bg: sel ? getComputedStyle(sel).backgroundColor : null,
        color: sel ? getComputedStyle(sel).color : null,
        optionBg: opt ? getComputedStyle(opt).backgroundColor : null,
        optionColor: opt ? getComputedStyle(opt).color : null,
        options: sel?.options.length,
      };
    });
    await page.screenshot({ path: 'qa-vision.png' });

    // Pestana Tema -> modo claro.
    for (const tab of await page.$$('[role="tab"]')) {
      if ((await tab.textContent()).trim() === 'Tema') {
        await tab.click();
        await page.waitForTimeout(300);
      }
    }
    const themeBtn = await page.$('#accessibility-panel button[aria-label="Activar modo claro"]');
    if (themeBtn) await themeBtn.click();
    await page.waitForTimeout(1200);

    out.light = await page.evaluate(() => ({
      cls: document.documentElement.className,
      canvas: getComputedStyle(document.documentElement).getPropertyValue('--cacique-canvas').trim(),
      card: getComputedStyle(document.documentElement).getPropertyValue('--cacique-card').trim(),
      body: getComputedStyle(document.body).backgroundColor,
      logoFilter: getComputedStyle(document.querySelector('.cacique-logo')).filter,
    }));
    await page.screenshot({ path: 'qa-light-gourmet.png' });
  }

  for (const width of [375, 768, 1440, 2560]) {
    await page.setViewportSize({ width, height: 900 });
    await page.waitForTimeout(250);
    out[`overflow_${width}`] = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
  }

  return out;
}