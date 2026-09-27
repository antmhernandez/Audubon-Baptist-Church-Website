const DEFAULT_DATA = {
  role: "public",
  announcement: "Sample announcement: Join us Wednesday evening for prayer and Bible study.",
  sermon: {
    title: "The Good Shepherd",
    reference: "John 10:1–18",
    speaker: "Pastor · name to confirm",
    tags: ["John", "Shepherd", "Gospel"]
  },
  events: [
    { id: "event-1", date: "Wednesday · Sample 6:30 PM", title: "Prayer & Bible Study", audience: "Churchwide", description: "A midweek gathering for prayer, fellowship, and study." },
    { id: "event-2", date: "Saturday · Sample 9:00 AM", title: "Church Work Day", audience: "Churchwide", description: "Serve together on practical projects around the church." },
    { id: "event-3", date: "Sunday · After Worship", title: "Fellowship Lunch", audience: "Members & guests", description: "A sample calendar item demonstrating RSVP capability." }
  ],
  rsvps: {},
  prayers: [
    { id: "prayer-1", visibility: "member", label: "Members", title: "Sample congregational prayer request", text: "A members-only request can be shared without publishing private details on the public website." },
    { id: "prayer-2", visibility: "group", label: "Ministry group", title: "Sample ministry-team request", text: "Group-level requests are visible only to members assigned to that ministry." },
    { id: "prayer-3", visibility: "leadership", label: "Leadership", title: "Sample leadership prayer concern", text: "Sensitive matters can be restricted to leaders rather than placed on a general list." }
  ]
};

const SAMPLE_SERMONS = [
  { id: 1, title: "The Good Shepherd", reference: "John 10:1–18", speaker: "Pastor · sample", group: "new", tags: ["John", "Shepherd", "Gospel"] },
  { id: 2, title: "Grace and Peace", reference: "Romans 5:1–11", speaker: "Pastor · sample", group: "new", tags: ["Romans", "Grace", "Peace"] },
  { id: 3, title: "The Lord Is My Shepherd", reference: "Psalm 23", speaker: "Pastor · sample", group: "old", tags: ["Psalms", "Trust", "Comfort"] },
  { id: 4, title: "Walking in Wisdom", reference: "Proverbs 3:1–12", speaker: "Pastor · sample", group: "old", tags: ["Proverbs", "Wisdom", "Trust"] }
];

const ROLE_LABELS = {
  public: "Public visitor",
  member: "Church member",
  group: "Ministry / group member",
  leadership: "Church leadership",
  admin: "Administrator"
};

const ROLE_LEVEL = { public: 0, member: 1, group: 2, leadership: 3, admin: 4 };

function cloneDefaultData() {
  return JSON.parse(JSON.stringify(DEFAULT_DATA));
}

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem("abcDemoV2") || "{}");
    return {
      ...cloneDefaultData(),
      ...stored,
      sermon: { ...cloneDefaultData().sermon, ...(stored.sermon || {}) },
      events: Array.isArray(stored.events) ? stored.events : cloneDefaultData().events,
      rsvps: stored.rsvps || {},
      prayers: Array.isArray(stored.prayers) ? stored.prayers : cloneDefaultData().prayers
    };
  } catch {
    return cloneDefaultData();
  }
}

let data = loadData();
let activeSermonFilter = "all";

function saveData() {
  try {
    localStorage.setItem("abcDemoV2", JSON.stringify(data));
  } catch {
    showToast("This browser is not allowing local demo storage.");
  }
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[ch]));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.add("hidden"), 3200);
}

function openDialog(dialog) {
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeDialog(dialog) {
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function renderAnnouncement() {
  document.getElementById("announcementText").textContent = data.announcement;
  document.getElementById("announcementInput").value = data.announcement;
}

function renderSermon() {
  const sermon = data.sermon;
  document.getElementById("sermonTitle").textContent = sermon.title || "Untitled sermon";
  document.getElementById("sermonReference").textContent = sermon.reference || "Scripture reference";
  document.getElementById("sermonSpeaker").textContent = sermon.speaker || "Speaker";
  document.getElementById("sermonTags").innerHTML = (sermon.tags || []).map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join("");
  document.getElementById("sermonTitleInput").value = sermon.title || "";
  document.getElementById("sermonReferenceInput").value = sermon.reference || "";
  document.getElementById("sermonSpeakerInput").value = sermon.speaker || "";
  document.getElementById("sermonTagsInput").value = (sermon.tags || []).join(", ");
}

function renderSermonLibrary() {
  const query = document.getElementById("sermonSearch").value.trim().toLowerCase();
  const matches = SAMPLE_SERMONS.filter(item => {
    const text = [item.title, item.reference, item.speaker, ...item.tags].join(" ").toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesFilter =
      activeSermonFilter === "all" ||
      item.group === activeSermonFilter ||
      (activeSermonFilter === "topic" && item.tags.length > 0);
    return matchesQuery && matchesFilter;
  });

  document.getElementById("sermonGrid").innerHTML = matches.map(item => `
    <article class="sermon-card">
      <span class="tag">Sample archive entry</span>
      <h3>${escapeHtml(item.title)}</h3>
      <span class="sermon-ref">${escapeHtml(item.reference)}</span>
      <p>${escapeHtml(item.speaker)}</p>
      <div class="chip-row">${item.tags.map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>
      <button class="text-button sermon-open" type="button" data-sermon-id="${item.id}">Open sermon →</button>
    </article>
  `).join("");

  document.getElementById("sermonEmpty").classList.toggle("hidden", matches.length !== 0);

  document.querySelectorAll(".sermon-open").forEach(button => {
    button.addEventListener("click", () => {
      const item = SAMPLE_SERMONS.find(sermon => String(sermon.id) === button.dataset.sermonId);
      if (!item) return;
      data.sermon = { title: item.title, reference: item.reference, speaker: item.speaker, tags: item.tags };
      saveData();
      renderSermon();
      document.getElementById("sermons").scrollIntoView({ behavior: "smooth" });
      showToast("Loaded a sample sermon into the featured area.");
    });
  });
}

function renderEvents() {
  const isMember = ROLE_LEVEL[data.role] >= ROLE_LEVEL.member;
  const grid = document.getElementById("eventGrid");
  grid.innerHTML = data.events.map(event => {
    const current = data.rsvps[event.id] || "";
    return `
      <article class="event-card">
        <span class="event-date">${escapeHtml(event.date)}</span>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.description)}</p>
        <div class="event-meta"><span class="chip">${escapeHtml(event.audience)}</span></div>
        <div class="rsvp-actions" aria-label="RSVP for ${escapeHtml(event.title)}">
          <button class="rsvp-choice ${current === "going" ? "selected" : ""}" type="button" data-rsvp-id="${escapeHtml(event.id)}" data-rsvp-value="going" ${isMember ? "" : "disabled"}>${isMember ? "Going" : "Sign in to RSVP"}</button>
          <button class="rsvp-choice ${current === "maybe" ? "selected" : ""}" type="button" data-rsvp-id="${escapeHtml(event.id)}" data-rsvp-value="maybe" ${isMember ? "" : "disabled"}>${isMember ? "Maybe" : "Member only"}</button>
        </div>
      </article>
    `;
  }).join("");

  document.getElementById("eventCount").textContent = String(data.events.length);

  grid.querySelectorAll("[data-rsvp-id]").forEach(button => {
    button.addEventListener("click", () => {
      if (!isMember) {
        openDialog(document.getElementById("signInDialog"));
        return;
      }
      const id = button.dataset.rsvpId;
      const value = button.dataset.rsvpValue;
      data.rsvps[id] = data.rsvps[id] === value ? "" : value;
      saveData();
      renderEvents();
      renderMemberSummary();
      showToast(data.rsvps[id] ? `RSVP saved: ${data.rsvps[id] === "going" ? "Going" : "Maybe"}.` : "RSVP cleared.");
    });
  });
}

function renderMemberSummary() {
  const workDay = data.events.find(event => event.title.toLowerCase().includes("work day"));
  if (!workDay) return;
  const answer = data.rsvps[workDay.id];
  document.getElementById("memberRsvpSummary").textContent =
    answer === "going" ? "Going ✓" : answer === "maybe" ? "Maybe" : "Not yet answered";
}

function renderPrayers() {
  const level = ROLE_LEVEL[data.role];
  const allowed = data.prayers.filter(item => level >= ROLE_LEVEL[item.visibility]);
  document.getElementById("prayerList").innerHTML = allowed.length
    ? allowed.map(item => `
        <article class="prayer-item">
          <header>
            <h4>${escapeHtml(item.title)}</h4>
            <span class="tag">${escapeHtml(item.label || ROLE_LABELS[item.visibility])}</span>
          </header>
          <p>${escapeHtml(item.text)}</p>
        </article>
      `).join("")
    : "<p>No prayer items are visible at this access level.</p>";
}

function renderRole() {
  const role = data.role;
  const level = ROLE_LEVEL[role];
  const isMember = level >= ROLE_LEVEL.member;
  const isGroup = level >= ROLE_LEVEL.group;
  const isLeadership = level >= ROLE_LEVEL.leadership;
  const isAdmin = level >= ROLE_LEVEL.admin;

  document.getElementById("roleSwitcher").value = role;
  document.getElementById("dialogRole").value = role === "public" ? "member" : role;
  document.getElementById("memberArea").classList.toggle("hidden", !isMember);
  document.getElementById("adminArea").classList.toggle("hidden", !isAdmin);
  document.getElementById("accessBadge").textContent = ROLE_LABELS[role];
  document.getElementById("memberHeading").textContent = isAdmin ? "Administrator workspace and member view." : "Welcome to the member area.";
  document.getElementById("rsvpRoleNote").textContent = isMember ? "RSVPs are enabled in this preview." : "Members can RSVP after signing in.";
  document.getElementById("memberSignInButton").textContent = isMember ? ROLE_LABELS[role] : "Member sign in";

  document.querySelectorAll(".group-only").forEach(element => element.classList.toggle("hidden", !isGroup));
  document.querySelectorAll(".leadership-only").forEach(element => element.classList.toggle("hidden", !isLeadership));

  renderEvents();
  renderPrayers();
  renderMemberSummary();
}

function openMemberTab(tab) {
  document.querySelectorAll(".member-tab").forEach(button => button.classList.toggle("active", button.dataset.tab === tab));
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tab));
}

function activateRole(role, scrollToMember = false) {
  data.role = role;
  saveData();
  renderRole();
  if (role !== "public") showToast(`Previewing as ${ROLE_LABELS[role]}. This is a design demo, not real authentication.`);
  if (scrollToMember && role !== "public") {
    document.getElementById("memberArea").scrollIntoView({ behavior: "smooth" });
  }
}

document.getElementById("roleSwitcher").addEventListener("change", event => activateRole(event.target.value));

document.getElementById("copyLinkButton").addEventListener("click", async () => {
  const link = window.location.href.split("#")[0];
  try {
    await navigator.clipboard.writeText(link);
    showToast("Share link copied.");
  } catch {
    window.prompt("Copy this share link:", link);
  }
});

document.getElementById("menuButton").addEventListener("click", () => {
  const nav = document.getElementById("mainNav");
  const isOpen = nav.classList.toggle("open");
  document.getElementById("menuButton").setAttribute("aria-expanded", String(isOpen));
});

document.querySelectorAll("#mainNav a").forEach(link => {
  link.addEventListener("click", () => {
    document.getElementById("mainNav").classList.remove("open");
    document.getElementById("menuButton").setAttribute("aria-expanded", "false");
  });
});

document.getElementById("memberSignInButton").addEventListener("click", () => {
  if (ROLE_LEVEL[data.role] >= ROLE_LEVEL.member) {
    document.getElementById("memberArea").scrollIntoView({ behavior: "smooth" });
  } else {
    openDialog(document.getElementById("signInDialog"));
  }
});

document.getElementById("dialogContinue").addEventListener("click", () => {
  const role = document.getElementById("dialogRole").value;
  closeDialog(document.getElementById("signInDialog"));
  activateRole(role, true);
});

document.querySelectorAll(".member-tab").forEach(button => {
  button.addEventListener("click", () => openMemberTab(button.dataset.tab));
});

document.querySelectorAll("[data-open-member]").forEach(button => {
  button.addEventListener("click", () => {
    if (ROLE_LEVEL[data.role] < ROLE_LEVEL.member) {
      openDialog(document.getElementById("signInDialog"));
      return;
    }
    openMemberTab(button.dataset.openMember);
    document.getElementById("memberArea").scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("sermonSearch").addEventListener("input", renderSermonLibrary);

document.querySelectorAll("[data-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeSermonFilter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(item => item.classList.toggle("active", item === button));
    renderSermonLibrary();
  });
});

document.getElementById("watchDemoButton").addEventListener("click", () => showToast("A real sermon video will play here after the media provider is connected."));
document.getElementById("audioDemoButton").addEventListener("click", () => showToast("An audio-only sermon option can be generated during media processing."));
document.getElementById("givingButton").addEventListener("click", () => showToast("Production will hand off securely to the church's approved giving provider."));
document.getElementById("volunteerButton").addEventListener("click", () => showToast("Sample volunteer signup recorded conceptually; real shared signups require the database phase."));
document.getElementById("newPostButton").addEventListener("click", () => showToast("A production forum will open a new-post composer here."));

document.getElementById("prayerForm").addEventListener("submit", event => {
  event.preventDefault();
  if (ROLE_LEVEL[data.role] < ROLE_LEVEL.member) {
    openDialog(document.getElementById("signInDialog"));
    return;
  }
  const visibility = document.getElementById("prayerVisibilityInput").value;
  data.prayers.unshift({
    id: `prayer-${Date.now()}`,
    visibility,
    label: visibility === "member" ? "Members" : visibility === "group" ? "Ministry group" : "Leadership",
    title: document.getElementById("prayerTitleInput").value.trim(),
    text: document.getElementById("prayerTextInput").value.trim()
  });
  saveData();
  event.target.reset();
  renderPrayers();
  showToast("Sample prayer request added in this browser only.");
});

document.getElementById("announcementForm").addEventListener("submit", event => {
  event.preventDefault();
  data.announcement = document.getElementById("announcementInput").value.trim() || DEFAULT_DATA.announcement;
  saveData();
  renderAnnouncement();
  showToast("Homepage announcement updated in this browser.");
});

document.getElementById("eventForm").addEventListener("submit", event => {
  event.preventDefault();
  data.events.push({
    id: `event-${Date.now()}`,
    title: document.getElementById("eventTitle").value.trim(),
    date: document.getElementById("eventDate").value.trim(),
    audience: document.getElementById("eventAudience").value,
    description: "Administrator-created sample event."
  });
  saveData();
  event.target.reset();
  renderEvents();
  showToast("Sample calendar item added.");
});

document.getElementById("sermonForm").addEventListener("submit", event => {
  event.preventDefault();
  data.sermon = {
    title: document.getElementById("sermonTitleInput").value.trim(),
    reference: document.getElementById("sermonReferenceInput").value.trim(),
    speaker: document.getElementById("sermonSpeakerInput").value.trim(),
    tags: document.getElementById("sermonTagsInput").value.split(",").map(tag => tag.trim()).filter(Boolean)
  };
  saveData();
  renderSermon();
  showToast("Featured sermon metadata updated in this browser.");
});

document.getElementById("processPreview").addEventListener("click", () => {
  const start = document.getElementById("trimStart").value.trim();
  const end = document.getElementById("trimEnd").value.trim();
  const gain = document.getElementById("audioGain").value.trim();
  const normalized = document.getElementById("normalizeAudio").checked;
  document.getElementById("mediaJobStatus").textContent =
    `Future media job: trim ${start || "start"}–${end || "end"}, gain ${gain || "unchanged"}, speech normalization ${normalized ? "on" : "off"}. A production worker would run this with FFmpeg or a video API.`;
});

document.getElementById("sermonAdminShortcut").addEventListener("click", () => {
  activateRole("admin");
  document.getElementById("adminArea").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("resetDemo").addEventListener("click", () => {
  localStorage.removeItem("abcDemoV2");
  data = cloneDefaultData();
  activeSermonFilter = "all";
  document.getElementById("sermonSearch").value = "";
  document.querySelectorAll("[data-filter]").forEach(button => button.classList.toggle("active", button.dataset.filter === "all"));
  renderAll();
  showToast("Demo data reset.");
});

function renderAll() {
  renderAnnouncement();
  renderSermon();
  renderSermonLibrary();
  renderRole();
}

renderAll();
