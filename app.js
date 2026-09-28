/**
 * Home-page behavior only.
 * Renders the featured sermon teaser and member-only weekly summary.
 * Shared public navigation lives in site.js.
 */

function visibleMemberEvents(data,limit){
  const level=AudubonSite.ROLE_LEVEL[data.role]||0;
  const today=AudubonSite.ymd(new Date());
  return (data.events||[])
    .filter(function(event){
      if(event.dateISO<today)return false;
      if(event.audience==="member"&&level<1)return false;
      if(event.audience==="group"&&level<2)return false;
      return true;
    })
    .sort(function(a,b){return (a.dateISO+(a.time||"")).localeCompare(b.dateISO+(b.time||""));})
    .slice(0,limit||2);
}

function renderHomeSermon(data){
  const sermon=data.sermon||{};
  document.getElementById("homeSermonTitle").textContent=sermon.title||"Latest sermon";
  document.getElementById("homeSermonReference").textContent=sermon.reference||"Scripture";
  document.getElementById("homeSermonSpeaker").textContent=sermon.speaker||"Speaker";
}

function renderMemberWeek(data){
  const level=AudubonSite.ROLE_LEVEL[data.role]||0;
  const section=document.getElementById("memberWeekSummary");
  const isMember=level>=1;
  section.classList.toggle("hidden",!isMember);
  if(!isMember)return;

  const events=visibleMemberEvents(data,2);
  const root=document.getElementById("memberWeekEvents");
  root.innerHTML=events.length?events.map(function(event){
    const title=event.title.replace("Sample: ","");
    const status=data.rsvps&&data.rsvps[event.id]?data.rsvps[event.id]:"";
    const statusLabel=status==="going"?"Going":status==="maybe"?"Maybe":"View details";
    return '<article class="member-week-item"><div><span>'+AudubonSite.escapeHtml(AudubonSite.formatEvent(event))+'</span><h3>'+AudubonSite.escapeHtml(title)+'</h3></div><a href="calendar.html">'+AudubonSite.escapeHtml(statusLabel)+' →</a></article>';
  }).join(""):'<p class="empty-state">No upcoming items are available in this prototype view.</p>';

  document.querySelectorAll(".admin-only-tool").forEach(function(el){
    el.classList.toggle("hidden",level<4);
  });
}

function renderHome(){
  const data=AudubonSite.load();
  renderHomeSermon(data);
  renderMemberWeek(data);
}

window.addEventListener("audubon:rolechange",renderHome);
renderHome();