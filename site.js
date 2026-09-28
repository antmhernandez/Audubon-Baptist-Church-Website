/**
 * Shared public-site behavior.
 * Handles navigation, About menu, role preview, and Member entry.
 * See docs/EDITING_GUIDE.md before changing shared navigation behavior.
 */ (function() {
  const STORAGE_KEY="abcDemoV3"; const ROLE_LEVEL= {
    public:0, member:1, group:2, leadership:3, admin:4
  }; const ROLE_LABELS= {
    public:"Public visitor", member:"Church member", group:"Ministry / group member", leadership:"Church leadership", admin:"Administrator"
  }; function ymd(date) {
    return [date.getFullYear(), String(date.getMonth()+1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  }
  function nextWeekday(start, weekday, offsetWeeks) {
    offsetWeeks=offsetWeeks||0; const d=new Date(start.getFullYear(), start.getMonth(), start.getDate()); d.setDate(d.getDate()+((weekday-d.getDay()+7)%7)+(offsetWeeks*7)); return d;
  }
  function addDays(start, count) {
    const d=new Date(start); d.setDate(d.getDate()+count); return d;
  }
  function buildEvents() {
    const today=new Date(), events=[]; for(let week=0; week<14; week+=1) {
      const sunday=nextWeekday(today, 0, week), wednesday=nextWeekday(today, 3, week); events.push({
        id:"worship-"+ymd(sunday), dateISO:ymd(sunday), time:"10:30", title:"Sunday Worship", audience:"churchwide", description:"Published Audubon materials list Sunday worship at 10:30 AM; please confirm the current schedule before production.", source:"published"
      }); events.push({
        id:"midweek-"+ymd(wednesday), dateISO:ymd(wednesday), time:"18:30", title:"Midweek Service", audience:"churchwide", description:"Published Audubon materials list the Midweek Service at 6:30 PM; please confirm the current schedule before production.", source:"published"
      });
    }
    events.push({
      id:"sample-work-day", dateISO:ymd(addDays(today, 12)), time:"09:00", title:"Sample: Church Work Day", audience:"member", description:"Demonstration event showing member RSVP and volunteer planning.", source:"sample"
    }); events.push({
      id:"sample-ministry-meeting", dateISO:ymd(addDays(today, 31)), time:"18:00", title:"Sample: Ministry Team Meeting", audience:"group", description:"Demonstration group-only event.", source:"sample"
    }); return events;
  }
  function defaults() {
    return {
      role:"public", announcement:"Welcome to Audubon Baptist Church — A Church in the Park.", sermon: {
        title:"How to Be Great for God – Beyond Yourself", reference:"Ezra 8:1–15", speaker:"Pastor Jeff Akin", tags:["Ezra", "Beyond Yourself", "Mission"]
      }, events:buildEvents(), rsvps: {
      }, prayers:[], mediaDrafts:[]
    };
  }
  function load() {
    try {
      const stored=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}"), base=defaults(); return Object.assign({
      }, base, stored, {
        sermon:Object.assign({
        }, base.sermon, stored.sermon|| {
        }), events:Array.isArray(stored.events)&&stored.events.some(function(e) {
          return e.dateISO;
        })?stored.events:base.events, rsvps:stored.rsvps|| {
        }, prayers:Array.isArray(stored.prayers)?stored.prayers:[]
      });
    }
    catch(error) {
      return defaults();
    }
  }
  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }
  function formatEvent(event) {
    const p=event.dateISO.split("-").map(Number), date=new Date(p[0], p[1]-1, p[2]); const day=new Intl.DateTimeFormat("en-US", {
      weekday:"short", month:"short", day:"numeric"
    }).format(date); if(!event.time)return day; const t=event.time.split(":").map(Number); const time=new Intl.DateTimeFormat("en-US", {
      hour:"numeric", minute:"2-digit"
    }).format(new Date(2000, 0, 1, t[0], t[1])); return day+" · "+time;
  }
  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g,function(c){return {"&":"&amp; ","<":"&lt; ",">":"&gt; ",'"':"&quot;","'":"&#039; "}[c];});}
  function ensureDialog(){
    let dialog=document.getElementById("siteSignInDialog");
    if(dialog)return dialog;
    dialog=document.createElement("dialog");
    dialog.id="siteSignInDialog";
    dialog.className="signin-dialog";
    dialog.innerHTML='<form method="dialog" class="dialog-card"><div class="dialog-heading"><div><p class="editorial-kicker">Member access preview</p><h2>Choose an account type.</h2></div><button class="dialog-close" value="cancel" aria-label="Close">×</button></div><p>Production will use real credentials. This chooser lets leadership review the private member experience now.</p><label for="siteDialogRole">Preview account</label><select id="siteDialogRole"><option value="member">Church member</option><option value="group">Ministry / group member</option><option value="leadership">Church leadership</option><option value="admin">Administrator</option></select><button class="button primary full" id="siteDialogContinue" type="button">Open Member Home</button></form>';
    document.body.appendChild(dialog);
    document.getElementById("siteDialogContinue").addEventListener("click",function(){
      const data=load();data.role=document.getElementById("siteDialogRole").value;save(data);
      if(dialog.close)dialog.close();
      window.dispatchEvent(new CustomEvent("audubon:rolechange",{detail:{role:data.role}}));
      window.location.href="member.html";
    });
    return dialog;
  }
  function renderRole(){
    const data=load(),level=ROLE_LEVEL[data.role]||0,isMember=level>=1,isAdmin=level>=4;
    const memberButton=document.getElementById("memberSignInButton");
    if(memberButton)memberButton.textContent=isMember?"Member Home":"Member sign in";
    const switcher=document.getElementById("roleSwitcher");
    if(switcher)switcher.value=data.role;
    const tools=document.getElementById("roleTools");
    if(tools)tools.classList.toggle("hidden",!isMember);
    const toolsLabel=document.getElementById("roleToolsLabel");
    if(toolsLabel)toolsLabel.textContent=ROLE_LABELS[data.role];
    document.querySelectorAll(".admin-only-tool").forEach(function(el){el.classList.toggle("hidden",!isAdmin);});
  }
  function initNav(){
    const menu=document.getElementById("menuButton"),nav=document.getElementById("mainNav");
    if(menu&&nav){
      menu.addEventListener("click",function(){const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));});
      nav.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){nav.classList.remove("open");menu.setAttribute("aria-expanded","false");});});
    }
    const page=document.body.dataset.page;
    document.querySelectorAll("[data-nav-page]").forEach(function(el){el.classList.toggle("active-page",el.dataset.navPage===page);});
    if(page==="beliefs"||page==="about"){
      const about=document.querySelector(".nav-dropdown");
      if(about)about.classList.add("active-page");
    }
    document.addEventListener("click",function(e){
      document.querySelectorAll(".nav-dropdown[open]").forEach(function(drop){if(!drop.contains(e.target))drop.removeAttribute("open");});
    });
    document.addEventListener("keydown",function(e){
      if(e.key==="Escape"){
        if(nav&&nav.classList.contains("open")){nav.classList.remove("open");if(menu){menu.setAttribute("aria-expanded","false");menu.focus();}}
        document.querySelectorAll(".nav-dropdown[open]").forEach(function(drop){drop.removeAttribute("open");});
      }
    });
  }
  function initMemberButton(){
    document.querySelectorAll("[data-member-entry], #memberSignInButton").forEach(function(button){
      button.addEventListener("click",function(e){
        if(button.tagName==="A")e.preventDefault();
        const data=load();
        if((ROLE_LEVEL[data.role]||0)>=1)window.location.href="member.html";
        else {
          const dialog=ensureDialog();
          if(dialog.showModal)dialog.showModal();else dialog.setAttribute("open","");
        }
      });
    });
  }
  function initPrototype(){
    const switcher=document.getElementById("roleSwitcher");
    if(switcher)switcher.addEventListener("change",function(){
      const data=load();data.role=switcher.value;save(data);renderRole();
      window.dispatchEvent(new CustomEvent("audubon:rolechange",{detail:{role:data.role}}));
    });
    const copy=document.getElementById("copyLinkButton");
    if(copy)copy.addEventListener("click",async function(){
      const url=window.location.href.split("#")[0];
      try{await navigator.clipboard.writeText(url);copy.textContent="Copied";setTimeout(function(){copy.textContent="Copy share link";},1600);}
      catch(error){window.prompt("Copy this link:",url);}
    });
  }
  window.AudubonSite={load:load,save:save,ROLE_LEVEL:ROLE_LEVEL,ROLE_LABELS:ROLE_LABELS,formatEvent:formatEvent,escapeHtml:escapeHtml,ymd:ymd,renderRole:renderRole};
  document.addEventListener("DOMContentLoaded",function(){initNav();initMemberButton();initPrototype();renderRole();});
})();
