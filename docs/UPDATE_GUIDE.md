# 새 작업을 계속 쌓는 방법

## 1. 다음번에 Codex에게 이렇게 부탁하세요

> 김덕진 AI 작업 기록 사이트를 업데이트해 줘. 저장소는 socialkim/dukjin-ai-chronicle이야. 이번에 한 작업은 [내용]이고, 원본 사이트는 [주소], 사용한 도구는 [도구], 실제 작업일은 [날짜]야. 첨부한 이미지·영상과 수정 과정을 새 프로젝트로 추가해 줘. 기존 프로젝트의 후속 작업이면 같은 페이지의 과정에 이어 붙여 줘. 공개 콘텐츠를 확인하고 npm test와 모바일 표시를 검증한 뒤 main에 올려 줘.

제목, 목적, 실제 결과, 바꾼 점, 날짜, 자료 링크만 전달해도 기록을 이어서 만들 수 있습니다. 추정한 완료일이나 실험하지 않은 기능을 넣지 않습니다.

## 2. GitHub에서 직접 고치기

1. [프로젝트 폴더](https://github.com/socialkim/dukjin-ai-chronicle/tree/main/content/entries)를 엽니다.
2. 고칠 JSON 파일을 열고 연필 버튼을 누릅니다.
3. 문장·링크·과정을 수정하고 `updated`를 수정일로 바꿉니다.
4. **Commit changes**로 `main`에 저장합니다.
5. [Actions](https://github.com/socialkim/dukjin-ai-chronicle/actions)에서 초록색 완료를 확인합니다.

반영은 자동으로 진행되며 실행 대기와 배포 시간에 따라 수 분 걸릴 수 있습니다. 실패하면 해당 실행 로그에서 오류 파일을 확인합니다. 검사 오류가 있는 파일은 고친 뒤 다시 커밋합니다. 공개 사이트가 갱신되지 않으면 강력 새로고침을 해 봅니다.

## 3. 새 프로젝트 추가

로컬에서는 다음 명령으로 틀을 만들 수 있습니다.

```sh
npm run new -- my-new-project "프로젝트 이름"
```

GitHub에서 직접 추가할 때는 `content/entries/`에서 **Add file → Create new file**을 누르고 기존 JSON을 참고합니다. 파일명은 `my-new-project.json`, `id`는 `my-new-project`로 맞춥니다.

| 필드 | 역할 |
| --- | --- |
| `id` | 영문 소문자·숫자·하이픈. 공개 뒤 바꾸지 않는 고유 주소 |
| `title` | 사람이 읽을 제목 |
| `date` | 연표 정렬 기준 `YYYY-MM-DD` |
| `dateLabel` | 실제 화면의 날짜 설명. 생성일·기간·회고 범위 등 |
| `updated` | 마지막 수정일 |
| `published` | `true`면 사이트에 표시. `false`여도 GitHub 파일은 공개 |
| `category` | 가족과 창작 / 방송과 게임 / 업무와 도구 / 에이전트 실험 |
| `summary` | 목록에 보일 목적과 결과, 1~2문장 |
| `tools` | 사용 도구 이름의 배열 |
| `cover` | 대표 이미지 파일명. 없으면 `""` |
| `status` | 플레이 가능 / 개인 실사용 도구 / 실험 중 등 |
| `sections` | `heading`과 `paragraphs`로 구성한 상세 본문 |
| `milestones` | 날짜와 수정 흐름. `date`, `text` |
| `links` | 원본 사이트와 결과 링크. `label`, `url`, `access` |
| `media` | `content/media.json`의 자료 id 배열 |
| `note` | 확인 범위와 필요한 설명 |

`dateLabel`을 정확히 적어 두면 월 단위 회고를 특정 하루의 완료처럼 오해하지 않습니다. `links`의 `access`는 `public` 또는 `login`입니다. 관련 프로젝트 내부 링크는 `../프로젝트-id/` 형식입니다.

## 4. 기존 프로젝트를 발전시켰다면

새 프로젝트를 중복으로 만들기보다 같은 기록의 `milestones`에 날짜와 변경점을 추가합니다. `sections`에는 왜 바꿨는지, 써 보니 무엇이 달랐는지 적고 `updated`를 갱신합니다. 최초 날짜와 `id`는 유지해 앞서 공유한 링크가 살아 있게 합니다.

예: Context Cut의 MacBook 로그를 나중에 확인하면 같은 프로젝트에 실제 버전별 변화와 검증 화면을 추가합니다. 확인 전에는 세부 기능을 추정해 적지 않습니다.

## 5. 이미지와 영상 넣기

- 이미지: `public/assets/images/`에 WebP·JPG·PNG로 저장합니다. 가로 1200~1600px 정도가 적당합니다.
- 영상: `public/assets/videos/`에 MP4를 넣습니다. GitHub 파일 제한에 여유가 있도록 파일당 95MB 미만이어야 합니다. 현재 재생기는 사용자가 누를 때 영상을 불러옵니다.
- 95MB를 넘는 영상은 공개 영상 서비스에 올린 뒤 `links`에 그 주소를 연결합니다. 파일을 Git에 강제로 넣지 않습니다.
- `content/media.json`에 고유 `id`, `type`, `title`, `src`, `caption`, `project`를 추가합니다. 영상은 `poster` 이미지 파일명과 `duration`도 넣습니다.
- 해당 프로젝트 JSON의 `media`에 같은 id를 추가하면 상세 화면과 자료실에 표시됩니다.

```json
{
  "id": "my-new-demo",
  "type": "video",
  "title": "업데이트한 기능의 실행 화면",
  "src": "assets/videos/my-new-demo.mp4",
  "poster": "my-new-cover.webp",
  "duration": "30초",
  "caption": "2026년 10월 10일 실제 앱에서 확인한 실행 화면.",
  "project": "my-new-project"
}
```

`src`는 `public/`을 뺀 경로입니다. 출처와 어떤 장면인지 캡션에 적습니다. 실제 게임인지 합성 영상인지도 필요한 경우 설명합니다. 이전 자료를 덮어쓰기보다 새 파일명으로 추가하면 변화 과정을 보존하기 쉽습니다.

## 6. 긴 글과 외부 링크

- 산문: `content/articles/essay.md`
- 상세리포트 공개판: `content/articles/report.md`
- 외부 작품 모음: `content/links.json`
- 홈페이지 추천 네 작품: `content/site.json`의 `featured`

긴 글의 문법은 제목 `#`, 절 제목 `##`, 소제목 `###`, 빈 줄로 구분한 문단, `-` 목록, 굵은 글씨, HTTPS 링크와 이미지입니다. 표·각주·임의 HTML은 현재 렌더러에서 지원하지 않습니다. 글 제목과 소개·발행일을 새로 바꾸는 경우 `scripts/build.mjs`의 `articleMeta`와 관련 표기도 함께 맞춥니다. Markdown 내려받기와 인쇄/PDF 저장은 웹페이지에서 제공됩니다.

## 7. 배포 전 확인과 되돌리기

```sh
npm test
npm run dev
```

프로젝트·연표·자료실·긴 글에서 내용을 확인합니다. 검색과 분류, 이미지 확대, 영상 재생을 써 보고 모바일 가로 넘침을 확인합니다. 원문 대화 주소·메일·계정 키·개인 연락처가 포함되지 않았는지 내용과 화면을 점검합니다.

배포는 main에 커밋한 뒤 push하면 시작됩니다. 잘못 수정했다면 해당 변경만 `git revert <commit>`으로 되돌리고 다시 push합니다. 자동 생성 폴더 `dist/`를 직접 고치면 다음 빌드에서 사라집니다. 반드시 `content/`, `public/`, `src/`의 원본을 수정합니다.

워크플로는 [GitHub Pages 공식 안내](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)를 따릅니다. 저장소의 **Settings → Pages → Source**는 **GitHub Actions**로 유지합니다.
