const {test}=require('node:test');
const assert=require('node:assert/strict');
const {binLayout,distribution,summary}=require('../frequency.js');
const close=(a,b,eps=1e-10)=>assert.ok(Math.abs(a-b)<eps,`${a} ≈ ${b}`);

test('histogram puts boundary values in exactly one bin, including the final endpoint',()=>{
  const bins=binLayout([],0,3,{binWidth:1,binStart:0});
  const d=distribution([0,.2,1,1.5,2,3,NaN,Infinity],bins,{curve:'normal'});
  assert.deepEqual(d.histogram.map(b=>b.count),[2,2,2]);
  assert.equal(d.n,6);
});
test('decimal bin edges are stable and a custom origin aligns all groups',()=>{
  const bins=binLayout([],.15,.5,{binWidth:.1,binStart:0});
  close(bins.start,.1);
  assert.deepEqual(distribution([.1,.2,.3,.4,.5],bins).histogram.map(b=>b.count),[1,1,1,2]);
});
test('relative histograms sum to one independently for unequal group sizes',()=>{
  const bins=binLayout([],0,4,{binWidth:1});
  for(const values of [[0,1],[0,1,1,2,3,4]]){
    const d=distribution(values,bins,{scale:'relative'});
    close(d.histogram.reduce((n,b)=>n+b.height,0),1);
    const count=distribution(values,bins,{scale:'count'});
    for(let i=0;i<d.curve.length;i++)close(count.curve[i].height,d.curve[i].height*values.length);
  }
});
test('normal fit agrees with sample mean and standard deviation and bin scaling',()=>{
  const values=[-2,-1,0,1,2],bins=binLayout([],-6,6,{binWidth:.5});
  const d=distribution(values,bins,{curve:'normal',scale:'count'});
  close(d.mean,0);close(d.sd,Math.sqrt(2.5));
  close(d.curve[120].height,values.length*.5/(Math.sqrt(2.5)*Math.sqrt(2*Math.PI)));
  const area=d.curve.slice(1).reduce((sum,p,i)=>sum+(p.x-d.curve[i].x)*(p.height+d.curve[i].height)/2,0);
  close(area,values.length*bins.width,.001);
});
test('Gaussian KDE integrates to the selected frequency scale with explicit bandwidth',()=>{
  const bins=binLayout([],-8,8,{binWidth:.25});
  const d=distribution([-1,0,1],bins,{bandwidth:.5,scale:'relative'});
  close(d.bandwidth,.5);
  const area=d.curve.slice(1).reduce((sum,p,i)=>sum+(p.x-d.curve[i].x)*(p.height+d.curve[i].height)/2,0);
  close(area,bins.width,1e-6);
});
test('constant, singleton, empty and log data remain finite',()=>{
  const bins=binLayout([],1,10,{binWidth:1});
  for(const values of [[],[3],[3,3,3]]){
    const kde=distribution(values,bins);
    assert.ok(kde.curve.every(p=>Number.isFinite(p.height)));
    const normal=distribution(values,bins,{curve:'normal'});
    assert.equal(normal.curve.length,0);
    if(values.length)assert.ok(normal.warning);
  }
  const log=distribution([-1,0,1,10,NaN],bins,{},true);
  assert.equal(log.n,2);close(log.curve[120].x,Math.sqrt(10));
});
test('invalid and excessively fine bins fail explicitly',()=>{
  for(const width of [0,-1,Infinity,.0001])assert.throws(()=>binLayout([],0,10,{binWidth:width}));
  assert.throws(()=>binLayout([],3,2));
  assert.throws(()=>distribution([1],binLayout([],0,2),{bandwidth:0}));
  assert.ok(binLayout([0,0,0,1e6],0,1e6).count<=400);
});
test('variance calculation is stable for a large offset',()=>{
  const stats=summary([1e12+1,1e12+2,1e12+3]);
  close(stats.mean,1e12+2);close(stats.sd,1);
});
