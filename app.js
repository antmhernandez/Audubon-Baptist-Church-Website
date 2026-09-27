const STORAGE_KEY = "abcDemoV3";
const ROLE_LABELS = {
  public: "Public visitor",
  member: "Church member",
  group: "Ministry / group member",
  leadership: "Church leadership",
  admin: "Administrator"
};
const ROLE_LEVEL = { public: 0, member: 1, group: 2, leadership: 3, admin: 4 };

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function nextWeekday(start, weekday, offsetWeeks = 0) {
  const date = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const delta = (weekday - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + delta + offsetWeeks * 7);
  return date;
}

function addDays(start, count) {
  const date = new Date(start);
  date.setDate(date.getDate() + count);
  return date;
}

function buildDefaultEvents() {
  const today = new Date();
  const events = [];
  for (let week = 0; week < 14; week += 1) {
    const sunday = nextWeekday(today, 0, week);
    const wednesday = nextWeekday(today, 3, week);
    events.push({
      id: `worship-${ymd(sunday)}`,
      dateISO: ymd(sunday),
      time: "10:30",
      title: "Sunday Worship",
      audience: "churchwide",
      description: "Audubon's published materials list Sunday worship at 10:30 AM. Please confirm the current schedule before production.",
      source: "published"
    });
    events.push({
      id: `midweek-${ymd(wednesday)}`,
      dateISO: ymd(wednesday),
      time: "18:30",
      title: "Midweek Service",
      audience: "churchwide",
      description: "Audubon's published materials list a Wednesday midweek service at 6:30 PM. Please confirm the current schedule before production.",
      source: "published"
    });
  }
  const workDay = addDays(today, 12);
  const groupMeeting = addDays(today, 31);
  events.push({
    id: "sample-work-day",
    dateISO: ymd(workDay),
    time: "09:00",
    title: "Sample: Church Work Day",
    audience: "member",
    description: "Demonstration event showing member RSVP and volunteer planning.",
    source: "sample"
  });
  events.push({
    id: "sample-ministry-meeting",
    dateISO: ymd(groupMeeting),
    time: "18:00",
    title: "Sample: Ministry Team Meeting",
    audience: "group",
    description: "Demonstration event showing ministry-specific calendar visibility.",
    source: "sample"
  });
  return events;
}

function defaultData() {
  return {
    role: "public",
    announcement: "Welcome to Audubon Baptist Church — A Church in the Park.",
    sermon: {
      title: "How to Be Great for God – Beyond Yourself",
      reference: "Ezra 8:1–15",
      speaker: "Pastor Jeff Akin",
      tags: ["Ezra", "Beyond Yourself", "Mission"]
    },
    events: buildDefaultEvents(),
    rsvps: {},
    prayers: [
      { id: "prayer-1", visibility: "member", label: "Members", title: "Sample congregational prayer request", text: "A members-only request can be shared without publishing private details on the public website." },
      { id: "prayer-2", visibility: "group", label: "Ministry group", title: "Sample ministry-team request", text: "Group-level requests are visible only to members assigned to that ministry." },
      { id: "prayer-3", visibility: "leadership", label: "Leadership", title: "Sample leadership prayer concern", text: "Sensitive matters can be restricted to leaders rather than placed on a general list." }
    ],
    mediaDrafts: []
  };
}

const ARCHIVE_SERMONS = [
  { id: 1, title: "How to Be Great for God – Beyond Yourself", reference: "Ezra 8:1–15", speaker: "Pastor Jeff Akin", date: "February 12, 2023", group: "ezra", tags: ["Ezra", "Mission", "Beyond Yourself"] },
  { id: 2, title: "The Inclusivity of God", reference: "Ezra 6:16–22", speaker: "Pastor Jeff Akin", date: "January 22, 2023", group: "ezra", tags: ["Ezra", "Worship", "God"] },
  { id: 3, title: "Bye Bye Babylon", reference: "Ezra 6:1–15", speaker: "Pastor Jeff Akin", date: "January 15, 2023", group: "ezra", tags: ["Ezra", "Providence"] },
  { id: 4, title: "Yet I Will Quietly Wait", reference: "Habakkuk 3:3–16", speaker: "Pastor Jeff Akin", date: "August 22, 2021", group: "habakkuk", tags: ["Habakkuk", "Waiting", "Faith"] }
];

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    const base = defaultData();
    return {
      ...base,
      ...stored,
      sermon: { ...base.sermon, ...(stored.sermon || {}) },
      events: Array.isArray(stored.events) && stored.events.some(event => event.dateISO) ? stored.events : base.events,
      rsvps: stored.rsvps || {},
      prayers: Array.isArray(stored.prayers) && stored.prayers.length ? stored.prayers : base.prayers,
      mediaDrafts: Array.isArray(stored.mediaDrafts) ? stored.mediaDrafts : []
    };
  } catch {
    return defaultData();
  }
}

let data = loadData();
let activeSermonFilter = "all";

function saveData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
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
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 3200);
}

function openDialog(dialog) {
  if (typeof dialog.showModal === "function") dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeDialog(dialog) {
  if (typeof dialog.close === "function") dialog.close();
  else dialog.removeAttribute("open");
}

function formatTime(time) {
  if (!time) return "Time TBD";
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
}

function formatEventDate(event) {
  const [year, month, day] = event.dateISO.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const formatted = new Intl.DateTimeFormat("en-US", { weekday: "short", month: "short", day: "numeric" }).format(date);
  return `${formatted} · ${formatTime(event.time)}`;
}

function allowedEvents() {
  const level = ROLE_LEVEL[data.role];
  return data.events.filter(event => {
    if (event.audience === "group" && level < ROLE_LEVEL.group) return false;
    if (event.audience === "member" && level < ROLE_LEVEL.member) return false;
    return true;
  });
}

function upcomingEvents(limit = 3) {
  const today = ymd(new Date());
  return allowedEvents()
    .filter(event => event.dateISO >= today)
    .sort((a, b) => (a.dateISO + (a.time || "")).localeCompare(b.dateISO + (b.time || "")))
    .slice(0, limit);
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
  const matches = ARCHIVE_SERMONS.filter(item => {
    const text = [item.title, item.reference, item.speaker, item.date, ...item.tags].join(" ").toLowerCase();
    const matchesQuery = !query || text.includes(query);
    const matchesFilter = activeSermonFilter === "all" || item.group === activeSermonFilter || (activeSermonFilter === "archive");
    return matchesQuery && matchesFilter;
  });

  document.getElementById("sermonGrid").innerHTML = matches.map(item => `
    <article class="sermon-card">
      <span class="tag">Existing archive</span>
      <h3>${escapeHtml(item.title)}</h3>
      <span class="sermon-ref">${escapeHtml(item.reference)}</span>
      <p>${escapeHtml(item.date)} · ${escapeHtml(item.speaker)}</p>
      <div class="chip-row">${item.tags.map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join("")}</div>
      <button class="text-button sermon-open" type="button" data-sermon-id="${item.id}">Feature this sermon →</button>
    </article>
  `).join("");

  document.getElementById("sermonEmpty").classList.toggle("hidden", matches.length !== 0);

  document.querySelectorAll(".sermon-open").forEach(button => {
    button.addEventListener("click", () => {
      const item = ARCHIVE_SERMONS.find(sermon => String(sermon.id) === button.dataset.sermonId);
      if (!item) return;
      data.sermon = { title: item.title, reference: item.reference, speaker: item.speaker, tags: item.tags };
      saveData();
      renderSermon();
      document.getElementById("sermons").scrollIntoView({ behavior: "smooth" });
      showToast("Loaded an existing Audubon archive entry into the featured-sermon prototype.");
    });
  });
}

function renderEvents() {
  const isMember = ROLE_LEVEL[data.role] >= ROLE_LEVEL.member;
  const grid = document.getElementById("eventGrid");
  const events = upcomingEvents(3);

  grid.innerHTML = events.map(event => {
    const current = data.rsvps[event.id] || "";
    const sourceLabel = event.source === "sample" ? "Sample event" : event.source === "published" ? "Published schedule*" : "Calendar";
    return `
      <article class="event-card">
        <span class="event-date">${escapeHtml(formatEventDate(event))}</span>
        <h3>${escapeHtml(event.title)}</h3>
        <p>${escapeHtml(event.description)}</p>
        <div class="event-meta"><span class="chip">${escapeHtml(sourceLabel)}</span><span class="chip">${escapeHtml(event.audience)}</span></div>
        <div class="rsvp-actions" aria-label="RSVP for ${escapeHtml(event.title)}">
          <button class="rsvp-choice ${current === "going" ? "selected" : ""}" type="button" data-rsvp-id="${escapeHtml(event.id)}" data-rsvp-value="going" ${isMember ? "" : "disabled"}>${isMember ? "Going" : "Sign in to RSVP"}</button>
          <button class="rsvp-choice ${current === "maybe" ? "selected" : ""}" type="button" data-rsvp-id="${escapeHtml(event.id)}" data-rsvp-value="maybe" ${isMember ? "" : "disabled"}>${isMember ? "Maybe" : "Member only"}</button>
        </div>
      </article>
    `;
  }).join("");

  const today = ymd(new Date());
  document.getElementById("eventCount").textContent = String(data.events.filter(event => event.dateISO >= today).length);

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
  const workDay = data.events.find(event => event.id === "sample-work-day");
  const summary = document.getElementById("memberRsvpSummary");
  if (!workDay) {
    summary.textContent = "Open calendar";
    return;
  }
  const answer = data.rsvps[workDay.id];
  summary.textContent = answer === "going" ? "Going ✓" : answer === "maybe" ? "Maybe" : "Not yet answered";
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
  document.getElementById("memberCalendarButton").classList.toggle("hidden", !isMember);
  document.getElementById("calendarPromoButton").textContent = isMember ? "Open 3-month calendar" : "Preview member calendar";

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
  if (scrollToMember && role !== "public") document.getElementById("memberArea").scrollIntoView({ behavior: "smooth" });
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
  if (ROLE_LEVEL[data.role] >= ROLE_LEVEL.member) document.getElementById("memberArea").scrollIntoView({ behavior: "smooth" });
  else openDialog(document.getElementById("signInDialog"));
});

document.getElementById("dialogContinue").addEventListener("click", () => {
  const role = document.getElementById("dialogRole").value;
  closeDialog(document.getElementById("signInDialog"));
  activateRole(role, true);
});

document.getElementById("calendarPromoButton").addEventListener("click", () => {
  if (ROLE_LEVEL[data.role] >= ROLE_LEVEL.member) {
    window.location.href = "calendar.html";
  } else {
    openDialog(document.getElementById("signInDialog"));
    showToast("Choose a member role, then open the member calendar.");
  }
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

document.getElementById("watchDemoButton").addEventListener("click", () => showToast("The production site will play the published sermon video here."));
document.getElementById("audioDemoButton").addEventListener("click", () => showToast("The media workflow can create an audio-only sermon copy automatically."));
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
  data.announcement = document.getElementById("announcementInput").value.trim() || defaultData().announcement;
  saveData();
  renderAnnouncement();
  showToast("Homepage announcement updated in this browser.");
});

document.getElementById("eventForm").addEventListener("submit", event => {
  event.preventDefault();
  data.events.push({
    id: `event-${Date.now()}`,
    title: document.getElementById("eventTitle").value.trim(),
    dateISO: document.getElementById("eventDate").value,
    time: document.getElementById("eventTime").value,
    audience: document.getElementById("eventAudience").value,
    description: "Administrator-created prototype event.",
    source: "admin-demo"
  });
  saveData();
  event.target.reset();
  document.getElementById("eventTime").value = "18:30";
  renderEvents();
  showToast("Calendar item added to the shared browser prototype data.");
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
    `Future media job: trim ${start || "start"}–${end || "end"}, gain ${gain || "unchanged"}, speech normalization ${normalized ? "on" : "off"}. The dedicated Media Studio now demonstrates the full upload-and-trim workflow.`;
});

document.getElementById("sermonAdminShortcut").addEventListener("click", () => {
  activateRole("admin");
  window.location.href = "media-studio.html";
});

document.getElementById("resetDemo").addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEY);
  data = defaultData();
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
