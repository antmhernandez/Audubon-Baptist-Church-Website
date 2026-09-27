const STORAGE_KEY="abcDemoV3";
const ROLE_LABELS={public:"Public visitor",member:"Church member",group:"Ministry / group member",leadership:"Church leadership",admin:"Administrator"};
const ROLE_LEVEL={public:0,member:1,group:2,leadership:3,admin:4};

function ymd(date){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");}
function nextWeekday(start,weekday,offsetWeeks){offsetWeeks=offsetWeeks||0;const d=new Date(start.getFullYear(),start.getMonth(),start.getDate());d.setDate(d.getDate()+((weekday-d.getDay()+7)%7)+(offsetWeeks*7));return d;}
function addDays(start,count){const d=new Date(start);d.setDate(d.getDate()+count);return d;}

function buildDefaultEvents(){
  const today=new Date(),events=[];
  for(let week=0;week<14;week+=1){
    const sunday=nextWeekday(today,0,week),wednesday=nextWeekday(today,3,week);
    events.push({id:"worship-"+ymd(sunday),dateISO:ymd(sunday),time:"10:30",title:"Sunday Worship",audience:"churchwide",description:"Published Audubon materials list this gathering at 10:30 AM; please confirm the current schedule before production.",source:"published"});
    events.push({id:"midweek-"+ymd(wednesday),dateISO:ymd(wednesday),time:"18:30",title:"Midweek Service",audience:"churchwide",description:"Published Audubon materials list the Midweek Service at 6:30 PM; please confirm the current schedule before production.",source:"published"});
  }
  events.push({id:"sample-work-day",dateISO:ymd(addDays(today,12)),time:"09:00",title:"Sample: Church Work Day",audience:"member",description:"Demonstration event showing member RSVP and volunteer planning.",source:"sample"});
  events.push({id:"sample-ministry-meeting",dateISO:ymd(addDays(today,31)),time:"18:00",title:"Sample: Ministry Team Meeting",audience:"group",description:"Demonstration group-only event.",source:"sample"});
  return events;
}

function defaults(){return{
  role:"public",
  announcement:"Welcome to Audubon Baptist Church — A Church in the Park.",
  sermon:{title:"How to Be Great for God – Beyond Yourself",reference:"Ezra 8:1–15",speaker:"Pastor Jeff Akin",tags:["Ezra","Beyond Yourself","Mission"]},
  events:buildDefaultEvents(),
  rsvps:{},
  prayers:[
    {id:"prayer-1",visibility:"member",label:"Members",title:"Sample congregational prayer request",text:"A members-only request can be shared without publishing private details on the public website."},
    {id:"prayer-2",visibility:"group",label:"Ministry group",title:"Sample ministry-team request",text:"Group-level requests are visible only to assigned ministry members."},
    {id:"prayer-3",visibility:"leadership",label:"Leadership",title:"Sample leadership prayer concern",text:"Sensitive matters can be restricted to leaders."}
  ],
  mediaDrafts:[]
};}

const ARCHIVE_SERMONS=[
  {id:1,title:"How to Be Great for God – Beyond Yourself",reference:"Ezra 8:1–15",speaker:"Pastor Jeff Akin",date:"February 12, 2023",group:"ezra",tags:["Ezra","Mission"]},
  {id:2,title:"The Inclusivity of God",reference:"Ezra 6:16–22",speaker:"Pastor Jeff Akin",date:"January 22, 2023",group:"ezra",tags:["Ezra","Worship"]},
  {id:3,title:"Bye Bye Babylon",reference:"Ezra 6:1–15",speaker:"Pastor Jeff Akin",date:"January 15, 2023",group:"ezra",tags:["Ezra","Providence"]},
  {id:4,title:"Yet I Will Quietly Wait",reference:"Habakkuk 3:3–16",speaker:"Pastor Jeff Akin",date:"August 22, 2021",group:"habakkuk",tags:["Habakkuk","Faith"]}
];

function loadData(){
  try{
    const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}"),base=defaults();
    return Object.assign({},base,stored,{
      sermon:Object.assign({},base.sermon,stored.sermon||{}),
      events:Array.isArray(stored.events)&&stored.events.some(function(e){return e.dateISO;})?stored.events:base.events,
      rsvps:stored.rsvps||{},
      prayers:Array.isArray(stored.prayers)&&stored.prayers.length?stored.prayers:base.prayers
    });
  }catch(error){return defaults();}
}

let data=loadData();
let activeFilter="all";
let pendingDestination="member.html";

function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c];});}
function showToast(message){const el=document.getElementById("toast");el.textContent=message;el.classList.remove("hidden");clearTimeout(showToast.timer);showToast.timer=setTimeout(function(){el.classList.add("hidden");},3000);}
function openDialog(){const d=document.getElementById("signInDialog");if(d.showModal)d.showModal();else d.setAttribute("open","");}
function closeDialog(){const d=document.getElementById("signInDialog");if(d.close)d.close();else d.removeAttribute("open");}
function formatEvent(event){
  const parts=event.dateISO.split("-").map(Number),date=new Date(parts[0],parts[1]-1,parts[2]);
  const day=new Intl.DateTimeFormat("en-US",{weekday:"short",month:"short",day:"numeric"}).format(date);
  if(!event.time)return day;
  const timeParts=event.time.split(":").map(Number);
  const time=new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit"}).format(new Date(2000,0,1,timeParts[0],timeParts[1]));
  return day+" · "+time;
}

function visibleUpcoming(limit){
  limit=limit||3;
  const today=ymd(new Date()),level=ROLE_LEVEL[data.role];
  return data.events.filter(function(e){
    return e.dateISO>=today&&(e.audience!=="member"||level>=1)&&(e.audience!=="group"||level>=2);
  }).sort(function(a,b){return (a.dateISO+(a.time||"")).localeCompare(b.dateISO+(b.time||""));}).slice(0,limit);
}

function renderSermon(){
  const s=data.sermon;
  document.getElementById("sermonTitle").textContent=s.title;
  document.getElementById("sermonReference").textContent=s.reference;
  document.getElementById("sermonSpeaker").textContent=s.speaker;
  document.getElementById("sermonTags").innerHTML=(s.tags||[]).map(function(t){return '<span class="chip">'+escapeHtml(t)+'</span>';}).join("");
}

function renderArchive(){
  const query=document.getElementById("sermonSearch").value.trim().toLowerCase();
  const items=ARCHIVE_SERMONS.filter(function(s){
    const hay=[s.title,s.reference,s.speaker,s.date].concat(s.tags).join(" ").toLowerCase();
    return (!query||hay.includes(query))&&(activeFilter==="all"||s.group===activeFilter);
  });
  document.getElementById("sermonGrid").innerHTML=items.map(function(s){
    return '<article class="sermon-card"><span class="sermon-ref">'+escapeHtml(s.reference)+'</span><h3>'+escapeHtml(s.title)+'</h3><p>'+escapeHtml(s.date)+' · '+escapeHtml(s.speaker)+'</p><button class="text-button archive-feature" data-sermon-id="'+s.id+'" type="button">Feature this sermon →</button></article>';
  }).join("");
  document.getElementById("sermonEmpty").classList.toggle("hidden",items.length>0);
  document.querySelectorAll(".archive-feature").forEach(function(btn){
    btn.addEventListener("click",function(){
      const s=ARCHIVE_SERMONS.find(function(x){return String(x.id)===btn.dataset.sermonId;});
      if(!s)return;
      data.sermon={title:s.title,reference:s.reference,speaker:s.speaker,tags:s.tags};
      saveData();renderSermon();document.getElementById("sermons").scrollIntoView({behavior:"smooth"});
      showToast("Featured sermon updated in this browser demo.");
    });
  });
}

function renderEvents(){
  const isMember=ROLE_LEVEL[data.role]>=1,root=document.getElementById("eventGrid"),items=visibleUpcoming(3);
  root.innerHTML=items.map(function(e){
    const title=e.title.replace("Sample: ","");
    const audience=e.audience==="churchwide"?"Everyone":e.audience==="member"?"Members":"Ministry";
    const memberLink=isMember?'<a class="text-link-dark" href="calendar.html">View in calendar →</a>':"";
    return '<article class="event-card clean-event-card"><span class="event-date">'+escapeHtml(formatEvent(e))+'</span><h3>'+escapeHtml(title)+'</h3><p>'+escapeHtml(e.description)+'</p><div class="event-card-footer"><span class="chip">'+escapeHtml(audience)+'</span>'+memberLink+'</div></article>';
  }).join("");
}

function renderRole(){
  const isMember=ROLE_LEVEL[data.role]>=1,isAdmin=ROLE_LEVEL[data.role]>=4;
  document.getElementById("roleSwitcher").value=data.role;
  document.getElementById("dialogRole").value=isMember?data.role:"member";
  document.getElementById("memberSignInButton").textContent=isMember?"Member Home":"Member sign in";
  document.getElementById("roleTools").classList.toggle("hidden",!isMember);
  document.getElementById("roleToolsLabel").textContent=ROLE_LABELS[data.role];
  document.querySelectorAll(".admin-only-tool").forEach(function(el){el.classList.toggle("hidden",!isAdmin);});
  document.getElementById("sermonAdminShortcut").classList.toggle("hidden",!isAdmin);
  renderEvents();
}

function requestPrivate(destination){
  pendingDestination=destination;
  if(ROLE_LEVEL[data.role]>=1)window.location.href=destination;
  else openDialog();
}

document.getElementById("roleSwitcher").addEventListener("change",function(e){
  data.role=e.target.value;saveData();renderRole();
  if(data.role!=="public")showToast("Previewing as "+ROLE_LABELS[data.role]+".");
});
document.getElementById("copyLinkButton").addEventListener("click",async function(){
  const url=window.location.href.split("#")[0];
  try{await navigator.clipboard.writeText(url);showToast("Share link copied.");}
  catch(error){window.prompt("Copy this link:",url);}
});
document.getElementById("menuButton").addEventListener("click",function(){
  const nav=document.getElementById("mainNav"),open=nav.classList.toggle("open");
  document.getElementById("menuButton").setAttribute("aria-expanded",String(open));
});
document.querySelectorAll("#mainNav a").forEach(function(a){
  a.addEventListener("click",function(){
    document.getElementById("mainNav").classList.remove("open");
    document.getElementById("menuButton").setAttribute("aria-expanded","false");
  });
});

["memberSignInButton","memberQuickLink","memberHomeButton","footerMemberButton"].forEach(function(id){
  document.getElementById(id).addEventListener("click",function(){requestPrivate("member.html");});
});
document.getElementById("calendarPromoButton").addEventListener("click",function(){requestPrivate("calendar.html");});
document.getElementById("dialogContinue").addEventListener("click",function(){
  data.role=document.getElementById("dialogRole").value;saveData();closeDialog();window.location.href=pendingDestination;
});

document.getElementById("sermonSearch").addEventListener("input",renderArchive);
document.querySelectorAll("[data-filter]").forEach(function(btn){
  btn.addEventListener("click",function(){
    activeFilter=btn.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach(function(x){x.classList.toggle("active",x===btn);});
    renderArchive();
  });
});
document.getElementById("watchDemoButton").addEventListener("click",function(){showToast("The newest published sermon video will play here.");});
document.getElementById("audioDemoButton").addEventListener("click",function(){showToast("An audio-only copy can be generated during publishing.");});
document.getElementById("givingButton").addEventListener("click",function(){showToast("The production button will open Audubon's approved secure giving provider.");});
document.getElementById("sermonAdminShortcut").addEventListener("click",function(){window.location.href="media-studio.html";});

/* Long-page navigation: quiet, useful, and accessible. */
const scrollProgress=document.getElementById("scrollProgress");
const backToTop=document.getElementById("backToTop");
const trackedSections=["visit","sermons","events","beliefs","about","give"];
const navLinks=[...document.querySelectorAll("#mainNav a[href^='#']")];

function updateScrollUI(){
  const doc=document.documentElement;
  const max=doc.scrollHeight-window.innerHeight;
  const ratio=max>0?Math.min(1,Math.max(0,window.scrollY/max)):0;
  scrollProgress.style.transform="scaleX("+ratio+")";
  backToTop.classList.toggle("hidden",window.scrollY<720);
}

function setActiveSection(id){
  navLinks.forEach(function(link){
    const active=link.getAttribute("href")==="#"+id;
    link.classList.toggle("active-section",active);
    if(active)link.setAttribute("aria-current","location");
    else link.removeAttribute("aria-current");
  });
}

if("IntersectionObserver" in window){
  const observer=new IntersectionObserver(function(entries){
    const visible=entries.filter(function(entry){return entry.isIntersecting;}).sort(function(a,b){return b.intersectionRatio-a.intersectionRatio;});
    if(visible[0])setActiveSection(visible[0].target.id);
  },{rootMargin:"-26% 0px -58% 0px",threshold:[0,.15,.4,.7]});
  trackedSections.forEach(function(id){
    const section=document.getElementById(id);
    if(section)observer.observe(section);
  });
}

window.addEventListener("scroll",updateScrollUI,{passive:true});
window.addEventListener("resize",updateScrollUI);
updateScrollUI();

backToTop.addEventListener("click",function(){
  window.scrollTo({top:0,behavior:"smooth"});
});

document.addEventListener("keydown",function(event){
  if(event.key==="Escape"){
    const nav=document.getElementById("mainNav");
    if(nav.classList.contains("open")){
      nav.classList.remove("open");
      document.getElementById("menuButton").setAttribute("aria-expanded","false");
      document.getElementById("menuButton").focus();
    }
  }
});

function renderAll(){
  document.getElementById("announcementText").textContent=data.announcement;
  renderSermon();renderArchive();renderRole();
}
renderAll();