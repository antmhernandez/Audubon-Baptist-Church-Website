/**
 * Sermons page behavior.
 * EDIT HERE for prototype archive entries, search/filter behavior, and featured-sermon preview.
 * Production sermon records will later come from the church database/media workflow.
 */ const ARCHIVE=[ {
  id:1, title:"How to Be Great for God – Beyond Yourself", reference:"Ezra 8:1–15", speaker:"Pastor Jeff Akin", date:"February 12, 2023", group:"ezra", tags:["Ezra", "Mission"]
}, {
  id:2, title:"The Inclusivity of God", reference:"Ezra 6:16–22", speaker:"Pastor Jeff Akin", date:"January 22, 2023", group:"ezra", tags:["Ezra", "Worship"]
}, {
  id:3, title:"Bye Bye Babylon", reference:"Ezra 6:1–15", speaker:"Pastor Jeff Akin", date:"January 15, 2023", group:"ezra", tags:["Ezra", "Providence"]
}, {
  id:4, title:"Yet I Will Quietly Wait", reference:"Habakkuk 3:3–16", speaker:"Pastor Jeff Akin", date:"August 22, 2021", group:"habakkuk", tags:["Habakkuk", "Faith"]
} ];
let filter="all";
function toast(message) {
  const t=document.getElementById("sermonToast");
  t.textContent=message;
  t.classList.remove("hidden");
  clearTimeout(toast.timer);
  toast.timer=setTimeout(function() {
    t.classList.add("hidden");
  }, 2800);
}
function renderFeatured() {
  const data=AudubonSite.load(), s=data.sermon;
  document.getElementById("sermonTitle").textContent=s.title;
  document.getElementById("sermonReference").textContent=s.reference;
  document.getElementById("sermonSpeaker").textContent=s.speaker;
  document.getElementById("sermonTags").innerHTML=(s.tags||[]).map(function(tag) {
    return '<span class="chip">'+AudubonSite.escapeHtml(tag)+'</span>';
  }).join("");
  document.querySelectorAll(".admin-sermon-link").forEach(function(el) {
    el.classList.toggle("hidden", (AudubonSite.ROLE_LEVEL[data.role]||0)<4);
  });
}
function renderArchive() {
  const q=document.getElementById("sermonSearch").value.trim().toLowerCase();
  const items=ARCHIVE.filter(function(s) {
    const text=[s.title, s.reference, s.speaker, s.date].concat(s.tags).join(" ").toLowerCase(); return (!q||text.includes(q))&&(filter==="all"||s.group===filter);
  });
  document.getElementById("sermonGrid").innerHTML=items.map(function(s) {
    return '<article class="sermon-card"><span class="sermon-ref">'+AudubonSite.escapeHtml(s.reference)+'</span><h3>'+AudubonSite.escapeHtml(s.title)+'</h3><p>'+AudubonSite.escapeHtml(s.date)+' · '+AudubonSite.escapeHtml(s.speaker)+'</p><button class="text-button feature-archive-sermon" data-id="'+s.id+'" type="button">Feature in prototype →</button></article>';
  }).join("");
  document.getElementById("sermonEmpty").classList.toggle("hidden", items.length>0);
  document.querySelectorAll(".feature-archive-sermon").forEach(function(btn) {
    btn.addEventListener("click", function() {
      const s=ARCHIVE.find(function(x) {
        return String(x.id)===btn.dataset.id;
      }); if(!s)return; const data=AudubonSite.load(); data.sermon= {
        title:s.title, reference:s.reference, speaker:s.speaker, tags:s.tags
      }; AudubonSite.save(data); renderFeatured(); window.scrollTo({
        top:0, behavior:"smooth"
      }); toast("Featured sermon updated in this browser prototype.");
    });
  });
}
document.getElementById("sermonSearch").addEventListener("input", renderArchive);
document.querySelectorAll("[data-filter]").forEach(function(btn) {
  btn.addEventListener("click", function() {
    filter=btn.dataset.filter; document.querySelectorAll("[data-filter]").forEach(function(x) {
      x.classList.toggle("active", x===btn);
    }); renderArchive();
  });
});
document.getElementById("watchSermonButton").addEventListener("click", function() {
  toast("The newest published sermon video will play here.");
});
document.getElementById("audioSermonButton").addEventListener("click", function() {
  toast("The published audio-only sermon will open here.");
});
window.addEventListener("audubon:rolechange", renderFeatured);
renderFeatured();
renderArchive();
