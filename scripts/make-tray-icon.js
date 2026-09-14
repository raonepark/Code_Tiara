/*
 * Generates the macOS menu-bar (tray) icon from the lucide "Crown" glyph.
 *
 *   npx electron scripts/make-tray-icon.js
 *
 * Output: assets/tray_icon.png (18×18) and assets/tray_icon@2x.png (36×36).
 * Black strokes on a transparent background — a macOS *template* image, so
 * the system recolours it for light/dark menu bars. Rendered 2× oversampled
 * inside a transparent offscreen BrowserWindow, then downscaled.
 *
 * Why lucide Crown: it is the same glyph as the app's UI icons and the app
 * icon, and a 1.5px monoline outline is what macOS menu-bar icons look like.
 */
const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

// lucide "crown" (ISC licence), 24×24 viewBox
const CROWN_PATHS = [
    'M11.562 3.266a.5.5 0 0 1 .876 0L15.39 8.87a1 1 0 0 0 1.516.294L21.183 5.5a.5.5 0 0 1 .798.519l-2.834 10.246a1 1 0 0 1-.956.734H5.81a1 1 0 0 1-.957-.734L2.02 6.02a.5.5 0 0 1 .798-.519l4.276 3.664a1 1 0 0 0 1.516-.294z',
    'M5 21h14'
];

const OUT_DIR = path.join(__dirname, '..', 'assets');
const SIZES = [{ file: 'tray_icon.png', px: 18 }, { file: 'tray_icon@2x.png', px: 36 }];
const OVERSAMPLE = 4; // master is rendered at 72px

function svgHtml(px) {
    // 24-unit viewBox padded by 1 unit each side so the strokes never touch the edge
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="-1 -1 26 26" fill="none" stroke="#000" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${CROWN_PATHS.map(d => `<path d="${d}"/>`).join('')}</svg>`;
    return `data:text/html;charset=utf-8,${encodeURIComponent(`<!doctype html><html><body style="margin:0;background:transparent;overflow:hidden">${svg}</body></html>`)}`;
}

// One oversampled render (4× of the 1× size), then downscale to both sizes.
// (Loading a second data: URL in a fresh window intermittently failed with ERR_FAILED.)
async function renderMaster(px) {
    const win = new BrowserWindow({
        width: px, height: px, show: false, frame: false, transparent: true,
        backgroundColor: '#00000000', useContentSize: true,
        webPreferences: { offscreen: true, sandbox: true }
    });
    await win.loadURL(svgHtml(px));
    await new Promise(r => setTimeout(r, 400)); // let the offscreen frame settle
    const image = await win.webContents.capturePage({ x: 0, y: 0, width: px, height: px });
    win.destroy();
    return image;
}

app.whenReady().then(async () => {
    try {
        const master = await renderMaster(SIZES[0].px * OVERSAMPLE);
        for (const { file, px } of SIZES) {
            const png = master.resize({ width: px, height: px, quality: 'best' }).toPNG();
            fs.writeFileSync(path.join(OUT_DIR, file), png);
            console.log(`wrote assets/${file} (${px}×${px}, ${png.length} bytes)`);
        }
    } catch (err) {
        console.error(err);
        process.exitCode = 1;
    } finally {
        app.quit();
    }
});
