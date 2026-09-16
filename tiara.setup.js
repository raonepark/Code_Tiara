const path = require('path');
const { execFileSync } = require('child_process');

// Electron 42+ shows macOS notifications only from a code-signed bundle (UNNotification).
// Without a Developer ID, electron-builder ad-hoc signs arm64 (macOS refuses to run
// unsigned arm64 apps) but leaves x64 unsigned — so Intel users would silently lose
// notifications. Ad-hoc sign every mac build ourselves; a real identity still wins later.
async function adHocSignMac(context) {
    if (context.electronPlatformName !== 'darwin') return;
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
        "package.json",
        "assets/**/*"
    ],
    asar: true,
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
        artifactName: "${productName} Setup ${version}.${ext}",
        createDesktopShortcut: true,
        createStartMenuShortcut: true,
        shortcutName: "Code Tiara"
    },
    mac: {
        target: [
            {
                target: "default",
                arch: ["x64", "arm64"]
            }
        ],
        icon: "assets/icons/icon.icns",
        category: "public.app-category.productivity",
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
        artifactName: "${productName}-${version}-${arch}.${ext}" // x64 and arm64 DMGs used to share one name and overwrite each other
    }
};
