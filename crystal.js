import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { RGBShiftShader } from 'three/addons/shaders/RGBShiftShader.js';

const canvas=document.getElementById('crystal');
const host=canvas.parentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(42,1,.1,100);
camera.position.set(0,0,6.4);
const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.setClearColor(0x000000,0);

// Non-indexed faces keep their flat normals. This position buffer is never modified.
const geometry=new THREE.IcosahedronGeometry(2.05,1).toNonIndexed();
const count=geometry.attributes.position.count;
const bary=[];
for(let i=0;i<count;i+=3)bary.push(1,0,0, 0,1,0, 0,0,1);
geometry.setAttribute('aBary',new THREE.Float32BufferAttribute(bary,3));
const uniforms={uTime:{value:0},uPointer:{value:new THREE.Vector2()},uReduced:{value:reduced?1:0}};
const vertexShader=`
attribute vec3 aBary;
varying vec3 vLocal;
varying vec3 vNormal;
varying vec3 vBary;
varying vec3 vView;
void main(){
  vLocal=position;
  vBary=aBary;
  vNormal=normalize(normalMatrix*normal);
  vec4 view=modelViewMatrix*vec4(position,1.0);
  vView=normalize(-view.xyz);
  gl_Position=projectionMatrix*view;
}`;
const fragmentShader=`
precision highp float;
uniform float uTime;
uniform vec2 uPointer;
uniform float uReduced;
varying vec3 vLocal;
varying vec3 vNormal;
varying vec3 vBary;
varying vec3 vView;
// 3D simplex noise. Only color/masks change; geometry remains shape-locked.
vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
float snoise(vec3 v){
 const vec2 C=vec2(1.0/6.0,1.0/3.0);
 const vec4 D=vec4(0.0,0.5,1.0,2.0);
 vec3 i=floor(v+dot(v,C.yyy));
 vec3 x0=v-i+dot(i,C.xxx);
 vec3 g=step(x0.yzx,x0.xyz);
 vec3 l=1.0-g;
 vec3 i1=min(g.xyz,l.zxy);
 vec3 i2=max(g.xyz,l.zxy);
 vec3 x1=x0-i1+C.xxx;
 vec3 x2=x0-i2+C.yyy;
 vec3 x3=x0-D.yyy;
 i=mod289(i);
 vec4 p=permute(permute(permute(i.z+vec4(0.0,i1.z,i2.z,1.0))+i.y+vec4(0.0,i1.y,i2.y,1.0))+i.x+vec4(0.0,i1.x,i2.x,1.0));
 float n_=0.142857142857;
 vec3 ns=n_*D.wyz-D.xzx;
 vec4 j=p-49.0*floor(p*ns.z*ns.z);
 vec4 x_=floor(j*ns.z);
 vec4 y_=floor(j-7.0*x_);
 vec4 x=x_*ns.x+ns.yyyy;
 vec4 y=y_*ns.x+ns.yyyy;
 vec4 h=1.0-abs(x)-abs(y);
 vec4 b0=vec4(x.xy,y.xy);
 vec4 b1=vec4(x.zw,y.zw);
 vec4 s0=floor(b0)*2.0+1.0;
 vec4 s1=floor(b1)*2.0+1.0;
 vec4 sh=-step(h,vec4(0.0));
 vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
 vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
 vec3 p0=vec3(a0.xy,h.x);
 vec3 p1=vec3(a0.zw,h.y);
 vec3 p2=vec3(a1.xy,h.z);
 vec3 p3=vec3(a1.zw,h.w);
 vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
 p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
 vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
 m=m*m;
 return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
}
float lineGrid(vec2 uv,float density){vec2 g=abs(fract(uv*density)-0.5);return smoothstep(0.475,0.5,max(g.x,g.y));}
float hash(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}
void main(){
 float t=uReduced>0.5?1.8:uTime;
 vec3 n=normalize(vNormal);
 float flow=snoise(vLocal*1.65+vec3(t*.20,-t*.26,t*.16));
 float detail=snoise(vLocal*4.4+vec3(-t*.43,t*.24,t*.31));
 float mask=smoothstep(-.34,.34,flow*.78+detail*.26);
 float facet=.54+.46*abs(dot(n,normalize(vec3(-.35,.7,1.0))));
 float fresnel=pow(1.0-max(dot(n,normalize(vView)),0.0),2.2);
 vec3 mineral=mix(vec3(.28,.19,.49),vec3(.79,.67,.95),facet);
 mineral+=vec3(.25,.32,.45)*fresnel;
 mineral=mix(mineral,vec3(.95,.53,.82),smoothstep(.15,.85,detail)*.25);
 vec2 uv=vec2(vLocal.x+vLocal.z*.38,vLocal.y-vLocal.z*.22);
 float grid=lineGrid(uv,12.0);
 float fine=lineGrid(uv+vec2(.032,0.0),32.0)*.22;
 vec2 cell=floor(uv*12.0);
 float code=step(.80,hash(vec3(cell,floor(t*2.5))))*step(.15,fract(uv.y*12.0));
 float barcode=step(.85,hash(vec3(floor(uv.x*47.0),floor(uv.y*17.0),floor(t*2.0))));
 vec3 data=vec3(.07,.12,.29)+grid*vec3(.35,.84,.92)+fine*vec3(.56,.28,.76)+code*vec3(.96,.28,.70)+barcode*vec3(.35,.59,.9);
 float seam=1.0-smoothstep(.01,.075,min(min(vBary.x,vBary.y),vBary.z));
 vec3 color=mix(mineral,data,mask);
 color+=seam*mix(vec3(.34,.23,.55),vec3(.23,.89,.95),mask)*.42;
 float rupture=1.0-smoothstep(.0,.09,abs(flow*.78+detail*.26));
 color+=rupture*vec3(.35,.17,.42);
 // Solid alpha guarantees a complete silhouette, even in the mineral phase.
 gl_FragColor=vec4(color,1.0);
}`;
const material=new THREE.ShaderMaterial({uniforms,vertexShader,fragmentShader,side:THREE.DoubleSide,transparent:false});
const crystal=new THREE.Mesh(geometry,material);
scene.add(crystal);

const composer=new EffectComposer(renderer);
composer.addPass(new RenderPass(scene,camera));
const bloom=new UnrealBloomPass(new THREE.Vector2(1,1),.55,.65,.72);
composer.addPass(bloom);
const rgb=new ShaderPass(RGBShiftShader);
rgb.uniforms.amount.value=.0012;
composer.addPass(rgb);
const ScanlinesShader={uniforms:{tDiffuse:{value:null},uTime:{value:0},uResolution:{value:new THREE.Vector2(1,1)}},vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,fragmentShader:`uniform sampler2D tDiffuse;uniform float uTime;uniform vec2 uResolution;varying vec2 vUv;void main(){vec4 c=texture2D(tDiffuse,vUv);float scan=0.94+0.06*sin(vUv.y*uResolution.y*1.2);float jitter=step(.996,fract(sin(floor(vUv.y*90.0)+floor(uTime*3.0))*43758.5453));c.rgb*=scan;c.rgb+=jitter*.026;gl_FragColor=c;}`};
const scanlines=new ShaderPass(ScanlinesShader);
composer.addPass(scanlines);
let pointer={x:0,y:0},last=0;
function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);composer.setSize(w,h);scanlines.uniforms.uResolution.value.set(w*renderer.getPixelRatio(),h*renderer.getPixelRatio())}
new ResizeObserver(resize).observe(host);resize();
host.addEventListener('pointermove',e=>{let r=host.getBoundingClientRect();pointer.x=(e.clientX-r.left)/r.width-.5;pointer.y=(e.clientY-r.top)/r.height-.5});
const clock=new THREE.Clock();
function frame(){let elapsed=clock.getElapsedTime(),t=reduced?0:elapsed;uniforms.uTime.value=t;uniforms.uPointer.value.set(pointer.x,pointer.y);crystal.rotation.y=.5+(reduced?0:t*.08)+pointer.x*.18;crystal.rotation.x=.1+pointer.y*.15;rgb.uniforms.amount.value=reduced?.0004:.0012+Math.pow(Math.max(0,Math.sin(t*2.7)),26)*.006;scanlines.uniforms.uTime.value=t;composer.render();if(!reduced)requestAnimationFrame(frame)}frame();
const samples=[['Ta','1.26','SiO₂ · 72.31'],['La','18.20','Zr · 212.0'],['Nb','12.04','Y · 24.10'],['Ti','0.23','La/Zr · 0.086']];
let sampleIndex=0;
function updateReadout(){sampleIndex=(sampleIndex+1)%samples.length;const s=samples[sampleIndex];document.getElementById('ppm').textContent=s[1];document.getElementById('fragment').textContent=s[2];document.getElementById('hexdata').textContent='0x'+Math.floor(Math.random()*65535).toString(16).toUpperCase().padStart(4,'0')+'  '+Math.floor(Math.random()*256).toString(2).padStart(8,'0');document.querySelector('.tech-a').firstChild.textContent='[ '+s[0]+' / MINERAL STRUCTURE ]'}
if(!reduced)setInterval(updateReadout,2200);
