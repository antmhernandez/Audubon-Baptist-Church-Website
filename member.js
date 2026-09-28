/**
 * Member Home application behavior.
 * ------------------------------------------------------------
 * Controls role-aware panels: Overview, Prayer, Groups, Conversations,
 * Lists/signups, and Serve.
 *
 * Browser-local data is prototype-only. Production permissions must be
 * enforced by the server/database.
 */

const STORAGE_KEY = "abcDemoV3";

const ROLE_LEVEL = {
  public: 0,
  member: 1,
  group: 2,
  leadership: 3,
  admin: 4
};

const ROLE_LABELS = {
  public: "Public visitor",
  member: "Church member",
  group: "Ministry / group member",
  leadership: "Church leadership",
  admin: "Administrator"
};

function ymd(date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0")
  ].join("-");
}

function loadData() {
  const fallback = {
    role: "public",
    events: [],
    rsvps: {},
    prayers: [],
    announcement: ""
  };

  try {
    return {
      ...fallback,
      ...JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
    };
  } catch (error) {
    return fallback;
  }
}

let data = loadData();

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, function (character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character];
  });
}

function showToast(message) {
  const element = document.getElementById("memberToast");

  element.textContent = message;
  element.classList.remove("hidden");

  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(function () {
    element.classList.add("hidden");
  }, 2800);
}

function openDialog(dialog) {
  if (dialog.showModal) dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeDialog(dialog) {
  if (dialog.close) dialog.close();
  else dialog.removeAttribute("open");
}

function formatEvent(event) {
  if (!event.dateISO) return "";

  const [year, month, day] = event.dateISO.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(date);

  if (!event.time) return formattedDate;

  const [hours, minutes] = event.time.split(":").map(Number);
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(2000, 0, 1, hours, minutes));

  return formattedDate + " · " + formattedTime;
}

function visibleEvents() {
  const today = ymd(new Date());
  const level = ROLE_LEVEL[data.role];

  return (data.events || [])
    .filter(function (event) {
      if (event.dateISO < today) return false;
      if (event.audience === "member" && level < ROLE_LEVEL.member) return false;
      if (event.audience === "group" && level < ROLE_LEVEL.group) return false;
      return true;
    })
    .sort(function (a, b) {
      return (a.dateISO + (a.time || ""))
        .localeCompare(b.dateISO + (b.time || ""));
    });
}

function renderUpcoming() {
  const items = visibleEvents().slice(0, 3);
  const root = document.getElementById("memberUpcoming");

  root.innerHTML = items.length
    ? items.map(function (event) {
        const status = (data.rsvps || {})[event.id];
        const statusLabel =
          status === "going"
            ? "Going"
            : status === "maybe"
              ? "Maybe"
              : "Details";

        return [
          '<article class="member-overview-event">',
          "<span>" + escapeHtml(formatEvent(event)) + "</span>",
          "<div>",
          "<h3>" + escapeHtml(event.title.replace("Sample: ", "")) + "</h3>",
          "<p>" + escapeHtml(event.description || "") + "</p>",
          "</div>",
          '<a href="calendar.html">' + escapeHtml(statusLabel) + " →</a>",
          "</article>"
        ].join("");
      }).join("")
    : '<p class="empty-state">No upcoming prototype events are available yet.</p>';
}

function renderPrayers() {
  const level = ROLE_LEVEL[data.role];

  const allowed = (data.prayers || []).filter(function (prayer) {
    return level >= ROLE_LEVEL[prayer.visibility];
  });

  document.getElementById("memberPrayerList").innerHTML = allowed.length
    ? allowed.map(function (prayer) {
        return [
          '<article class="prayer-item">',
          "<header>",
          "<h4>" + escapeHtml(prayer.title) + "</h4>",
          '<span class="tag">' + escapeHtml(prayer.label || prayer.visibility) + "</span>",
          "</header>",
          "<p>" + escapeHtml(prayer.text) + "</p>",
          "</article>"
        ].join("");
      }).join("")
    : '<p class="empty-state">No prayer requests are visible at this access level.</p>';
}

function renderLists() {
  const rsvps = data.rsvps || {};

  const items = visibleEvents().filter(function (event) {
    return Boolean(rsvps[event.id]);
  });

  document.getElementById("memberLists").innerHTML = items.length
    ? items.map(function (event) {
        const answer = rsvps[event.id] === "going" ? "Going" : "Maybe";

        return [
          "<article>",
          "<div>",
          '<span class="list-kicker">' + escapeHtml(answer) + "</span>",
          "<h3>" + escapeHtml(event.title.replace("Sample: ", "")) + "</h3>",
          "<p>" + escapeHtml(formatEvent(event)) + "</p>",
          "</div>",
          '<a class="text-button" href="calendar.html">Change RSVP →</a>',
          "</article>"
        ].join("");
      }).join("")
    : '<p class="empty-state">No RSVPs or signups yet. Use the Calendar to respond to an event.</p>';
}

function renderAccess() {
  const level = ROLE_LEVEL[data.role];
  const isMember = level >= ROLE_LEVEL.member;
  const isGroup = level >= ROLE_LEVEL.group;
  const isLeadership = level >= ROLE_LEVEL.leadership;
  const isAdmin = level >= ROLE_LEVEL.admin;

  document.getElementById("memberRoleSwitcher").value = data.role;
  document.getElementById("memberDialogRole").value =
    isMember ? data.role : "member";

  document.getElementById("memberGate").classList.toggle("hidden", isMember);
  document.getElementById("memberHome").classList.toggle("hidden", !isMember);
  document.getElementById("memberAccessLabel").textContent = ROLE_LABELS[data.role];
  document.getElementById("memberAnnouncement").textContent =
    data.announcement || "Welcome to Audubon Baptist Church — A Church in the Park.";

  document.querySelectorAll(".group-only").forEach(function (element) {
    element.classList.toggle("hidden", !isGroup);
  });

  document.querySelectorAll(".leadership-only").forEach(function (element) {
    element.classList.toggle("hidden", !isLeadership);
  });

  document.querySelectorAll(".admin-tool-link").forEach(function (element) {
    element.classList.toggle("hidden", !isAdmin);
  });

  if (isMember) {
    renderUpcoming();
    renderPrayers();
    renderLists();
  }
}

function openView(name) {
  document.querySelectorAll(".member-view").forEach(function (panel) {
    panel.classList.toggle("active", panel.dataset.memberPanel === name);
  });

  document.querySelectorAll(".member-nav-button").forEach(function (button) {
    button.classList.toggle("active", button.dataset.memberView === name);
  });

  const content = document.querySelector(".member-content");

  if (content && window.innerWidth < 900) {
    content.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

document.querySelectorAll("[data-member-view]").forEach(function (button) {
  button.addEventListener("click", function () {
    openView(button.dataset.memberView);
  });
});

document.querySelectorAll("[data-jump-view]").forEach(function (button) {
  button.addEventListener("click", function () {
    openView(button.dataset.jumpView);
  });
});

document.getElementById("memberRoleSwitcher").addEventListener("change", function (event) {
  data.role = event.target.value;
  saveData();
  renderAccess();
});

document.getElementById("memberPreviewButton").addEventListener("click", function () {
  openDialog(document.getElementById("memberAccessDialog"));
});

document.getElementById("memberDialogContinue").addEventListener("click", function () {
  data.role = document.getElementById("memberDialogRole").value;
  saveData();
  closeDialog(document.getElementById("memberAccessDialog"));
  renderAccess();
  showToast("Member preview opened.");
});

document.getElementById("memberPrayerForm").addEventListener("submit", function (event) {
  event.preventDefault();

  const visibility = document.getElementById("memberPrayerVisibility").value;

  data.prayers = data.prayers || [];
  data.prayers.unshift({
    id: "prayer-" + Date.now(),
    visibility,
    label:
      visibility === "member"
        ? "Members"
        : visibility === "group"
          ? "Ministry group"
          : "Leadership",
    title: document.getElementById("memberPrayerTitle").value.trim(),
    text: document.getElementById("memberPrayerText").value.trim()
  });

  saveData();
  event.target.reset();
  renderPrayers();
  showToast("Sample request added in this browser.");
});

document.getElementById("memberVolunteerButton").addEventListener("click", function () {
  showToast("Prototype: volunteer interest recorded conceptually.");
});

document.getElementById("newConversationButton").addEventListener("click", function () {
  showToast("A production conversation composer will open here.");
});

renderAccess();
