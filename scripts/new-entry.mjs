import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
const [id, ...titleParts] = process.argv.slice(2);
if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id || "") || titleParts.length === 0) {
  console.error('사용법: npm run new -- my-project "새 작업의 제목"');
  process.exit(1);
}
const date = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const entry = {
  id,
  title: titleParts.join(" "),
  date,
  dateLabel: date.replaceAll("-", ".") + " · 제작 기록",
  updated: date,
  published: false,
  category: "업무와 도구",
  summary: "작업의 목적과 결과를 한두 문장으로 작성합니다.",
  tools: [],
  cover: "",
  status: "작성 중",
  sections: [
    {
      heading: "어떤 필요에서 시작했나요?",
      paragraphs: ["구체적인 상황과 요청을 작성합니다."],
    },
    {
      heading: "무엇을 만들고 바꾸었나요?",
      paragraphs: ["실제 결과와 수정 과정을 작성합니다."],
    },
  ],
  milestones: [],
  links: [],
  media: [],
  note: "",
};
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
try {
  await fs.writeFile(
    path.join(root, "content/entries", id + ".json"),
    JSON.stringify(entry, null, 2) + "\n",
    { flag: "wx" },
  );
  console.log(
    `Created content/entries/${id}.json (published: false). 내용 작성 후 true로 바꾸고 npm test를 실행하세요.`,
  );
} catch (e) {
  console.error(
    e.code === "EEXIST" ? "같은 id의 기록이 이미 있습니다." : e.message,
  );
  process.exit(1);
}
