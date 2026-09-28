/**
 * Member Home application behavior.
 * Controls role-aware panels: Overview, Prayer, Groups, Conversations, Lists, and Serve.
 * Browser-local data is prototype-only; production permissions must be server-enforced.
 */ const STORAGE_KEY="abcDemoV3";
const ROLE_LEVEL= {
  public:0, member:1, group:2, leadership:3, admin:4
};
const ROLE_LABELS= {
  public:"Public visitor", member:"Church member", group:"Ministry / group member", leadership:"Church leadership", admin:"Administrator"
};
function ymd(date) {
  return [date.getFullYear(), String(date.getMonth()+1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
}
function loadData() {
  try {
    return {
      role:"public", events:[], rsvps: {
      }, prayers:[], announcement:"", ...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")
    };
  }
  catch {
    return {
      role:"public", events:[], rsvps: {
      }, prayers:[], announcement:""
    };
  }
}
let data=loadData();
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g,function(c){return {"&":"&amp; ","<":"&lt; ",">":"&gt; ",'"':"&quot;","'":"&#039; "}[c];});}
function showToast(message){const el=document.getElementById("memberToast");el.textContent=message;el.classList.remove("hidden");clearTimeout(showToast.timer);showToast.timer=setTimeout(function(){el.classList.add("hidden");},2800);}
function openDialog(dialog){if(dialog.showModal)dialog.showModal();else dialog.setAttribute("open","");}
function closeDialog(dialog){if(dialog.close)dialog.close();else dialog.removeAttribute("open");}
function formatEvent(event){if(!event.dateISO)return "";const p=event.dateISO.split("-").map(Number),date=new Date(p[0],p[1]-1,p[2]);const day=new Intl.DateTimeFormat("en-US",{weekday:"short",month:"short",day:"numeric"}).format(date);if(!event.time)return day;const t=event.time.split(":").map(Number);const time=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(new Date(2000,0,1,t[0],t[1]));return day+" · "+time;}

function visibleEvents(){
  const today=ymd(new Date()),level=ROLE_LEVEL[data.role];
  return (data.events||[]).filter(function(e){return e.dateISO>=today&&(e.audience!=="member"||level>=1)&&(e.audience!=="group"||level>=2);}).sort(function(a,b){return (a.dateISO+(a.time||"")).localeCompare(b.dateISO+(b.time||""));});
}
function renderUpcoming(){
  const items=visibleEvents().slice(0,3);
  document.getElementById("memberUpcoming").innerHTML=items.length?items.map(function(event){
    const status=(data.rsvps||{})[event.id];
    return '<article class="member-overview-event"><span>'+escapeHtml(formatEvent(event))+'</span><div><h3>'+escapeHtml(event.title.replace("Sample: ",""))+'</h3><p>'+escapeHtml(event.description||"")+'</p></div><a href="calendar.html">'+(status==="going"?"Going":status==="maybe"?"Maybe":"Details")+' →</a></article>';
  }).join(""):'<p class="empty-state">No upcoming prototype events are available yet.</p>';
}
function renderPrayers(){
  const level=ROLE_LEVEL[data.role];
  const allowed=(data.prayers||[]).filter(function(p){return level>=ROLE_LEVEL[p.visibility];});
  document.getElementById("memberPrayerList").innerHTML=allowed.length?allowed.map(function(p){return '<article class="prayer-item"><header><h4>'+escapeHtml(p.title)+'</h4><span class="tag">'+escapeHtml(p.label||p.visibility)+'</span></header><p>'+escapeHtml(p.text)+'</p></article>';}).join(""):'<p class="empty-state">No prayer requests are visible at this access level.</p>';
}
function renderLists(){
  const rsvps=data.rsvps||{};
  const items=visibleEvents().filter(function(event){return !!rsvps[event.id];});
  document.getElementById("memberLists").innerHTML=items.length?items.map(function(event){
    const answer=rsvps[event.id]==="going"?"Going":"Maybe";
    return '<article><div><span class="list-kicker">'+escapeHtml(answer)+'</span><h3>'+escapeHtml(event.title.replace("Sample: ",""))+'</h3><p>'+escapeHtml(formatEvent(event))+'</p></div><a class="text-button" href="calendar.html">Change RSVP →</a></article>';
  }).join(""):'<p class="empty-state">No RSVPs or signups yet. Use the Calendar to respond to an event.</p>';
}
function renderAccess(){
  const level=ROLE_LEVEL[data.role],isMember=level>=1,isGroup=level>=2,isLeadership=level>=3,isAdmin=level>=4;
  document.getElementById("memberRoleSwitcher").value=data.role;
  document.getElementById("memberDialogRole").value=isMember?data.role:"member";
  document.getElementById("memberGate").classList.toggle("hidden",isMember);
  document.getElementById("memberHome").classList.toggle("hidden",!isMember);
  document.getElementById("memberAccessLabel").textContent=ROLE_LABELS[data.role];
  document.getElementById("memberAnnouncement").textContent=data.announcement||"Welcome to Audubon Baptist Church — A Church in the Park.";
  document.querySelectorAll(".group-only").forEach(function(el){el.classList.toggle("hidden",!isGroup);});
  document.querySelectorAll(".leadership-only").forEach(function(el){el.classList.toggle("hidden",!isLeadership);});
  document.querySelectorAll(".admin-tool-link").forEach(function(el){el.classList.toggle("hidden",!isAdmin);});
  if(isMember){renderUpcoming();renderPrayers();renderLists();}
}

function openView(name){
  document.querySelectorAll(".member-view").forEach(function(panel){panel.classList.toggle("active",panel.dataset.memberPanel===name);});
  document.querySelectorAll(".member-nav-button").forEach(function(btn){btn.classList.toggle("active",btn.dataset.memberView===name);});
  const content=document.querySelector(".member-content");
  if(content&&window.innerWidth<900)content.scrollIntoView({behavior:"smooth",block:"start"});
}
document.querySelectorAll("[data-member-view]").forEach(function(btn){btn.addEventListener("click",function(){openView(btn.dataset.memberView);});});
document.querySelectorAll("[data-jump-view]").forEach(function(btn){btn.addEventListener("click",function(){openView(btn.dataset.jumpView);});});

document.getElementById("memberRoleSwitcher").addEventListener("change",function(e){data.role=e.target.value;saveData();renderAccess();});
document.getElementById("memberPreviewButton").addEventListener("click",function(){openDialog(document.getElementById("memberAccessDialog"));});
document.getElementById("memberDialogContinue").addEventListener("click",function(){data.role=document.getElementById("memberDialogRole").value;saveData();closeDialog(document.getElementById("memberAccessDialog"));renderAccess();showToast("Member preview opened.");});

document.getElementById("memberPrayerForm").addEventListener("submit",function(e){
  e.preventDefault();
  const visibility=document.getElementById("memberPrayerVisibility").value;
  data.prayers=data.prayers||[];
  data.prayers.unshift({id:"prayer-"+Date.now(),visibility:visibility,label:visibility==="member"?"Members":visibility==="group"?"Ministry group":"Leadership",title:document.getElementById("memberPrayerTitle").value.trim(),text:document.getElementById("memberPrayerText").value.trim()});
  saveData();e.target.reset();renderPrayers();showToast("Sample request added in this browser.");
});
document.getElementById("memberVolunteerButton").addEventListener("click",function(){showToast("Prototype: volunteer interest recorded conceptually.");});
document.getElementById("newConversationButton").addEventListener("click",function(){showToast("A production conversation composer will open here.");});

renderAccess();
