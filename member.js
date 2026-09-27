const STORAGE_KEY="abcDemoV3";
const ROLE_LEVEL={public:0,member:1,group:2,leadership:3,admin:4};
const ROLE_LABELS={public:"Public visitor",member:"Church member",group:"Ministry / group member",leadership:"Church leadership",admin:"Administrator"};

function ymd(date){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");}
function loadData(){try{return {role:"public",events:[],rsvps:{},prayers:[],...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")};}catch{return {role:"public",events:[],rsvps:{},prayers:[]};}}
let data=loadData();

function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function showToast(message){const el=document.getElementById("memberToast");el.textContent=message;el.classList.remove("hidden");clearTimeout(showToast.timer);showToast.timer=setTimeout(()=>el.classList.add("hidden"),2800);}
function openDialog(dialog){dialog.showModal?dialog.showModal():dialog.setAttribute("open","");}
function closeDialog(dialog){dialog.close?dialog.close():dialog.removeAttribute("open");}
function formatEvent(event){if(!event.dateISO)return "";const [y,m,d]=event.dateISO.split("-").map(Number);const date=new Date(y,m-1,d);const day=new Intl.DateTimeFormat("en-US",{weekday:"short",month:"short",day:"numeric"}).format(date);let time="";if(event.time){const [h,min]=event.time.split(":").map(Number);time=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(new Date(2000,0,1,h,min));}return time?`${day} · ${time}`:day;}

function visibleEvents(){
  const today=ymd(new Date()),level=ROLE_LEVEL[data.role];
  return (data.events||[]).filter(e=>e.dateISO>=today && (e.audience!=="member"||level>=1) && (e.audience!=="group"||level>=2)).sort((a,b)=>(a.dateISO+(a.time||"")).localeCompare(b.dateISO+(b.time||"")));
}

function renderUpcoming(){
  const items=visibleEvents().slice(0,3);
  const root=document.getElementById("memberUpcoming");
  root.innerHTML=items.length?items.map(event=>`
    <article class="member-event-card">
      <span class="event-date">${escapeHtml(formatEvent(event))}</span>
      <h3>${escapeHtml(event.title)}</h3>
      <p>${escapeHtml(event.description||"")}</p>
      <span class="chip">${escapeHtml(event.audience||"churchwide")}</span>
    </article>`).join(""):'<p class="empty-state">No upcoming prototype events are available yet.</p>';
}

function renderPrayers(){
  const level=ROLE_LEVEL[data.role];
  const allowed=(data.prayers||[]).filter(p=>level>=ROLE_LEVEL[p.visibility]);
  document.getElementById("memberPrayerList").innerHTML=allowed.length?allowed.map(p=>`
    <article class="prayer-item"><header><h4>${escapeHtml(p.title)}</h4><span class="tag">${escapeHtml(p.label||p.visibility)}</span></header><p>${escapeHtml(p.text)}</p></article>`).join(""):'<p class="empty-state">No prayer requests are visible at this access level.</p>';
}

function renderAccess(){
  const level=ROLE_LEVEL[data.role],isMember=level>=1,isGroup=level>=2,isLeadership=level>=3,isAdmin=level>=4;
  document.getElementById("memberRoleSwitcher").value=data.role;
  document.getElementById("memberDialogRole").value=isMember?data.role:"member";
  document.getElementById("memberGate").classList.toggle("hidden",isMember);
  document.getElementById("memberHome").classList.toggle("hidden",!isMember);
  document.getElementById("memberAccessLabel").textContent=ROLE_LABELS[data.role];
  document.getElementById("memberAnnouncement").textContent=data.announcement||"Welcome to Audubon Baptist Church — A Church in the Park.";
  document.querySelectorAll(".group-only").forEach(el=>el.classList.toggle("hidden",!isGroup));
  document.querySelectorAll(".leadership-only").forEach(el=>el.classList.toggle("hidden",!isLeadership));
  document.querySelectorAll(".admin-tool-link").forEach(el=>el.classList.toggle("hidden",!isAdmin));
  if(isMember){renderUpcoming();renderPrayers();}
}

function openPanel(name){
  ["prayer","serve","discussion"].forEach(panel=>document.getElementById(panel+"Panel").classList.toggle("hidden",panel!==name));
  document.getElementById(name+"Panel").scrollIntoView({behavior:"smooth",block:"start"});
}
function closePanels(){document.querySelectorAll(".member-panel").forEach(el=>el.classList.add("hidden"));}

document.getElementById("memberRoleSwitcher").addEventListener("change",e=>{data.role=e.target.value;saveData();renderAccess();});
document.getElementById("memberPreviewButton").addEventListener("click",()=>openDialog(document.getElementById("memberAccessDialog")));
document.getElementById("memberDialogContinue").addEventListener("click",()=>{data.role=document.getElementById("memberDialogRole").value;saveData();closeDialog(document.getElementById("memberAccessDialog"));renderAccess();showToast("Member preview opened.");});
document.querySelectorAll("[data-member-panel]").forEach(btn=>btn.addEventListener("click",()=>openPanel(btn.dataset.memberPanel)));
document.querySelectorAll("[data-close-panel]").forEach(btn=>btn.addEventListener("click",closePanels));

document.getElementById("memberPrayerForm").addEventListener("submit",e=>{
  e.preventDefault();
  const visibility=document.getElementById("memberPrayerVisibility").value;
  data.prayers=data.prayers||[];
  data.prayers.unshift({id:`prayer-${Date.now()}`,visibility,label:visibility==="member"?"Members":visibility==="group"?"Ministry group":"Leadership",title:document.getElementById("memberPrayerTitle").value.trim(),text:document.getElementById("memberPrayerText").value.trim()});
  saveData();e.target.reset();renderPrayers();showToast("Sample request added in this browser.");
});
document.getElementById("memberVolunteerButton").addEventListener("click",()=>showToast("Prototype: volunteer interest recorded conceptually."));

renderAccess();