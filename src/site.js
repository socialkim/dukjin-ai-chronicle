document.querySelectorAll("[data-filterable]").forEach((section) => {
  const input = section.querySelector('input[type="search"]');
  const items = [...section.querySelectorAll("[data-item]")];
  const buttons = [...section.querySelectorAll("[data-filter]")];
  const params = new URLSearchParams(location.search);
  let category = params.get("category") || "전체";
  if (!buttons.some((b) => b.dataset.filter === category)) category = "전체";
  input.value = params.get("q") || "";
  function apply(updateUrl = true) {
    const query = input.value.trim().toLocaleLowerCase("ko-KR");
    let count = 0;
    items.forEach((item) => {
      const visible =
        (category === "전체" || item.dataset.category === category) &&
        query
          .split(/\s+/)
          .every((word) =>
            item.dataset.search.toLocaleLowerCase("ko-KR").includes(word),
          );
      item.hidden = !visible;
      if (visible) count++;
    });
    buttons.forEach((b) =>
      b.setAttribute("aria-pressed", String(b.dataset.filter === category)),
    );
    section.querySelector(".result-count").textContent =
      `${count}개의 기록${category === "전체" ? "" : " · " + category}`;
    section.querySelector(".empty-state").hidden = count > 0;
    if (updateUrl) {
      const url = new URL(location.href);
      query
        ? url.searchParams.set("q", input.value.trim())
        : url.searchParams.delete("q");
      category === "전체"
        ? url.searchParams.delete("category")
        : url.searchParams.set("category", category);
      history.replaceState(null, "", url);
    }
  }
  input.addEventListener("input", () => apply());
  buttons.forEach((b) =>
    b.addEventListener("click", () => {
      category = b.dataset.filter;
      apply();
    }),
  );
  section.querySelector("[data-clear]").addEventListener("click", () => {
    input.value = "";
    category = "전체";
    apply();
    input.focus();
  });
  section
    .querySelector("form")
    .addEventListener("submit", (e) => e.preventDefault());
  apply(false);
});

const viewer = document.querySelector("#image-viewer");
document.querySelectorAll("[data-image]").forEach((button) =>
  button.addEventListener("click", () => {
    viewer.querySelector("img").src = button.dataset.image;
    viewer.querySelector("img").alt = button.querySelector("img").alt;
    viewer.querySelector("figcaption").textContent = button.dataset.caption;
    viewer.showModal();
  }),
);
viewer?.querySelector("button").addEventListener("click", () => viewer.close());
viewer?.addEventListener("click", (event) => {
  if (event.target === viewer) viewer.close();
});
document.querySelectorAll(".share-button").forEach((button) =>
  button.addEventListener("click", async () => {
    const status = button.parentElement.querySelector(".share-status");
    try {
      await navigator.clipboard.writeText(location.href);
      status.textContent = "링크를 복사했습니다.";
    } catch {
      status.textContent = "주소창의 링크를 복사해 주세요.";
    }
  }),
);
document
  .querySelectorAll(".print-button")
  .forEach((button) => button.addEventListener("click", () => window.print()));
const progress = document.querySelector(".reading-progress");
if (progress) {
  let scheduled = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, scrollY / max) : 0})`;
    scheduled = false;
  };
  addEventListener(
    "scroll",
    () => {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(update);
      }
    },
    { passive: true },
  );
  update();
}
