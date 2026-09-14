# Code Tiara 👑

개발자를 위한 작은 생산성 대시보드 — 카테고리별 할 일, 포모도로 타이머, 항상 위에 떠 있는 팝아웃 메모 창.
Windows · macOS 데스크톱 앱(Electron)이며, Firebase 로그인으로 기기 간 동기화됩니다.

## 기술 스택

- **UI**: React 19, Tailwind CSS, lucide-react, @hello-pangea/dnd, i18next (한국어/English)
- **데스크톱**: Electron 33 (frameless / transparent 창, 트레이 아이콘, 팝아웃 창)
- **백엔드**: Firebase Auth (Google · 이메일), Cloud Firestore
- **빌드**: react-scripts(CRA) + electron-builder

## 시작하기

```bash
npm install
cp .env.example .env      # Firebase 콘솔 값으로 채우기
npm run electron:dev      # CRA dev server(3000) + Electron 동시 실행
```

패키징:

```bash
npm run electron:build:mac   # dist/ 에 .dmg / .zip
npm run electron:build:win   # dist/ 에 NSIS 설치 파일
```

패키징 없이 프로덕션 로더(build/ 폴더 + http 인터셉트)를 확인하려면:

```bash
npm run build
CODE_TIARA_ENV=production npx electron .
```

## 구조

```
public/main.js       Electron 메인 프로세스 (창, 트레이, IPC 핸들러, 프로덕션 로더)
public/preload.js    렌더러에 노출되는 유일한 브리지 (window.electron) — 채널 allow-list
src/App.js           메인 React 컴포넌트
src/components/      TitleBar · TaskItem · SettingsPanel · AuthScreen · Onboarding …
src/firebase/        Firebase 초기화 및 re-export
src/constants/       테마 설정
src/locales/         ko.json · en.json
firestore.rules      Firestore 보안 규칙 (users/{uid} 하위만 본인이 읽기/쓰기)
tiara.setup.js       electron-builder 설정
```

### 렌더러 ↔ 메인 프로세스

렌더러는 `contextIsolation: true`, `nodeIntegration: false`로 실행됩니다. Node/Electron API에 직접 접근할 수 없고,
`public/preload.js`가 `window.electron`으로 노출한 allow-list 채널만 사용할 수 있습니다.

```js
window.electron.ipcRenderer.send('open-popout', 'timer');
const off = window.electron.ipcRenderer.on('popout-closed', (event, id) => { ... });
off(); // 구독 해제
window.electron.shell.openExternal('https://…');  // http(s)만 허용
window.electron.platform; // 'darwin' | 'win32' | …
```

새 IPC 채널을 추가할 때는 `main.js`의 핸들러와 `preload.js`의 allow-list 둘 다 갱신해야 합니다.

### 프로덕션 origin

Firebase Auth의 팝업 로그인은 `file://` origin에서 동작하지 않기 때문에, 패키징된 앱은
`http://127.0.0.1:51283` origin에서 실행됩니다. 실제 포트를 여는 대신 Electron 안에서 `http` 스킴을
인터셉트해 `build/` 폴더를 서빙하므로 포트 충돌이 없고 origin이 항상 동일합니다.
(localStorage / IndexedDB가 origin에 묶여 있으므로 이 값은 바꾸면 안 됩니다.)

## Firestore 규칙

`firestore.rules`를 Firebase 콘솔(Firestore Database → Rules)에 붙여 넣거나 CLI로 배포합니다:

```bash
firebase deploy --only firestore:rules
```

## 라이선스

Private — © Lumora
