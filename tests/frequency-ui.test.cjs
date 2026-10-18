const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const source=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');
function setup(t){
  const dom=new JSDOM(source('index.html'),{runScripts:'outside-only',url:'http://localhost'}),w=dom.window,d=w.document;
  // jsdom has no native modal or raster canvas; emulate those browser boundaries.
  w.HTMLDialogElement.prototype.showModal=function(){this.open=true};
  w.HTMLDialogElement.prototype.close=function(){this.open=false};
  w.Blob=globalThis.Blob;
  const downloads=[];
  w.URL.createObjectURL=blob=>{downloads.push(blob);return 'blob:test'};
  w.URL.revokeObjectURL=()=>{};
  w.HTMLAnchorElement.prototype.click=function(){};
  w.setTimeout=()=>0;
  w.eval(source('frequency.js'));w.eval(source('app.js'));
  t.after(()=>w.close());
  const el=s=>d.querySelector(s),change=(selector,value)=>{const e=el(selector);if(e.type==='checkbox')e.checked=value;else e.value=value;e.dispatchEvent(new w.Event('change',{bubbles:true}))};
  const enable=a=>change(`[data-frequency="${a}"]`,true);
  const open=a=>el(`[data-frequency-settings="${a}"]`).click();
  const field=(key,value)=>change(`[data-frequency-key="${key}"]`,value);
  const apply=()=>el('#frequencyForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  return {w,d,el,change,enable,open,field,apply,downloads};
}
test('independent checkboxes appear below units and add top/right plots aligned with scatter',t=>{
  const {el,d,enable,change}=setup(t);
  assert.equal(d.querySelectorAll('.frequency-panel').length,0);
  for(const card of d.querySelectorAll('.axis-card'))assert.equal(card.lastElementChild.className,'frequency-toggle');
  enable('x');assert.equal(d.querySelectorAll('.frequency-panel').length,1);
  enable('y');assert.equal(d.querySelectorAll('.frequency-panel').length,2);
  const top=el('[data-frequency-open="x"] rect'),right=el('[data-frequency-open="y"] rect');
  assert.equal(+top.getAttribute('x'),140);assert.equal(+top.getAttribute('width'),540);
  assert.equal(+right.getAttribute('height'),405);
  assert.equal(el('#chart svg').getAttribute('viewBox'),'0 0 961 723');
  change('[data-frequency="x"]',false);
  assert.equal(el('#chart svg').getAttribute('viewBox'),'0 0 961 540');
});
test('clicking a group curve opens its axis settings and applies normal/relative histogram controls',t=>{
  const {el,enable,change,field,apply,w}=setup(t);enable('x');enable('y');
  const curve=el('[data-frequency-open="x"] path[stroke="transparent"]'),g=curve.dataset.frequencyGroup;
  curve.dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.ok(el('#frequencyDialog').open);assert.ok(el('#frequencyContext').textContent.includes(g));
  field('curve','normal');field('scale','relative');field('binWidth',2);field('binStart',0);field('histOpacity',.4);field('size',180);field('divisions',5);field('lineWidth',3);
  change('[data-frequency-axis-key="min"]',50);change('[data-frequency-axis-key="max"]',90);change('[data-frequency-axis-key="step"]',10);
  apply();assert.equal(el('#frequencyDialog').open,false);
  assert.ok(el('[data-frequency-open="x"]').textContent.includes('正态'));
  assert.ok(el('[data-frequency-open="x"]').textContent.includes('%'));
  assert.equal(el('[data-frequency-open="x"] path').getAttribute('stroke-width'),'3');
  assert.equal(el('[data-frequency-open="x"] rect[data-frequency-group]').getAttribute('fill-opacity'),'0.4');
  assert.ok(el('[data-frequency-open="y"]').textContent.includes('KDE'));
  assert.equal(el('[data-axis="x"][data-key="min"]').value,'50');
});
test('grouping and sample selection update curves, with safe empty plots',t=>{
  const {d,el,enable,change}=setup(t);enable('x');
  const groups=d.querySelectorAll('#legend .legend-item').length;
  assert.equal(d.querySelectorAll('.frequency-panel path[stroke="transparent"]').length,groups);
  change('#groupPlot',false);assert.equal(d.querySelectorAll('.frequency-panel path[stroke="transparent"]').length,1);
  el('#selectNone').click();assert.equal(d.querySelectorAll('.frequency-panel path').length,0);
  assert.ok(el('.frequency-panel').textContent.includes('暂无有效'));
  el('#selectAll').click();assert.equal(d.querySelectorAll('.frequency-panel path[stroke="transparent"]').length,1);
  el('#clearData').click();assert.equal(el('#chart svg'),null);
});
test('invalid bin settings stay in the dialog; cancel and reset do not mutate plots',t=>{
  const {el,enable,open,field,apply}=setup(t);enable('x');const original=el('#chart').innerHTML;
  open('x');field('binWidth',.00001);apply();
  assert.ok(el('#frequencyDialog').open);assert.ok(el('#frequencyError').textContent.includes('400'));
  el('#frequencyCancel').click();assert.equal(el('#chart').innerHTML,original);
  open('x');field('binWidth',2);el('#frequencyReset').click();
  assert.equal(el('[data-frequency-key="binWidth"]').value,'');
  el('#frequencyCancel').click();assert.equal(el('#chart').innerHTML,original);
});
test('histogram-only and curve-only modes, grid settings and independent axes survive re-render',t=>{
  const {d,el,enable,open,field,apply,change}=setup(t);enable('x');enable('y');open('x');
  field('showCurve',false);field('grid',false);apply();
  assert.equal(d.querySelectorAll('[data-frequency-open="x"] path').length,0);
  assert.ok(d.querySelectorAll('[data-frequency-open="x"] rect[data-frequency-group]').length>0);
  assert.ok(d.querySelectorAll('[data-frequency-open="y"] path').length>0);
  open('x');field('showCurve',true);field('histogram',false);apply();
  assert.equal(d.querySelectorAll('[data-frequency-open="x"] rect[data-frequency-group]').length,0);
  change('[data-axis="x"][data-key="use"]',true);
  assert.ok(el('[data-frequency="x"]').checked);assert.ok(el('[data-frequency="y"]').checked);
});
test('LOG10 and denominator exclusions never introduce NaN or Infinity in frequency SVG',t=>{
  const {el,enable,change,w}=setup(t);
  const input='Sample\tGroup\tSiO2\tMgO\tCaO\nS1\tA\t1\t2\t1\nS2\tA\t10\t3\t0\nS3\tB\t100\t4\t2\nS4\tB\t0\t5\t1\nS5\tB\t-1\t6\t1';
  el('#source').value=input;el('#parse').click();enable('x');enable('y');
  change('[data-axis="x"][data-key="log"]',true);
  change('[data-axis="x"][data-key="use"]',true);
  change('[data-axis="x"][data-key="den"]','CaO');
  assert.ok(el('#plotNotice').textContent.includes('有效投图 2 个'));
  assert.doesNotMatch(el('#chart svg').outerHTML,/NaN|Infinity/);
  assert.ok(el('#chart svg').outerHTML.includes('frequency-clip-x'));
});
test('SVG export contains both panels; PNG uses the full dynamic SVG dimensions',async t=>{
  const {el,enable,downloads,w}=setup(t);enable('x');enable('y');el('#svgExport').click();
  const svg=await downloads.at(-1).text();assert.ok(svg.includes('frequency-clip-x'));assert.ok(svg.includes('frequency-clip-y'));
  assert.ok(svg.includes('viewBox="0 0 961 723"'));
  const doc=new w.DOMParser().parseFromString(svg,'image/svg+xml');assert.equal(doc.querySelector('parsererror'),null);
  Object.defineProperty(el('#chart svg'),'viewBox',{value:{baseVal:{width:961,height:723}}});
  let canvas;const original=w.document.createElement.bind(w.document);
  w.document.createElement=name=>{const e=original(name);if(name==='canvas'){canvas=e;e.getContext=()=>({drawImage(){}});e.toBlob=cb=>cb(new Blob(['png']))}return e};
  w.Image=class {set src(_){this.onload()}};
  el('#pngExport').click();assert.equal(canvas.width,1922);assert.equal(canvas.height,1446);
});
