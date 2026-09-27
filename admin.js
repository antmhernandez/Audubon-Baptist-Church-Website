const STORAGE_KEY="abcDemoV3";
function ymd(date){return [date.getFullYear(),String(date.getMonth()+1).padStart(2,"0"),String(date.getDate()).padStart(2,"0")].join("-");}
function loadData(){try{return {role:"public",events:[],sermon:{title:"",reference:"",speaker:"",tags:[]},announcement:"",...JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}")};}catch{return {role:"public",events:[],sermon:{title:"",reference:"",speaker:"",tags:[]},announcement:""};}}
let data=loadData();
function saveData(){localStorage.setItem(STORAGE_KEY,JSON.stringify(data));}
function showToast(message){const el=document.getElementById("adminToast");el.textContent=message;el.classList.remove("hidden");clearTimeout(showToast.timer);showToast.timer=setTimeout(function(){el.classList.add("hidden");},2800);}
function render(){
  const isAdmin=data.role==="admin";
  document.getElementById("adminGate").classList.toggle("hidden",isAdmin);
  document.getElementById("adminHome").classList.toggle("hidden",!isAdmin);
  document.getElementById("adminRoleLabel").textContent=isAdmin?"Administrator preview":"Administrator preview required";
  if(!isAdmin)return;
  document.getElementById("adminAnnouncement").value=data.announcement||"";
  document.getElementById("adminSermonTitle").value=data.sermon.title||"";
  document.getElementById("adminSermonReference").value=data.sermon.reference||"";
  document.getElementById("adminSermonSpeaker").value=data.sermon.speaker||"";
  document.getElementById("adminSermonTags").value=(data.sermon.tags||[]).join(", ");
  const today=ymd(new Date());
  document.getElementById("adminEventCount").textContent=(data.events||[]).filter(function(e){return e.dateISO>=today;}).length+" upcoming";
}
document.getElementById("adminPreviewButton").addEventListener("click",function(){data.role="admin";saveData();render();showToast("Administrator preview opened.");});
document.getElementById("adminAnnouncementForm").addEventListener("submit",function(e){e.preventDefault();data.announcement=document.getElementById("adminAnnouncement").value.trim();saveData();showToast("Homepage announcement saved in this browser.");});
document.getElementById("adminEventForm").addEventListener("submit",function(e){
  e.preventDefault();
  data.events=data.events||[];
  data.events.push({
    id:"event-"+Date.now(),
    dateISO:document.getElementById("adminEventDate").value,
    time:document.getElementById("adminEventTime").value,
    title:document.getElementById("adminEventTitle").value.trim(),
    audience:document.getElementById("adminEventAudience").value,
    description:document.getElementById("adminEventDescription").value.trim(),
    source:"admin-demo"
  });
  saveData();e.target.reset();document.getElementById("adminEventTime").value="18:30";render();showToast("Calendar event added.");
});
document.getElementById("adminSermonForm").addEventListener("submit",function(e){
  e.preventDefault();
  data.sermon={
    title:document.getElementById("adminSermonTitle").value.trim(),
    reference:document.getElementById("adminSermonReference").value.trim(),
    speaker:document.getElementById("adminSermonSpeaker").value.trim(),
    tags:document.getElementById("adminSermonTags").value.split(",").map(function(x){return x.trim();}).filter(Boolean)
  };
  saveData();showToast("Featured sermon details saved.");
});
render();