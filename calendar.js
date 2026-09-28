/**
 * Member three-month calendar behavior.
 * Handles event visibility, quarter rendering, RSVPs, and .ics downloads.
 * Keep private-event authorization server-side in production.
 */

const ROLE_LEVEL = { public: 0, member: 1, group: 2, leadership: 3, admin: 4 };
const ROLE_LABELS = { public: "Public visitor", member: "Church member", group: "Ministry / group member", leadership: "Church leadership", admin: "Administrator" };
const STORAGE_KEY = "abcDemoV3";

function ymd(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function addDays(date, count) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + count);
  return copy;
}

function nextWeekday(start, weekday, offsetWeeks = 0) {
  const date = new Date(start.getFullYear(), start.getMonth(), start.getDate());
  const delta = (weekday - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + delta + offsetWeeks * 7);
  return date;
}

function buildFallbackEvents() {
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
      description: "Published Audubon materials list Sunday worship at 10:30 AM; please confirm the current schedule before production.",
      source: "published"
    });
    events.push({
      id: `midweek-${ymd(wednesday)}`,
      dateISO: ymd(wednesday),
      time: "18:30",
      title: "Midweek Service",
      audience: "churchwide",
      description: "Published Audubon materials list a Wednesday midweek service at 6:30 PM; please confirm the current schedule before production.",
      source: "published"
    });
  }
  const sample1 = addDays(today, 12);
  const sample2 = addDays(today, 31);
  events.push({
    id: "sample-work-day",
    dateISO: ymd(sample1),
    time: "09:00",
    title: "Sample: Church Work Day",
    audience: "member",
    description: "Demonstration event for RSVP and volunteer planning.",
    source: "sample"
  });
  events.push({
    id: "sample-ministry-meeting",
    dateISO: ymd(sample2),
    time: "18:00",
    title: "Sample: Ministry Team Meeting",
    audience: "group",
    description: "Demonstration group-only event.",
    source: "sample"
  });
  return events;
}

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return {
      ...stored,
      role: stored.role || "public",
      events: Array.isArray(stored.events) && stored.events.some(e => e.dateISO) ? stored.events : buildFallbackEvents(),
      rsvps: stored.rsvps || {},
      sermon: stored.sermon || {},
      prayers: stored.prayers || [],
      mediaDrafts: stored.mediaDrafts || []
    };
  } catch {
    return { role: "public", events: buildFallbackEvents(), rsvps: {}, sermon: {}, prayers: [] };
  }
}

let data = loadData();
let quarterStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
let activeFilter = "all";
let selectedDate = "";

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, ch => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#039;" }[ch]));
}

function showToast(message) {
  const toast = document.getElementById("calendarToast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.add("hidden"), 3000);
}

function openDialog(dialog) {
  if (dialog.showModal) dialog.showModal();
  else dialog.setAttribute("open", "");
}

function closeDialog(dialog) {
  if (dialog.close) dialog.close();
  else dialog.removeAttribute("open");
}

function formatTime(time) {
  if (!time) return "";
  const [hours, minutes] = time.split(":").map(Number);
  return new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit" }).format(new Date(2000, 0, 1, hours, minutes));
}

function formatDate(dateISO, options = { month: "short", day: "numeric", weekday: "short" }) {
  const [y,m,d] = dateISO.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", options).format(new Date(y, m - 1, d));
}

function visibleEvents() {
  const level = ROLE_LEVEL[data.role];
  return data.events.filter(event => {
    if (event.audience === "group" && level < ROLE_LEVEL.group) return false;
    if (event.audience === "member" && level < ROLE_LEVEL.member) return false;
    if (activeFilter !== "all" && event.audience !== activeFilter) return false;
    return true;
  });
}

function monthEvents(year, month) {
  return visibleEvents().filter(event => {
    const [ey, em] = event.dateISO.split("-").map(Number);
    return ey === year && em - 1 === month;
  });
}

function renderMonth(year, month) {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const startOffset = first.getDay();
  const events = monthEvents(year, month);
  const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(first);
  const todayISO = ymd(new Date());

  let cells = "";
  for (let i = 0; i < startOffset; i += 1) cells += '<div class="calendar-day empty" aria-hidden="true"></div>';

  for (let day = 1; day <= days; day += 1) {
    const dateISO = ymd(new Date(year, month, day));
    const dayEvents = events.filter(event => event.dateISO === dateISO);
    const labels = dayEvents.slice(0, 2).map(event => `<span class="calendar-event-pill ${event.audience}">${escapeHtml(event.title.replace("Sample: ", ""))}</span>`).join("");
    const more = dayEvents.length > 2 ? `<span class="calendar-more">+${dayEvents.length - 2} more</span>` : "";
    cells += `
      <button class="calendar-day ${dateISO === todayISO ? "today" : ""} ${dateISO === selectedDate ? "selected" : ""}" type="button" data-calendar-date="${dateISO}" aria-label="${formatDate(dateISO, { month:"long", day:"numeric", year:"numeric" })}, ${dayEvents.length} events">
        <span class="calendar-day-number">${day}</span>
        <span class="calendar-day-events">${labels}${more}</span>
      </button>`;
  }

  return `
    <article class="month-card">
      <header><h2>${monthName}</h2></header>
      <div class="weekday-row" aria-hidden="true">
        <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
      </div>
      <div class="month-grid">${cells}</div>
    </article>`;
}

function renderQuarter() {
  const grid = document.getElementById("quarterGrid");
  const months = [];
  for (let offset = 0; offset < 3; offset += 1) {
    months.push(new Date(quarterStart.getFullYear(), quarterStart.getMonth() + offset, 1));
  }
  grid.innerHTML = months.map(month => renderMonth(month.getFullYear(), month.getMonth())).join("");

  const firstName = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(months[0]);
  const lastName = new Intl.DateTimeFormat("en-US", { month: "short", year: "numeric" }).format(months[2]);
  document.getElementById("quarterLabel").textContent = `${firstName} – ${lastName}`;

  grid.querySelectorAll("[data-calendar-date]").forEach(button => {
    button.addEventListener("click", () => {
      selectedDate = button.dataset.calendarDate;
      renderQuarter();
      renderSelectedDay();
    });
  });

  renderUpcoming();
  renderStats();
}

function renderSelectedDay() {
  const title = document.getElementById("selectedDayTitle");
  const agenda = document.getElementById("selectedDayAgenda");
  if (!selectedDate) {
    title.textContent = "Choose a date";
    agenda.innerHTML = '<p class="empty-state">Select a day in the calendar to see its events here.</p>';
    return;
  }
  title.textContent = formatDate(selectedDate, { weekday:"long", month:"long", day:"numeric", year:"numeric" });
  const items = visibleEvents().filter(event => event.dateISO === selectedDate);
  agenda.innerHTML = items.length ? items.map(renderAgendaItem).join("") : '<p class="empty-state">Nothing is scheduled for this day.</p>';
  wireAgendaButtons(agenda);
}

function renderAgendaItem(event) {
  const rsvp = data.rsvps[event.id] || "";
  return `
    <article class="agenda-item">
      <div class="agenda-time">${escapeHtml(formatTime(event.time) || "Time TBD")}</div>
      <div class="agenda-copy">
        <div class="agenda-title-row"><h3>${escapeHtml(event.title)}</h3><span class="chip">${escapeHtml(event.audience)}</span></div>
        <p>${escapeHtml(event.description || "")}</p>
        <div class="agenda-actions">
          <button class="mini-action ${rsvp === "going" ? "selected" : ""}" data-agenda-rsvp="${escapeHtml(event.id)}" data-value="going" type="button">Going</button>
          <button class="mini-action ${rsvp === "maybe" ? "selected" : ""}" data-agenda-rsvp="${escapeHtml(event.id)}" data-value="maybe" type="button">Maybe</button>
          <button class="mini-action" data-download-ics="${escapeHtml(event.id)}" type="button">Add to my calendar</button>
        </div>
      </div>
    </article>`;
}

function wireAgendaButtons(root) {
  root.querySelectorAll("[data-agenda-rsvp]").forEach(button => {
    button.addEventListener("click", () => {
      const id = button.dataset.agendaRsvp;
      const value = button.dataset.value;
      data.rsvps[id] = data.rsvps[id] === value ? "" : value;
      saveData();
      renderSelectedDay();
      renderUpcoming();
      renderStats();
    });
  });
  root.querySelectorAll("[data-download-ics]").forEach(button => {
    button.addEventListener("click", () => {
      const event = data.events.find(item => item.id === button.dataset.downloadIcs);
      if (event) downloadICS(event);
    });
  });
}

function renderUpcoming() {
  const today = ymd(new Date());
  const list = visibleEvents()
    .filter(event => event.dateISO >= today)
    .sort((a,b) => (a.dateISO + a.time).localeCompare(b.dateISO + b.time))
    .slice(0, 8);
  document.getElementById("upcomingList").innerHTML = list.length ? list.map(event => `
    <button class="upcoming-item" type="button" data-upcoming-date="${event.dateISO}">
      <span class="upcoming-date">${escapeHtml(formatDate(event.dateISO))}</span>
      <strong>${escapeHtml(event.title)}</strong>
      <small>${escapeHtml(formatTime(event.time))} · ${escapeHtml(event.audience)}</small>
    </button>
  `).join("") : '<p class="empty-state">No upcoming events in this view.</p>';

  document.querySelectorAll("[data-upcoming-date]").forEach(button => {
    button.addEventListener("click", () => {
      selectedDate = button.dataset.upcomingDate;
      const [y,m] = selectedDate.split("-").map(Number);
      const target = new Date(y, m - 1, 1);
      if (target < quarterStart || target > new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 2, 1)) {
        quarterStart = target;
      }
      renderQuarter();
      renderSelectedDay();
      document.getElementById("quarterGrid").scrollIntoView({ behavior:"smooth" });
    });
  });
}

function renderStats() {
  const now = ymd(new Date());
  const end = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0);
  const endISO = ymd(end);
  const count = visibleEvents().filter(event => event.dateISO >= now && event.dateISO <= endISO).length;
  const answered = Object.values(data.rsvps).filter(Boolean).length;
  document.getElementById("upcomingCount").textContent = `${count} ${count === 1 ? "event" : "events"}`;
  document.getElementById("rsvpCount").textContent = `${answered} answered`;
  document.getElementById("calendarAccessLabel").textContent = ROLE_LABELS[data.role];
}

function downloadICS(event) {
  const date = event.dateISO.replaceAll("-", "");
  const time = (event.time || "09:00").replace(":", "") + "00";
  const start = `${date}T${time}`;
  const content = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Audubon Baptist Church//Prototype//EN",
    "BEGIN:VEVENT",
    `UID:${event.id}@audubonbaptist`,
    `DTSTART:${start}`,
    `SUMMARY:${event.title.replaceAll(",", "\\,")}`,
    `DESCRIPTION:${(event.description || "").replaceAll(",", "\\,")}`,
    "LOCATION:1046 Hess Lane, Louisville, KY 40217",
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");
  const blob = new Blob([content], { type:"text/calendar" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${event.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "audubon-event"}.ics`;
  link.click();
  URL.revokeObjectURL(url);
  showToast("Calendar file created.");
}

function renderAccess() {
  const isMember = ROLE_LEVEL[data.role] >= ROLE_LEVEL.member;
  const isAdmin = ROLE_LEVEL[data.role] >= ROLE_LEVEL.admin;
  document.getElementById("calendarRoleSwitcher").value = data.role;
  document.getElementById("calendarGate").classList.toggle("hidden", isMember);
  document.getElementById("calendarApp").classList.toggle("hidden", !isMember);
  document.querySelectorAll(".admin-tool-link").forEach(el => el.classList.toggle("hidden", !isAdmin));
  if (isMember) renderQuarter();
}

document.getElementById("calendarRoleSwitcher").addEventListener("change", event => {
  data.role = event.target.value;
  saveData();
  renderAccess();
});

document.getElementById("calendarDemoSignIn").addEventListener("click", () => openDialog(document.getElementById("calendarSignInDialog")));
document.getElementById("calendarDialogContinue").addEventListener("click", () => {
  data.role = document.getElementById("calendarDialogRole").value;
  saveData();
  closeDialog(document.getElementById("calendarSignInDialog"));
  renderAccess();
  showToast("Member calendar preview opened.");
});

document.getElementById("previousQuarter").addEventListener("click", () => {
  quarterStart = new Date(quarterStart.getFullYear(), quarterStart.getMonth() - 3, 1);
  selectedDate = "";
  renderQuarter();
  renderSelectedDay();
});
document.getElementById("nextQuarter").addEventListener("click", () => {
  quarterStart = new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 1);
  selectedDate = "";
  renderQuarter();
  renderSelectedDay();
});
document.getElementById("todayQuarter").addEventListener("click", () => {
  const now = new Date();
  quarterStart = new Date(now.getFullYear(), now.getMonth(), 1);
  selectedDate = ymd(now);
  renderQuarter();
  renderSelectedDay();
});

document.querySelectorAll("[data-calendar-filter]").forEach(button => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.calendarFilter;
    document.querySelectorAll("[data-calendar-filter]").forEach(item => item.classList.toggle("active", item === button));
    renderQuarter();
    renderSelectedDay();
  });
});

document.getElementById("openEventComposer").addEventListener("click", () => openDialog(document.getElementById("eventComposerDialog")));
document.getElementById("calendarEventForm").addEventListener("submit", event => {
  event.preventDefault();
  const newEvent = {
    id: `event-${Date.now()}`,
    title: document.getElementById("calendarEventTitle").value.trim(),
    dateISO: document.getElementById("calendarEventDate").value,
    time: document.getElementById("calendarEventTime").value,
    audience: document.getElementById("calendarEventAudience").value,
    description: document.getElementById("calendarEventDescription").value.trim(),
    source: "admin-demo"
  };
  data.events.push(newEvent);
  saveData();
  closeDialog(document.getElementById("eventComposerDialog"));
  event.target.reset();
  selectedDate = newEvent.dateISO;
  const [y,m] = newEvent.dateISO.split("-").map(Number);
  quarterStart = new Date(y, m - 1, 1);
  renderQuarter();
  renderSelectedDay();
  showToast("Event added to this browser prototype.");
});

renderAccess();
