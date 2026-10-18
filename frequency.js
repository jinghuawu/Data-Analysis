/* Statistical model shared by the SVG renderer and Node regression tests. */
(function(root){
  'use strict';
  const MAX_BINS=400;
  function quantile(sorted,p){
    const i=(sorted.length-1)*p,k=Math.floor(i);
    return sorted[k]+(sorted[Math.min(k+1,sorted.length-1)]-sorted[k])*(i-k);
  }
  function summary(values){
    let n=0,mean=0,m2=0;
    for(const v of values){n++;const delta=v-mean;mean+=delta/n;m2+=delta*(v-mean)}
    return {n,mean,sd:n>1?Math.sqrt(Math.max(0,m2/(n-1))):0};
  }
  function binLayout(values,low,high,options={}){
    if(!Number.isFinite(low)||!Number.isFinite(high)||!(high>low))throw new Error('数据轴结束值必须大于起始值。');
    const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b),n=sorted.length;
    const iqr=n?quantile(sorted,.75)-quantile(sorted,.25):0;
    const automatic=iqr>0?2*iqr/Math.cbrt(n):(high-low)/Math.max(1,Math.ceil(Math.log2(n||1)+1));
    const width=options.binWidth===''||options.binWidth==null?Math.max(automatic,(high-low)/MAX_BINS):Number(options.binWidth);
    if(!Number.isFinite(width)||width<=0)throw new Error('分箱步长必须为正数。');
    const origin=options.binStart===''||options.binStart==null?low:Number(options.binStart);
    if(!Number.isFinite(origin))throw new Error('分箱起点必须为有限数值。');
    const start=origin+Math.floor((low-origin)/width)*width;
    const count=Math.ceil(Number(((high-start)/width).toPrecision(14)));
    if(!Number.isFinite(start)||!Number.isFinite(count)||count<1||count>MAX_BINS)throw new Error('分箱数需为 1–400，请增大步长或缩小数据轴范围。');
    return {start,width,count,low,high,end:start+count*width};
  }
  function distribution(values,bins,options={},log=false){
    const clean=values.filter(v=>Number.isFinite(v)&&(!log||v>0));
    const stats=summary(clean),counts=Array(bins.count).fill(0);
    for(const v of clean){
      let i=Math.floor(Number(((v-bins.start)/bins.width).toPrecision(14)));
      if(i===bins.count&&Math.abs(v-bins.end)<=Math.abs(bins.width)*1e-10)i--;
      if(i>=0&&i<counts.length)counts[i]++;
    }
    const divisor=options.scale==='relative'?(stats.n||1):1;
    const histogram=counts.map((count,i)=>({low:bins.start+i*bins.width,high:bins.start+(i+1)*bins.width,count,height:count/divisor}));
    const sorted=clean.slice().sort((a,b)=>a-b);
    const iqr=clean.length?quantile(sorted,.75)-quantile(sorted,.25):0;
    const robust=iqr>0?Math.min(stats.sd||Infinity,iqr/1.34):stats.sd;
    const bandwidth=options.bandwidth!==''&&options.bandwidth!=null?Number(options.bandwidth):(.9*(robust||bins.width)*Math.pow(stats.n||1,-.2));
    if(!Number.isFinite(bandwidth)||bandwidth<=0)throw new Error('KDE 带宽必须为正数。');
    const curve=[],normal=options.curve==='normal',canFit=stats.n>0&&(!normal||stats.sd>0);
    if(canFit){
      const norm=Math.sqrt(2*Math.PI),factor=bins.width*(options.scale==='relative'?1:stats.n);
      for(let i=0;i<=240;i++){
        const t=i/240,x=log?Math.exp(Math.log(bins.low)+t*(Math.log(bins.high)-Math.log(bins.low))):bins.low+t*(bins.high-bins.low);
        let density;
        if(normal){const z=(x-stats.mean)/stats.sd;density=Math.exp(-.5*z*z)/(stats.sd*norm)}
        else {let sum=0;for(const v of clean){const z=(x-v)/bandwidth;sum+=Math.exp(-.5*z*z)}density=sum/(stats.n*bandwidth*norm)}
        curve.push({x,height:density*factor});
      }
    }
    return {...stats,bandwidth,histogram,curve,warning:normal&&stats.n>0&&!canFit?'样本不足或数值相同，无法拟合正态曲线；可改用 KDE。':''};
  }
  const api={MAX_BINS,quantile,summary,binLayout,distribution};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
  else root.FrequencyStats=api;
})(globalThis);
