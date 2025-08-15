(function(){
const $=(s,el=document)=>el.querySelector(s), $$=(s,el=document)=>Array.from(el.querySelectorAll(s));
let demo={title:'',settings:{},steps:[]}, sidx=0, hidx=0, timer=null;

function curStep(){ return demo.steps[sidx]; }
function curHot(){ return curStep().hotspots[hidx]; }

function render(){
  const step = curStep() || {hotspots:[]};
  $('#bgImage').src = step.image || '';

  const r = $('#canvas').getBoundingClientRect();
  const hs = curHot() || {};
  // Shapes
  if ((hs.shape||'rect') === 'rect'){
    const x = (hs.x||0)*r.width, y=(hs.y||0)*r.height, w=(hs.w||.2)*r.width, h=(hs.h||.2)*r.height;
    const cr = hs.corner||12;
    const holeRect = $('#spotHoleRect'), holeCircle = $('#spotHoleCircle');
    holeRect.setAttribute('x', x); holeRect.setAttribute('y', y);
    holeRect.setAttribute('width', w); holeRect.setAttribute('height', h);
    holeRect.setAttribute('rx', cr); holeRect.setAttribute('ry', cr);
    holeCircle.setAttribute('r', 0);
  } else {
    const cx = (hs.x||.3)*r.width, cy=(hs.y||.3)*r.height, rad=((hs.r||.12)*Math.min(r.width, r.height));
    const holeRect = $('#spotHoleRect'), holeCircle = $('#spotHoleCircle');
    holeRect.setAttribute('width', 0); holeRect.setAttribute('height', 0);
    holeCircle.setAttribute('cx', cx); holeCircle.setAttribute('cy', cy); holeCircle.setAttribute('r', rad);
  }

  // Tooltip
  const tt = hs.tooltip || {};
  $('#tipTitle').textContent = tt.title || '';
  $('#tipDesc').textContent = tt.desc || '';
  $('#ctaBtn').textContent = tt.ctaLabel || 'Next';
  $('#ctaLink').href = tt.link || '#';

  const tip = $('#tooltip');
  tip.dataset.style = tt.style || 'dark';
  tip.dataset.arrow = String(tt.arrow !== false);
  tip.style.width = (tt.width || 320) + 'px';
  const accent = tt.accent || demo.settings?.accent || '#5b8cff';
  tip.style.setProperty('--primary', accent);

  // Position tooltip
  let cx, cy;
  if ((hs.shape||'rect') === 'rect'){
    cx = ((hs.x||0)+(hs.w||.2)/2)/1 * r.width;
    cy = ((hs.y||0)+(hs.h||.2)/2)/1 * r.height;
  } else { cx=(hs.x||.3)*r.width; cy=(hs.y||.3)*r.height; }
  const dx = (tt.pos||'right')==='left' ? -120 : (tt.pos||'right')==='right' ? +120 : 0;
  const dy = (tt.pos||'right')==='top' ? -80 : (tt.pos||'right')==='bottom' ? +80 : 0;
  tip.style.left = (cx/r.width*100)+'%';
  tip.style.top = (cy/r.height*100)+'%';
  tip.style.transform = 'translate(-50%,-50%) translate('+dx+'px,'+dy+'px)';

  // Arrow
  const arrow=$('#tipArrow');
  const side={left:{left:'calc(100% - 6px)',top:'50%'},right:{left:'6px',top:'50%'},top:{left:'50%',top:'calc(100% - 6px)'},bottom:{left:'50%',top:'6px'}};
  const ap=side[tt.pos||'right']; Object.assign(arrow.style, ap); arrow.style.transform='translate(-50%,-50%) rotate(45deg)';

  // Progress
  const dots = $('#dots'); dots.innerHTML = '';
  demo.steps.forEach((s,i)=>{ const b=document.createElement('button'); b.className='dot'+(i===sidx?' active':'')+(i<sidx?' done':''); b.addEventListener('click',()=>{sidx=i; hidx=0; sync();}); dots.appendChild(b);});
  $('#stepCounter').textContent = (sidx+1)+' / '+demo.steps.length;
  $('#hotCounter').textContent = 'Hotspot ' + (hidx+1) + ' / ' + step.hotspots.length;

  setupTimer(hs.auto||0);
}
function setupTimer(sec){
  if (timer) clearTimeout(timer);
  if (sec>0) timer = setTimeout(onNext, sec*1000);
}
function onPrev(){
  if (hidx>0){ hidx--; sync(); return; }
  if (sidx>0){ sidx--; hidx = Math.max(0, (curStep().hotspots||[]).length-1); sync(); }
}
function onNext(){
  const hs = curHot() || {};
  const act = hs.action || {type:'nextHotspot'};
  if (act.type==='jump' && act.target){
    const j = demo.steps.findIndex(s => s.id===act.target);
    if (j>=0){ sidx=j; hidx=0; sync(); return; }
  }
  if (act.type==='nextStep'){ if (sidx<demo.steps.length-1){ sidx++; hidx=0; sync(); } return; }
  if (act.type==='link' && hs.tooltip?.link){ return; }
  if (hidx < (curStep().hotspots||[]).length-1){ hidx++; sync(); }
  else if (curStep().autoNextOnLast && sidx<demo.steps.length-1){ sidx++; hidx=0; sync(); }
}
function bind(){
  $('#prevBtn').addEventListener('click', onPrev);
  $('#nextBtn').addEventListener('click', onNext);
  $('#ctaBtn').addEventListener('click', (e)=>{ const hs=curHot(); const link = hs?.tooltip?.link||'#'; if (link==='#') onNext(); });
  window.addEventListener('resize', render);
  document.addEventListener('keydown', (e)=>{ const a=document.activeElement, inField=a&&(/INPUT|TEXTAREA/.test(a.tagName)||a.isContentEditable); if(inField) return; const k=e.key.toLowerCase(); if(k==='n') onNext(); if(k==='p') onPrev();});
}
async function load(){
  try { const res = await fetch('demo.json',{cache:'no-store'}); demo = await res.json(); }
  catch(e){ console.error('Failed to load demo.json', e); demo = {title:'Demo', settings:{}, steps:[]}; }
  sidx=0; hidx=0; bind(); render();
}
function sync(){ render(); }
document.addEventListener('DOMContentLoaded', load);
})();