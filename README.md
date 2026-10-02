# 김덕진의 AI 작업 기록

대화가 작업이 되고, 일상이 바뀌다. AI와 함께 만든 게임·영상·업무 도구와 에이전트 실험의 공개 아카이브입니다.

**[공개 사이트](https://socialkim.github.io/dukjin-ai-chronicle/)** · **[업데이트 안내](docs/UPDATE_GUIDE.md)**

첫 공개판은 17개 프로젝트, 4편의 원본 영상, 10장의 이미지, 20개 외부 작품 링크, 상세리포트와 산문으로 구성했습니다. 콘텐츠 기준은 2026년 10월 1일, 공개 편집일은 10월 2일입니다.

## 가장 쉬운 업데이트

1. `content/entries/` 안의 프로젝트 JSON을 수정하거나 새 파일을 추가합니다.
2. 이미지·영상이 있으면 `public/assets/`에 넣고 `content/media.json`에 등록합니다.
3. `main`에 커밋하면 검사를 거쳐 GitHub Pages에 자동 반영됩니다.

새 기록은 프로젝트 목록·연표·상세 페이지·사이트맵·RSS에 자동 반영됩니다. 외부 링크는 `content/links.json`, 긴 글은 `content/articles/`에서 관리합니다. 홈의 추천 프로젝트는 `content/site.json`의 `featured` 네 항목으로 정합니다.

## 로컬 실행

Node.js 22 이상. 외부 패키지 설치가 필요 없습니다.

```sh
npm test
npm run dev
```

미리보기: `http://127.0.0.1:4173/dukjin-ai-chronicle/`

```sh
npm run new -- next-project "새로운 작업의 제목"
```

명령은 `published: false`인 빈 기록을 만듭니다. 내용 작성 후 `true`로 바꾸어 공개 목록에 포함합니다. **공개 저장소의 모든 소스 파일은 읽을 수 있습니다.** `published: false`는 목록에서만 제외하며 비공개 보관 기능이 아닙니다.

## 구조

```text
content/
  site.json             사이트 설정과 추천 프로젝트
  entries/*.json        프로젝트별 기록
  articles/*.md         산문·리포트
  media.json            이미지·영상 설명과 출처 맥락
  links.json            외부 작품 링크
public/assets/          공개할 실제 이미지·영상
src/                    화면 스타일과 검색·분류·확대 기능
scripts/                정적 페이지 생성·검사·미리보기
docs/UPDATE_GUIDE.md    운영 안내
.github/workflows/     자동 검사와 Pages 배포
dist/                   생성된 사이트 (Git에 올리지 않음)
```

## 검사와 배포

`npm test`는 데이터·날짜·미디어 파일·내부 링크·제목·앵커·비공개 링크 패턴을 검사합니다. PR에서는 검사만 수행하고, `main` 커밋에서는 통과한 파일만 배포합니다. 빌드가 실패하면 기존 공개 사이트는 유지됩니다. 외부 사이트의 접근 상태는 자동 검사 대상이 아니므로 새 링크를 직접 열어 확인합니다.

GitHub Pages 설정은 **Settings → Pages → Source: GitHub Actions**입니다. 저장소 이름이나 도메인을 바꾸면 `content/site.json`의 `url`과 `repository`도 수정합니다. 구축 방식은 [GitHub 공식 Pages 워크플로 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)를 따릅니다.

## 콘텐츠 원칙

날짜와 사실의 범위를 표시합니다. 생성일을 방송일로 바꾸지 않으며, 애니메이션·실제 게임·봇 리플레이를 구분합니다. 내부 Slack·ChatGPT 대화 링크, 개인 메일, 로컬 경로와 인증 정보는 게시하지 않습니다. 결과를 실제로 확인한 범위와 본인 회고를 구분합니다.

콘텐츠의 권리는 김덕진 및 각 원저작자에게 있습니다. 제3자 창작물에 대한 재배포 허가를 부여하는 저장소가 아닙니다.
