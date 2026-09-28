# AGENTS.md — Code Tiara 작업 규칙 (AI 도구 · 새 기여자용)

이 저장소에서 코드를 고치거나 새 플랫폼(모바일/웹) 버전을 만들 때 먼저 읽는 파일입니다.
디자인·제품 규칙의 본문은 **[docs/design-system.md](docs/design-system.md)** 에 있고, 이 파일은 작업 절차와 절대 규칙만 요약합니다.

## 프로젝트 지도

| 경로 | 역할 |
|---|---|
| `public/main.js` | Electron 메인 프로세스: 창·트레이·IPC 핸들러·프로덕션 로더 |
| `public/preload.js` | 렌더러에 노출되는 **유일한** 브리지 `window.electron` (채널 allow-list) |
| `src/App.js` | 메인 React 컴포넌트 (보드·메뉴·타이머·팝아웃 렌더). 4,500줄 — 분리 예정 |
| `src/components/` | `TaskItem` `SettingsPanel` `AuthScreen` `OnboardingPanel` `CustomTitleBar` `CustomDatePicker` |
| `src/constants/themeConfig.js` | 테마별 Tailwind 토큰. 스타일은 여기서, 컴포넌트는 `theme.*`로 참조 |
| `src/constants.js` | 카테고리 색표, `hexToRgba`, 날짜 유틸 |
| `src/locales/ko.json` `en.json` | 모든 문자열. 두 파일 동시 수정 |
| `assets/` | 아이콘. macOS는 `icon_mac.png`(여백 패딩) → `icons/icon.icns` |
| `public/fonts/` | 번들 웹폰트(Pretendard, Gamja Flower, Gaegu) + `fonts.css` + 라이선스. 규칙은 design-system §4 |
| `scripts/make-tray-icon.js` | macOS 메뉴 바 아이콘 생성 (`npx electron scripts/make-tray-icon.js`) |
| `firestore.rules` | `users/{uid}` 본인만 읽기/쓰기 |
| `docs/design-system.md` | 디자인 시스템 · 결정 로그 |
| `public/updater.js` | 자동 업데이트 (Windows 완전 자동 · macOS 새 버전 안내). 렌더러는 `UpdateNotice.jsx` |
| `src/utils/platform.js` | `isMac` `isWin` `isMobileDevice` — 플랫폼 판정은 여기서만 |
| `src/utils/realtimeSync.js` | Firestore `onSnapshot` 변경을 로컬 상태에 반영하는 순수 함수 (모바일 브랜치) |
| `src/components/AuthBridge.js` | 모바일 셸용 Google 로그인 브리지 페이지 (`?auth_bridge=google`, 모바일 브랜치) |
| `firebase.json` `.firebaserc` | 웹 빌드 호스팅(`code-tiara`), 캐시 정책 (모바일 브랜치) |
| `public/privacy.html` | 개인정보처리방침 (스토어 등록용, ko/en) (모바일 브랜치) |

## 절대 규칙

1. **origin 고정** — 패키징 앱은 `http://127.0.0.1:51283`에서 실행된다. 이 값을 바꾸면 모든 사용자의 로컬 데이터가 사라진다.
2. **렌더러에서 Node 접근 금지** — `window.require`, `process`, `Buffer` 없음. Electron 기능은 `window.electron.*`만. 새 IPC 채널은 `main.js` 핸들러 **와** `preload.js` allow-list 둘 다에 추가.
3. **문자열은 전부 `t()`** — `ko.json` + `en.json` 동시 추가. 기본 데이터(예시 할 일 등)는 키를 저장하고 `displaySampleText()`로 렌더 시 번역. **`t`는 i18n 전용 이름** — 콜백 파라미터로 `t`를 쓰지 않는다(`task`, `item`…). 알림 코드가 `tasks.map(t => t('…'))`로 가려져 알림이 통째로 죽어 있었다. 언어는 설정에서 고르기 전엔 OS 언어, 고르면 `lumora_language`에 기기별 저장 — 저장은 `setUserLanguage()`만 한다 (design-system §10-6).
4. **UI 아이콘은 lucide-react만** — 이모지는 카테고리 아이콘과 문장 끝 말투에만.
5. **Princess가 기본 테마** — fallback은 항상 `'princess'`. 디자인 판단 기준도 Princess.
6. **카드 표면은 기존 Princess 디자인 유지** — 흰 카드 + `hexToRgba(hue, 0.45)` 헤더 밴드 + 테두리 있는 흰 행. 카드 배경에 투명 `rgba`를 쓰지 않는다(팝아웃 창이 투명이라 바탕화면이 비침). "테두리 대신 톤" 시안은 2026-09-14 사용자 검토 후 기각 — `docs/design-system.md` §16 참고.
7. **카드 안에서는 `sm:`/`md:` 같은 창 폭 변형을 쓰지 않는다** — 카테고리 카드가 컨테이너이므로 `[@container(min-width:560px)]:`를 쓴다 (design-system §8).
8. **기기별 상태는 클라우드에 올리지 않는다** — 팝아웃/핀 여부, 창 위치·크기는 `localStorage` / `userData/window-state.json`. Firestore `users/{uid}` 문서에는 데이터와 취향 설정만 (design-system §8).
9. **창 크기는 콘텐츠 + 2×`WINDOW_INSET`(현재 0)** — `main.js`에서 창을 만들거나 크기를 바꿀 때는 `withInset()`을 거치고, IPC로 오가는 width/height는 항상 콘텐츠 크기다. 렌더러는 `window.electron.windowInset`로 카드를 안쪽에 두고 그림자를 여백에 그린다 (design-system §6/§12). 창은 `roundedCorners: false` — OS 둥근 마스크가 카드를 잘라내므로 모서리는 항상 테마 CSS가 정한다. Electron 44부터 macOS·Windows 11·Linux 모두에서 동작한다 (§7-2). 테마별 토큰 표는 design-system §3-3.
10. **디자인 변경은 사용자 확인 후** — 실제 앱 위에 CSS로 2안 이상 얹어 비교하고, 고른 뒤 구현.
11. **macOS 배포는 Universal DMG 하나** (`tiara.setup.js` `arch: ["universal"]`) — 다운로드 페이지 버튼이 하나이고 Safari는 칩 종류를 숨기므로 칩별 파일로 나누지 않는다. 빌드 후 `lipo -info`로 x64·arm64 두 슬라이스, `codesign -dv`로 ad-hoc 서명(알림에 필요)을 확인한다. Intel 슬라이스 실행 확인(`arch -x86_64`)은 macOS가 "Intel 기반 앱 지원 종료" 알림을 띄우므로 사용자에게 미리 알린다.
12. **릴리스 = `raonepark/Code_Tiara`의 버전별 GitHub 릴리스(태그 `v<version>`)** — 자동 업데이트(`public/updater.js`, electron-updater)가 이 저장소의 최신 릴리스에서 `latest.yml`(Windows)·`latest-mac.yml`(macOS)을 읽는다. 태그 하나를 덮어쓰는 방식과 다른 저장소(lumora.tools) 업로드는 하지 않는다 — lumora.tools는 다운로드 **페이지**일 뿐이고 링크만 이 릴리스를 가리킨다. 산출물 이름에 공백 금지(`Code-Tiara-…`, GitHub가 공백을 바꿔 yml의 URL이 깨진다). 절차는 design-system §14-2.

## 모바일 규칙 (웹 빌드 + 네이티브 셸)

모바일은 **같은 React 앱**을 Firebase Hosting에 올리고, 별도 저장소 `Code_Tiara_Mobile`(React Native WebView 셸)이 그 페이지를 감싸는 구조다. 데스크톱(Electron)과 코드베이스가 하나이므로 아래 규칙은 데스크톱을 깨지 않기 위한 것이다. 상세는 design-system §13. (2026-09-26 기준 코드는 `feat/mobile-companion` 브랜치, 아직 `main` 미머지.)

1. **모바일 판정은 `isMobileDevice`(`src/utils/platform.js`) 하나만.** 순서: `window.ReactNativeWebView` 있음 → 모바일 / `?mobile=1` → 모바일 / `window.electron` 있음 → 데스크톱 / 그 외 UA. **창 폭(`isMiniMode`)으로 모바일을 판정하지 않는다.** 데스크톱 브라우저에서 모바일 UI를 보려면 `?mobile=1` + 375×812.
2. **분기는 `isMobile` prop 또는 `isMobileDevice` import로만.** `!isMobile` 경로는 데스크톱 코드를 그대로 둔다. Electron 전용 호출은 기존 `sendIPC` 가드를 유지한다.
3. **웹 → 셸 통신은 `window.ReactNativeWebView.postMessage(JSON.stringify({ type, … }))` 한 방향뿐.** 허용 타입: `THEME_CHANGE {theme}` · `SCHEDULE_REMINDERS {reminders:[{id,title,body,fireAt}]}` · `GOOGLE_SIGN_IN {lang}` · `NOTIFICATION_STATUS` · `TEST_NOTIFICATION {title,body}`. 새 타입은 이 목록과 `Code_Tiara_Mobile` 양쪽에 같은 PR로 추가.
4. **셸 → 웹 콜백은 두 전역뿐.** `window.CodeTiaraNative.{onGoogleCredential(idToken, accessToken), onGoogleCancelled(reason)}` (AuthScreen 마운트 중), `window.CodeTiaraNotify.{onStatus({available,granted,scheduled}), onTestResult({ok,seconds,reason})}` (설정 패널 열림 중). 등록한 컴포넌트가 언마운트 시 `delete`한다. 다른 전역을 만들지 않는다.
5. **Google 로그인**: 셸이 `{WEB_URL}/?auth_bridge=google&return=<딥링크>&hl=ko|en`을 **시스템 브라우저**로 열고, `AuthBridge.js`가 `signInWithRedirect` 결과의 크리덴셜을 `return` 딥링크로 돌려준다. `return`은 `isSafeReturnUrl` 통과 필수. `authDomain`은 `code-tiara.firebaseapp.com` 고정(web.app 핸들러는 등록된 redirect URI가 아님). ⚠️ 미해결: 토큰이 커스텀 스킴 URL로 전달되고 `exp://`·`exps://`가 프로덕션에서도 허용됨 — 머지 전 §13 "열린 이슈" 참고.
6. **실시간 동기화**: 원격 변경은 `onSnapshot` + `applyRemoteChanges`(`src/utils/realtimeSync.js`)로만 반영하고 `prevTasksRef`/`prevCategoriesRef`를 함께 전진시킨다. 기존 저장 경로(localStorage → diff push)는 건드리지 않는다. 팝아웃 창은 구독하지 않는다. `hasPendingWrites` 스냅샷은 무시.
7. **"이미 알림함" 상태는 기기별.** `localStorage['lumora_alerted_local']`(키 `reminderKey(task)`, `src/utils/time.js`)에만 쓰고 `task.alerted`를 Firestore에 쓰지 않는다 (규칙 8의 연장).
8. **네이티브 알림은 셸이 띄운다.** 웹은 `SCHEDULE_REMINDERS`로 앞으로 30일치 전체 목록을 매번 통째로 넘긴다(증분 아님, 800ms 디바운스). 모바일에서 `new Notification`을 직접 부르지 않는다.
9. **모바일 전용 스타일**은 `isMobile` 분기와 `index.css`의 `.mobile-sheet-*`에만. 색은 반드시 `themeConfig` 토큰(`theme.*`) — 컴포넌트에 테마별 hex를 하드코딩하지 않는다.
10. **문자열·아이콘 규칙은 동일** (규칙 3·4). 모바일에서 문구가 달라지면 `*_mobile` 키로 ko/en 동시 추가.
11. **배포**: `npm run deploy:web` (= `npm run build && firebase deploy --only hosting`, 프로젝트 `code-tiara`). 캐시 정책은 `firebase.json`에서만: `/static/**` 1년 immutable, `/`·`/index.html` no-cache. 데스크톱 앱은 이 배포와 무관하다 — 데스크톱 수정은 DMG/exe를 다시 만들어야 반영된다.
12. **스토어 등록**: 개인정보처리방침 `https://code-tiara.web.app/privacy.html`(`public/privacy.html`, ko/en), 계정 삭제 경로는 설정 > 회원탈퇴.
13. **빌드 산출물(`build/`, `main.*.js`, `*.asar`)은 절대 커밋하지 않는다.**

## 로컬 실행 · 검증

```bash
npm install                     # .npmrc의 legacy-peer-deps=true 적용 (react-scripts 5 ↔ typescript 6 피어 충돌 회피)
cp .env.example .env            # Firebase 값 (없으면 게스트 모드만 동작)
npm run electron:dev            # CRA(3000) + Electron
# Electron 42+는 npm install 때 실행 파일을 받지 않는다. 첫 `electron` 실행(위 명령 포함)이 ~120MB를 내려받으니 한 번 기다릴 것.
```

개발 모드(`electron .`)는 userData를 `~/Library/Application Support/Code Tiara (dev)`에 따로 두므로 설치된 앱과 **동시에 실행**할 수 있다. 창이 안 뜨고 바로 종료되면 단일 인스턴스 락에 막힌 것 — 터미널의 `Another Code Tiara instance is already running` 로그를 확인.

**macOS 알림은 개발 모드에서 뜨지 않는다** (Electron 42+의 UNNotification은 서명된 번들 필수 — 서명 없는 `electron .`는 `failed` 이벤트만 남김). 알림 확인은 패키징된 앱으로 (design-system §14-1 7번).

UI만 볼 때는 `BROWSER=none npx react-scripts start` 후 브라우저 340×600으로. `window.electron`이 없어 IPC 기능(팝아웃·창 제어)은 콘솔 에러 한 줄과 함께 무시된다 — 정상.

머지 전 필수:

```bash
npm run build
CODE_TIARA_ENV=production npx electron . --user-data-dir=/tmp/ct-smoke   # 실행 중인 앱과 락 충돌 방지
```

확인 항목: 메인 창 로드 · `window.electron` 존재 / `window.require` 없음 · 팝아웃 열기/닫기 · 창 간 localStorage 동기화 · 렌더러 예외 0 · 3개 테마 눌러보기.

> 테스트용 Electron을 `node_modules/.bin/electron` 래퍼로 띄운 뒤 래퍼만 kill 하면 실제 프로세스가 고아로 남아 EPIPE 다이얼로그를 띄운다. 바이너리(`node_modules/electron/dist/Electron.app/Contents/MacOS/Electron`)를 직접 실행하거나 프로세스 그룹을 종료할 것.

## PR 규칙

- 항목 하나 = 브랜치 하나 = PR 하나. 디자인과 버그 수정을 섞지 않는다.
- UI 변경은 340×600 / 900×650 전·후 스크린샷을 PR에 첨부.
- 규칙이 바뀌면 `docs/design-system.md` §16 결정 로그에 날짜·이유를 남기고 해당 절을 고친다 — 같은 PR에서.
- 커밋 메시지: `type(scope): 요약` (`fix` `feat` `design` `docs` `chore`). 본문에 *왜*를 적는다.

## 알려진 후속 과제

CRA→Vite · `App.js` 분리 · CSP · macOS 서명/공증 · 행 클릭=완료 UX 재검토. (Electron은 2026-09-17에 44로 올림 — 다음 메이저 업그레이드 때는 design-system §14의 리그레션 체크리스트를 다시 돈다.)
