/**
 * Sermons page behavior.
 * ------------------------------------------------------------
 * The historical archive below is drawn from Audubon's existing public
 * sermon pages. Production sermon records will eventually come from the
 * church database/media workflow.
 */

const ARCHIVE = [
  {
    id: 1,
    title: "How to Be Great for God – Beyond Yourself",
    reference: "Ezra 8:1–15",
    speaker: "Pastor Jeff Akin",
    date: "February 12, 2023",
    dateISO: "2023-02-12",
    group: "ezra",
    series: "Ezra",
    tags: ["Ezra", "Mission"],
    audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2023/02/DR0000_0336-AudioTrimmer.com_.mp3",
    sourceUrl: "https://www.achurchinthepark.org/sermons/ezra/"
  },
  {
    id: 2,
    title: "The Inclusivity of God",
    reference: "Ezra 6:16–22",
    speaker: "Pastor Jeff Akin",
    date: "January 22, 2023",
    dateISO: "2023-01-22",
    group: "ezra",
    series: "Ezra",
    tags: ["Ezra", "Worship"],
    audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2023/01/DR0000_0333-AudioTrimmer.com_.mp3",
    sourceUrl: "https://www.achurchinthepark.org/sermons/ezra/"
  },
  {
    id: 3,
    title: "Bye Bye Babylon",
    reference: "Ezra 6:1–15",
    speaker: "Pastor Jeff Akin",
    date: "January 15, 2023",
    dateISO: "2023-01-15",
    group: "ezra",
    series: "Ezra",
    tags: ["Ezra", "Providence"],
    audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2023/01/DR0000_0332-AudioTrimmer.com_.mp3",
    sourceUrl: "https://www.achurchinthepark.org/sermons/"
  },
  {
    id: 4,
    title: "A Beginning",
    reference: "Ezra 3:8–13",
    speaker: "Pastor Jeff Akin",
    date: "October 30, 2022",
    dateISO: "2022-10-30",
    group: "ezra",
    series: "Ezra",
    tags: ["Ezra", "Worship"],
    audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2022/11/DR0000_0320-AudioTrimmer.com_.mp3",
    sourceUrl: "https://www.achurchinthepark.org/sermons/ezra/"
  },
  {
    id: 5,
    title: "Yet I Will Quietly Wait",
    reference: "Habakkuk 3:3–16",
    speaker: "Pastor Jeff Akin",
    date: "August 22, 2021",
    dateISO: "2021-08-22",
    group: "habakkuk",
    series: "Habakkuk",
    tags: ["Habakkuk", "Faith"],
    audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2021/09/I-Will-Quietly-Wait.m4a",
    sourceUrl: "https://www.achurchinthepark.org/sermons/habakkuk/"
  },
  {
    id: 6,
    title: "Yet, I Will Wait",
    reference: "Habakkuk 3:1–2",
    speaker: "Pastor Jeff Akin",
    date: "August 15, 2021",
    dateISO: "2021-08-15",
    group: "habakkuk",
    series: "Habakkuk",
    tags: ["Habakkuk", "Prayer"],
    audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2021/09/Yet-I-Will-Wait.m4a",
    sourceUrl: "https://www.achurchinthepark.org/sermons/habakkuk/"
  },
  {
    id: 7,
    title: "God Sees and He Knows",
    reference: "Habakkuk 2:6–20",
    speaker: "Pastor Jeff Akin",
    date: "August 8, 2021",
    dateISO: "2021-08-08",
    group: "habakkuk",
    series: "Habakkuk",
    tags: ["Habakkuk", "God"],
    audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2021/08/8.8.21.mp3",
    sourceUrl: "https://www.achurchinthepark.org/sermons/habakkuk/"
  },
  {
    id: 8,
    title: "The One God Opposes",
    reference: "Habakkuk 2:1–5",
    speaker: "Pastor Jeff Akin",
    date: "August 1, 2021",
    dateISO: "2021-08-01",
    group: "habakkuk",
    series: "Habakkuk",
    tags: ["Habakkuk", "Pride"],
    audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2021/08/8.1.21.mp3",
    sourceUrl: "https://www.achurchinthepark.org/sermons/habakkuk/"
  },
  {
    id: 9,
    title: "In Whom Shall We Trust?",
    reference: "Habakkuk 1:6–17",
    speaker: "Pastor Jeff Akin",
    date: "July 25, 2021",
    dateISO: "2021-07-25",
    group: "habakkuk",
    series: "Habakkuk",
    tags: ["Habakkuk", "Trust"],
    audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2021/07/7.25.21.mp3",
    sourceUrl: "https://www.achurchinthepark.org/sermons/habakkuk/"
  },
  {
    id: 10,
    title: "Will We Choose To Be Satisfied In Christ?",
    reference: "Habakkuk 1:1–5",
    speaker: "Pastor Jeff Akin",
    date: "July 18, 2021",
    dateISO: "2021-07-18",
    group: "habakkuk",
    series: "Habakkuk",
    tags: ["Habakkuk", "Christ"],
    audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2021/07/Sermon-7.18.21.mp3",
    sourceUrl: "https://www.achurchinthepark.org/sermons/habakkuk/"
  },
  {
    id: 11,
    title: "Will We Be Honest With God?",
    reference: "Habakkuk 1:1–5",
    speaker: "Pastor Jeff Akin",
    date: "July 11, 2021",
    dateISO: "2021-07-11",
    group: "habakkuk",
    series: "Habakkuk",
    tags: ["Habakkuk", "Prayer"],
    audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2021/07/7.11.21.mp3",
    sourceUrl: "https://www.achurchinthepark.org/sermons/habakkuk/"
  }
];

let activeFilter = "all";
let activeSort = "newest";
let selectedSermon = {
  ...AudubonSite.load().sermon
};

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
  const videoPanel = document.getElementById("videoSermonPanel");
  const audioPanel = document.getElementById("audioSermonPanel");
  const videoButton = document.getElementById("videoModeButton");
  const audioButton = document.getElementById("audioSermonButton");
  const videoPlayer = document.getElementById("featuredVideoPlayer");
  const videoPlaceholder = document.getElementById("videoSermonPlaceholder");
  const videoUnavailable = document.getElementById("videoUnavailable");
  const audioPlayer = document.getElementById("featuredAudioPlayer");
  const audioAvailability = document.getElementById("audioAvailability");

  videoPanel.classList.toggle("hidden", activeMediaMode !== "video");
  audioPanel.classList.toggle("hidden", activeMediaMode !== "audio");
  videoButton.classList.toggle("active", activeMediaMode === "video");
  audioButton.classList.toggle("active", activeMediaMode === "audio");

  setMediaSource(videoPlayer, selectedSermon.videoUrl || "");
  setMediaSource(audioPlayer, selectedSermon.audioUrl || "");

  const hasVideo = Boolean(selectedSermon.videoUrl);
  const hasAudio = Boolean(selectedSermon.audioUrl);

  videoPlayer.classList.toggle("hidden", !hasVideo);
  videoPlaceholder.classList.toggle("hidden", hasVideo);
  videoUnavailable.textContent = hasAudio
    ? "No video is attached to this historical archive item. Choose Listen only to hear the sermon."
    : "Video playback will appear here when a current sermon is published.";

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

  document.getElementById("sermonTitle").textContent =
    selectedSermon.title || "Featured sermon";
  document.getElementById("sermonReference").textContent =
    selectedSermon.reference || "Scripture";
  document.getElementById("sermonSpeaker").textContent =
    selectedSermon.speaker || "Speaker";
  document.getElementById("sermonDate").textContent =
    selectedSermon.archiveDate
      ? "From Audubon’s archive · " + selectedSermon.archiveDate
      : "Audubon sermon";

  document.getElementById("sermonTags").innerHTML =
    (selectedSermon.tags || [])
      .map(function (tag) {
        return '<span class="chip">' + AudubonSite.escapeHtml(tag) + "</span>";
      })
      .join("");

  const sourceLink = document.getElementById("sermonSourceLink");
  sourceLink.classList.toggle("hidden", !selectedSermon.sourceUrl);

  if (selectedSermon.sourceUrl) {
    sourceLink.href = selectedSermon.sourceUrl;
  }

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

  const items = ARCHIVE.filter(function (sermon) {
    const searchable = [
      sermon.title,
      sermon.reference,
      sermon.speaker,
      sermon.date,
      sermon.series
    ].concat(sermon.tags).join(" ").toLowerCase();

    const matchesQuery = !query || searchable.includes(query);
    const matchesFilter =
      activeFilter === "all" || sermon.group === activeFilter;

    return matchesQuery && matchesFilter;
  });

  return items.sort(function (a, b) {
    return activeSort === "oldest"
      ? a.dateISO.localeCompare(b.dateISO)
      : b.dateISO.localeCompare(a.dateISO);
  });
}

function selectArchiveSermon(id) {
  const sermon = ARCHIVE.find(function (item) {
    return String(item.id) === String(id);
  });

  if (!sermon) return;

  selectedSermon = {
    title: sermon.title,
    reference: sermon.reference,
    speaker: sermon.speaker,
    tags: sermon.tags,
    archiveDate: sermon.date,
    sourceUrl: sermon.sourceUrl,
    videoUrl: "",
    audioUrl: sermon.audioUrl
  };

  activeMediaMode = "audio";
  renderFeatured();

  const audioPlayer = document.getElementById("featuredAudioPlayer");
  document.querySelector(".sermons-page-feature").scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

  audioPlayer.play().catch(function () {
    // Some browsers require a second explicit press after smooth scrolling.
  });
}

function renderArchive() {
  const items = filteredArchive();
  const grid = document.getElementById("sermonGrid");

  document.getElementById("sermonResultCount").textContent =
    items.length + (items.length === 1 ? " sermon" : " sermons");

  grid.innerHTML = items.map(function (sermon) {
    return [
      '<article class="sermon-card archive-sermon-card">',
      '<div class="sermon-card-meta">',
      '<span class="sermon-ref">' + AudubonSite.escapeHtml(sermon.reference) + "</span>",
      '<span>' + AudubonSite.escapeHtml(sermon.date) + "</span>",
      "</div>",
      "<h3>" + AudubonSite.escapeHtml(sermon.title) + "</h3>",
      "<p>" + AudubonSite.escapeHtml(sermon.series) + " · " + AudubonSite.escapeHtml(sermon.speaker) + "</p>",
      '<div class="archive-card-actions">',
      '<button class="text-button listen-archive-sermon" data-id="' + sermon.id + '" type="button">Listen now →</button>',
      '<a class="archive-source-link" href="' + AudubonSite.escapeHtml(sermon.sourceUrl) + '" target="_blank" rel="noopener">Original archive ↗</a>',
      "</div>",
      "</article>"
    ].join("");
  }).join("");

  document.getElementById("sermonEmpty")
    .classList.toggle("hidden", items.length > 0);

  document.querySelectorAll(".listen-archive-sermon").forEach(function (button) {
    button.addEventListener("click", function () {
      selectArchiveSermon(button.dataset.id);
    });
  });
}

document.getElementById("sermonSearch").addEventListener("input", renderArchive);

document.getElementById("sermonSort").addEventListener("change", function (event) {
  activeSort = event.target.value;
  renderArchive();
});

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
  if (selectedSermon.videoUrl) {
    document.getElementById("featuredVideoPlayer").play();
  } else if (selectedSermon.audioUrl) {
    selectMediaMode("audio");
  } else {
    toast("A published sermon video will play here once media is attached.");
  }
});

window.addEventListener("audubon:rolechange", renderFeatured);

renderFeatured();
renderArchive();
