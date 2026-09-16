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

## 절대 규칙

1. **origin 고정** — 패키징 앱은 `http://127.0.0.1:51283`에서 실행된다. 이 값을 바꾸면 모든 사용자의 로컬 데이터가 사라진다.
2. **렌더러에서 Node 접근 금지** — `window.require`, `process`, `Buffer` 없음. Electron 기능은 `window.electron.*`만. 새 IPC 채널은 `main.js` 핸들러 **와** `preload.js` allow-list 둘 다에 추가.
3. **문자열은 전부 `t()`** — `ko.json` + `en.json` 동시 추가. 기본 데이터(예시 할 일 등)는 키를 저장하고 `displaySampleText()`로 렌더 시 번역. **`t`는 i18n 전용 이름** — 콜백 파라미터로 `t`를 쓰지 않는다(`task`, `item`…). 알림 코드가 `tasks.map(t => t('…'))`로 가려져 알림이 통째로 죽어 있었다.
4. **UI 아이콘은 lucide-react만** — 이모지는 카테고리 아이콘과 문장 끝 말투에만.
5. **Princess가 기본 테마** — fallback은 항상 `'princess'`. 디자인 판단 기준도 Princess.
6. **카드 표면은 기존 Princess 디자인 유지** — 흰 카드 + `hexToRgba(hue, 0.45)` 헤더 밴드 + 테두리 있는 흰 행. 카드 배경에 투명 `rgba`를 쓰지 않는다(팝아웃 창이 투명이라 바탕화면이 비침). "테두리 대신 톤" 시안은 2026-09-14 사용자 검토 후 기각 — `docs/design-system.md` §16 참고.
7. **카드 안에서는 `sm:`/`md:` 같은 창 폭 변형을 쓰지 않는다** — 카테고리 카드가 컨테이너이므로 `[@container(min-width:560px)]:`를 쓴다 (design-system §8).
8. **기기별 상태는 클라우드에 올리지 않는다** — 팝아웃/핀 여부, 창 위치·크기는 `localStorage` / `userData/window-state.json`. Firestore `users/{uid}` 문서에는 데이터와 취향 설정만 (design-system §8).
9. **창 크기는 콘텐츠 + 2×`WINDOW_INSET`(현재 0)** — `main.js`에서 창을 만들거나 크기를 바꿀 때는 `withInset()`을 거치고, IPC로 오가는 width/height는 항상 콘텐츠 크기다. 렌더러는 `window.electron.windowInset`로 카드를 안쪽에 두고 그림자를 여백에 그린다 (design-system §6/§12). 창은 `roundedCorners: false` — OS 둥근 마스크가 카드를 잘라내므로 모서리는 항상 테마 CSS가 정한다. Windows 11에서는 Electron 34+부터 효과가 있다 (§7-2). 테마별 토큰 표는 design-system §3-3.
10. **디자인 변경은 사용자 확인 후** — 실제 앱 위에 CSS로 2안 이상 얹어 비교하고, 고른 뒤 구현.

## 로컬 실행 · 검증

```bash
npm install
cp .env.example .env            # Firebase 값 (없으면 게스트 모드만 동작)
npm run electron:dev            # CRA(3000) + Electron
```

개발 모드(`electron .`)는 userData를 `~/Library/Application Support/Code Tiara (dev)`에 따로 두므로 설치된 앱과 **동시에 실행**할 수 있다. 창이 안 뜨고 바로 종료되면 단일 인스턴스 락에 막힌 것 — 터미널의 `Another Code Tiara instance is already running` 로그를 확인.

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

Electron 33→44 · CRA→Vite · `App.js` 분리 · CSP · macOS 서명/공증 · 행 클릭=완료 UX 재검토.
