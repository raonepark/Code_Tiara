const path = require('path');

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
        "package.json",
        "assets/**/*"
    ],
    asar: true,
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
    }
};
