import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = async (p) =>
  JSON.parse(await fs.readFile(path.join(root, p), "utf8"));
const site = await read("content/site.json");
const base = new URL(site.url).pathname;
const errors = [];
const check = (condition, msg) => {
  if (!condition) errors.push(msg);
};
const exists = async (p) => {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
};
const names = (await fs.readdir(path.join(root, "content/entries"))).filter(
  (f) => f.endsWith(".json"),
);
const entries = await Promise.all(
  names.map((n) => read("content/entries/" + n)),
);
const media = await read("content/media.json");
const links = await read("content/links.json");
const ids = new Set();
const validDate = (s) =>
  typeof s === "string" &&
  /^\d{4}-\d{2}-\d{2}$/.test(s) &&
  !Number.isNaN(Date.parse(s)) &&
  new Date(s).toISOString().startsWith(s);
const privatePatterns = [
  /https?:\/\/[^\s"<>]*slack\.com\/archives\//i,
  /https?:\/\/chatgpt\.com\/c\//i,
  /codex:\/\/threads\//i,
  /\b[A-Z]:[\\/](?:Users|home)\b/i,
  /\bgh[pousr]_[A-Za-z0-9]{20,}\b/,
  /\bsk-[A-Za-z0-9_-]{20,}\b/,
];
const inspectPrivate = (text, name) =>
  privatePatterns.forEach((p, i) =>
    check(
      !p.test(text),
      `${name}: non-public link or credential pattern ${i + 1}`,
    ),
  );
for (const [i, e] of entries.entries()) {
  check(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id), `${names[i]}: invalid id`);
  check(names[i] === e.id + ".json", `${names[i]}: filename must match id`);
  check(!ids.has(e.id), `Duplicate id ${e.id}`);
  ids.add(e.id);
  for (const key of ["title", "dateLabel", "category", "summary", "status"])
    check(
      typeof e[key] === "string" && e[key].length > 0,
      `${e.id}: missing ${key}`,
    );
  check(validDate(e.date) && validDate(e.updated), `${e.id}: invalid date`);
  check(e.updated >= e.date, `${e.id}: updated precedes date`);
  check(typeof e.published === "boolean", `${e.id}: published must be boolean`);
  check(site.categories.includes(e.category), `${e.id}: unknown category`);
  for (const key of ["tools", "sections", "milestones", "links", "media"])
    check(Array.isArray(e[key]), `${e.id}: ${key} must be an array`);
  if (e.cover)
    check(
      await exists(path.join(root, "public/assets/images", e.cover)),
      `${e.id}: missing cover`,
    );
  for (const s of e.sections || [])
    check(
      typeof s.heading === "string" &&
        Array.isArray(s.paragraphs) &&
        s.paragraphs.every((p) => typeof p === "string"),
      `${e.id}: invalid section`,
    );
  for (const m of e.media || [])
    check(
      media.some((x) => x.id === m),
      `${e.id}: missing media ${m}`,
    );
  for (const l of e.links || [])
    check(
      l.label && /^(https:\/\/|\.\.\/)[^\s<>"']+$/.test(l.url),
      `${e.id}: invalid link`,
    );
  inspectPrivate(JSON.stringify(e), e.id);
}
check(
  new Set(media.map((m) => m.id)).size === media.length,
  "Duplicate media id",
);
for (const m of media) {
  check(["image", "video"].includes(m.type), `${m.id}: invalid media type`);
  check(ids.has(m.project), `${m.id}: missing project`);
  check(m.title && m.caption, `${m.id}: missing caption`);
  check(
    await exists(path.join(root, "public", m.src)),
    `${m.id}: missing file`,
  );
  if (m.type === "video")
    check(
      await exists(path.join(root, "public/assets/images", m.poster)),
      `${m.id}: missing poster`,
    );
}
for (const l of links) {
  check(/^https:\/\//.test(l.url), `Invalid external URL: ${l.title}`);
  check(["public", "login"].includes(l.access), `Invalid access: ${l.title}`);
}
for (const id of site.featured)
  check(
    entries.some((e) => e.id === id && e.published),
    `Missing featured project ${id}`,
  );
async function walk(dir) {
  const items = await fs.readdir(dir, { withFileTypes: true });
  const arrays = await Promise.all(
    items.map((d) =>
      d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)],
    ),
  );
  return arrays.flat();
}
const dist = path.join(root, "dist");
const all = await walk(dist);
let localReferences = 0;
for (const file of all) {
  const stat = await fs.stat(file);
  check(
    stat.size < 95 * 1024 * 1024,
    `${path.relative(root, file)}: file exceeds 95 MB`,
  );
  if (!/\.(html|md|json|xml|txt|js|css)$/.test(file)) continue;
  const text = await fs.readFile(file, "utf8");
  inspectPrivate(text, path.relative(dist, file));
  if (!file.endsWith(".html")) continue;
  check(
    (text.match(/<h1(?:\s|>)/g) || []).length === 1,
    `${file}: expected one h1`,
  );
  check(text.includes('<html lang="ko">'), `${file}: missing Korean language`);
  const idList = [...text.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  check(new Set(idList).size === idList.length, `${file}: duplicate HTML id`);
  for (const m of text.matchAll(/\b(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|data:|mailto:)/.test(m[1])) continue;
    const rel = path.relative(dist, file).split(path.sep).join("/");
    const parsed = new URL(
      m[1].replaceAll("&amp;", "&"),
      new URL(rel, site.url),
    );
    check(
      parsed.pathname.startsWith(base),
      `${file}: link escaped site base ${m[1]}`,
    );
    let target = path.join(
      dist,
      decodeURIComponent(parsed.pathname.slice(base.length)),
    );
    if (parsed.pathname.endsWith("/")) target = path.join(target, "index.html");
    const present = await exists(target);
    check(present, `${path.relative(dist, file)}: missing ${m[1]}`);
    localReferences++;
    if (present && parsed.hash && target.endsWith(".html")) {
      const html = target === file ? text : await fs.readFile(target, "utf8");
      check(
        html.includes(`id="${decodeURIComponent(parsed.hash.slice(1))}"`),
        `${file}: missing anchor ${m[1]}`,
      );
    }
  }
  for (const m of text.matchAll(/<img\b[^>]*>/g))
    check(/\balt="[^"]*"/.test(m[0]), `${file}: image has no alt`);
  for (const m of text.matchAll(/<video\b[^>]*>/g))
    check(
      /\bcontrols\b/.test(m[0]) && /\bpreload="none"/.test(m[0]),
      `${file}: video needs controls and no eager load`,
    );
}
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(
  `PASS: ${entries.length} records, ${media.length} media, ${links.length} external links, ${localReferences} internal references. Content boundaries, files, headings and anchors checked.`,
);
