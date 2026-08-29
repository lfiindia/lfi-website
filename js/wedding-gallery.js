// Renders the real wedding-invitation demo catalog (window.demoCatalog, loaded
// from demo-data.js) into the Wedding Invitation page — search + category
// filter chips + a grid of cards linking out to the real Google Drive files.
(function () {
  const searchEl = document.getElementById("demoSearch");
  const chipWrap = document.getElementById("categoryChips");
  const sectionsWrap = document.getElementById("demoSections");
  const totalEl = document.getElementById("demoTotalCount");

  if (!sectionsWrap || !window.demoCatalog) return;

  const categories = window.demoCatalog.map((cat, index) => ({
    ...cat,
    key: `cat-${index}`,
    short: cat.title.split("(")[0].trim(),
  }));

  let active = "all";
  let query = "";

  function toInitials(name) {
    const cleaned = name.replace(/\.[a-z0-9]+$/i, "").trim();
    const words = cleaned.split(/\s+/).slice(0, 2);
    return words.map((w) => w[0]?.toUpperCase() || "").join("") || "DE";
  }

  function cardTemplate(item, catName, uniqueName) {
    const safeTitle = uniqueName.replace(/"/g, "&quot;");
    const isAudio = item.mime && item.mime.startsWith("audio/");
    const audioPreviewUrl = isAudio ? `https://drive.google.com/uc?export=download&id=${item.id}` : "";
    const thumbContent = item.thumbnail
      ? `<img src="${item.thumbnail}" alt="${safeTitle} preview" loading="lazy" referrerpolicy="no-referrer" />`
      : `<div class="thumb-fallback">${isAudio ? "Audio" : toInitials(uniqueName)}</div>`;
    const audioPlayer = audioPreviewUrl
      ? `<audio class="audio-preview" controls preload="none" src="${audioPreviewUrl}">Audio preview is not supported in this browser.</audio>`
      : "";

    return `
      <article class="demo-card reveal" data-name="${safeTitle.toLowerCase()}" data-category="${catName}">
        <div class="thumb" data-initial="${toInitials(uniqueName)}">
          ${thumbContent}
          <span class="thumb-badge">${catName}</span>
        </div>
        <div class="demo-body">
          <p class="demo-title">${safeTitle}</p>
          ${audioPlayer}
          <div class="demo-actions">
            <a href="${item.url}" target="_blank" rel="noopener noreferrer">Open Demo</a>
            <button type="button" data-copy="${item.url}">Copy Link</button>
          </div>
        </div>
      </article>
    `;
  }

  function renderChips() {
    const chipList = [
      `<button class="filter-btn ${active === "all" ? "active" : ""}" data-filter="all">All Categories</button>`,
    ]
      .concat(
        categories.map(
          (cat) =>
            `<button class="filter-btn ${active === cat.key ? "active" : ""}" data-filter="${cat.key}">${cat.short}</button>`
        )
      )
      .join("");
    chipWrap.innerHTML = chipList;
  }

  function buildSection(cat) {
    const countByName = {};
    const displayItems = cat.items.map((item) => {
      countByName[item.name] = (countByName[item.name] || 0) + 1;
      const variant = countByName[item.name];
      return { ...item, displayName: countByName[item.name] > 1 ? `${item.name} \u2022 Variant ${variant}` : item.name };
    });

    const matchItems = displayItems.filter((item) => item.displayName.toLowerCase().includes(query));
    if (!matchItems.length) return "";

    const cards = matchItems.map((item) => cardTemplate(item, cat.short, item.displayName)).join("");

    return `
      <section class="demo-section reveal visible" data-cat="${cat.key}">
        <div class="demo-head">
          <div>
            <h3>${cat.title}</h3>
            <div class="demo-count">${matchItems.length} preview cards</div>
          </div>
          <a class="btn btn-outline btn-sm" href="${cat.folderUrl}" target="_blank" rel="noopener noreferrer">Open Full Folder</a>
        </div>
        <div class="demo-grid">${cards}</div>
      </section>
    `;
  }

  function renderSections() {
    const selected = active === "all" ? categories : categories.filter((c) => c.key === active);
    const html = selected.map(buildSection).filter(Boolean).join("");
    sectionsWrap.innerHTML =
      html || `<p class="text-center text-muted" style="padding:2rem 0">No demos found for your search. Try another keyword.</p>`;

    const shown = sectionsWrap.querySelectorAll(".demo-card").length;
    if (totalEl) totalEl.textContent = String(shown);

    sectionsWrap.querySelectorAll("img").forEach((img) => {
      img.addEventListener("error", () => {
        const wrapper = img.closest(".thumb");
        if (!wrapper) return;
        img.remove();
        const initials = wrapper.getAttribute("data-initial") || "DE";
        const fallback = document.createElement("div");
        fallback.className = "thumb-fallback";
        fallback.textContent = initials;
        wrapper.prepend(fallback);
      });
    });

    sectionsWrap.querySelectorAll("[data-copy]").forEach((btn) => {
      btn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(btn.getAttribute("data-copy"));
          const old = btn.textContent;
          btn.textContent = "Copied";
          setTimeout(() => (btn.textContent = old), 1100);
        } catch (error) {
          btn.textContent = "Copy failed";
          setTimeout(() => (btn.textContent = "Copy Link"), 1000);
        }
      });
    });
  }

  renderChips();
  renderSections();

  chipWrap.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-filter]");
    if (!btn) return;
    active = btn.getAttribute("data-filter");
    renderChips();
    renderSections();
  });

  if (searchEl) {
    searchEl.addEventListener("input", (event) => {
      query = event.target.value.trim().toLowerCase();
      renderSections();
    });
  }
})();
