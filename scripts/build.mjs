import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = async (p) =>
  JSON.parse(await fs.readFile(path.join(root, p), "utf8"));
const site = await read("content/site.json");
const base = new URL(site.url).pathname;
const out = path.join(root, "dist");
const esc = (v) =>
  String(v ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const u = (p) => base + p.replace(/^\//, "");
const img = (name) => u("assets/images/" + name);
const files = (await fs.readdir(path.join(root, "content/entries")))
  .filter((x) => x.endsWith(".json"))
  .sort();
const entries = (
  await Promise.all(files.map((f) => read("content/entries/" + f)))
)
  .filter((p) => p.published)
  .sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id));
const media = await read("content/media.json");
const links = await read("content/links.json");
const latest = entries.reduce(
  (date, e) => (e.updated > date ? e.updated : date),
  site.published,
);
const detail = (e) => u("projects/" + e.id + "/");
const external = (href, label, cls = "text-link") =>
  `<a class="${cls}" href="${esc(href)}"${/^https:\/\//.test(href) ? ' target="_blank" rel="noopener noreferrer"' : ""}>${esc(label)} <span aria-hidden="true">↗</span></a>`;
const entryLink = (l) =>
  external(
    l.url,
    l.label + (l.access === "login" ? " · 로그인 필요" : ""),
    "button button-light",
  );

function shell(
  title,
  description,
  body,
  route = "",
  active = "",
  image = "first-concept.webp",
) {
  const canonical = new URL(route, site.url).href;
  const nav = [
    ["projects/", "프로젝트", "projects"],
    ["timeline/", "변화의 연표", "timeline"],
    ["library/", "영상·자료실", "library"],
    ["writing/", "읽는 기록", "writing"],
  ];
  return `<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}${title === site.title ? "" : " — " + esc(site.title)}</title><meta name="description" content="${esc(description)}"><meta name="theme-color" content="#f7f4ed"><meta property="og:type" content="${route.startsWith("writing/") && route !== "writing/" ? "article" : "website"}"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(description)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${new URL("assets/images/" + image, site.url).href}"><meta property="og:locale" content="ko_KR"><meta name="twitter:card" content="summary_large_image"><link rel="canonical" href="${esc(canonical)}"><link rel="icon" href="${u("favicon.svg")}" type="image/svg+xml"><link rel="alternate" type="application/rss+xml" title="${esc(site.title)}" href="${u("feed.xml")}"><link rel="stylesheet" href="${u("assets/site.css")}"><script defer src="${u("assets/site.js")}"></script></head><body><a class="skip-link" href="#main">본문으로 건너뛰기</a><header class="site-header"><div class="header-inner"><a class="brand" href="${base}" aria-label="김덕진의 AI 작업 기록 홈"><span class="brand-mark" aria-hidden="true">K.</span><span>김덕진의 <strong>AI 작업 기록</strong></span></a><nav aria-label="주요 메뉴">${nav.map(([p, l, a]) => `<a href="${u(p)}" ${active === a ? 'aria-current="page"' : ""}>${l}</a>`).join("")}</nav></div></header><main id="main">${body}</main><footer class="site-footer"><div><p class="eyebrow">AN OPEN, ONGOING JOURNAL</p><p class="footer-title">만들고, 써보고,<br>다시 이야기합니다.</p><p class="muted">김덕진 · AI와 함께 바뀌는 일과 일상의 기록</p></div><div class="footer-links"><a href="${u("about/")}">이 기록에 관하여</a>${external(site.repository, "GitHub에서 기록 보기")}${external("https://socialkim.github.io/", "AI 강의 자료실")}<a href="${u("feed.xml")}">새 기록 구독 · RSS</a><span class="fine">마지막 편집 ${latest.replaceAll("-", ".")}<br>최초 조사 기준 ${site.evidenceThrough.replaceAll("-", ".")}<br>© 김덕진. 콘텐츠별 원저작자의 권리를 존중합니다.</span></div></footer><dialog id="image-viewer" aria-label="이미지 크게 보기"><button class="dialog-close" type="button" aria-label="이미지 닫기">닫기 ×</button><figure><img alt=""><figcaption></figcaption></figure></dialog></body></html>`;
}

function card(e, index = 0) {
  return `<article class="project-card" data-item data-category="${esc(e.category)}" data-search="${esc([e.title, e.summary, ...e.tools, e.category, ...e.sections.map((s) => s.heading + " " + s.paragraphs.join(" ")), ...e.links.map((l) => l.label)].join(" "))}"><a class="card-image ${e.cover ? "" : "type-cover"}" href="${detail(e)}" tabindex="-1" aria-hidden="true">${e.cover ? `<img src="${img(e.cover)}" alt="" loading="lazy" width="1280" height="850">` : `<span class="cover-kicker">FIELD NOTE / ${String(index + 1).padStart(2, "0")}</span><span class="cover-type">${esc(e.id === "slack-agent" ? "대화 속에서,\n다음 할 일을." : e.id === "muse" ? "내 일상에\n한 걸음 더." : e.id === "dot" ? "계속 맡길\n역할의 시작." : e.title)}</span><span class="cover-footer">KIM DUKJIN · AI JOURNAL</span>`}</a><div class="card-meta"><span>${esc(e.category)}</span><time datetime="${e.date}">${e.date.slice(0, 7).replace("-", ".")}</time></div><h3><a href="${detail(e)}">${esc(e.title)}</a></h3><p>${esc(e.summary)}</p><a class="card-more" href="${detail(e)}">과정과 결과 보기 <span aria-hidden="true">↗</span><span class="sr-only"> — ${esc(e.title)}</span></a></article>`;
}
function pageHead(kicker, title, description) {
  return `<div class="page-head container"><p class="eyebrow">${esc(kicker)}</p><h1>${title}</h1><p class="lede">${esc(description)}</p></div>`;
}
function filters(categories, placeholder) {
  return `<form class="filter-bar" role="search"><label class="search"><span class="sr-only">${esc(placeholder)}</span><span aria-hidden="true">⌕</span><input type="search" name="q" placeholder="${esc(placeholder)}" autocomplete="off"><button type="button" data-clear aria-label="검색과 분류 초기화">초기화</button></label><div class="filter-options" role="group" aria-label="분류 선택">${["전체", ...categories].map((c, i) => `<button type="button" data-filter="${esc(c)}" aria-pressed="${i === 0}">${esc(c)}</button>`).join("")}</div></form><p class="result-count" role="status" aria-live="polite"></p><p class="empty-state" hidden>일치하는 기록이 없습니다. 다른 검색어로 찾아보세요.</p>`;
}

const family = entries.find((e) => e.id === "suchan-rhythm");
const home = `<section class="hero container"><div class="hero-copy"><p class="eyebrow"><span class="status-dot"></span> KIM DUKJIN’S AI JOURNAL</p><h1>대화가 작업이 되고,<br><em>일상이 바뀌다.</em></h1><p class="hero-description">아이의 상상이 게임이 되고,<br>내게 필요한 도구를 직접 만들고,<br>함께 일하는 AI가 일상에 들어왔습니다.</p><div class="actions"><a class="button" href="${u("projects/")}">만든 것들 살펴보기 <span aria-hidden="true">↗</span></a><a class="quiet-link" href="${u("writing/essay/")}">나의 변화기 읽기 →</a></div><p class="hero-note">김덕진이 직접 시도하고, 쓰고, 고쳐 온 과정의 기록.</p></div><a class="hero-art" href="${detail(family)}"><img src="${img("first-concept.webp")}" width="1536" height="1024" alt="아들의 설명에서 출발한 노란 호박 얼굴의 해적 푸나폰 콘셉트" fetchpriority="high"><div class="hero-caption"><span>01 / 아들의 상상에서 시작된 세계</span><span aria-hidden="true">↗</span></div></a></section><div class="chapter-strip container"><span>한 문장에서 시작해</span><span>이미지 <i>→</i> 영상 <i>→</i> 게임 <i>→</i> 도구 <i>→</i> 함께하는 일</span></div><section class="section container"><div class="section-heading"><div><p class="eyebrow">SELECTED STORIES</p><h2>변화가 보이는 네 가지 장면</h2></div><a class="text-link" href="${u("projects/")}">전체 ${entries.length}개 기록 보기 ↗</a></div><div class="project-grid featured-grid">${site.featured
  .map((id, i) =>
    card(
      entries.find((e) => e.id === id),
      i,
    ),
  )
  .join(
    "",
  )}</div></section><section class="journey-section"><div class="container"><div class="section-heading"><div><p class="eyebrow">THE WAY I WORK</p><h2>도구가 발전하는 동안,<br>나의 질문도 달라졌습니다.</h2></div><a class="text-link" href="${u("timeline/")}">연표로 따라가기 ↗</a></div><div class="journey-grid"><div><span class="step-number">01</span><h3>결과를 만들어 보다</h3><p>취재 자료와 내 말투를 정리하고,<br>아이와 첫 게임을 만들었습니다.</p><span class="fine">2026.01 — 08</span></div><div><span class="step-number">02</span><h3>다음 작업으로 연결하다</h3><p>그림을 영상과 게임으로,<br>필요한 기능을 나만의 도구로.</p><span class="fine">2026.09</span></div><div><span class="step-number">03</span><h3>함께 일할 맥락을 주다</h3><p>팀의 대화와 나의 일정을 읽고,<br>이어서 할 일을 찾게 합니다.</p><span class="fine">2026.09 — 현재</span></div></div></div></section><section class="section container watch-section"><div><p class="eyebrow">FROM AN IDEA TO A PLAYABLE WORLD</p><h2>아이의 말이<br>실제로 움직이기까지.</h2><p>첫 그림과 두 편의 영상, 조작 가능한 게임.<br>만드는 과정에서 아이의 요구도 구체적으로 바뀌었습니다.</p><a class="text-link" href="${u("library/")}">영상과 이미지 모두 보기 ↗</a></div>${renderMedia(media.find((m) => m.id === "trailer"))}</section><section class="reading-band container"><div><p class="eyebrow">READ THE JOURNAL</p><h2>결과 뒤에 남은 이야기</h2><p>무엇을 만들었는지, 그 경험이 나를 어떻게 바꾸었는지.</p></div><div class="reading-links"><a href="${u("writing/essay/")}"><span class="fine">ESSAY · 김덕진</span><strong>AI와 함께 달라진<br>나의 일과 가족의 시간</strong><span>산문 읽기 ↗</span></a><a href="${u("writing/report/")}"><span class="fine">REPORT · 공개판</span><strong>AI를 쓰는 방식이<br>달라진 시간</strong><span>상세리포트 읽기 ↗</span></a></div></section>`;

function renderMedia(m) {
  return `<figure class="media-figure" id="media-${m.id}">${m.type === "video" ? `<video controls playsinline preload="none" poster="${img(m.poster)}" aria-label="${esc(m.title)}"><source src="${u(m.src)}" type="video/mp4">이 브라우저에서는 영상을 재생할 수 없습니다. 아래 원본 링크로 열어 주세요.</video>` : `<button class="image-open" data-image="${u(m.src)}" data-caption="${esc(m.caption)}" aria-label="${esc(m.title)} 크게 보기"><img src="${u(m.src)}" alt="${esc(m.title)}" loading="lazy"><span class="zoom-label" aria-hidden="true">확대 ↗</span></button>`}<figcaption><div class="media-title">${esc(m.title)}${m.duration ? ` <span class="fine">${esc(m.duration)}</span>` : ""}</div><p>${esc(m.caption)}</p>${m.type === "video" ? `<a href="${u(m.src)}" target="_blank" rel="noopener" class="fine">원본 영상 열기 ↗</a>` : ""}</figcaption></figure>`;
}

if (path.dirname(out) !== root || path.basename(out) !== "dist")
  throw new Error("Unsafe output directory");
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });
await fs.cp(path.join(root, "public"), out, { recursive: true });
await fs.mkdir(path.join(out, "assets"), { recursive: true });
await fs.copyFile(
  path.join(root, "src/site.css"),
  path.join(out, "assets/site.css"),
);
await fs.copyFile(
  path.join(root, "src/site.js"),
  path.join(out, "assets/site.js"),
);
const routes = [];
async function emit(route, html) {
  const file = path.join(out, route, "index.html");
  await fs.mkdir(path.dirname(file), { recursive: true });
  await fs.writeFile(file, html);
  routes.push(route);
}
await emit("", shell(site.title, site.description, home));
await emit(
  "projects/",
  shell(
    "프로젝트",
    "게임, 영상, 업무 도구와 에이전트 실험의 과정과 결과를 찾아보세요.",
    pageHead(
      "THE WORK ARCHIVE",
      "만들고, 써보고, 고친 것들.",
      "작품의 결과와 그 뒤에 쌓인 대화를 함께 기록합니다.",
    ) +
      `<section class="container archive-section" data-filterable>${filters(site.categories, "프로젝트, 도구, 주제로 검색")}<div class="project-grid">${entries.map(card).join("")}</div></section>`,
    "projects/",
    "projects",
  ),
);

for (const e of entries) {
  const body = `<div class="container project-heading"><a class="back-link" href="${u("projects/")}">← 모든 프로젝트</a><div class="project-kicker"><span class="eyebrow">${esc(e.category)}</span><span class="fine">${esc(e.dateLabel)}</span></div><h1>${esc(e.title)}</h1><p class="lede">${esc(e.summary)}</p><div class="tool-row">${e.tools.map((t) => `<span>${esc(t)}</span>`).join("")}<span class="project-status">${esc(e.status)}</span></div>${e.links.length ? `<div class="actions">${e.links.map(entryLink).join("")}</div>` : ""}</div>${e.cover ? `<div class="container project-cover"><img src="${img(e.cover)}" alt="${esc(e.title)} 관련 실제 제작 이미지" width="1280" height="850"></div>` : ""}<div class="detail-layout container"><aside class="detail-aside"><p class="eyebrow">BEHIND THE WORK</p><p>결과가 나오면,<br>다음 질문이 생깁니다.</p><button class="share-button" type="button">이 기록 링크 복사 ↗</button><p class="share-status fine" role="status"></p></aside><article class="prose">${e.sections.map((s, i) => `<section id="section-${i + 1}"><h2>${esc(s.heading)}</h2>${s.paragraphs.map((p) => `<p>${esc(p)}</p>`).join("")}</section>`).join("")}${e.milestones.length ? `<section><h2>이렇게 이어졌습니다</h2><ol class="milestones">${e.milestones.map((m) => `<li><span>${esc(m.date)}</span><p>${esc(m.text)}</p></li>`).join("")}</ol></section>` : ""}${e.note ? `<aside class="evidence-note"><strong>기록 메모</strong><p>${esc(e.note)}</p></aside>` : ""}</article></div>${e.media.length ? `<section class="section container"><div class="section-heading"><h2>결과를 직접 살펴보기</h2><a class="text-link" href="${u("library/")}">전체 자료실 ↗</a></div><div class="media-grid">${e.media.map((id) => renderMedia(media.find((m) => m.id === id))).join("")}</div></section>` : ""}<section class="container next-record"><p class="eyebrow">KEEP EXPLORING</p><h2>다른 기록도 이어서</h2><div class="related-links">${entries
    .filter((p) => p.category === e.category && p.id !== e.id)
    .slice(0, 3)
    .map(
      (p) =>
        `<a href="${detail(p)}">${esc(p.title)} <span aria-hidden="true">↗</span></a>`,
    )
    .join("")}</div></section>`;
  await emit(
    "projects/" + e.id + "/",
    shell(
      e.title,
      e.summary,
      body,
      "projects/" + e.id + "/",
      "projects",
      e.cover || "first-concept.webp",
    ),
  );
}
const phases = [
  {
    label: "01 / 2026.01 — 08",
    title: "이미 여러 단계를 연결하고 있었다",
    text: "취재를 자료로, 아이의 설명을 첫 게임으로. 최근 변화 이전에도 시도와 수정의 경험이 쌓였습니다.",
    items: entries.filter((e) => e.date < "2026-09-01"),
  },
  {
    label: "02 / 2026.09",
    title: "만들고 고치고 공개하는 일이 가까워졌다",
    text: "Work와 Codex를 오가며 게임과 영상, 나에게 맞는 도구를 만들었습니다.",
    items: entries.filter(
      (e) => e.date >= "2026-09-01" && e.date < "2026-09-30",
    ),
  },
  {
    label: "03 / 2026.09 — 현재",
    title: "업무의 맥락 안으로 AI를 부르다",
    text: "대화와 일정, 앞선 자료에서 다음 할 일을 찾게 합니다. 실험은 계속됩니다.",
    items: entries.filter((e) => e.date >= "2026-09-30"),
  },
];
await emit(
  "timeline/",
  shell(
    "변화의 연표",
    "2026년 취재·가족 창작에서 Work·Codex 제작, 슬랙과 개인 에이전트 실험까지.",
    pageHead(
      "A CHRONICLE IN PROGRESS",
      "기술의 변화 옆에,<br>나의 변화가 쌓였습니다.",
      "최근 경험은 그전의 수많은 시도 위에서 시작됐습니다. 날짜를 따라 기록을 펼쳐 보세요.",
    ) +
      `<div class="container timeline-page"><p class="timeline-note">날짜는 제작·생성·수정 기록입니다. 방송 송출일은 별도로 확정한 경우에만 표시합니다.</p>${phases
        .map(
          (p) =>
            `<section class="timeline-phase"><div class="phase-intro"><p class="eyebrow">${p.label}</p><h2>${p.title}</h2><p>${p.text}</p></div><ol class="timeline">${p.items
              .sort((a, b) => a.date.localeCompare(b.date))
              .map(
                (e) =>
                  `<li><time datetime="${e.date}">${esc(e.dateLabel)}</time><h3><a href="${detail(e)}">${esc(e.title)} <span aria-hidden="true">↗</span></a></h3><p>${esc(e.summary)}</p></li>`,
              )
              .join("")}</ol></section>`,
        )
        .join("")}</div>`,
    "timeline/",
    "timeline",
  ),
);
await emit(
  "library/",
  shell(
    "영상·자료실",
    "실제 제작 영상과 게임 화면, 공개 작품 링크를 한곳에서 만나보세요.",
    pageHead(
      "WATCH · EXPLORE · PLAY",
      "설명보다 먼저,<br>직접 만나보세요.",
      "만드는 과정에서 나온 실제 영상과 이미지, 직접 열어볼 수 있는 게임과 사이트입니다.",
    ) +
      `<div class="container library-jump"><a href="#films">영상 ${media.filter((m) => m.type === "video").length}편 ↓</a><a href="#images">이미지 ${media.filter((m) => m.type === "image").length}장 ↓</a><a href="#links">외부 작품 ${links.length}개 ↓</a></div><section id="films" class="section container"><div class="section-heading"><div><p class="eyebrow">THE MOVING IMAGES</p><h2>한 장의 그림, 그다음 장면</h2></div></div><div class="media-grid">${media
        .filter((m) => m.type === "video")
        .map(renderMedia)
        .join(
          "",
        )}</div></section><section id="images" class="section container"><div class="section-heading"><div><p class="eyebrow">ACTUAL WORK, CAPTURED</p><h2>결과를 남긴 이미지들</h2></div><span class="fine">이미지를 누르면 크게 볼 수 있습니다</span></div><div class="image-grid">${media
        .filter((m) => m.type === "image")
        .map(renderMedia)
        .join(
          "",
        )}</div></section><section id="links" class="section container" data-filterable><div class="section-heading"><div><p class="eyebrow">OUT IN THE WORLD</p><h2>작품으로 바로 가기</h2></div></div><p class="muted">원래 공개된 사이트로 연결됩니다. 로그인 필요 표시는 조사 시점의 접속 상태이며, 외부 서비스의 접근 조건은 달라질 수 있습니다.</p>${filters([...new Set(links.map((l) => l.category))], "게임·사이트 이름으로 검색")}<div class="link-directory">${links.map((l) => `<a class="directory-item" data-item data-category="${esc(l.category)}" data-search="${esc(l.title + " " + l.description + " " + l.category)}" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer"><span class="fine">${esc(l.category)}</span><div><h3>${esc(l.title)}</h3><p>${esc(l.description)}</p></div><span class="directory-access">${l.access === "login" ? "로그인 필요" : "열어보기"} ↗</span></a>`).join("")}</div></section>`,
    "library/",
    "library",
  ),
);

const articleMeta = [
  {
    id: "essay",
    label: "ESSAY",
    title: "AI와 함께 달라진 나의 일과 가족의 시간",
    description:
      "아들의 한마디에서 시작해 방송, 나만의 도구, 함께 일하는 에이전트로. 김덕진의 1인칭 변화기.",
    image: "first-concept.webp",
  },
  {
    id: "report",
    label: "REPORT",
    title: "AI를 쓰는 방식이 달라진 시간",
    description:
      "아스트라 전후의 활용, Work와 Codex, 맞춤형 편집툴, 닷·슬랙·Muse와 가족 창작의 상세리포트 공개판.",
    image: "creation-history.webp",
  },
];
const inline = (text) =>
  esc(text)
    .replace(
      /!\[([^\]]*)\]\(([^)]+)\)/g,
      (_, alt, src) =>
        `<figure><img src="${u(src)}" alt="${alt}" loading="lazy"><figcaption>${alt}</figcaption></figure>`,
    )
    .replace(
      /\[([^\]]+)\]\((https:\/\/[^)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1 ↗</a>',
    )
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
function markdown(md) {
  let count = 0;
  return md
    .split(/\n\s*\n/)
    .filter(Boolean)
    .map((block) => {
      if (/^# /.test(block) || block.trim() === "김덕진") return "";
      if (/^## /.test(block))
        return `<h2 id="part-${++count}">${inline(block.slice(3).trim())}</h2>`;
      if (/^### /.test(block))
        return `<h3>${inline(block.slice(4).trim())}</h3>`;
      if (block.startsWith("![")) return inline(block.trim());
      if (block.startsWith("- "))
        return (
          "<ul>" +
          block
            .split("\n")
            .map((l) => `<li>${inline(l.replace(/^- /, ""))}</li>`)
            .join("") +
          "</ul>"
        );
      return `<p>${inline(block.trim())}</p>`;
    })
    .join("\n");
}
await emit(
  "writing/",
  shell(
    "읽는 기록",
    "AI와 함께 달라진 김덕진의 업무와 일상, 긴 호흡으로 읽는 산문과 상세리포트.",
    pageHead(
      "LONG READS",
      "만든 것 너머의 이야기.",
      "일의 방식이 달라지고, 아이와 나누는 대화가 달라졌습니다. 결과 뒤에 남은 생각들을 긴 글로 묶었습니다.",
    ) +
      `<div class="container writing-list">${articleMeta.map((a) => `<article><a href="${u("writing/" + a.id + "/")}" class="writing-image" tabindex="-1" aria-hidden="true"><img src="${img(a.image)}" alt="" width="1280" height="850"></a><div><p class="eyebrow">${a.label} / 2026.10.02</p><h2><a href="${u("writing/" + a.id + "/")}">${a.title}</a></h2><p>${a.description}</p><a class="text-link" href="${u("writing/" + a.id + "/")}">글 읽기 ↗</a></div></article>`).join("")}</div>`,
    "writing/",
    "writing",
  ),
);
for (const a of articleMeta) {
  const md = await fs.readFile(
    path.join(root, "content/articles/" + a.id + ".md"),
    "utf8",
  );
  const headings = [...md.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  const body = `<div class="reading-progress" aria-hidden="true"></div><header class="article-head container"><a class="back-link" href="${u("writing/")}">← 읽는 기록</a><p class="eyebrow">${a.label} · ${a.id === "report" ? "PUBLIC EDITION" : "A PERSONAL CHRONICLE"}</p><h1>${a.title}</h1><p class="lede">${a.description}</p><div class="article-byline"><span>글 · 김덕진</span><time datetime="2026-10-02">2026.10.02</time><span>약 ${Math.ceil(md.length / 700)}분 읽기</span></div><div class="article-actions"><a href="${u("downloads/" + a.id + ".md")}" download>원고 내려받기 ↓</a><button type="button" class="print-button">인쇄 · PDF 저장</button><button type="button" class="share-button">링크 복사</button><span class="share-status fine" role="status"></span></div></header><div class="article-layout container"><aside class="toc"><details open><summary>이 글의 흐름</summary><ol>${headings.map((h, i) => `<li><a href="#part-${i + 1}">${esc(h)}</a></li>`).join("")}</ol></details></aside><article class="prose longread">${markdown(md)}</article></div><div class="container article-end"><span class="eyebrow">THE STORY CONTINUES</span><h2>이 이야기의 실제 결과들</h2><a class="button" href="${u("projects/")}">프로젝트 둘러보기 ↗</a></div>`;
  await emit(
    "writing/" + a.id + "/",
    shell(
      a.title,
      a.description,
      body,
      "writing/" + a.id + "/",
      "writing",
      a.image,
    ),
  );
  await fs.mkdir(path.join(out, "downloads"), { recursive: true });
  const downloadable = md.replace(
    /\]\(assets\/images\//g,
    "](" + site.url + "assets/images/",
  );
  await fs.writeFile(path.join(out, "downloads/" + a.id + ".md"), downloadable);
}
await emit(
  "about/",
  shell(
    "이 기록에 관하여",
    "김덕진의 AI 작업 기록: 목적과 공개 기준, 앞으로 이어질 기록.",
    pageHead(
      "ABOUT THIS JOURNAL",
      "완성품만큼,<br>만드는 과정도 남깁니다.",
      "방송과 강의, 업무와 가족의 시간 안에서 AI를 직접 써 보며 쌓인 기록입니다.",
    ) +
      `<article class="prose about-prose container"><h2>김덕진의 AI 작업 기록</h2><p>이 사이트는 게임과 영상, 맞춤형 업무 도구, 개인 에이전트 실험을 함께 모으는 공개 아카이브입니다. 결과를 보여 주는 것과 함께 어떤 필요에서 시작했고 무엇을 바꾸었는지 기록합니다.</p><h2>어떤 근거로 썼나요?</h2><p>2026년 10월 1일까지 확인한 제작 대화와 파일, 실제 사이트와 화면, 본인의 설명을 바탕으로 10월 2일 첫 공개판을 구성했습니다. 날짜가 사이트 생성일인지, 수정 범위인지, 월 단위 회고인지를 프로젝트마다 표시했습니다.</p><p>방송에 여러 게임을 시연한 경험과 개별 작품의 특정 회차 송출은 구분합니다. 애니메이션과 조작 가능한 게임, 봇 리플레이와 사람의 플레이, 요청한 업무와 완료된 업무도 각각의 캡션과 메모에서 설명합니다.</p><h2>실제 자료를 함께 봅니다</h2><p>이미지는 원래 제작 산출물과 실제 앱·사이트 화면입니다. 영상 네 편은 원본 MP4로 이 사이트에서도 재생할 수 있습니다. 외부 작품은 원래 사이트로 연결하며 로그인 안내를 확인한 경우 그 상태를 표시했습니다.</p><h2>앞으로 무엇이 쌓이나요?</h2><p>새 프로젝트뿐 아니라 이미 만든 것의 업데이트도 남깁니다. 최초 시도, 실제 사용 뒤의 피드백, 수정 결과를 같은 기록에 이어 쌓습니다. 개별 기록은 주소가 유지되어 나중에도 찾아올 수 있고, 새 기록은 RSS로 확인할 수 있습니다.</p><h2>자료 이용</h2><p>글과 창작 자료의 저작권은 김덕진 및 각 원저작자에게 있습니다. 이 사이트 공개가 제3자 저작물의 권리 양도나 자유로운 재배포 허가를 뜻하지 않습니다. 인용할 때에는 해당 프로젝트의 주소와 맥락을 함께 표시해 주세요.</p><div class="actions">${external(site.repository, "공개 저장소 보기", "button")}${external("https://socialkim.github.io/", "김덕진 AI 강의 자료실", "button button-light")}</div></article>`,
    "about/",
  ),
);
await fs.writeFile(
  path.join(out, "404.html"),
  shell(
    "기록을 찾을 수 없습니다",
    "찾는 기록의 주소를 확인해 주세요.",
    `<div class="container not-found"><p class="eyebrow">404 / PAGE NOT FOUND</p><h1>아직 이곳에는<br>기록이 없습니다.</h1><p>주소를 다시 확인하거나 프로젝트 목록에서 찾아보세요.</p><a class="button" href="${u("projects/")}">기록 찾아보기 ↗</a></div>`,
    "404.html",
  ),
);
await fs.writeFile(
  path.join(out, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${routes.map((r) => `<url><loc>${esc(new URL(r, site.url).href)}</loc><lastmod>${latest}</lastmod></url>`).join("")}</urlset>`,
);
await fs.writeFile(
  path.join(out, "robots.txt"),
  `User-agent: *\nAllow: /\nSitemap: ${site.url}sitemap.xml\n`,
);
await fs.writeFile(
  path.join(out, "feed.xml"),
  `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>${esc(site.title)}</title><link>${site.url}</link><description>${esc(site.description)}</description><language>ko</language>${entries.map((e) => `<item><title>${esc(e.title)}</title><link>${new URL("projects/" + e.id + "/", site.url).href}</link><guid isPermaLink="true">${new URL("projects/" + e.id + "/", site.url).href}</guid><description>${esc(e.summary)}</description><pubDate>${new Date(e.date + "T12:00:00+09:00").toUTCString()}</pubDate></item>`).join("")}</channel></rss>`,
);
await fs.writeFile(path.join(out, ".nojekyll"), "");
await fs.writeFile(
  path.join(out, "build-manifest.json"),
  JSON.stringify(
    {
      routes,
      entries: entries.length,
      media: media.length,
      links: links.length,
      updated: latest,
    },
    null,
    2,
  ),
);
console.log(
  `Built ${routes.length} pages / ${entries.length} projects / ${media.length} media / ${links.length} links`,
);
