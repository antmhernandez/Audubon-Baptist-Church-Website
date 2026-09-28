/**
 * Sermons page behavior.
 * ------------------------------------------------------------
 * Production sermon records will eventually provide videoUrl and audioUrl.
 * The audio derivative is intended as a lower-data listening option.
 */

const ARCHIVE = [
  {
    id: 1,
    title: "How to Be Great for God – Beyond Yourself",
    reference: "Ezra 8:1–15",
    speaker: "Pastor Jeff Akin",
    date: "February 12, 2023",
    group: "ezra",
    tags: ["Ezra", "Mission"]
  },
  {
    id: 2,
    title: "The Inclusivity of God",
    reference: "Ezra 6:16–22",
    speaker: "Pastor Jeff Akin",
    date: "January 22, 2023",
    group: "ezra",
    tags: ["Ezra", "Worship"]
  },
  {
    id: 3,
    title: "Bye Bye Babylon",
    reference: "Ezra 6:1–15",
    speaker: "Pastor Jeff Akin",
    date: "January 15, 2023",
    group: "ezra",
    tags: ["Ezra", "Providence"]
  },
  {
    id: 4,
    title: "Yet I Will Quietly Wait",
    reference: "Habakkuk 3:3–16",
    speaker: "Pastor Jeff Akin",
    date: "August 22, 2021",
    group: "habakkuk",
    tags: ["Habakkuk", "Faith"]
  }
];

let activeFilter = "all";
let activeMediaMode =
  new URLSearchParams(window.location.search).get("mode") === "audio"
    ? "audio"
    : "video";

function toast(message) {
  const element = document.getElementById("sermonToast");
  element.textContent = message;
  element.classList.remove("hidden");

  clearTimeout(toast.timer);
  toast.timer = setTimeout(function () {
    element.classList.add("hidden");
  }, 2800);
}

function setMediaSource(player, url) {
  if (!url) {
    player.removeAttribute("src");
    player.load();
    return;
  }

  if (player.getAttribute("src") !== url) {
    player.src = url;
    player.load();
  }
}

function renderMediaMode() {
  const data = AudubonSite.load();
  const sermon = data.sermon || {};

  const videoPanel = document.getElementById("videoSermonPanel");
  const audioPanel = document.getElementById("audioSermonPanel");
  const videoButton = document.getElementById("videoModeButton");
  const audioButton = document.getElementById("audioSermonButton");
  const videoPlayer = document.getElementById("featuredVideoPlayer");
  const videoPlaceholder = document.getElementById("videoSermonPlaceholder");
  const audioPlayer = document.getElementById("featuredAudioPlayer");
  const audioAvailability = document.getElementById("audioAvailability");

  videoPanel.classList.toggle("hidden", activeMediaMode !== "video");
  audioPanel.classList.toggle("hidden", activeMediaMode !== "audio");
  videoButton.classList.toggle("active", activeMediaMode === "video");
  audioButton.classList.toggle("active", activeMediaMode === "audio");

  setMediaSource(videoPlayer, sermon.videoUrl || "");
  setMediaSource(audioPlayer, sermon.audioUrl || "");

  const hasVideo = Boolean(sermon.videoUrl);
  const hasAudio = Boolean(sermon.audioUrl);

  videoPlayer.classList.toggle("hidden", !hasVideo);
  videoPlaceholder.classList.toggle("hidden", hasVideo);
  audioPlayer.classList.toggle("hidden", !hasAudio);
  audioAvailability.classList.toggle("hidden", hasAudio);
}

function selectMediaMode(mode) {
  activeMediaMode = mode;

  const otherPlayer =
    mode === "audio"
      ? document.getElementById("featuredVideoPlayer")
      : document.getElementById("featuredAudioPlayer");

  if (otherPlayer && !otherPlayer.paused) {
    otherPlayer.pause();
  }

  renderMediaMode();
}

function renderFeatured() {
  const data = AudubonSite.load();
  const sermon = data.sermon || {};

  document.getElementById("sermonTitle").textContent =
    sermon.title || "Featured sermon";
  document.getElementById("sermonReference").textContent =
    sermon.reference || "Scripture";
  document.getElementById("sermonSpeaker").textContent =
    sermon.speaker || "Speaker";

  document.getElementById("sermonTags").innerHTML = (sermon.tags || [])
    .map(function (tag) {
      return '<span class="chip">' + AudubonSite.escapeHtml(tag) + "</span>";
    })
    .join("");

  const isAdmin =
    (AudubonSite.ROLE_LEVEL[data.role] || 0) >= AudubonSite.ROLE_LEVEL.admin;

  document.querySelectorAll(".admin-sermon-link").forEach(function (element) {
    element.classList.toggle("hidden", !isAdmin);
  });

  renderMediaMode();
}

function filteredArchive() {
  const query = document.getElementById("sermonSearch")
    .value
    .trim()
    .toLowerCase();

  return ARCHIVE.filter(function (sermon) {
    const searchable = [
      sermon.title,
      sermon.reference,
      sermon.speaker,
      sermon.date
    ].concat(sermon.tags).join(" ").toLowerCase();

    const matchesQuery = !query || searchable.includes(query);
    const matchesFilter =
      activeFilter === "all" || sermon.group === activeFilter;

    return matchesQuery && matchesFilter;
  });
}

function renderArchive() {
  const items = filteredArchive();
  const grid = document.getElementById("sermonGrid");

  grid.innerHTML = items.map(function (sermon) {
    return [
      '<article class="sermon-card">',
      '<span class="sermon-ref">' + AudubonSite.escapeHtml(sermon.reference) + "</span>",
      "<h3>" + AudubonSite.escapeHtml(sermon.title) + "</h3>",
      "<p>" + AudubonSite.escapeHtml(sermon.date) + " · " + AudubonSite.escapeHtml(sermon.speaker) + "</p>",
      '<button class="text-button feature-archive-sermon" data-id="' + sermon.id + '" type="button">Feature in prototype →</button>',
      "</article>"
    ].join("");
  }).join("");

  document.getElementById("sermonEmpty")
    .classList.toggle("hidden", items.length > 0);

  document.querySelectorAll(".feature-archive-sermon").forEach(function (button) {
    button.addEventListener("click", function () {
      const sermon = ARCHIVE.find(function (item) {
        return String(item.id) === button.dataset.id;
      });

      if (!sermon) return;

      const data = AudubonSite.load();

      data.sermon = {
        ...data.sermon,
        title: sermon.title,
        reference: sermon.reference,
        speaker: sermon.speaker,
        tags: sermon.tags
      };

      AudubonSite.save(data);
      renderFeatured();
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast("Featured sermon updated in this browser prototype.");
    });
  });
}

document.getElementById("sermonSearch").addEventListener("input", renderArchive);

document.querySelectorAll("[data-filter]").forEach(function (button) {
  button.addEventListener("click", function () {
    activeFilter = button.dataset.filter;

    document.querySelectorAll("[data-filter]").forEach(function (item) {
      item.classList.toggle("active", item === button);
    });

    renderArchive();
  });
});

document.getElementById("videoModeButton").addEventListener("click", function () {
  selectMediaMode("video");
});

document.getElementById("audioSermonButton").addEventListener("click", function () {
  selectMediaMode("audio");
});

document.getElementById("watchSermonButton").addEventListener("click", function () {
  const sermon = AudubonSite.load().sermon || {};

  if (sermon.videoUrl) {
    document.getElementById("featuredVideoPlayer").play();
  } else {
    toast("The published sermon video will play here once the media pipeline is connected.");
  }
});

window.addEventListener("audubon:rolechange", renderFeatured);

renderFeatured();
renderArchive();
