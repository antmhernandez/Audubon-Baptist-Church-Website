/**
 * Optional current-sermon catalog.
 *
 * Edit sermon-catalog.json (or let the future authorized NAS publishing
 * worker update it) to expose recently published R2 video/audio and
 * historical archive destinations. This file never contacts the NAS.
 *
 * Privacy: this is public metadata only. No credentials or private data.
 */
(async function () {
  const container = document.getElementById("currentSermonCatalog");
  const list = document.getElementById("currentSermonList");
  const archiveSection = document.getElementById("additionalSermonArchive");
  const archiveList = document.getElementById("additionalArchiveList");
  if (!container || !list || !archiveSection || !archiveList) return;

  function validUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(String(value));
      return url.protocol === "https:" ? url.href : "";
    } catch {
      return "";
    }
  }

  function textNode(tag, value, className) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    element.textContent = value || "";
    return element;
  }

  function mediaItem(item) {
    if (!item || typeof item !== "object") return null;
    const videoUrl = validUrl(item.videoUrl);
    const audioUrl = validUrl(item.audioUrl);
    const archiveUrl = validUrl(item.archiveUrl);
    if (!videoUrl && !audioUrl && !archiveUrl) return null;

    const card = document.createElement("article");
    card.className = "catalog-sermon";
    card.appendChild(textNode("p", item.date || "", "catalog-date"));
    card.appendChild(textNode("h3", item.title || "Sermon"));
    card.appendChild(textNode("p",
      [item.scripture, item.speaker].filter(Boolean).join(" · "),
      "catalog-meta"));

    const actions = document.createElement("div");
    actions.className = "catalog-actions";

    if (videoUrl) {
      const link = textNode("a", "Watch video ↗");
      link.href = videoUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      actions.appendChild(link);
    }

    if (audioUrl) {
      const link = textNode("a", "Listen / download audio ↗");
      link.href = audioUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      actions.appendChild(link);
    }

    if (archiveUrl) {
      const link = textNode("a", "Open archive ↗");
      link.href = archiveUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      actions.appendChild(link);
    }

    card.appendChild(actions);
    return card;
  }

  try {
    const response = await fetch("sermon-catalog.json", { cache: "no-store" });
    if (!response.ok) return;
    const catalog = await response.json();
    if (catalog.schemaVersion !== 1) return;

    const recent = Array.isArray(catalog.recent)
      ? catalog.recent.slice(0, 4) : [];
    recent.forEach(item => {
      const card = mediaItem(item);
      if (card) list.appendChild(card);
    });
    container.classList.toggle("hidden", !list.children.length);

    const archive = Array.isArray(catalog.archive) ? catalog.archive : [];
    archive.forEach(item => {
      const card = mediaItem(item);
      if (card) archiveList.appendChild(card);
    });
    archiveSection.classList.toggle("hidden", !archiveList.children.length);
  } catch {
    // The established historical Audubon archive remains available.
  }
})();
