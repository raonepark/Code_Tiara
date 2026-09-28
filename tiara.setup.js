const path = require('path');
const { execFileSync } = require('child_process');

// Electron 42+ shows macOS notifications only from a code-signed bundle (UNNotification).
// Without a Developer ID, electron-builder ad-hoc signs arm64 (macOS refuses to run
// unsigned arm64 apps) but leaves x64 unsigned — so Intel users would silently lose
// notifications. Ad-hoc sign every mac build ourselves; a real identity still wins later.
async function adHocSignMac(context) {
    if (context.electronPlatformName !== 'darwin') return;
    // A universal build first packs x64 and arm64 into "*-x64-temp" / "*-arm64-temp" and then
    // merges them. Signing those intermediates (--deep rewrites each framework's CodeResources)
    // makes the non-binary files differ per arch and @electron/universal refuses to merge.
    // Sign only the final merged app.
    if (/-(x64|arm64)-temp$/.test(context.appOutDir)) return;
    const appPath = path.join(context.appOutDir, `${context.packager.appInfo.productFilename}.app`);
    execFileSync('codesign', ['--force', '--deep', '--sign', '-', appPath], { stdio: 'inherit' });
    console.log(`  • ad-hoc signed ${appPath}`);
}

module.exports = {
    appId: "com.lumora.codetiara",
    productName: "Code Tiara",
    extends: null,
    directories: {
        output: "dist"
    },
    files: [
        "build/**/*",
        "public/main.js",
        "public/preload.js",
        "public/updater.js",
        "package.json",
        "assets/**/*"
    ],
    asar: true,
    // Auto-update feed (AGENTS rule 12). One GitHub release per version, tag v<version>.
    // electron-builder only uploads with `--publish always` (GH_TOKEN from `gh auth token`),
    // and always as a DRAFT — nothing reaches users until the release is published by hand.
    publish: {
        provider: "github",
        owner: "raonepark",
        repo: "Code_Tiara",
        releaseType: "draft"
    },
    afterPack: adHocSignMac,
    win: {
        target: [
            {
                target: "nsis",
                arch: ["x64"]
            }
        ],
        icon: "assets/icon.ico"
    },
    nsis: {
        oneClick: true,
        include: "installer.nsh",
        allowToChangeInstallationDirectory: false,
        installerIcon: "assets/icon.ico",
        uninstallerIcon: "assets/icon.ico",
        artifactName: "Code-Tiara-Setup-${version}.${ext}", // no spaces: GitHub renames them, breaking latest.yml URLs
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: "Code Tiara"
    },
    mac: {
        // One Universal DMG (x64 + arm64 slices) instead of two per-chip files: the download page
        // has a single Mac button and Safari hides the CPU type, so users cannot be routed by chip.
        // No native modules → both slices share one app.asar; @electron/universal merges them.
        target: [
            {
                target: "default",
                arch: ["universal"]
            }
        ],
        icon: "assets/icons/icon.icns",
        category: "public.app-category.productivity",
        artifactName: "Code-Tiara-${version}-${arch}-mac.${ext}", // the zip electron-updater reads via latest-mac.yml
        hardenedRuntime: true,
        gatekeeperAssess: false
    },
    dmg: {
        contents: [
            {
                x: 130,
                y: 220
            },
            {
                x: 410,
                y: 220,
                type: "link",
                path: "/Applications"
            }
        ],
        artifactName: "Code-Tiara-${version}-${arch}.${ext}" // no spaces (see nsis.artifactName)
    }
};
