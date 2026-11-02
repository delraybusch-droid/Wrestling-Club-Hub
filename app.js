/* Swanton Wrestling Club prototype. Vanilla JS, no tracking, no external services. */
(() => {
'use strict';
const DATA_KEY = 'swanton_wrestling_demo_v1';
const FILE_DB = 'swanton_wrestling_files_v1';
const DEFAULT_ADDRESS = 'Swanton Wrestling Club, 206 Cherry Street, Swanton, OH 43558';
const DEFAULT_FACEBOOK = 'https://www.facebook.com/swantonohiowrestlingclub';
const EDIT_ACTIONS = new Set(['new-event','new-event-on-day','edit-event','delete-event','new-wrestler','edit-wrestler','delete-wrestler','new-match','attendance','new-update','edit-update','delete-update','resource-add','resource-delete','import-sheet','upload-doc','delete-doc','import-data','reset-data']);
function isCoach(){return ui.role==='coach';}
function fbUrl(raw){try{const u=new URL(raw);return u.protocol==='https:' && ['facebook.com','www.facebook.com','m.facebook.com'].includes(u.hostname) ? u.href : '';}catch{return '';}}
function localNow(){const d=new Date();return toYmd(d)+'T'+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');}
function ageFromBirthday(birthday){if(!/^\d{4}-\d{2}-\d{2}$/.test(birthday||''))return null;const b=new Date(birthday+'T12:00:00'),n=new Date();if(!Number.isFinite(b.getTime())||b>n)return null;let age=n.getFullYear()-b.getFullYear();if((n.getMonth()<b.getMonth())||(n.getMonth()===b.getMonth()&&n.getDate()<b.getDate()))age--;return age>=0&&age<=120?age:null;}
function addWeeks(ymd,n){const d=dateObj(ymd);d.setDate(d.getDate()+7*n);return toYmd(d);}
function occurrences(items=data.events){const result=[];for(const base of items){const until=base.recurrence?.weekly?base.recurrence.until:null;if(!until||until<base.date){result.push(base);continue;}for(let i=0;i<=104;i++){const day=addWeeks(base.date,i);if(day>until)break;result.push({...base,date:day,id:base.id+'~'+day,seriesId:base.id,recurred:true});}}return result;}
function findOccurrence(id){return occurrences().find(e=>e.id===id)||data.events.find(e=>e.id===id);}
function realId(id){return String(id||'').split('~')[0];}
function visibleWrestlers(){return isCoach()?data.wrestlers:(data.wrestlers.length?[data.wrestlers[0]]:[]);}
function publicUpdates(){return data.announcements.filter(a=>(a.publishAt||((a.date||today())+'T00:00'))<=localNow());}
function editableMessage(){toast('Parent view is read-only. Coach access requires a real secure login before launch.');}

const $ = (sel, root=document) => root.querySelector(sel);
const el = (tag, props={}) => Object.assign(document.createElement(tag), props);
const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today = () => toYmd(new Date());
function toYmd(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;}
function addDays(n){const d = new Date();d.setHours(12,0,0,0);d.setDate(d.getDate()+n);return toYmd(d);}
function nextDay(weekday, weeks=0){let d=new Date();d.setHours(12,0,0,0);let delta=(weekday-d.getDay()+7)%7;d.setDate(d.getDate()+delta+weeks*7);return toYmd(d);}
function dateObj(ymd){const x=new Date(`${ymd}T12:00:00`);return Number.isNaN(x.getTime()) ? new Date() : x;}
function dateLong(ymd){return dateObj(ymd).toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});}
function dateShort(ymd){return dateObj(ymd).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});}
function timeLabel(hhmm){if(!hhmm)return 'Time TBD';const [h,m]=hhmm.split(':').map(Number);return `${(h%12)||12}:${String(m||0).padStart(2,'0')} ${h>=12?'PM':'AM'}`;}
function uid(){return (typeof crypto!=='undefined'&&crypto.randomUUID)?crypto.randomUUID():`id-${Date.now()}-${Math.random().toString(36).slice(2)}`;}
function cleanUrl(value){try{const url=new URL(String(value));return ['https:','http:'].includes(url.protocol)?url.href:'';}catch{return '';}}
function icon(name,extra=''){
 const paths={
 home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h3M13 14h3"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3.1a4 4 0 0 1 0 7.8M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
 message:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z"/>',
 more:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 trophy:'<path d="M8 21h8m-4-4v4m-7-18h14v7a7 7 0 0 1-14 0V3ZM5 6H2v2a4 4 0 0 0 4 4m13-6h3v2a4 4 0 0 1-4 4"/>',
 megaphone:'<path d="m3 11 15-7v16L3 13zm0 0v2m5 3 2 5h3l-3-6m8-7a4 4 0 0 1 0 8"/>',
 pin:'<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
 chevron:'<path d="m9 18 6-6-6-6"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
 folder:'<path d="M3 6a2 2 0 0 1 2-2h5l2 3h7a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
 upload:'<path d="M12 16V3m-5 5 5-5 5 5M4 17v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M8 13h8M8 17h8"/>',
 settings:'<path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a2 2 0 0 0 .4 2.2l-2.1 2.1a2 2 0 0 0-2.2-.4 2 2 0 0 0-1.3 1.8h-3a2 2 0 0 0-1.3-1.8 2 2 0 0 0-2.2.4l-2.1-2.1A2 2 0 0 0 6 15a2 2 0 0 0-1.8-1.3v-3A2 2 0 0 0 6 9.4 2 2 0 0 0 5.6 7l2.1-2.1a2 2 0 0 0 2.2.4A2 2 0 0 0 11.2 3h3a2 2 0 0 0 1.3 2.3 2 2 0 0 0 2.2-.4L19.8 7a2 2 0 0 0-.4 2.2 2 2 0 0 0 1.8 1.3v3a2 2 0 0 0-1.8 1.5Z"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2m3 0-1 15H6L5 6m5 4v7m4-7v7"/>',
 x:'<path d="M5 5l14 14M19 5 5 19"/>',
 edit:'<path d="m4 16 0 4 4 0 12-12-4-4L4 16zm10-10 4 4"/>',
 check:'<path d="m5 12 5 5L20 7"/>',
 alert:'<circle cx="12" cy="12" r="10"/><path d="M12 7v6m0 4h.01"/>',
 chart:'<path d="M4 20V12M10 20V5M16 20v-9M22 20V8"/>',
 shield:'<path d="m12 22 1.5-.7C20 18 21 12 21 5l-9-3-9 3c0 7 1 13 7.5 16.3z"/><path d="m8 12 3 3 5-6"/>',
 arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v6m0-10h.01"/>'
 };
 return `<svg aria-hidden="true" class="ico ${extra}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">${paths[name]||paths.more}</svg>`;
}
function buildSampleData(){
 const events=[];
 const add=(weekday,title,team,start,end)=>events.push({id:uid(),kind:'practice',title,date:nextDay(weekday),start,end,team,location:DEFAULT_ADDRESS,notes:'Sample recurring practice. Confirm times before sharing.',distance:'',url:'',recurrence:{weekly:true,until:nextDay(weekday,2)},demo:true});
 add(1,'Grey Team Practice','Grey','18:00','19:30');
 add(2,'Purple Team Practice','Purple','18:00','19:30');
 add(3,'6U Practice','6U','17:30','18:30');
 add(3,'Grey Team Practice','Grey','18:30','19:45');
 add(4,'Purple Team Practice','Purple','18:00','19:30');
 events.push({id:uid(),kind:'tournament',title:'Bill Urban Memorial Tournament',date:'2027-01-24',start:'08:00',end:'',team:'All teams',location:'Swanton, Ohio',distance:'0',url:'',notes:'Demo event. Add verified registration information and venue details when available.',demo:true});
 events.push({id:uid(),kind:'tournament',title:'DEMO: Northwest Youth Open',date:nextDay(6,1),start:'09:00',end:'',team:'All teams',location:'Napoleon, Ohio',distance:'',url:'',notes:'Fictional sample listing for testing. This is NOT a verified tournament.',demo:true});
 const wrestlers=[
  {id:uid(),name:'Sample Wrestler A',team:'Grey',grade:'5',birthday:'2015-06-20',weight:'88',results:[{id:uid(),date:addDays(-10),outcome:'win',method:'Pin'},{id:uid(),date:addDays(-3),outcome:'win',method:'Decision'},{id:uid(),date:addDays(-1),outcome:'loss',method:'Decision'}],attendance:{},demo:true},
  {id:uid(),name:'Sample Wrestler B',team:'Purple',grade:'4',birthday:'2016-04-10',weight:'76',results:[{id:uid(),date:addDays(-4),outcome:'win',method:'Pin'}],attendance:{},demo:true},
  {id:uid(),name:'Sample Wrestler C',team:'6U',grade:'K',birthday:'2020-01-22',weight:'48',results:[],attendance:{},demo:true},
 ];
 const announcements=[
  {id:uid(),title:'Welcome to your club hub!',body:'This is a working prototype. Explore the calendar, add a sample tournament, record match results and upload a test document. Nothing here is being sent to club families.',date:addDays(0),demo:true},
  {id:uid(),title:'Coaches can add club updates',body:'Practice changes and other announcements can be drafted here. Secure logins and real notifications would be added before a club-wide launch.',date:addDays(-1),demo:true}
 ];
 return {version:3,clubName:'Swanton Wrestling Club',homeCity:'Swanton, Ohio',defaultAddress:DEFAULT_ADDRESS,facebookUrl:DEFAULT_FACEBOOK,events,wrestlers,announcements,resources:[]};
}
function load(){try{const raw=localStorage.getItem(DATA_KEY);if(raw){const parsed=JSON.parse(raw);if(parsed&&Array.isArray(parsed.events)&&Array.isArray(parsed.wrestlers)&&Array.isArray(parsed.announcements))return parsed;}}catch(e){console.warn('Data storage unavailable',e);}return buildSampleData();}
let data=load();
data.defaultAddress ||= DEFAULT_ADDRESS;
data.facebookUrl ||= DEFAULT_FACEBOOK;
data.version=3;
const ui={role:'coach',nav:'home',eventView:'all',searchEvents:'',searchTeam:'',teamView:'roster',group:'all',radius:'all',docs:[],hasFiles:true,calendarOffset:0,calendarMode:'month'};
let toastTimer;
function persist(){try{localStorage.setItem(DATA_KEY,JSON.stringify(data));}catch(e){toast('Could not save. Your browser storage may be full.');}}
function toast(msg){const node=$('#toast');node.textContent=msg;node.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>node.classList.remove('show'),3300);}
const NAV=[['home','Home','home'],['events','Events','calendar'],['team','Team','users'],['messages','Updates','message'],['more','More','more']];
function navHTML(kind){return NAV.map(([name,title,symbol])=>`<button type="button" data-action="nav" data-to="${name}" class="${kind==='side'?'nav-btn':'tab-btn'} ${ui.nav===name?'active':''}" aria-label="${title}" ${ui.nav===name?'aria-current="page"':''}>${icon(symbol)}<span>${title}</span></button>`).join('');}
function roleSwitch(){return `<label class="role-switch">Preview <select aria-label="Preview role; not secure login" data-role-preview><option value="coach" ${isCoach()?'selected':''}>Coach</option><option value="parent" ${!isCoach()?'selected':''}>Parent</option></select></label>`;}
function socialLink(compact=false){return `<a class="social-link ${compact?'compact':''}" href="${esc(fbUrl(data.facebookUrl)||DEFAULT_FACEBOOK)}" target="_blank" rel="noopener noreferrer" aria-label="Swanton Wrestling Club Facebook page">${compact?'f':'Facebook ↗'}</a>`;}
function render(){
 const name=esc(data.clubName);
 $('#app').innerHTML=`<div class="app-shell">
  <aside class="sidebar"><div class="side-brand"><img src="assets/logo.png" alt="Swanton bulldog logo"><div><b>SWANTON</b><small>WRESTLING CLUB</small></div></div><nav class="side-nav" aria-label="Main navigation">${navHTML('side')}</nav><div class="side-foot"><strong>CLUB HUB · PROTOTYPE</strong><br>Created in Swanton purple, black and white.<br>Data is saved only in this browser.</div></aside>
  <div class="workspace"><header class="topbar"><div class="topbar-heading">${icon('shield')} ${name} <span class="topbar-label"> / ${NAV.find(i=>i[0]===ui.nav)[1]}</span></div><div class="topbar-tools">${socialLink()}${roleSwitch()}${isCoach()?`<button class="topbar-action" data-action="new-event">${icon('plus')} Add Event</button>`:''}</div></header>
  <header class="mobile-top"><div class="mobile-brand"><img src="assets/logo.png" alt="Swanton Wrestling Club logo"><div><b>SWANTON</b><small>WRESTLING CLUB</small></div></div><div class="mobile-tools">${socialLink(true)}${roleSwitch()}<button class="mobile-icon" aria-label="Settings" data-action="nav" data-to="more">${icon('settings')}</button></div></header>
  <main class="content" id="main-content">${ribbon()}${page()}</main></div></div>
  <nav class="tab-nav" aria-label="Bottom navigation">${navHTML('bottom')}</nav>`;
}
function ribbon(){return `<div class="demo-ribbon">${icon('info')}<span><strong>DEMO · ${isCoach()?'COACH':'PARENT'} PREVIEW.</strong> No secure login yet. Sample entries only; data stays on this device.</span></div>`;}
function page(){switch(ui.nav){case 'events':return renderEvents();case 'team':return renderTeam();case 'messages':return renderUpdates();case 'more':return renderMore();default:return renderHome();}}
function sortedEvents(events=occurrences()){return [...events].sort((a,b)=>`${a.date||''} ${a.start||''}`.localeCompare(`${b.date||''} ${b.start||''}`));}
function upcoming(kind){return sortedEvents(occurrences().filter(e=>e.date>=today() && (!kind||e.kind===kind)));}
function getStats(w){const matches=Array.isArray(w.results)?w.results:[];const wins=matches.filter(r=>r.outcome==='win').length;const losses=matches.filter(r=>r.outcome==='loss').length;const pins=matches.filter(r=>r.outcome==='win'&&r.method==='Pin').length;return {matches:matches.length,wins,losses,pins,pct:matches.length?Math.round(wins/matches.length*100):0};}
function renderHome(){
 const practice=upcoming('practice')[0];const tournament=upcoming('tournament')[0];const updates=[...publicUpdates()].sort((a,b)=>String(b.date).localeCompare(String(a.date)));const recent=updates[0];
 return `<section class="hero"><div class="hero-copy"><div class="eyebrow">Your club. Your team. Your season.</div><h1 class="hero-title">Stronger<br>Together.</h1><p class="hero-desc">Practices, tournaments, team information and updates. All in one place.</p></div><img src="assets/logo.png" class="hero-mark" alt="Swanton Wrestling Club bulldog crest"></section>
 <section class="two-col" style="margin-bottom:23px"><div class="stack">
  ${featureCard('calendar','NEXT PRACTICE',practice,'View calendar')}
  ${featureCard('trophy','UPCOMING TOURNAMENT',tournament,'View tournaments')}
 </div><div class="stack"><div class="card announcement-card"><div class="feature-label">LATEST PUBLISHED UPDATE</div><h3>${recent?esc(recent.title):'No announcements yet'}</h3><p>${recent?esc(recent.body.slice(0,165))+(recent.body.length>165?'…':''):'Start by creating your first update.'}</p><span class="date">${recent?dateShort(recent.date):''}</span><button class="feature-link" data-action="nav" data-to="messages">See all updates ${icon('arrow')}</button></div><div class="sponsor"><div><strong>Local sponsor space</strong><small>Optional future revenue for your club app</small></div><span class="badge">SPONSOR</span></div></div></section>
 <section style="margin-bottom:25px"><div class="section-head"><h2 class="section-title">Quick actions</h2></div><div class="quick-grid">
 ${[['Calendar','calendar','events'],['Tournaments','trophy','events-tournament'],['Roster','users','team'],['Documents','folder','more']].map(([name,symbol,to])=>`<button class="quick-tile" data-action="quick" data-to="${to}">${icon(symbol)}<span>${name}</span></button>`).join('')}</div></section>
 <section><div class="section-head"><h2 class="section-title">Coming up</h2><button class="text-link" data-action="nav" data-to="events">All events ${icon('arrow')}</button></div><div class="upcoming-list">${upcoming().slice(0,4).map(eventRow).join('')||empty('calendar','Nothing scheduled','Add your first practice, tournament or meeting.','new-event','Add event')}</div></section>`;
}
function featureCard(symbol,label,event,linkText){return `<article class="card feature-card"><div class="feature-icon">${icon(symbol)}</div><div style="flex:1;min-width:0"><div class="feature-label">${label}</div><h3>${event?esc(event.title):'Not scheduled'}</h3><p>${event?`${dateShort(event.date)}${event.start?' · '+timeLabel(event.start):''}`:'Add an event to get started.'}</p><p>${event?esc(event.location||'Location to be confirmed'):''}</p><button class="feature-link" data-action="${event?'event-detail':'new-event'}" ${event?`data-id="${esc(event.id)}"`:''}>${linkText} ${icon('arrow')}</button></div></article>`;}
function eventRow(event){const day=dateObj(event.date);return `<article class="event-row"><div class="datebox"><span>${day.toLocaleDateString('en-US',{month:'short'})}</span><strong>${day.getDate()}</strong><span>${day.toLocaleDateString('en-US',{weekday:'short'})}</span></div><div class="event-copy"><h3>${esc(event.title)}</h3><div class="event-meta"><span>${icon('clock')} ${event.start?timeLabel(event.start):'All day'}</span><span>${icon('pin')} ${esc(event.location||'Location TBD')}</span></div><div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap"><span class="chip">${event.kind==='tournament'?'Tournament':event.kind==='practice'?'Practice':event.kind==='meeting'?'Meeting':'Event'}</span>${event.recurred?'<span class="chip">Weekly</span>':''}${event.team&&event.team!=='All teams'?`<span class="chip dark">${esc(event.team)}</span>`:''}${event.demo?'<span class="tiny">Sample</span>':''}</div></div><button class="row-open" aria-label="View ${esc(event.title)}" data-action="event-detail" data-id="${esc(event.id)}">${icon('chevron')}</button></article>`;}
function heading(tag,title,subtitle,buttonAction,buttonText){return `<header class="heading-row"><div><div class="eyebrow">${tag}</div><h1 class="page-title">${title}</h1><p class="page-subtitle">${subtitle}</p></div>${buttonAction&&isCoach()?`<button class="btn btn-primary" data-action="${buttonAction}">${icon('plus')} <span>${buttonText}</span></button>`:''}</header>`;}
function calendarGrid(){
 const base=new Date();const m=new Date(base.getFullYear(),base.getMonth()+ui.calendarOffset,1);const year=m.getFullYear(),month=m.getMonth();const count=new Date(year,month+1,0).getDate(),first=m.getDay();
 const title=m.toLocaleDateString('en-US',{month:'long',year:'numeric'});
 const days=Array.from({length:first+count},(_,i)=>{const num=i-first+1;if(num<1)return '<div class="calendar-empty"></div>';
  const d=toYmd(new Date(year,month,num));const dayEvents=occurrences().filter(e=>e.date===d);const label=dayEvents.map(e=>e.title).join(', ');
  return `<button class="calendar-day ${d===today()?'is-today':''}" type="button" data-action="calendar-date" data-date="${d}" aria-label="${esc(`${dateLong(d)}. ${dayEvents.length} events. ${label}`)}"><b>${num}</b><div class="calendar-dots">${dayEvents.slice(0,3).map(e=>`<i class="${esc(e.kind)}" title="${esc(e.title)}"></i>`).join('')}</div></button>`;
 }).join('');
 return `<section class="card calendar-wrap"><div class="calendar-heading"><h2>${esc(title)}</h2><div class="calendar-controls"><button class="btn btn-secondary btn-sm" data-action="calendar-prev" aria-label="Previous month">‹</button><button class="btn btn-secondary btn-sm" data-action="calendar-today">Today</button><button class="btn btn-secondary btn-sm" data-action="calendar-next" aria-label="Next month">›</button></div></div><div class="calendar-grid">${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d=>`<div class="calendar-weekday">${d}</div>`).join('')}${days}</div><p class="legal">Select any date to see that day’s events or add a practice. Purple: practice. Gold: tournament. Gray: other event.</p></section>`;
}
function icsEscape(x){return String(x||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');}
function calendarStamp(e,end=false){const day=String(e.date||today()).replace(/-/g,'');if(!e.start)return `DTSTART;VALUE=DATE:${day}${end?'\r\nDTEND;VALUE=DATE:'+toYmd(new Date(dateObj(e.date).getTime()+86400000)).replace(/-/g,''):''}`;
 const time=(end?(e.end||e.start):e.start).replace(':','')+'00';return `${end?'DTEND':'DTSTART'};TZID=America/New_York:${day}T${time}`;
}
function icsFor(events){const body=events.map(e=>{const start=calendarStamp(e);let end;if(!e.start){const next=dateObj(e.date);next.setDate(next.getDate()+1);end='DTEND;VALUE=DATE:'+toYmd(next).replace(/-/g,'');}else {let stop=e.end||'';if(!stop||stop<=e.start){const [h,m]=e.start.split(':').map(Number);stop=String(Math.min(h+1,23)).padStart(2,'0')+':'+String(m).padStart(2,'0');}end='DTEND;TZID=America/New_York:'+e.date.replace(/-/g,'')+'T'+stop.replace(':','')+'00';}
 return ['BEGIN:VEVENT','UID:'+e.id+'@swanton-wrestling-prototype','DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'') ,'SUMMARY:'+icsEscape(e.title),start,end,'LOCATION:'+icsEscape(e.location),'DESCRIPTION:'+icsEscape([e.team,e.notes,e.url].filter(Boolean).join(' | ')),'END:VEVENT'].join('\r\n');}).join('\r\n');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//Swanton Wrestling Club//Demo//EN','CALSCALE:GREGORIAN','METHOD:PUBLISH',body,'END:VCALENDAR',''].join('\r\n');}
function googleCalendarLink(e){const dt=e.date.replace(/-/g,'');let dates;if(e.start){const start=dt+'T'+e.start.replace(':','')+'00';let end=e.end||e.start;const h=Number(end.slice(0,2)),m=Number(end.slice(3,5));if(end<=e.start)end=String(Math.min(h+1,23)).padStart(2,'0')+':'+String(m).padStart(2,'0');dates=start+'/'+dt+'T'+end.replace(':','')+'00';}else{const d=dateObj(e.date);d.setDate(d.getDate()+1);dates=dt+'/'+toYmd(d).replace(/-/g,'');}
 const q=new URLSearchParams({action:'TEMPLATE',text:e.title,dates,details:[e.team,e.notes,e.url].filter(Boolean).join(' | '),location:e.location||'',ctz:'America/New_York'});return 'https://calendar.google.com/calendar/render?'+q.toString();}
function showDateEvents(date){const events=sortedEvents(occurrences().filter(e=>e.date===date));modal(dateLong(date),'Club Calendar',`<div class="list-space">${events.map(e=>`<button class="roster-card" data-action="event-detail" data-id="${esc(e.id)}"><div class="feature-icon">${icon('calendar')}</div><div style="text-align:left;flex:1"><h3>${esc(e.title)}</h3><p>${e.start?timeLabel(e.start):'All day'} · ${esc(e.team||'All teams')}</p></div>${icon('chevron')}</button>`).join('')||'<p class="subtle">No events scheduled.</p>'}</div>${isCoach()?`<div class="form-buttons"><button class="btn btn-primary" data-action="new-event-on-day" data-date="${date}">${icon('plus')} Add practice or event</button></div>`:''}`);}
function renderEvents(){
 const isT=ui.eventView==='tournament';let matches=occurrences().filter(e=>ui.eventView==='all'||e.kind===ui.eventView);
 matches=matches.filter(e=>[e.title,e.location,e.team].some(s=>String(s||'').toLowerCase().includes(ui.searchEvents.toLowerCase())));
 if(isT&&ui.radius!=='all')matches=matches.filter(e=>String(e.distance).trim()!==''&&Number(e.distance)<=Number(ui.radius));
 const list=sortedEvents(matches).filter(e=>e.date>=today());const older=sortedEvents(matches).filter(e=>e.date<today()).reverse();
 return `${heading('Club calendar','Events & Tournaments','Manage practices, club events and your own tournament listings.','new-event','Add event')}
 <div class="segmented" role="group" aria-label="Event type">${[['all','All events'],['practice','Practices'],['tournament','Tournaments']].map(([key,label])=>`<button class="${ui.eventView===key?'selected':''}" data-action="event-view" data-to="${key}">${label}</button>`).join('')}</div>
 <div class="filters"><label class="searchbar">${icon('search')}<input data-filter="events" aria-label="Search events" placeholder="Search by event or city…" value="${esc(ui.searchEvents)}"></label>${isT?`<select class="filter-select" data-filter="radius" aria-label="Filter by entered distance"><option value="all" ${ui.radius==='all'?'selected':''}>Any distance</option>${[25,50,100].map(n=>`<option value="${n}" ${ui.radius===String(n)?'selected':''}>Within ${n} mi*</option>`).join('')}</select>`:''}</div>
 ${calendarGrid()}
 <div class="calendar-share-actions"><button class="btn btn-secondary btn-sm" data-action="export-calendar">${icon('download')} Download calendar for Apple / Google</button>${isCoach()?`<button class="btn btn-secondary btn-sm" data-action="import-sheet">${icon('upload')} Import events from Google Sheets CSV</button>`:''}</div>
 <p class="legal" style="margin:8px 0 18px">Calendar downloads are one-time imports, not a live subscription. Parents must import updates again until a shared calendar feed is configured.</p>
 ${isT?`<div class="demo-ribbon">${icon('info')}<span><strong>Tournament finder (phase 1):</strong> Clubs add their own tournaments here. There is not yet a live feed or automatic mileage lookup. ${ui.radius!=='all'?'Only entries with a manually supplied distance appear in filtered results.':''}</span></div>`:''}
 <section><div class="section-head"><h2 class="section-title">Upcoming (${list.length})</h2></div><div class="list-space">${list.map(eventRow).join('')||empty('calendar','No matching events','Try a different search or add an event.','new-event','Add event')}</div></section>
 ${older.length?`<section style="margin-top:28px"><div class="section-head"><h2 class="section-title">Past events (${older.length})</h2></div><div class="list-space">${older.slice(0,8).map(eventRow).join('')}</div></section>`:''}
 ${isT?`<p class="legal" style="margin-top:16px">* Distance must be entered and verified by the event organizer. No third-party tournament data is imported.</p>`:''}`;
}
function filteredWrestlers(){return [...visibleWrestlers()].filter(w=>(ui.group==='all'||w.team===ui.group)&&[w.name,w.team,w.grade].some(s=>String(s||'').toLowerCase().includes(ui.searchTeam.toLowerCase()))).sort((a,b)=>a.name.localeCompare(b.name));}
function renderTeam(){const all=visibleWrestlers();const wins=all.reduce((a,w)=>a+getStats(w).wins,0),matches=all.reduce((a,w)=>a+getStats(w).matches,0);
 return `${heading('Roster & performance',isCoach()?'Team Roster':'My Wrestler',isCoach()?'Track your demo roster, attendance and match statistics.':'Parent preview shows only one linked sample wrestler.','new-wrestler','Add wrestler')}
 <div class="stat-grid"><div class="stat-card"><strong>${all.length}</strong><span>Wrestlers</span></div><div class="stat-card"><strong>${matches}</strong><span>Matches logged</span></div><div class="stat-card"><strong>${matches?Math.round(wins/matches*100)+'%':'—'}</strong><span>Team win rate</span></div></div>
 <div class="segmented" role="group" aria-label="Roster options">${[['roster','Roster'],['attendance','Attendance'],['results','Results']].map(([k,t])=>`<button class="${ui.teamView===k?'selected':''}" data-action="team-view" data-to="${k}">${t}</button>`).join('')}</div>
 <div class="filters"><label class="searchbar">${icon('search')}<input data-filter="team" aria-label="Search wrestler" placeholder="Search wrestlers…" value="${esc(ui.searchTeam)}"></label><select class="filter-select" aria-label="Choose team" data-filter="group">${['all','Grey','Purple','6U'].map(g=>`<option value="${g}" ${ui.group===g?'selected':''}>${g==='all'?'All teams':g+' Team'}</option>`).join('')}</select></div>
 ${ui.teamView==='roster'?renderRoster():ui.teamView==='attendance'?renderAttendance():renderResults()}`;}
function renderRoster(){const wrestlers=filteredWrestlers();return `<div class="roster-grid">${wrestlers.map(w=>{const s=getStats(w);return `<button type="button" class="roster-card" data-action="wrestler-detail" data-id="${esc(w.id)}"><div class="avatar">${esc(w.name.split(' ').map(x=>x[0]).slice(-2).join('').toUpperCase())}</div><div style="min-width:0;flex:1"><h3>${esc(w.name)}</h3><p>${esc(w.team)} Team · Grade ${esc(w.grade||'Not entered')} · Age ${ageFromBirthday(w.birthday)??'—'}</p><p>${w.weight?esc(w.weight)+' lb · ':''}<strong>${s.wins}-${s.losses}</strong> record · ${s.pins} pins</p></div>${icon('chevron')}</button>`;}).join('')}</div>${wrestlers.length?'':empty('users','No wrestlers found','Add a sample wrestler to test team tracking.','new-wrestler','Add wrestler')}`;}
function renderAttendance(){const wrestlers=filteredWrestlers();return `<div style="margin:14px 0"><p class="page-subtitle">Attendance for <strong>${dateLong(today())}</strong>. Tap a status to change it: Not marked → Present → Absent → Excused.</p></div><div class="status-grid">${wrestlers.map(w=>{const status=(w.attendance||{})[today()]||'not-marked';return `<div class="attendance-row"><div class="name"><div class="avatar">${esc(w.name.slice(0,1))}</div><div class="team-info"><strong>${esc(w.name)}</strong><small>${esc(w.team)} Team</small></div></div>${isCoach()?`<button class="status ${status}" data-action="attendance" data-id="${esc(w.id)}" aria-label="Change attendance for ${esc(w.name)}">${status==='present'?icon('check'):''}${status==='not-marked'?'Not marked':status[0].toUpperCase()+status.slice(1)}</button>`:`<span class="status ${status}">${status==='not-marked'?'Not marked':status[0].toUpperCase()+status.slice(1)}</span>`}</div>`;}).join('')||empty('users','No wrestlers found','Add a wrestler first.','new-wrestler','Add wrestler')}</div>`;}
function renderResults(){const wrestlers=filteredWrestlers();const results=wrestlers.flatMap(w=>(w.results||[]).map(r=>({...r,wrestler:w.name,wrestlerId:w.id}))).sort((a,b)=>String(b.date).localeCompare(String(a.date)));
 return `<div class="section-head" style="margin-top:23px"><h2 class="section-title">Recent results</h2><span class="subtle">Select a wrestler to add match results</span></div><div class="list-space">${results.map(r=>`<button class="roster-card" data-action="wrestler-detail" data-id="${esc(r.wrestlerId)}"><div class="feature-icon">${icon(r.outcome==='win'?'trophy':'target')}</div><div style="flex:1;text-align:left"><h3>${esc(r.wrestler)}</h3><p>${dateShort(r.date)} · ${esc(r.method||'Match')}</p></div><span class="status ${r.outcome==='win'?'present':'absent'}">${r.outcome==='win'?'Win':'Loss'}</span>${icon('chevron')}</button>`).join('')||empty('chart','No results yet','Open a wrestler profile to add the first match result.','team-roster','View roster')}</div>`;}
function renderUpdates(){
 const all=isCoach()?data.announcements:publicUpdates();
 const updates=[...all].sort((a,b)=>String(b.publishAt||b.date).localeCompare(String(a.publishAt||a.date)));
 return `${heading('Team communications','Club Updates',isCoach()?'Write now, or schedule a coach post for a future date and time.':'Announcements from your club.','new-update','New update')}
 <div class="demo-ribbon">${icon('info')}<span>${isCoach()?'Scheduled posts become visible in this demo when their publish time arrives and someone opens or refreshes the app. This does not send notifications.':'Only published updates appear in the parent preview. No real accounts or push notifications yet.'}</span></div>
 <div class="list-space">${updates.map(a=>{const when=a.publishAt||(a.date+'T00:00');const queued=when>localNow();return `<article class="card announcement-card"><div class="date">${dateShort(when.slice(0,10))} · ${when.includes('T')?timeLabel(when.slice(11,16)):''} ${queued?'<span class="pill">Scheduled · Coach only</span>':'<span class="pill">Published</span>'} ${a.demo?'· Sample':''}</div><h3>${esc(a.title)}</h3><p style="white-space:pre-wrap;overflow-wrap:anywhere">${esc(a.body)}</p>${isCoach()?`<div style="margin-top:7px"><button class="btn btn-secondary btn-sm" data-action="edit-update" data-id="${esc(a.id)}">${icon('edit')} Edit</button> <button class="btn btn-danger btn-sm" data-action="delete-update" data-id="${esc(a.id)}">${icon('trash')} Delete</button></div>`:''}</article>`;}).join('')||empty('megaphone','No announcements yet',isCoach()?'Create a club update to get started.':'Published coach announcements will appear here.',isCoach()?'new-update':null,'New update')}</div>`;
}
function renderMore(){
 const documents=`<section class="card settings-card" style="margin-bottom:17px"><div class="section-head"><div><h3>Club Documents</h3><p>Files are kept in this browser, not on a shared server.</p></div>${isCoach()?`<button class="btn btn-primary btn-sm" data-action="upload-doc">${icon('upload')} Upload</button>`:''}</div>
 <div class="list-space">${ui.docs.map(d=>`<div class="document-item"><div class="file-symbol">${icon('file')}</div><div class="doc-name"><b>${esc(d.name)}</b><small>${Math.round(d.size/1024)} KB · ${dateShort(d.date||today())}</small></div><button class="btn btn-secondary btn-sm" data-action="open-doc" data-id="${esc(d.id)}">${icon('download')} Open</button>${isCoach()?`<button class="btn btn-danger btn-sm" data-action="delete-doc" data-id="${esc(d.id)}">${icon('trash')}</button>`:''}</div>`).join('')||'<p class="subtle">No files uploaded in this browser.</p>'}</div><p class="legal">Files do not sync or appear for other parents in this demo.</p></section>`;
 const google=`<section class="card settings-card" style="margin-bottom:17px"><div class="section-head"><div><h3>Google Forms, Sheets & Drive</h3><p>Save and open club forms and shareable Google Drive links.</p></div>${isCoach()?`<button class="btn btn-primary btn-sm" data-action="resource-add">${icon('plus')} Add Google link</button>`:''}</div>
 <div class="list-space">${(data.resources||[]).map(r=>`<div class="document-item"><div class="file-symbol">${icon(r.kind==='form'?'edit':r.kind==='sheet'?'chart':'folder')}</div><div class="doc-name"><b>${esc(r.name)}</b><small>${esc(r.kind==='form'?'Google Form':r.kind==='sheet'?'Google Sheet':'Google Drive file or folder')}</small></div><a class="btn btn-secondary btn-sm" href="${esc(cleanUrl(r.url))}" rel="noopener noreferrer" target="_blank">Open</a>${isCoach()?`<button class="btn btn-danger btn-sm" data-action="resource-delete" data-id="${esc(r.id)}">${icon('trash')}</button>`:''}</div>`).join('')||'<p class="subtle">No linked Google resources yet.</p>'}</div>
 ${isCoach()?`<div class="calendar-share-actions"><button class="btn btn-secondary btn-sm" data-action="import-sheet">${icon('upload')} Import Google Sheets CSV</button><button class="btn btn-secondary btn-sm" data-action="csv-template">${icon('download')} CSV template</button></div>`:''}<p class="legal">Links honor existing Google sharing permissions. This is not yet a two-way Google Drive sync or a Forms response importer.</p></section>`;
 const settings=isCoach()?`<section class="card settings-card" style="margin-bottom:17px"><h3>Coach Settings</h3><p>Club details apply to new events created in this browser.</p><form class="fields" data-form="settings" style="margin-top:16px"><div class="field"><label for="club-name">Club name</label><input id="club-name" name="clubName" required maxlength="70" value="${esc(data.clubName)}"></div><div class="field"><label for="home-city">Home city</label><input id="home-city" name="homeCity" maxlength="100" value="${esc(data.homeCity)}"></div><div class="field"><label for="default-address">Default practice and event address</label><input id="default-address" name="defaultAddress" required maxlength="180" value="${esc(data.defaultAddress)}"></div><div class="field"><label for="facebook-url">Club Facebook page</label><input id="facebook-url" type="url" name="facebookUrl" required maxlength="220" value="${esc(data.facebookUrl)}"></div><div><button type="submit" class="btn btn-primary">Save coach settings</button></div></form></section>`:'';
 const backup=isCoach()?`<section class="card settings-card" style="margin-bottom:17px"><h3>Data & Backup</h3><p>Export or restore your demo records and settings. This does not include documents.</p><div class="calendar-share-actions"><button class="btn btn-secondary btn-sm" data-action="export-data">${icon('download')} Export</button><button class="btn btn-secondary btn-sm" data-action="import-data">${icon('upload')} Import</button><button class="btn btn-danger btn-sm" data-action="reset-data">${icon('trash')} Reset demo</button></div></section>`:'';
 return `${heading('Files and preferences','Club Tools',isCoach()?'Coach settings, resources and backup tools.':'Parent access to shared forms and club information.')}
 ${documents}${google}${settings}${backup}<section class="card settings-card"><div class="section-head"><h3>Parent and Coach Accounts</h3>${icon('shield')}</div><p><strong>Role switch is a preview, not authentication.</strong> For real accounts, we'll host the app, add Firebase Authentication email invitations, store data in a protected database, and enforce coach/parent permissions on the server. Parents should only see their linked wrestler.</p><p>Children's birthdays, weights, results and family documents must not be entered until secure accounts and club data protections are ready.</p><p class="legal">One-time Apple / Google calendar downloads work now. A calendar subscription that stays updated will require a hosted live calendar feed.</p></section>`;
}
function empty(symbol,title,desc,action,btn){return `<div class="empty">${icon(symbol)}<h3>${title}</h3><p>${desc}</p>${action?`<button class="btn btn-secondary btn-sm" data-action="${action}">${icon('plus')} ${btn}</button>`:''}</div>`;}
function modal(title,subtitle,content){$('#modal-root').innerHTML=`<div class="overlay" data-action="overlay"><div class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header class="dialog-head"><div><div class="eyebrow">${esc(subtitle)}</div><h2 id="dialog-title">${esc(title)}</h2></div><button class="dialog-close" data-action="close-modal" aria-label="Close">${icon('x')}</button></header><div class="dialog-body">${content}</div></div></div>`;const input=$('#modal-root input:not([type=hidden])');if(input)input.focus();else $('#modal-root .dialog-close')?.focus();}
function closeModal(){$('#modal-root').innerHTML='';}
function formInput(label,name,value='',type='text',opts=''){return `<div class="field"><label for="f-${name}">${esc(label)}</label><input id="f-${name}" name="${name}" type="${type}" value="${esc(value)}" ${opts}></div>`;}
function formSelect(label,name,values,selected){return `<div class="field"><label for="f-${name}">${esc(label)}</label><select id="f-${name}" name="${name}">${values.map(([k,v])=>`<option value="${esc(k)}" ${String(k)===String(selected)?'selected':''}>${esc(v)}</option>`).join('')}</select></div>`;}
function textarea(label,name,value=''){return `<div class="field"><label for="f-${name}">${esc(label)}</label><textarea id="f-${name}" name="${name}">${esc(value)}</textarea></div>`;}
function eventForm(id){
 const e=data.events.find(x=>x.id===realId(id))||{kind:'practice',title:'',date:today(),start:'18:00',end:'19:30',location:data.defaultAddress||DEFAULT_ADDRESS,team:'All teams',notes:'',url:'',distance:'',recurrence:null};
 const editing=!!id;const weekly=!!e.recurrence?.weekly;
 modal(editing?'Edit Practice / Event':'Add Practice / Event','Club Calendar',`<form class="fields" data-form="event"><input type="hidden" name="id" value="${esc(editing?e.id:'')}">
 ${formInput('Event name','title',e.title,'text','required maxlength="120"')}
 <div class="field-row">${formSelect('Event type','kind',[['practice','Practice'],['tournament','Tournament'],['meeting','Meeting'],['other','Other']],e.kind)}${formSelect('Team','team',[['All teams','All teams'],['Grey','Grey'],['Purple','Purple'],['6U','6U']],e.team)}</div>
 <div class="field-row">${formInput('Start date','date',e.date,'date','required')}${formInput('Location','location',e.location||data.defaultAddress,'text','maxlength="180"')}</div>
 <div class="field-row">${formInput('Start time','start',e.start,'time')}${formInput('End time','end',e.end,'time')}</div>
 <div class="recurrence-box"><label class="checkline"><input type="checkbox" name="repeatWeekly" ${weekly?'checked':''}> <strong>Repeat weekly (enable recurring practices)</strong></label><div class="recurrence-until">${formInput('Repeat until (stop date)','repeatUntil',e.recurrence?.until||addWeeks(e.date,12),'date')}</div><p class="legal">Weekly on the same weekday, from the start date through the stop date. Editing or deleting changes the entire series. Maximum 2 years.</p></div>
 <div class="field-row">${formInput('Distance in miles (optional)','distance',e.distance,'number','min="0" max="9999" step="0.1"')}${formInput('Registration URL (optional)','url',e.url,'url','placeholder="https://…"')}</div>
 ${textarea('Details or notes','notes',e.notes)}
 <div class="form-buttons"><button class="btn btn-secondary" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${icon('check')} ${editing?'Save series / event':'Add event'}</button></div></form>`);
}
function eventDetails(id){const e=findOccurrence(id);if(!e)return;
 modal(e.title,e.kind.toUpperCase(),`<div class="details">
 <div class="detail-line">${icon('calendar')} ${dateLong(e.date)} ${e.recurred?'<span class="pill">Weekly recurring practice / event</span>':''}</div><div class="detail-line">${icon('clock')} ${e.start?timeLabel(e.start):'Time TBD'}${e.end?' to '+timeLabel(e.end):''}</div><div class="detail-line">${icon('pin')} ${esc(e.location||'Location TBD')}</div><div class="detail-line">${icon('users')} ${esc(e.team||'All teams')}</div>${e.recurrence?.weekly?`<div class="detail-line">${icon('calendar')} Every week until ${dateLong(e.recurrence.until)}</div>`:''}
 ${String(e.distance).trim()!==''?`<div class="detail-line">${icon('target')} ${esc(e.distance)} miles (manually entered)</div>`:''}
 ${e.demo?'<span class="pill">Sample event, please verify details</span>':''}${e.notes?`<div class="detail-note">${esc(e.notes)}</div>`:''}
 <div class="calendar-share-actions"><a class="btn btn-secondary btn-sm" href="${esc(googleCalendarLink(e))}" target="_blank" rel="noopener noreferrer">${icon('calendar')} Add to Google Calendar</a><button class="btn btn-secondary btn-sm" data-action="ics-event" data-id="${esc(e.id)}">${icon('download')} Apple / .ics</button></div>
 ${cleanUrl(e.url)?`<a class="btn btn-secondary" href="${esc(cleanUrl(e.url))}" target="_blank" rel="noopener noreferrer">Open registration link ${icon('arrow')}</a>`:''}</div>
 ${isCoach()?`<div class="form-buttons"><button class="btn btn-danger" data-action="delete-event" data-id="${esc(realId(e.id))}">${icon('trash')} Delete ${e.recurrence?.weekly?'series':'event'}</button><button class="btn btn-primary" data-action="edit-event" data-id="${esc(realId(e.id))}">${icon('edit')} Edit ${e.recurrence?.weekly?'series':'event'}</button></div>`:''}`);
}
function wrestlerForm(id){const w=data.wrestlers.find(x=>x.id===id)||{name:'',team:'Grey',grade:'',birthday:'',weight:''};modal(id?'Edit wrestler':'Add wrestler','Roster',`<form class="fields" data-form="wrestler"><input type="hidden" name="id" value="${esc(id||'')}">
 ${formInput('Name (sample names only until secure logins)','name',w.name,'text','required maxlength="100"')}
 <div class="field-row">${formSelect('Team','team',[['Grey','Grey'],['Purple','Purple'],['6U','6U']],w.team)}${formSelect('Grade (through 6th)','grade',[['','Choose grade'],['Pre-K','Pre-K'],['K','Kindergarten'],...Array.from({length:6},(_,i)=>[String(i+1),`${i+1}`])],w.grade)}</div>
 <div class="field-row">${formInput('Birthday (age calculated)','birthday',w.birthday||'','date')}${formInput('Weight (pounds)','weight',w.weight||'','number','min="20" max="400" step="0.1" placeholder="e.g. 75.5"')}</div>
 <p class="legal">Birthdays and weights are private child information. Use fictional values during this prototype.</p>
 <div class="form-buttons"><button class="btn btn-secondary" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Save wrestler</button></div></form>`);}
function wrestlerDetail(id){const w=visibleWrestlers().find(x=>x.id===id);if(!w)return;const s=getStats(w);
 modal(w.name,`${w.team} Team · Grade ${w.grade||'—'}`,`<div class="profile-details"><span><strong>Age</strong> ${ageFromBirthday(w.birthday)??'—'} years</span><span><strong>Birthday</strong> ${w.birthday?dateLong(w.birthday):'Not entered'}</span><span><strong>Weight</strong> ${w.weight?esc(w.weight)+' lb':'Not entered'}</span></div>
 <div class="stat-grid"><div class="stat-card"><strong>${s.wins}-${s.losses}</strong><span>Win / loss</span></div><div class="stat-card"><strong>${s.pins}</strong><span>Pins</span></div><div class="stat-card"><strong>${s.matches?s.pct+'%':'—'}</strong><span>Win rate</span></div></div>
 <div class="section-head"><h3 class="section-title">Match history</h3>${isCoach()?`<button class="btn btn-primary btn-sm" data-action="new-match" data-id="${esc(id)}">${icon('plus')} Add match</button>`:''}</div>
 <div class="match-log">${(w.results||[]).slice().sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(r=>`<div class="match-item"><span>${dateShort(r.date)} · ${esc(r.method||'Match')}</span><strong>${r.outcome==='win'?'WIN':'LOSS'}</strong></div>`).join('')||'<p class="subtle">No matches recorded.</p>'}</div>
 ${isCoach()?`<div class="form-buttons"><button class="btn btn-danger" data-action="delete-wrestler" data-id="${esc(id)}">${icon('trash')} Delete</button><button class="btn btn-secondary" data-action="edit-wrestler" data-id="${esc(id)}">${icon('edit')} Edit</button></div>`:''}`);
}
function matchForm(id){const w=data.wrestlers.find(x=>x.id===id);if(!w)return;modal('Record a match',w.name,`<form class="fields" data-form="match"><input type="hidden" name="wrestlerId" value="${esc(id)}"><div class="field-row">${formInput('Match date','date',today(),'date','required')}${formSelect('Result','outcome',[['win','Win'],['loss','Loss']],'win')}</div>${formSelect('Result type','method',[['Pin','Pin'],['Decision','Decision'],['Major Decision','Major Decision'],['Technical Fall','Technical Fall'],['Forfeit','Forfeit'],['Other','Other']],'Pin')}${formInput('Opponent or notes (optional)','opponent','','text','maxlength="100"')}<div class="form-buttons"><button class="btn btn-secondary" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">Save result</button></div></form>`);}
function updateForm(id){const a=data.announcements.find(x=>x.id===id)||{title:'',body:'',publishAt:localNow()};const when=a.publishAt||(a.date+'T00:00');modal(id?'Edit scheduled post':'New coach post','Club Announcements',`<form class="fields" data-form="update"><input type="hidden" name="id" value="${esc(id||'')}">${formInput('Title','title',a.title,'text','required maxlength="120"')}${formInput('Publish date and time','publishAt',when,'datetime-local','required')}${textarea('Message','body',a.body)}<p class="legal">Scheduled visibility is based on the date and time in this browser. It does not send notifications. Automatic publication and notifications on all phones require a server.</p><div class="form-buttons"><button class="btn btn-secondary" type="button" data-action="close-modal">Cancel</button><button class="btn btn-primary" type="submit">${id?'Save post':'Save or schedule post'}</button></div></form>`);}
function changePage(nav){ui.nav=nav;closeModal();render();window.scrollTo({top:0,behavior:'instant'});}
async function handleAction(a){const type=a.dataset.action,id=a.dataset.id;
 if(!isCoach()&&EDIT_ACTIONS.has(type)){editableMessage();return;}
 switch(type){
 case 'role-login-info':modal('Secure parent and coach login','Before club launch',`<p>Production logins will use email invitations with Firebase Authentication, and coach roles plus per-child parent access will be protected by database rules.</p><p><strong>This switch is only a UI preview.</strong> Do not enter personal information for real children yet.</p>`);break;
 case 'nav':changePage(a.dataset.to);break;
 case 'quick':if(a.dataset.to==='events-tournament'){ui.eventView='tournament';changePage('events');}else if(a.dataset.to==='team-roster'){ui.teamView='roster';changePage('team');}else changePage(a.dataset.to);break;
 case 'event-view':ui.eventView=a.dataset.to;render();break;
 case 'team-view':ui.teamView=a.dataset.to;render();break;
 case 'new-event':eventForm();break;
 case 'new-event-on-day':closeModal();eventForm();$('#modal-root [name=date]').value=a.dataset.date;$('#modal-root [name=repeatUntil]').value=addWeeks(a.dataset.date,12);break;
 case 'calendar-date':showDateEvents(a.dataset.date);break;
 case 'calendar-prev':ui.calendarOffset--;render();break;
 case 'calendar-next':ui.calendarOffset++;render();break;
 case 'calendar-today':ui.calendarOffset=0;render();break;
 case 'ics-event':{const ev=findOccurrence(id);if(ev)downloadBlob(new Blob([icsFor([ev])],{type:'text/calendar;charset=utf-8'}),`swanton-${ev.date}.ics`);break;}
 case 'export-calendar':downloadBlob(new Blob([icsFor(occurrences())],{type:'text/calendar;charset=utf-8'}),'swanton-club-calendar.ics');break;
 case 'resource-add':resourceForm();break;
 case 'resource-delete':if(confirm('Remove this Google link from the prototype?')){data.resources=(data.resources||[]).filter(r=>r.id!==id);persist();render();}break;
 case 'import-sheet':$('#sheet-import').click();break;
 case 'csv-template':if(!isCoach()){editableMessage();break;}downloadCSVTemplate();break;
 case 'event-detail':eventDetails(id);break;
 case 'edit-event':eventForm(id);break;
 case 'delete-event':if(confirm('Delete this event and every repeat in its series?')){data.events=data.events.filter(x=>x.id!==realId(id));persist();closeModal();render();toast('Event deleted.');}break;
 case 'new-wrestler':wrestlerForm();break;
 case 'wrestler-detail':wrestlerDetail(id);break;
 case 'edit-wrestler':wrestlerForm(id);break;
 case 'delete-wrestler':if(confirm('Delete this wrestler and their match results?')){data.wrestlers=data.wrestlers.filter(x=>x.id!==id);persist();closeModal();render();toast('Wrestler deleted.');}break;
 case 'new-match':matchForm(id);break;
 case 'attendance':{const w=data.wrestlers.find(x=>x.id===id);if(!w)break;w.attendance ||= {};const current=w.attendance[today()]||'not-marked';const next={'not-marked':'present',present:'absent',absent:'excused',excused:'not-marked'}[current];if(next==='not-marked')delete w.attendance[today()];else w.attendance[today()]=next;persist();render();break;}
 case 'new-update':updateForm();break;
 case 'edit-update':updateForm(id);break;
 case 'delete-update':if(confirm('Delete this announcement?')){data.announcements=data.announcements.filter(x=>x.id!==id);persist();render();toast('Update deleted.');}break;
 case 'upload-doc':$('#document-upload').click();break;
 case 'open-doc':await openFile(id);break;
 case 'delete-doc':if(confirm('Permanently delete this document from this browser?')){await deleteFile(id);await refreshDocs();render();toast('Document deleted.');}break;
 case 'export-data':if(!isCoach()){editableMessage();break;}exportData();break;
 case 'import-data':$('#data-import').click();break;
 case 'reset-data':if(confirm('Reset your events, roster, updates, and settings to demo data? Your uploaded documents will remain on this device.')){data=buildSampleData();persist();ui.nav='home';render();toast('Demo data restored.');}break;
 case 'close-modal':closeModal();break;
 case 'overlay':closeModal();break;
 default:break;
 }
}
function resourceForm(){modal('Add a Google resource','Google Forms · Sheets · Drive',`<form class="fields" data-form="resource">${formInput('Name','name','','text','required maxlength="100"')}${formSelect('Resource type','kind',[['form','Google Form'],['sheet','Google Sheet'],['drive','Drive document or folder']],'form')}${formInput('Shareable Google URL','url','','url','required placeholder="https://docs.google.com/…"')}<p class="legal">The link remains governed by its Google sharing settings. Private links will prompt parents to sign in or request access.</p><div class="form-buttons"><button class="btn btn-primary" type="submit">Save link</button></div></form>`);}
function parseCSV(text){let rows=[],row=[],cell='',quoted=false;for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quoted&&text[i+1]==='"'){cell+='"';i++;}else quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';}else cell+=c;}if(quoted)throw new Error('CSV contains an unmatched quote.');row.push(cell);if(row.some(x=>x.trim()))rows.push(row);return rows;}
async function importSheetCSV(file){try{if(file.size>2*1024*1024)throw Error('File is too large.');const rows=parseCSV((await file.text()).replace(/^\uFEFF/,''));if(rows.length<2)throw Error('CSV must include headers and at least one event.');const headers=rows.shift().map(x=>x.trim().toLowerCase().replace(/[ _-]/g,''));const value=(row,key)=>{const i=headers.indexOf(key);return i<0?'':String(row[i]||'').trim();};if(!headers.includes('title')||!headers.includes('date'))throw Error('Expected columns: title, date, kind, start, end, team, location, notes, url.');const imported=[];for(const row of rows){const title=value(row,'title').slice(0,120),date=value(row,'date');if(!title||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(new Date(date+'T12:00:00').getTime()))continue;const kind=['practice','tournament','meeting','other'].includes(value(row,'kind').toLowerCase())?value(row,'kind').toLowerCase():'other';const tm=x=>/^([01]\d|2[0-3]):[0-5]\d$/.test(x)?x:'';imported.push({id:uid(),title,date,kind,start:tm(value(row,'start')),end:tm(value(row,'end')),team:value(row,'team')||'All teams',location:(value(row,'location')||data.defaultAddress).slice(0,180),notes:value(row,'notes').slice(0,3000),url:cleanUrl(value(row,'url')),distance:'',recurrence:value(row,'repeatweekly').toLowerCase()==='true'&&/^\d{4}-\d{2}-\d{2}$/.test(value(row,'repeatuntil'))?{weekly:true,until:value(row,'repeatuntil')}:null,demo:false});}if(!imported.length)throw Error('No valid event rows found. Dates must be YYYY-MM-DD.');if(!confirm(`Import ${imported.length} events? This adds events to this device only and may create duplicates.`))return;data.events.push(...imported);persist();ui.nav='events';render();toast(`${imported.length} events imported from CSV.`);}catch(err){toast(err.message||'Could not read CSV.');}}
function downloadCSVTemplate(){downloadBlob(new Blob(['title,date,kind,start,end,team,location,notes,url,repeatWeekly,repeatUntil\r\n"Sample Practice",2026-11-09,practice,18:00,19:30,Grey,"Swanton Wrestling Club 206 Cherry Street Swanton OH 43558","Use YYYY-MM-DD dates",,true,2026-12-14\r\n'],{type:'text/csv;charset=utf-8'}),'swanton-events-template.csv');}
function exportData(){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});downloadBlob(blob,`swanton-wrestling-backup-${today()}.json`);toast('Backup downloaded. Documents are not included.');}
function downloadBlob(blob,name){const link=el('a',{href:URL.createObjectURL(blob),download:name});document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(link.href),2000);}
async function importData(file){try{if(file.size>3000000)throw new Error('File is too large.');const parsed=JSON.parse(await file.text());if(!parsed||!Array.isArray(parsed.events)||!Array.isArray(parsed.wrestlers)||!Array.isArray(parsed.announcements)||typeof parsed.clubName!=='string')throw new Error('Not a valid wrestling app backup.');if(!confirm('Replace this browser’s current app data with the imported backup?'))return;data=parsed;persist();render();toast('Backup imported.');}catch(err){toast(err.message||'Unable to import file.');}}
// IndexedDB is used for files because localStorage is unsuitable for binary documents.
function dbOpen(){return new Promise((resolve,reject)=>{if(!('indexedDB' in window))return reject(new Error('File storage unavailable.'));const req=indexedDB.open(FILE_DB,1);req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains('documents'))req.result.createObjectStore('documents',{keyPath:'id'});};req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);});}
async function dbRequest(mode,operation){const db=await dbOpen();return new Promise((resolve,reject)=>{let tx=db.transaction('documents',mode),store=tx.objectStore('documents'),req=operation(store);req.onsuccess=()=>resolve(req.result);req.onerror=()=>reject(req.error);tx.oncomplete=()=>db.close();tx.onerror=()=>{db.close();reject(tx.error);};});}
async function refreshDocs(){try{ui.docs=(await dbRequest('readonly',s=>s.getAll())).map(({id,name,size,date})=>({id,name,size,date})).sort((a,b)=>b.date.localeCompare(a.date));}catch(err){ui.docs=[];ui.hasFiles=false;console.warn('No document storage',err);}}
async function saveFiles(files){let saved=0;for(const file of files){if(file.size>8*1024*1024){toast(`${file.name} exceeds the 8 MB limit.`);continue;}const allowed=/\.(pdf|png|jpe?g|webp|txt|docx?|xlsx?)$/i.test(file.name);if(!allowed){toast(`${file.name} is not a supported file type.`);continue;}try{await dbRequest('readwrite',store=>store.put({id:uid(),name:file.name,size:file.size,date:today(),blob:file}));saved++;}catch(err){toast('Could not save file in this browser.');break;}}await refreshDocs();render();if(saved)toast(`${saved} document${saved===1?'':'s'} saved on this device.`);}
async function openFile(id){try{const record=await dbRequest('readonly',store=>store.get(id));if(!record){toast('Document not found.');return;}downloadBlob(record.blob,record.name);}catch{toast('Unable to open this file.');}}
async function deleteFile(id){try{await dbRequest('readwrite',store=>store.delete(id));}catch{toast('Unable to remove document.');}}
function submitForm(form){const fd=new FormData(form),type=form.dataset.form,v=Object.fromEntries(fd.entries());if(!isCoach()){editableMessage();return;}
 if(type==='resource'){const url=cleanUrl(v.url);let hostname='';try{hostname=new URL(url).hostname;}catch{}if(!url||!(hostname==='drive.google.com'||hostname==='docs.google.com'||hostname==='forms.gle'||hostname==='sheets.google.com')){toast('Enter a valid Google Forms, Sheets, or Drive link.');return;}data.resources ||= [];data.resources.push({id:uid(),name:String(v.name||'Google resource').trim().slice(0,100),kind:v.kind,url});persist();closeModal();render();toast('Google link saved on this device.');return;}
 if(type==='event'){
  if(!isCoach()){editableMessage();return;}
  if(!v.title?.trim()||!v.date)return;
  if(v.repeatWeekly==='on'&&(!v.repeatUntil||v.repeatUntil<v.date||v.repeatUntil>addWeeks(v.date,104))){toast('Choose a weekly end date after the start, within 2 years.');return;}
  const existing=data.events.find(e=>e.id===v.id);
  const item={id:existing?.id||uid(),kind:v.kind,title:v.title.trim().slice(0,120),date:v.date,start:v.start||'',end:v.end||'',team:v.team,location:(v.location||data.defaultAddress||DEFAULT_ADDRESS).trim().slice(0,180),distance:v.distance||'',url:cleanUrl(v.url||''),notes:(v.notes||'').trim().slice(0,3000),recurrence:v.repeatWeekly==='on'?{weekly:true,until:v.repeatUntil}:null,demo:false};
  if(v.url&&!item.url){toast('Please use a valid http:// or https:// link.');return;}
  if(existing)Object.assign(existing,item);else data.events.push(item);
  persist();closeModal();ui.nav='events';render();toast(item.recurrence?'Weekly series saved.':existing?'Event updated.':'Event added.');
 }else if(type==='wrestler'){
  if(!v.name?.trim())return;if(!['','Pre-K','K','1','2','3','4','5','6'].includes(v.grade)){toast('Select Pre-K through grade 6.');return;}if(v.birthday&&ageFromBirthday(v.birthday)===null){toast('Enter a valid past birthday.');return;}const existing=data.wrestlers.find(w=>w.id===v.id);const details={name:v.name.trim().slice(0,100),team:v.team,grade:v.grade,birthday:v.birthday||'',weight:v.weight||''};if(existing)Object.assign(existing,details);else data.wrestlers.push({id:uid(),...details,attendance:{},results:[],demo:false});persist();closeModal();ui.nav='team';ui.teamView='roster';render();toast(existing?'Wrestler updated.':'Wrestler added.');
 }else if(type==='match'){
  const w=data.wrestlers.find(w=>w.id===v.wrestlerId);if(!w)return;w.results||=[];w.results.push({id:uid(),date:v.date,outcome:v.outcome,method:v.method,opponent:(v.opponent||'').trim()});persist();closeModal();render();toast('Match result saved.');wrestlerDetail(w.id);
 }else if(type==='update'){
  if(!v.title?.trim())return;const existing=data.announcements.find(a=>a.id===v.id);const entry={id:existing?.id||uid(),title:v.title.trim(),body:v.body||'',publishAt:v.publishAt||localNow(),date:(v.publishAt||localNow()).slice(0,10),demo:existing?.demo||false};if(existing)Object.assign(existing,entry);else data.announcements.push(entry);persist();closeModal();ui.nav='messages';render();toast('Club update saved locally.');
 }else if(type==='settings'){
  if(!v.clubName?.trim())return;data.clubName=v.clubName.trim();data.homeCity=(v.homeCity||'').trim();if(!fbUrl(v.facebookUrl)){toast('Enter a valid https://facebook.com page link.');return;}data.facebookUrl=fbUrl(v.facebookUrl);data.defaultAddress=(v.defaultAddress||DEFAULT_ADDRESS).trim().slice(0,180);persist();render();toast('Club settings saved.');
 }
}
document.addEventListener('click',e=>{const btn=e.target.closest('[data-action]');if(!btn)return;if(btn.dataset.action==='overlay'&&e.target!==btn)return;e.preventDefault();handleAction(btn).catch(err=>{console.error(err);toast('Something went wrong. Try again.');});});
document.addEventListener('submit',e=>{const form=e.target.closest('form[data-form]');if(!form)return;e.preventDefault();submitForm(form);});
document.addEventListener('input',e=>{if(!e.target.matches('[data-filter="events"], [data-filter="team"]'))return;const key=e.target.dataset.filter==='events'?'searchEvents':'searchTeam';const cursor=e.target.selectionStart;ui[key]=e.target.value;render();const newInput=$(`[data-filter="${e.target.dataset.filter}"]`);if(newInput){newInput.focus();newInput.setSelectionRange(cursor,cursor);}});
document.addEventListener('change',async e=>{
 const target=e.target;
 if(target.matches('[data-role-preview]')){ui.role=target.value==='parent'?'parent':'coach';ui.nav='home';ui.teamView='roster';closeModal();render();toast('Demo '+ui.role+' view. This is not a secure login.');return;}
 if(target.name==='date'&&target.closest('form[data-form=event]')){const till=target.form.querySelector('[name=repeatUntil]');if(till&&till.value<target.value)till.value=addWeeks(target.value,12);}
 if(target.matches('[data-filter="group"]')){ui.group=target.value;render();}
 if(target.matches('[data-filter="radius"]')){ui.radius=target.value;render();}
 if(target.id==='document-upload'){if(target.files.length)await saveFiles([...target.files]);target.value='';}
 if(target.id==='sheet-import'){if(target.files?.[0])await importSheetCSV(target.files[0]);target.value='';}
 if(target.id==='data-import'){if(target.files?.[0])await importData(target.files[0]);target.value='';}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModal();});
render();refreshDocs().then(()=>{if(ui.nav==='more')render();});
if('serviceWorker' in navigator && (location.protocol==='https:'||location.hostname==='localhost'||location.hostname==='127.0.0.1')){navigator.serviceWorker.register('./service-worker.js').catch(console.warn);}
})();
