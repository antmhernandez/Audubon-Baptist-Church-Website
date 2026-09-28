/**
 * Audubon Baptist Church — Sermon Media Studio
 * ------------------------------------------------------------
 * Human-maintainer notes:
 * - Small/large seek jumps are configured below.
 * - Browser drafts are stored under STORAGE_KEY.
 * - The final "prepare publish" action is still a prototype; the future
 *   NAS/FFmpeg worker will replace that final processing step.
 * - See docs/EDITING_GUIDE.md and docs/MEDIA_WORKFLOW.md before changing
 *   the production workflow.
 */

const STORAGE_KEY = "abcDemoV3";
const ROLE_LEVEL = { public:0, member:1, group:2, leadership:3, admin:4 };

// EDIT HERE: quick-seek distances used by buttons and keyboard shortcuts.
const JUMP_SMALL_SECONDS = 5;
const JUMP_LARGE_SECONDS = 30;
const MAX_SAVED_DRAFTS = 10;
let data = loadData();
let objectUrl = "";
let sourceFile = null;
let duration = 0;
let trimStart = 0;
let trimEnd = 0;
let previewingSelection = false;
let lastPreparedJob = null;

function loadData() {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return { role: stored.role || "public", mediaDrafts: stored.mediaDrafts || [], ...stored };
  } catch {
    return { role:"public", mediaDrafts:[] };
  }
}
function saveData() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "00:00";
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return h ? `${h}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}` : `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
}
function formatBytes(bytes) {
  if (bytes < 1024 * 1024) return `${(bytes/1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes/(1024*1024)).toFixed(1)} MB`;
  return `${(bytes/(1024*1024*1024)).toFixed(2)} GB`;
}
function showToast(message) {
  const toast=document.getElementById("mediaToast");
  toast.textContent=message; toast.classList.remove("hidden");
  clearTimeout(showToast.timer);
  showToast.timer=setTimeout(()=>toast.classList.add("hidden"),3000);
}
function renderAccess() {
  const isAdmin=ROLE_LEVEL[data.role] >= ROLE_LEVEL.admin;
  document.getElementById("mediaGate").classList.toggle("hidden",isAdmin);
  document.getElementById("mediaStudio").classList.toggle("hidden",!isAdmin);
  document.getElementById("mediaRoleLabel").textContent=isAdmin ? "Administrator preview" : "Administrator preview required";
}
function setStudioStep(step) {
  document.querySelectorAll("[data-studio-step]").forEach(element => {
    const value=Number(element.dataset.studioStep);
    element.classList.toggle("active", value===step);
    element.classList.toggle("complete", value<step);
  });
}
function activateAdmin() {
  data.role="admin"; saveData(); renderAccess(); setStudioStep(sourceFile ? 2 : 1); showToast("Administrator media preview opened.");
}
document.getElementById("mediaAdminPreview").addEventListener("click",activateAdmin);

const input=document.getElementById("videoFileInput");
const drop=document.getElementById("dropZone");
input.addEventListener("change",()=>{ if(input.files[0]) loadVideo(input.files[0]); });
["dragenter","dragover"].forEach(name=>drop.addEventListener(name,e=>{e.preventDefault();drop.classList.add("dragging");}));
["dragleave","drop"].forEach(name=>drop.addEventListener(name,e=>{e.preventDefault();drop.classList.remove("dragging");}));
drop.addEventListener("drop",e=>{ const file=e.dataTransfer.files[0]; if(file && file.type.startsWith("video/")) loadVideo(file); else showToast("Please choose a video file."); });

function loadVideo(file) {
  sourceFile=file;
  if(objectUrl) URL.revokeObjectURL(objectUrl);
  objectUrl=URL.createObjectURL(file);
  const video=document.getElementById("videoPreview");
  video.src=objectUrl;
  document.getElementById("fileStatus").textContent="Reading video…";
  document.getElementById("fileSummary").classList.remove("hidden");
  document.getElementById("fileSummary").innerHTML=`<strong>${escapeHtml(file.name)}</strong><span>${formatBytes(file.size)} · ${escapeHtml(file.type || "video")}</span>`;
  ["editorCard","detailsCard","reviewCard"].forEach(id=>document.getElementById(id).classList.remove("hidden"));
  video.onloadedmetadata=()=>{
    duration=video.duration || 0;
    trimStart=0; trimEnd=duration;
    ["playheadSlider","trimStartSlider","trimEndSlider"].forEach(id=>document.getElementById(id).max=duration);
    document.getElementById("trimEndSlider").value=duration;
    document.getElementById("durationTime").textContent=formatTime(duration);
    document.getElementById("fileStatus").textContent="Ready to trim";
    setStudioStep(2);
    renderTrim();
    renderPublishSummary();
    document.getElementById("editorCard").scrollIntoView({behavior:"smooth",block:"start"});
  };
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[ch]));
}

const video=document.getElementById("videoPreview");
const playhead=document.getElementById("playheadSlider");

video.addEventListener("timeupdate",()=>{
  playhead.value=video.currentTime;
  document.getElementById("playheadTime").textContent=formatTime(video.currentTime);
  renderTimelineOnly();
  if(previewingSelection && video.currentTime >= trimEnd) {
    video.pause(); video.currentTime=trimStart; previewingSelection=false;
    document.getElementById("previewSelection").textContent="Preview selected clip";
  }
});
playhead.addEventListener("input",()=>{ video.currentTime=Number(playhead.value); });
document.getElementById("playPause").addEventListener("click",()=> video.paused ? video.play() : video.pause());
function seekBy(seconds) {
  if (!duration) return;
  video.currentTime = Math.max(0, Math.min(duration, video.currentTime + seconds));
}

document.getElementById("jumpBack").addEventListener("click",()=>seekBy(-JUMP_SMALL_SECONDS));
document.getElementById("jumpForward").addEventListener("click",()=>seekBy(JUMP_SMALL_SECONDS));
document.getElementById("jumpBack30").addEventListener("click",()=>seekBy(-JUMP_LARGE_SECONDS));
document.getElementById("jumpForward30").addEventListener("click",()=>seekBy(JUMP_LARGE_SECONDS));
document.getElementById("setStartHere").addEventListener("click",()=>{ trimStart=Math.min(video.currentTime,trimEnd-.1); document.getElementById("trimStartSlider").value=trimStart; renderTrim(); });
document.getElementById("setEndHere").addEventListener("click",()=>{ trimEnd=Math.max(video.currentTime,trimStart+.1); document.getElementById("trimEndSlider").value=trimEnd; renderTrim(); });

document.getElementById("setStartContinue").addEventListener("click",()=>{
  trimStart=Math.min(video.currentTime,trimEnd-.1);
  document.getElementById("trimStartSlider").value=trimStart;
  renderTrim();
  seekBy(60);
  showToast("Start saved. Jumped ahead one minute.");
});

document.getElementById("setEndContinue").addEventListener("click",()=>{
  trimEnd=Math.max(video.currentTime,trimStart+.1);
  document.getElementById("trimEndSlider").value=trimEnd;
  renderTrim();
  setStudioStep(3);
  document.getElementById("detailsCard").scrollIntoView({behavior:"smooth",block:"start"});
});
document.getElementById("trimStartSlider").addEventListener("input",e=>{ trimStart=Math.min(Number(e.target.value),trimEnd-.1); e.target.value=trimStart; renderTrim(); });
document.getElementById("trimEndSlider").addEventListener("input",e=>{ trimEnd=Math.max(Number(e.target.value),trimStart+.1); e.target.value=trimEnd; renderTrim(); });
document.getElementById("resetTrim").addEventListener("click",()=>{ trimStart=0; trimEnd=duration; document.getElementById("trimStartSlider").value=0; document.getElementById("trimEndSlider").value=duration; renderTrim(); });
document.getElementById("previewSelection").addEventListener("click",()=>{
  video.currentTime=trimStart; previewingSelection=true; video.play();
  document.getElementById("previewSelection").textContent="Playing selected clip…";
});

// Keyboard shortcuts speed up long service recordings. They are disabled
// while typing in metadata fields so normal form editing is unaffected.
document.addEventListener("keydown",event=>{
  const tag=event.target && event.target.tagName;
  if(!sourceFile || ["INPUT","TEXTAREA","SELECT"].includes(tag)) return;
  if(event.code==="Space"){ event.preventDefault(); video.paused ? video.play() : video.pause(); }
  else if(event.key==="ArrowLeft"){ event.preventDefault(); seekBy(event.shiftKey ? -JUMP_LARGE_SECONDS : -JUMP_SMALL_SECONDS); }
  else if(event.key==="ArrowRight"){ event.preventDefault(); seekBy(event.shiftKey ? JUMP_LARGE_SECONDS : JUMP_SMALL_SECONDS); }
  else if(event.key.toLowerCase()==="i"){ trimStart=Math.min(video.currentTime,trimEnd-.1); document.getElementById("trimStartSlider").value=trimStart; renderTrim(); }
  else if(event.key.toLowerCase()==="o"){ trimEnd=Math.max(video.currentTime,trimStart+.1); document.getElementById("trimEndSlider").value=trimEnd; renderTrim(); }
});

function renderTimelineOnly() {
  if(!duration) return;
  document.getElementById("trimPlayhead").style.left=`${(video.currentTime/duration)*100}%`;
}
function renderTrim() {
  document.getElementById("trimStartDisplay").textContent=formatTime(trimStart);
  document.getElementById("trimEndDisplay").textContent=formatTime(trimEnd);
  document.getElementById("clipDurationBadge").textContent=`Clip ${formatTime(trimEnd-trimStart)}`;
  if(duration) {
    const left=(trimStart/duration)*100;
    const width=((trimEnd-trimStart)/duration)*100;
    const included=document.getElementById("trimIncluded");
    included.style.left=`${left}%`; included.style.width=`${width}%`;
  }
  renderTimelineOnly();
  renderPublishSummary();
}

["mediaTitle","mediaScripture","mediaSpeaker","mediaSeries","mediaTags","mediaGain","mediaNormalize","mediaFade","mediaAudioOnly"].forEach(id=>{
  document.getElementById(id).addEventListener("input",()=>{ setStudioStep(3); renderPublishSummary(); });
  document.getElementById(id).addEventListener("change",()=>{ setStudioStep(3); renderPublishSummary(); });
});

function currentSettings() {
  return {
    fileName:sourceFile ? sourceFile.name : "",
    fileSize:sourceFile ? sourceFile.size : 0,
    sourceDuration:duration,
    trimStart, trimEnd,
    title:document.getElementById("mediaTitle").value.trim(),
    scripture:document.getElementById("mediaScripture").value.trim(),
    speaker:document.getElementById("mediaSpeaker").value.trim(),
    series:document.getElementById("mediaSeries").value.trim(),
    tags:document.getElementById("mediaTags").value.split(",").map(x=>x.trim()).filter(Boolean),
    gain:Number(document.getElementById("mediaGain").value),
    normalize:document.getElementById("mediaNormalize").checked,
    fade:document.getElementById("mediaFade").checked,
    audioOnly:document.getElementById("mediaAudioOnly").checked
  };
}

function renderWorkflowChecklist(settings) {
  const card=document.getElementById("workflowCheckCard");
  if(!sourceFile){
    card.classList.add("hidden");
    return;
  }

  card.classList.remove("hidden");

  const checks=[
    { ok:!!sourceFile, label:"Video selected" },
    { ok:settings.trimEnd>settings.trimStart, label:"Valid sermon start and end" },
    { ok:!!settings.title, label:"Sermon title entered" },
    { ok:!!settings.scripture, label:"Scripture reference entered" },
    { ok:!!settings.speaker, label:"Speaker entered" }
  ];

  document.getElementById("workflowChecklist").innerHTML=checks.map(item =>
    "<li class=\""+(item.ok?"ready":"not-ready")+"\"><span>"+(item.ok?"✓":"○")+"</span>"+escapeHtml(item.label)+"</li>"
  ).join("");

  const ready=checks.every(item=>item.ok);
  const status=document.getElementById("readyStatus");
  status.textContent=ready ? "Ready to review" : "Needs review";
  status.classList.toggle("ready",ready);
}

function renderPublishSummary() {
  const s=currentSettings();
  renderWorkflowChecklist(s);
  document.getElementById("publishSummary").innerHTML=`
    <div><span>Source</span><strong>${escapeHtml(s.fileName || "Select a video first")}</strong></div>
    <div><span>Clip</span><strong>${formatTime(s.trimStart)} → ${formatTime(s.trimEnd)} (${formatTime(Math.max(0,s.trimEnd-s.trimStart))})</strong></div>
    <div><span>Sermon</span><strong>${escapeHtml(s.title || "Title not entered")}</strong><small>${escapeHtml(s.scripture || "Scripture not entered")} · ${escapeHtml(s.speaker || "Speaker not entered")}</small></div>
    <div><span>Audio</span><strong>${s.normalize ? "Normalize speech" : "No normalization"}${s.gain ? ` · ${s.gain>0?"+":""}${s.gain} dB` : ""}</strong><small>${s.audioOnly ? "Audio-only derivative included" : "Video only"}</small></div>`;
}

function renderDrafts(){
  const drafts=Array.isArray(data.mediaDrafts)?data.mediaDrafts:[];
  document.getElementById("draftCount").textContent=drafts.length ? drafts.length+" saved" : "No drafts";
  document.getElementById("draftList").innerHTML=drafts.length ? drafts.map(draft=>"<article class=\"media-draft-row\"><div><strong>"+escapeHtml(draft.title||"Untitled sermon")+"</strong><span>"+escapeHtml(draft.fileName||"No source filename")+" · "+escapeHtml(draft.scripture||"No Scripture")+"</span></div><button class=\"mini-action\" type=\"button\" data-restore-draft=\""+escapeHtml(draft.id)+"\">Restore settings</button></article>").join("") : "<p class=\"empty-state\">No media drafts have been saved in this browser.</p>";
  document.querySelectorAll("[data-restore-draft]").forEach(button=>button.addEventListener("click",()=>{
    const draft=drafts.find(item=>item.id===button.dataset.restoreDraft);
    if(!draft) return;
    document.getElementById("mediaTitle").value=draft.title||"";
    document.getElementById("mediaScripture").value=draft.scripture||"";
    document.getElementById("mediaSpeaker").value=draft.speaker||"Pastor Jeff Akin";
    document.getElementById("mediaSeries").value=draft.series||"";
    document.getElementById("mediaTags").value=(draft.tags||[]).join(", ");
    document.getElementById("mediaGain").value=String(draft.gain||0);
    document.getElementById("mediaNormalize").checked=draft.normalize!==false;
    document.getElementById("mediaFade").checked=draft.fade!==false;
    document.getElementById("mediaAudioOnly").checked=draft.audioOnly!==false;
    if(sourceFile && duration){
      trimStart=Math.max(0,Math.min(duration,Number(draft.trimStart||0)));
      trimEnd=Math.max(trimStart+.1,Math.min(duration,Number(draft.trimEnd||duration)));
      document.getElementById("trimStartSlider").value=trimStart;
      document.getElementById("trimEndSlider").value=trimEnd;
      renderTrim();
    }
    renderPublishSummary();
    setStudioStep(sourceFile?3:1);
    showToast(sourceFile ? "Draft settings restored." : "Draft restored. Re-select the original video to restore trim points.");
  }));
}

document.getElementById("saveMediaDraft").addEventListener("click",()=>{
  if(!sourceFile){showToast("Choose a video before saving the media draft.");return;}
  const draft={...currentSettings(),id:`draft-${Date.now()}`,savedAt:new Date().toISOString()};
  data.mediaDrafts=Array.isArray(data.mediaDrafts)?data.mediaDrafts:[];
  data.mediaDrafts.unshift(draft);
  data.mediaDrafts=data.mediaDrafts.slice(0,MAX_SAVED_DRAFTS);
  saveData();
  renderDrafts();
  showToast("Trim and sermon settings saved in this browser.");
});

function buildProcessingJob(settings){
  return {
    schemaVersion:1,
    createdAt:new Date().toISOString(),
    source:{
      fileName:settings.fileName,
      fileSize:settings.fileSize,
      durationSeconds:settings.sourceDuration
    },
    edit:{
      trimStartSeconds:Number(settings.trimStart.toFixed(3)),
      trimEndSeconds:Number(settings.trimEnd.toFixed(3)),
      normalizeSpeech:settings.normalize,
      gainDb:settings.gain,
      shortFade:settings.fade,
      createAudioOnly:settings.audioOnly
    },
    sermon:{
      title:settings.title,
      scripture:settings.scripture,
      speaker:settings.speaker,
      series:settings.series,
      tags:settings.tags
    },
    publish:{
      keepRecentOnline:4,
      retainMasterOnNas:true,
      status:"ready-for-worker"
    }
  };
}

function downloadJsonFile(filename,value){
  const blob=new Blob([JSON.stringify(value,null,2)],{type:"application/json"});
  const url=URL.createObjectURL(blob);
  const link=document.createElement("a");
  link.href=url;
  link.download=filename;
  link.click();
  URL.revokeObjectURL(url);
}

document.getElementById("preparePublish").addEventListener("click",()=>{
  if(!sourceFile){showToast("Choose a video first.");return;}
  const s=currentSettings();
  if(!s.title || !s.scripture){showToast("Add a sermon title and Scripture reference before preparing publication.");return;}
  setStudioStep(4);
  lastPreparedJob=buildProcessingJob(s);
  document.getElementById("downloadMediaJob").classList.remove("hidden");
  const job=document.getElementById("publishJob");
  job.classList.remove("hidden");
  job.innerHTML=`<span class="status-pill ready">Ready for production worker</span><h3>${escapeHtml(s.title)}</h3><p>Trim <strong>${formatTime(s.trimStart)}</strong> to <strong>${formatTime(s.trimEnd)}</strong>, ${s.normalize?"normalize speech":"leave loudness unchanged"}${s.fade?", add short fades":""}, create the web video${s.audioOnly?" and audio-only copy":""}, upload to the configured provider, and publish the sermon metadata.</p><code>ffmpeg -ss ${s.trimStart.toFixed(2)} -to ${s.trimEnd.toFixed(2)} -i INPUT ... OUTPUT</code>`;
  job.scrollIntoView({behavior:"smooth",block:"nearest"});
  showToast("Prototype publish job prepared.");
});

document.getElementById("downloadMediaJob").addEventListener("click",()=>{
  if(!lastPreparedJob){
    showToast("Prepare the publication job first.");
    return;
  }
  const safeTitle=(lastPreparedJob.sermon.title||"sermon")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g,"-")
    .replace(/^-|-$/g,"");
  downloadJsonFile((safeTitle||"sermon")+"-job.json",lastPreparedJob);
  showToast("Processing-job JSON downloaded.");
});

renderAccess();
setStudioStep(1);
renderDrafts();
renderPublishSummary();
