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
    { id: 1, date: "Wednesday · Sample 6:30 PM", title: "Prayer & Bible Study", audience: "Churchwide", description: "A midweek gathering for prayer, fellowship, and study." },
    { id: 2, date: "Saturday · Sample 9:00 AM", title: "Church Work Day", audience: "Churchwide", description: "Serve together on practical projects around the church." },
    { id: 3, date: "Sunday · After Worship", title: "Fellowship Lunch", audience: "Members & guests", description: "A sample calendar item demonstrating RSVP capability." }
  ],
  rsvps: {}
};

const ROLE_LABELS = {
  public: "Public",
  member: "Church member",
  group: "Ministry / group member",
  leadership: "Church leadership",
  admin: "Administrator"
};

const ROLE_LEVEL = { public: 0, member: 1, group: 2, leadership: 3, admin: 4 };

const prayers = [
  { visibility: "member", label: "Members", title: "Sample congregational prayer request", text: "A members-only request can be shared without publishing private details on the public website." },
  { visibility: "group", label: "Ministry group", title: "Sample ministry-team request", text: "Group-level requests are visible only to members assigned to that ministry." },
  { visibility: "leadership", label: "Leadership", title: "Sample leadership prayer concern", text: "Sensitive matters can be restricted to leaders rather than placed on a general list." }
];

function loadData() {
  try {
    return { ...structuredClone(DEFAULT_DATA), ...JSON.parse(localStorage.getItem("abcDemo") || "{}") };
  } catch {
    return structuredClone(DEFAULT_DATA);
  }
}
let data = loadData();

function saveData() {
  localStorage.setItem("abcDemo", JSON.stringify(data));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 3200);
}

function renderRole() {
  const role = data.role;
  document.getElementById("roleSwitcher").value = role;
  const isMember = ROLE_LEVEL[role] >= 1;
  const isGroup = ROLE_LEVEL[role] >= 2;
  const isLeadership = ROLE_LEVEL[role] >= 3;
  const isAdmin = ROLE_LEVEL[role] >= 4;

  document.getElementById("memberArea").classList.toggle("hidden", !isMember);
  document.getElementById("adminArea").classList.toggle("hidden", !isAdmin);
  document.getElementById("accessBadge").textContent = ROLE_LABELS[role];
  document.getElementById("memberHeading").textContent = role === "admin" ? "Administrator workspace" : "Welcome to the member area.";
  document.getElementById("rsvpRoleNote").textContent = isMember ? "You can RSVP in this preview." : "Members can RSVP after signing in.";

  document.querySelectorAll(".group-only").forEach(el => el.classList.toggle("hidden", !isGroup));
  document.querySelectorAll(".leadership-only").forEach(el => el.classList.toggle("hidden", !isLeadership));

  renderEvents();
  renderPrayers();
}

function renderAnnouncement() {
  document.getElementById("announcementText").textContent = data.announcement;
  document.getElementById("announcementInput").value = data.announcement;
}

function renderSermon() {
  const sermon = data.sermon;
  document.getElementById("sermonTitle").textContent = sermon.title;
  document.getElementById("sermonReference").textContent = sermon.reference;
  document.getElementById("sermonSpeaker").textContent = sermon.speaker;
  document.getElementById("sermonTags").innerHTML = sermon.tags.map(tag => `<span class="chip">${escapeHtml(tag)}</span>`).join("");
  document.getElementById("sermonTitleInput").value = sermon.title;
  document.getElementById("sermonReferenceInput").value = sermon.reference;
  document.getElementById("sermonSpeakerInput").value = sermon.speaker;
  document.getElementById("sermonTagsInput").value = sermon.tags.join(", ");
}

function renderEvents() {
  const isMember = ROLE_LEVEL[data.role] >= 1;
  const grid = document.getElementById("eventGrid");
  grid.innerHTML = data.events.map(event => {
    const answer = data.rsvps[event.id];
    return `<article class="event-card">
      <span class="event-date">${escapeHtml(event.date)}</span>
      <h3>${escapeHtml(event.title)}</h3>
      <p>${escapeHtml(event.description)}</p>
      <span class="chip">${escapeHtml(event.audience)}</span>
      <button class="button ${answer ? "secondary" : "primary"} small" type="button" data-rsvp="${event.id}" ${isMember ? "" : "disabled"}>
        ${isMember ? (answer ? "RSVP: Going ✓" : "RSVP · I'm going") : "Sign in to RSVP"}
      </button>
    </article>`;
  }).join("");

  grid.querySelectorAll("[data-rsvp]").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.rsvp;
      data.rsvps[id] = data.rsvps[id] ? undefined : "going";
      saveData();
      renderEvents();
      renderMemberSummary();
      showToast(data.rsvps[id] ? "RSVP saved in this browser demo." : "RSVP removed.");
    });
  });
}

function renderMemberSummary() {
  const workDay = data.events.find(e => e.title.toLowerCase().includes("work day"));
  const summary = document.getElementById("memberRsvpSummary");
  if (!workDay) return;
  summary.textContent = data.rsvps[workDay.id] ? "Going ✓" : "Not yet answered";
}

function renderPrayers() {
  const level = ROLE_LEVEL[data.role];
  const allowed = prayers.filter(item => level >= ROLE_LEVEL[item.visibility]);
  document.getElementById("prayerList").innerHTML = allowed.length
    ? allowed.map(item => `<article class="prayer-item"><header><h4>${escapeHtml(item.title)}</h4><span class="tag">${escapeHtml(item.label)}</span></header><p>${escapeHtml(item.text)}</p></article>`).join("")
    : "<p>No member prayer items are visible in the public role.</p>";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[ch]));
}

document.getElementById("roleSwitcher").addEventListener("change", event => {
  data.role = event.target.value;
  saveData();
  renderRole();
  renderMemberSummary();
  if (data.role !== "public") {
    showToast(`Previewing as ${ROLE_LABELS[data.role]}. This is not production authentication.`);
  }
});

document.getElementById("menuButton").addEventListener("click", () => {
  const nav = document.getElementById("mainNav");
  const open = nav.classList.toggle("open");
  document.getElementById("menuButton").setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".member-tab").forEach(button => {
  button.addEventListener("click", () => openMemberTab(button.dataset.tab));
});

function openMemberTab(tab) {
  document.querySelectorAll(".member-tab").forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
  document.querySelectorAll(".tab-panel").forEach(panel => panel.classList.toggle("active", panel.dataset.panel === tab));
}

document.querySelectorAll("[data-open-member]").forEach(button => {
  button.addEventListener("click", () => {
    if (data.role === "public") {
      showToast("Choose a member role in the header to preview this private area.");
      document.getElementById("roleSwitcher").focus();
      return;
    }
    openMemberTab(button.dataset.openMember);
    document.getElementById("memberArea").scrollIntoView({ behavior: "smooth" });
  });
});

document.getElementById("announcementForm").addEventListener("submit", event => {
  event.preventDefault();
  data.announcement = document.getElementById("announcementInput").value.trim() || DEFAULT_DATA.announcement;
  saveData();
  renderAnnouncement();
  showToast("Announcement updated in this browser.");
});

document.getElementById("eventForm").addEventListener("submit", event => {
  event.preventDefault();
  data.events.push({
    id: Date.now(),
    title: document.getElementById("eventTitle").value.trim(),
    date: document.getElementById("eventDate").value.trim(),
    audience: document.getElementById("eventAudience").value,
    description: "Administrator-created sample event."
  });
  saveData();
  event.target.reset();
  renderEvents();
  showToast("Calendar item added to this browser demo.");
});

document.getElementById("sermonForm").addEventListener("submit", event => {
  event.preventDefault();
  data.sermon = {
    title: document.getElementById("sermonTitleInput").value.trim(),
    reference: document.getElementById("sermonReferenceInput").value.trim(),
    speaker: document.getElementById("sermonSpeakerInput").value.trim(),
    tags: document.getElementById("sermonTagsInput").value.split(",").map(t => t.trim()).filter(Boolean)
  };
  saveData();
  renderSermon();
  showToast("Sermon metadata updated in this browser.");
});

document.getElementById("processPreview").addEventListener("click", () => {
  const start = document.getElementById("trimStart").value;
  const end = document.getElementById("trimEnd").value;
  const gain = document.getElementById("audioGain").value;
  const normalized = document.getElementById("normalizeAudio").checked;
  document.getElementById("mediaJobStatus").textContent =
    `Future media job: trim ${start}–${end}, gain ${gain}, speech normalization ${normalized ? "on" : "off"}. The production worker would process this with FFmpeg or a video API.`;
});

document.getElementById("sermonAdminShortcut").addEventListener("click", () => {
  if (data.role !== "admin") {
    data.role = "admin";
    saveData();
    renderRole();
    showToast("Switched to Administrator preview.");
  }
  document.getElementById("adminArea").scrollIntoView({ behavior: "smooth" });
});

document.getElementById("givingButton").addEventListener("click", () => {
  showToast("Production: this button would hand off securely to the church's giving provider.");
});

document.getElementById("resetDemo").addEventListener("click", () => {
  localStorage.removeItem("abcDemo");
  data = structuredClone(DEFAULT_DATA);
  renderAll();
  showToast("Demo data reset.");
});

function renderAll() {
  renderAnnouncement();
  renderSermon();
  renderRole();
  renderMemberSummary();
}
renderAll();