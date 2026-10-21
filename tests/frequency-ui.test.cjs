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
  field('curve','normal');field('scale','relative');field('histogram',true);field('binWidth',2);field('binStart',0);field('histOpacity',.4);field('size',180);field('divisions',5);field('lineWidth',3);
  change('[data-frequency-axis-key="min"]',50);change('[data-frequency-axis-key="max"]',90);change('[data-frequency-axis-key="step"]',10);
  apply();assert.equal(el('#frequencyDialog').open,false);
  assert.ok(el('[data-frequency-open="x"]').textContent.includes('正态'));
  assert.ok(el('[data-frequency-open="x"]').textContent.includes('%'));
  assert.equal(el('[data-frequency-open="x"] .frequency-curve').getAttribute('stroke-width'),'3');
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
  field('histogram',true);field('showCurve',false);field('grid',false);apply();
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
test('default distributions use transparent baseline-to-peak fills behind every outline',t=>{
  const {d,el,enable,open,w}=setup(t);enable('x');enable('y');
  assert.equal(d.querySelectorAll('.frequency-panel rect[data-frequency-group]').length,0);
  const groups=d.querySelectorAll('#legend .legend-item').length,ids=[];
  for(const a of ['x','y']){
    const panel=el(`[data-frequency-open="${a}"]`),fills=[...panel.querySelectorAll('.frequency-fill')],curves=[...panel.querySelectorAll('.frequency-curve')];
    assert.equal(fills.length,groups);assert.equal(curves.length,groups);
    for(const fill of fills){
      assert.ok(fill.getAttribute('d').endsWith(' Z'));
      const id=fill.getAttribute('fill').slice(5,-1),gradient=d.getElementById(id);ids.push(id);
      assert.ok(gradient);assert.equal(gradient.getAttribute('gradientUnits'),'userSpaceOnUse');
      const stops=gradient.querySelectorAll('stop');
      assert.equal(stops[0].getAttribute('stop-opacity'),'0');assert.equal(stops[1].getAttribute('stop-opacity'),'0.4');
      const curve=curves.find(p=>p.dataset.frequencyGroup===fill.dataset.frequencyGroup);
      assert.equal(stops[1].getAttribute('stop-color'),curve.getAttribute('stroke'));
      assert.ok(fill.compareDocumentPosition(curves[0])&w.Node.DOCUMENT_POSITION_FOLLOWING);
      if(a==='x')assert.ok(+gradient.getAttribute('y1')>+gradient.getAttribute('y2'));
      else assert.ok(+gradient.getAttribute('x1')<+gradient.getAttribute('x2'));
    }
  }
  assert.equal(new Set(ids).size,ids.length);
  el('[data-frequency-open="x"] .frequency-fill').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.ok(el('#frequencyDialog').open);el('#frequencyCancel').click();
  open('y');assert.equal(el('[data-frequency-key="histogram"]').checked,false);
});
test('SVG export contains both panels; PNG uses the full dynamic SVG dimensions',async t=>{
  const {el,enable,downloads,w}=setup(t);enable('x');enable('y');el('#svgExport').click();
  const svg=await downloads.at(-1).text();assert.ok(svg.includes('frequency-clip-x'));assert.ok(svg.includes('frequency-clip-y'));
  assert.ok(svg.includes('viewBox="0 0 961 723"'));
  const doc=new w.DOMParser().parseFromString(svg,'image/svg+xml');assert.equal(doc.querySelector('parsererror'),null);
  assert.ok(doc.querySelectorAll('linearGradient').length>0);
  for(const fill of doc.querySelectorAll('.frequency-fill'))assert.ok(doc.getElementById(fill.getAttribute('fill').slice(5,-1)));
  Object.defineProperty(el('#chart svg'),'viewBox',{value:{baseVal:{width:961,height:723}}});
  let canvas;const original=w.document.createElement.bind(w.document);
  w.document.createElement=name=>{const e=original(name);if(name==='canvas'){canvas=e;e.getContext=()=>({drawImage(){}});e.toBlob=cb=>cb(new Blob(['png']))}return e};
  w.Image=class {set src(_){this.onload()}};
  el('#pngExport').click();assert.equal(canvas.width,1922);assert.equal(canvas.height,1446);
});
test('axis text defaults stay black at the original sizes, with decimal values at every magnitude',t=>{
  const {d,el,change,w}=setup(t);
  const labels=d.querySelectorAll('#chart [data-axis-edit]');assert.equal(labels.length,14);
  for(const text of labels){
    assert.equal(text.getAttribute('fill'),'#000000');assert.equal(text.getAttribute('data-cmyk'),'0,0,0,100');
    assert.equal(text.getAttribute('font-size'),text.dataset.axisPart==='ticks'?'16':'20');
  }
  assert.equal(w.formatAxisNumber(3500,'decimal'),'3500');
  assert.equal(w.formatAxisNumber(1e-7,'decimal'),'0.0000001');
  assert.equal(w.formatAxisNumber(-3500,'decimal'),'-3500');
  assert.equal(w.formatAxisNumber(0,'scientific'),'0');
  assert.ok(w.formatAxisNumber(-3500,'scientific').startsWith('-3.5×10'));
  assert.ok(w.formatAxisNumber(1e-7,'scientific').includes('>-7</tspan>'));
  change('[data-axis="y"][data-key="min"]',2500);change('[data-axis="y"][data-key="max"]',3500);change('[data-axis="y"][data-key="step"]',200);
  assert.deepEqual([...d.querySelectorAll('[data-axis-edit="y"][data-axis-part="ticks"]')].map(e=>e.textContent),['2600','2800','3000','3200','3400']);
  assert.equal(el('#chart svg').getAttribute('viewBox'),'0 0 750 540');
});
test('clicking a tick edits only that axis, using superscripts and synchronized CMYK colors',async t=>{
  const {d,el,change,w,downloads}=setup(t);
  change('[data-axis="y"][data-key="min"]',2500);change('[data-axis="y"][data-key="max"]',3500);
  el('[data-axis-edit="y"][data-axis-part="ticks"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.ok(el('#axisTextDialog').open);assert.ok(el('#axisTextNameField').hidden);assert.equal(el('#axisTextSize').value,'16');
  change('#axisTextSize',22);change('#axisTextNotation','scientific');change('[data-axis-cmyk="c"]',100);change('[data-axis-cmyk="k"]',0);
  assert.equal(el('#axisTextColor').value,'#00ffff');
  el('#axisTextForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(el('#axisTextDialog').open,false);
  for(const text of d.querySelectorAll('[data-axis-edit="y"][data-axis-part="ticks"]')){
    assert.equal(text.getAttribute('font-size'),'22');assert.equal(text.getAttribute('fill'),'#00ffff');assert.ok(text.querySelector('tspan[baseline-shift="super"]'));
  }
  assert.equal(el('[data-axis-edit="x"][data-axis-part="ticks"]').getAttribute('font-size'),'16');
  assert.equal(el('[data-axis-edit="y"][data-axis-part="title"]').getAttribute('fill'),'#000000');
  assert.equal(el('[data-axis="y"][data-key="min"]').value,'2500');
  el('#svgExport').click();const svg=await downloads.at(-1).text(),doc=new w.DOMParser().parseFromString(svg,'image/svg+xml');
  assert.equal(doc.querySelector('parsererror'),null);assert.equal(doc.querySelector('[data-axis-edit]'),null);
  assert.ok(doc.querySelector('text[fill="#00ffff"][data-cmyk="100,0,0,0"] tspan'));
  assert.doesNotMatch(svg,/NaN|Infinity/);
});
test('axis titles accept escaped names, picker colors, and independent apply/reset/cancel changes',t=>{
  const {el,change,w}=setup(t),selector='[data-axis-edit="x"][data-axis-part="title"]';
  el(selector).dispatchEvent(new w.KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
  assert.ok(el('#axisTextDialog').open);assert.ok(el('#axisTextNotationField').hidden);
  change('#axisTextName','Zr/Hf <custom>');change('#axisTextSize',24);change('#axisTextColor','#ff0000');
  assert.equal(el('[data-axis-cmyk="m"]').value,'100');assert.equal(el('[data-axis-cmyk="k"]').value,'0');
  el('#axisTextForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(el(selector).textContent,'Zr/Hf <custom>');assert.equal(el(selector).getAttribute('fill'),'#ff0000');
  assert.equal(el(selector).querySelector('custom'),null);assert.equal(el('[data-axis-edit="y"][data-axis-part="title"]').getAttribute('font-size'),'20');
  change('#groupPlot',false);assert.equal(el(selector).textContent,'Zr/Hf <custom>');
  el(selector).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));el('#axisTextReset').click();el('#axisTextCancel').click();
  assert.equal(el(selector).getAttribute('font-size'),'24');
  el(selector).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));el('#axisTextReset').click();
  el('#axisTextForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(el(selector).textContent,'SiO2');assert.equal(el(selector).getAttribute('font-size'),'20');assert.equal(el(selector).getAttribute('fill'),'#000000');
});
test('invalid text styles do not alter the plot, and enlarged labels keep all data and frame lines intact',t=>{
  const {d,el,change,w,enable}=setup(t),selector='[data-axis-edit="y"][data-axis-part="ticks"]';enable('x');enable('y');
  const original=el('#chart').innerHTML,stats=el('#stats').textContent,markers=d.querySelectorAll('#chart svg > circle, #chart svg > polygon').length;
  el(selector).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));change('#axisTextSize',0);
  el('#axisTextForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.ok(el('#axisTextDialog').open);assert.ok(el('#axisTextError').textContent.includes('字号'));assert.equal(el('#chart').innerHTML,original);
  change('#axisTextSize',36);change('[data-axis-cmyk="k"]',101);
  el('#axisTextForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.ok(el('#axisTextDialog').open);
  change('[data-axis-cmyk="k"]',100);el('#axisTextForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(el('#stats').textContent,stats);assert.equal(d.querySelectorAll('#chart svg > circle, #chart svg > polygon').length,markers);
  assert.equal(d.querySelectorAll('#chart svg > line[stroke="#c9cfd3"]').length,8);
  assert.equal(d.querySelectorAll('.frequency-panel').length,2);assert.doesNotMatch(el('#chart').innerHTML,/NaN|Infinity/);
  assert.ok(+el('#chart svg').getAttribute('width')>961);
});
test('RGB, HEX and CMYK share one color popup and preserve exact CMYK values across modes',t=>{
  const {el,change,w}=setup(t);el('[data-axis-edit="y"][data-axis-part="ticks"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));
  assert.ok(el('#axisColorPanel').hidden);assert.equal(el('#axisTextColor').type,'hidden');
  assert.ok(el('[data-axis-cmyk="c"]').closest('#axisColorPanel'));assert.equal(el('#axisTextDialog fieldset'),null);
  el('#axisColorToggle').click();assert.equal(el('#axisColorPanel').hidden,false);assert.equal(el('#axisColorToggle').getAttribute('aria-expanded'),'true');
  change('#axisColorMode','cmyk');assert.equal(el('[data-axis-color-mode="cmyk"]').hidden,false);assert.ok(el('[data-axis-color-mode="rgb"]').hidden);
  change('[data-axis-cmyk="c"]',20);change('[data-axis-cmyk="m"]',30);change('[data-axis-cmyk="y"]',40);change('[data-axis-cmyk="k"]',50);
  const hex=el('#axisTextColor').value;change('#axisColorMode','rgb');change('#axisColorMode','hex');assert.equal(el('#axisColorHex').value,hex);change('#axisColorMode','cmyk');
  assert.deepEqual([...el('#axisColorPanel').querySelectorAll('[data-axis-cmyk]')].map(e=>e.value),['20','30','40','50']);
  el('#axisColorDone').click();assert.ok(el('#axisColorPanel').hidden);el('#axisTextForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
  assert.equal(el('[data-axis-edit="y"][data-axis-part="ticks"]').getAttribute('data-cmyk'),'20,30,40,50');
  el('[data-axis-edit="y"][data-axis-part="ticks"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));assert.equal(el('#axisColorMode').value,'cmyk');assert.ok(el('#axisColorPanel').hidden);
});
test('popup RGB and HEX edits synchronize preview and reject invalid values; Escape closes only the picker',t=>{
  const {el,change,w}=setup(t);el('[data-axis-edit="x"][data-axis-part="title"]').dispatchEvent(new w.MouseEvent('click',{bubbles:true}));el('#axisColorToggle').click();
  change('[data-axis-rgb="r"]',255);assert.equal(el('#axisTextColor').value,'#ff0000');assert.equal(el('#axisTextPreview text').getAttribute('fill'),'#ff0000');
  change('#axisColorMode','hex');change('#axisColorHex','#00ff00');assert.equal(el('[data-axis-rgb="g"]').value,'255');assert.equal(el('[data-axis-rgb="r"]').value,'0');
  change('#axisColorHex','#bad');el('#axisTextForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.ok(el('#axisTextDialog').open);assert.match(el('#axisTextError').textContent,/HEX/);
  change('#axisColorHex','#0000ff');el('#axisTextDialog').dispatchEvent(new w.KeyboardEvent('keydown',{key:'Escape',bubbles:true,cancelable:true}));assert.ok(el('#axisTextDialog').open);assert.ok(el('#axisColorPanel').hidden);
  el('#axisTextForm').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));assert.equal(el('[data-axis-edit="x"][data-axis-part="title"]').getAttribute('fill'),'#0000ff');
});
