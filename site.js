/**
 * Shared public-site behavior.
 * ------------------------------------------------------------
 * Controls:
 * - public navigation;
 * - prototype role state;
 * - Member entry;
 * - shared prototype event/sermon defaults.
 *
 * See docs/EDITING_GUIDE.md and docs/HUMAN_MAINTAINABILITY_STANDARD.md.
 */

(function () {
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

  /* ========================================================
     Shared prototype data
     ======================================================== */

  function ymd(date) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0")
    ].join("-");
  }

  function nextWeekday(start, weekday, offsetWeeks = 0) {
    const date = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate()
    );

    const daysAhead = (weekday - date.getDay() + 7) % 7;
    date.setDate(date.getDate() + daysAhead + (offsetWeeks * 7));

    return date;
  }

  function addDays(start, count) {
    const date = new Date(start);
    date.setDate(date.getDate() + count);
    return date;
  }

  function buildEvents() {
    const today = new Date();
    const events = [];

    for (let week = 0; week < 14; week += 1) {
      const sunday = nextWeekday(today, 0, week);
      const wednesday = nextWeekday(today, 3, week);

      events.push({
        id: "worship-" + ymd(sunday),
        dateISO: ymd(sunday),
        time: "10:30",
        title: "Sunday Worship",
        audience: "churchwide",
        description: "Published Audubon materials list Sunday worship at 10:30 AM; please confirm the current schedule before production.",
        source: "published"
      });

      events.push({
        id: "midweek-" + ymd(wednesday),
        dateISO: ymd(wednesday),
        time: "18:30",
        title: "Midweek Service",
        audience: "churchwide",
        description: "Published Audubon materials list the Midweek Service at 6:30 PM; please confirm the current schedule before production.",
        source: "published"
      });
    }

    events.push({
      id: "sample-work-day",
      dateISO: ymd(addDays(today, 12)),
      time: "09:00",
      title: "Sample: Church Work Day",
      audience: "member",
      description: "Demonstration event showing member RSVP and volunteer planning.",
      source: "sample"
    });

    events.push({
      id: "sample-ministry-meeting",
      dateISO: ymd(addDays(today, 31)),
      time: "18:00",
      title: "Sample: Ministry Team Meeting",
      audience: "group",
      description: "Demonstration group-only event.",
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
        tags: ["Ezra", "Beyond Yourself", "Mission"],
        archiveDate: "February 12, 2023",
        sourceUrl: "https://www.achurchinthepark.org/sermons/ezra/",

        // The existing Audubon archive already provides this audio file.
        // Production publishing will eventually populate current video/audio URLs.
        videoUrl: "",
        audioUrl: "https://www.achurchinthepark.org/wp-content/uploads/2023/02/DR0000_0336-AudioTrimmer.com_.mp3"
      },
      events: buildEvents(),
      rsvps: {},
      prayers: [],
      mediaDrafts: []
    };
  }

  function load() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const defaults = defaultData();

      return {
        ...defaults,
        ...stored,
        sermon: {
          ...defaults.sermon,
          ...(stored.sermon || {})
        },
        events: Array.isArray(stored.events)
          && stored.events.some(event => event.dateISO)
          ? stored.events
          : defaults.events,
        rsvps: stored.rsvps || {},
        prayers: Array.isArray(stored.prayers) ? stored.prayers : []
      };
    } catch (error) {
      return defaultData();
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  /* ========================================================
     Shared formatting helpers
     ======================================================== */

  function formatEvent(event) {
    const [year, month, day] = event.dateISO.split("-").map(Number);
    const date = new Date(year, month - 1, day);

    const formattedDate = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric"
    }).format(date);

    if (!event.time) return formattedDate;

    const [hour, minute] = event.time.split(":").map(Number);
    const formattedTime = new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit"
    }).format(new Date(2000, 0, 1, hour, minute));

    return formattedDate + " · " + formattedTime;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, character => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[character]));
  }

  /* ========================================================
     Prototype Member entry
     ======================================================== */

  function ensureMemberDialog() {
    let dialog = document.getElementById("siteSignInDialog");

    if (dialog) return dialog;

    dialog = document.createElement("dialog");
    dialog.id = "siteSignInDialog";
    dialog.className = "signin-dialog";
    dialog.innerHTML = [
      '<form method="dialog" class="dialog-card">',
      '<div class="dialog-heading">',
      '<div><p class="editorial-kicker">Member access preview</p>',
      '<h2>Choose an account type.</h2></div>',
      '<button class="dialog-close" value="cancel" aria-label="Close">×</button>',
      '</div>',
      '<p>Production will use real credentials. This chooser lets leadership review the private member experience now.</p>',
      '<label for="siteDialogRole">Preview account</label>',
      '<select id="siteDialogRole">',
      '<option value="member">Church member</option>',
      '<option value="group">Ministry / group member</option>',
      '<option value="leadership">Church leadership</option>',
      '<option value="admin">Administrator</option>',
      '</select>',
      '<button class="button primary full" id="siteDialogContinue" type="button">Open Member Home</button>',
      '</form>'
    ].join("");

    document.body.appendChild(dialog);

    document.getElementById("siteDialogContinue").addEventListener("click", () => {
      const data = load();
      data.role = document.getElementById("siteDialogRole").value;
      save(data);

      if (dialog.close) dialog.close();

      window.dispatchEvent(new CustomEvent("audubon:rolechange", {
        detail: { role: data.role }
      }));

      window.location.href = "member.html";
    });

    return dialog;
  }

  function renderRole() {
    const data = load();
    const level = ROLE_LEVEL[data.role] || 0;
    const isMember = level >= ROLE_LEVEL.member;
    const isAdmin = level >= ROLE_LEVEL.admin;

    const memberButton = document.getElementById("memberSignInButton");
    if (memberButton) {
      memberButton.textContent = isMember ? "Member Home" : "Member sign in";
    }

    const switcher = document.getElementById("roleSwitcher");
    if (switcher) switcher.value = data.role;

    const tools = document.getElementById("roleTools");
    if (tools) tools.classList.toggle("hidden", !isMember);

    const toolsLabel = document.getElementById("roleToolsLabel");
    if (toolsLabel) toolsLabel.textContent = ROLE_LABELS[data.role];

    document.querySelectorAll(".admin-only-tool").forEach(element => {
      element.classList.toggle("hidden", !isAdmin);
    });
  }

  /* ========================================================
     Navigation behavior
     ======================================================== */

  function initNavigation() {
    const menuButton = document.getElementById("menuButton");
    const mainNav = document.getElementById("mainNav");

    if (menuButton && mainNav) {
      menuButton.addEventListener("click", () => {
        const isOpen = mainNav.classList.toggle("open");
        menuButton.setAttribute("aria-expanded", String(isOpen));
      });

      mainNav.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", () => {
          mainNav.classList.remove("open");
          menuButton.setAttribute("aria-expanded", "false");
        });
      });
    }

    const page = document.body.dataset.page;

    document.querySelectorAll("[data-nav-page]").forEach(element => {
      const isCurrent = element.dataset.navPage === page;
      element.classList.toggle("active-page", isCurrent);

      if (isCurrent) element.setAttribute("aria-current", "page");
      else element.removeAttribute("aria-current");
    });

    if (page === "beliefs" || page === "about") {
      const aboutMenu = document.querySelector(".nav-dropdown");
      if (aboutMenu) aboutMenu.classList.add("active-page");
    }

    document.addEventListener("click", event => {
      document.querySelectorAll(".nav-dropdown[open]").forEach(dropdown => {
        if (!dropdown.contains(event.target)) {
          dropdown.removeAttribute("open");
        }
      });
    });

    document.addEventListener("keydown", event => {
      if (event.key !== "Escape") return;

      if (mainNav && mainNav.classList.contains("open")) {
        mainNav.classList.remove("open");

        if (menuButton) {
          menuButton.setAttribute("aria-expanded", "false");
          menuButton.focus();
        }
      }

      document.querySelectorAll(".nav-dropdown[open]").forEach(dropdown => {
        dropdown.removeAttribute("open");
      });
    });
  }

  function initMemberButton() {
    document.querySelectorAll("[data-member-entry], #memberSignInButton")
      .forEach(button => {
        button.addEventListener("click", event => {
          if (button.tagName === "A") event.preventDefault();

          const data = load();

          if ((ROLE_LEVEL[data.role] || 0) >= ROLE_LEVEL.member) {
            window.location.href = "member.html";
            return;
          }

          const dialog = ensureMemberDialog();

          if (dialog.showModal) dialog.showModal();
          else dialog.setAttribute("open", "");
        });
      });
  }

  function initPrototypeControls() {
    const switcher = document.getElementById("roleSwitcher");

    if (switcher) {
      switcher.addEventListener("change", () => {
        const data = load();
        data.role = switcher.value;
        save(data);
        renderRole();

        window.dispatchEvent(new CustomEvent("audubon:rolechange", {
          detail: { role: data.role }
        }));
      });
    }

    const copyButton = document.getElementById("copyLinkButton");

    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        const url = window.location.href.split("#")[0];

        try {
          await navigator.clipboard.writeText(url);
          copyButton.textContent = "Copied";
          setTimeout(() => {
            copyButton.textContent = "Copy share link";
          }, 1600);
        } catch (error) {
          window.prompt("Copy this link:", url);
        }
      });
    }
  }

  /* ========================================================
     Public helper API used by page-specific scripts
     ======================================================== */

  window.AudubonSite = {
    load,
    save,
    ROLE_LEVEL,
    ROLE_LABELS,
    formatEvent,
    escapeHtml,
    ymd,
    renderRole
  };

  document.addEventListener("DOMContentLoaded", () => {
    initNavigation();
    initMemberButton();
    initPrototypeControls();
    renderRole();
  });
}());
