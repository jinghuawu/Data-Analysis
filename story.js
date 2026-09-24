// Five scenes are blended by scroll position; two contain small photographic apertures.
(() => {
  const home = document.getElementById('home');
  if (!home) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const svg = (body, defs = '') => `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 760 760" fill="none" aria-hidden="true"><defs>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="9"/></filter>
    <linearGradient id="pink" x1=".1" y1="0" x2=".9" y2="1" objectBoundingBox="true"><stop stop-color="#f6cce9"/><stop offset=".48" stop-color="#a98bbf"/><stop offset="1" stop-color="#443c6b"/></linearGradient>
    <linearGradient id="ice" x1="0" y1="0" x2="1" y2="1" objectBoundingBox="true"><stop stop-color="#d5fcf3"/><stop offset=".46" stop-color="#74b2c5"/><stop offset="1" stop-color="#4e5a91"/></linearGradient>
    <radialGradient id="orb"><stop stop-color="#fff"/><stop offset=".19" stop-color="#e8c1e5"/><stop offset=".55" stop-color="#826999"/><stop offset="1" stop-color="#302943"/></radialGradient>
    ${defs}</defs>${body}</svg>`;

  const rock = svg(`
    <circle cx="391" cy="384" r="274" stroke="#e8badb" stroke-opacity=".19" stroke-dasharray="3 14"/>
    <path d="M190 430 235 286 338 214 463 179 582 249 626 374 571 522 433 594 285 563 209 501Z" fill="#332f46" stroke="#f4d6e9" stroke-width="3"/>
    <g clip-path="url(#rockClip)">
      <path d="M138 327Q287 288 381 332T670 310V198H145Z" fill="#837184"/>
      <path d="M141 389Q265 353 367 390T672 364V307Q546 356 402 329T141 329Z" fill="#a18a91"/>
      <path d="M138 444Q269 407 372 438T670 415V364Q524 412 390 386T138 389Z" fill="#655968"/>
      <path d="M145 512Q284 471 394 501T670 475V413Q528 454 385 434T145 445Z" fill="#8b7581"/>
      <path d="M133 577Q272 533 388 560T666 534V472Q514 528 382 496T133 514Z" fill="#594c64"/>
      <path d="M165 342Q307 317 383 349T636 328M169 406Q295 374 393 411T632 389M155 464Q291 435 392 465T628 445M158 527Q295 491 404 527T624 505" stroke="#e5b8cf" stroke-opacity=".42" stroke-width="2"/>
      <path d="M263 229 366 345 338 459 419 590M490 190 450 313 514 421 475 581M578 250 499 339 570 521" stroke="#2d283b" stroke-opacity=".75" stroke-width="9"/>
      <path d="M263 229 366 345 338 459 419 590M490 190 450 313 514 421 475 581M578 250 499 339 570 521" stroke="#e7c7d7" stroke-opacity=".5" stroke-width="1.5"/>
      <path d="m301 315 32-25 17 42-25 29Zm176 119 34-24 27 30-42 30Zm-69 74 31-16 23 22-40 32Z" fill="#d6bad3" fill-opacity=".78" stroke="#fff0f8" stroke-opacity=".54"/>
      <g clip-path="url(#rockPhotoClip)">
        <image class="photo-cycle-a" x="225" y="265" width="370" height="295" href="assets/rock-pyroxenite-detail.jpg" xlink:href="assets/rock-pyroxenite-detail.jpg" preserveAspectRatio="xMidYMid slice"/>
        <image class="photo-cycle-b" x="225" y="265" width="370" height="295" href="assets/rock-basalt-detail.jpg" xlink:href="assets/rock-basalt-detail.jpg" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <path d="M250 351 285 291 382 278 460 300 564 321 592 389 559 482 484 529 371 501 284 515 231 440Z" fill="none" stroke="#fff1f7" stroke-opacity=".9" stroke-width="2.5"/>
      <path d="m250 351 35-60 97-13m102 251 75-47 33-93" fill="none" stroke="#ffbce7" stroke-opacity=".7" stroke-width="6"/>
    </g>
    <path d="M190 430 235 286 338 214 463 179 582 249 626 374 571 522 433 594 285 563 209 501Z" stroke="#fff0f8" stroke-opacity=".72" stroke-width="2"/>
    <path d="m220 228-27 19 9 35 22-13Zm411 272 20 14-13 22-30-7Zm-333 96-22 13 9 27 38-9Z" fill="#c1a2ba" stroke="#f4d9e8" stroke-opacity=".6"/>
    <g stroke="#f3d5ea" stroke-opacity=".5"><path d="M103 355h55m-27-27v54M612 210h46m-23-23v46M611 577h56m-28-28v56"/></g>
    <text x="116" y="187" fill="#cdb4cb" font-family="monospace" font-size="11" letter-spacing="4">ROCK / 01</text>
    <text x="548" y="635" fill="#cdb4cb" font-family="monospace" font-size="11" letter-spacing="3">CORE →</text>
  `, `<clipPath id="rockClip"><path d="M190 430 235 286 338 214 463 179 582 249 626 374 571 522 433 594 285 563 209 501Z"/></clipPath><clipPath id="rockPhotoClip"><path d="M250 351 285 291 382 278 460 300 564 321 592 389 559 482 484 529 371 501 284 515 231 440Z"/></clipPath>`);

  const mineral = svg(`
    <circle cx="382" cy="376" r="267" stroke="#e9c8ef" stroke-opacity=".2" stroke-dasharray="2 14"/>
    <circle cx="382" cy="376" r="204" stroke="#d8b5e2" stroke-opacity=".11"/>
    <path d="m192 539 88-79 101 27 102-51 109 89-59 52-119 35-137-16Z" fill="#39334e" stroke="#c9b1cc" stroke-width="2"/>
    <g stroke="#fbe6fc" stroke-opacity=".75" stroke-width="2" stroke-linejoin="round">
      <path d="m199 536 8-142 72-72 65 75-11 165-56 38Z" fill="#795b88"/><path d="m207 394 72-72 65 75-66 53Z" fill="#c89bc2"/><path d="m207 394 71 56-1 150-78-64Z" fill="#624d78"/><path d="m278 450 66-53-11 165-56 38Z" fill="#a689ac"/>
      <path d="m316 509-20-247 85-133 74 142-3 278-69 49Z" fill="#92789f"/><path d="m296 262 85-133 74 142-76 40Z" fill="#e9c2e5"/><path d="m296 262 83 49 4 287-67-89Z" fill="#604f82"/><path d="m379 311 76-40-3 278-69 49Z" fill="url(#pink)"/>
      <path d="m430 527 11-180 80-95 69 123-3 164-83 57Z" fill="#755b8f"/><path d="m441 347 80-95 69 123-84 29Z" fill="#c8e2e1"/><path d="m441 347 65 57-2 192-74-69Z" fill="#566684"/><path d="m506 404 84-29-3 164-83 57Z" fill="url(#ice)"/>
      <path d="m370 581 43-153 44-30 28 71-16 110-60 31Z" fill="#a276aa"/><path d="m413 428 44-30 28 71-51 16Z" fill="#edc7ed"/><path d="m434 485 51-16-16 110-60 31Z" fill="#675c91"/>
    </g>
    <path d="m381 129-2 182m76-40-72 327M521 252l-15 152m-227-82-1 128" stroke="#fff" stroke-opacity=".65" stroke-width="2"/>
    <g fill="#ffebf9"><circle cx="201" cy="261" r="2"/><circle cx="596" cy="221" r="2"/><circle cx="623" cy="519" r="2"/><circle cx="155" cy="496" r="2"/></g>
    <g stroke="#c9aad9" stroke-opacity=".53"><path d="m153 270 31 16m-15-31-1 30m452 22 29-19m-13-13-4 27"/></g>
    <text x="116" y="187" fill="#d7bddd" font-family="monospace" font-size="11" letter-spacing="4">CRYSTAL / 03</text>
    <text x="553" y="641" fill="#d7bddd" font-family="monospace" font-size="11" letter-spacing="3">FACET</text>
  `);

  const hash = n => { let x = Math.sin(n * 127.1 + 78.233) * 43758.5453; return x - Math.floor(x); };
  const palette = ['#75649f','#cf9ebc','#86bdc7','#d3b8e0','#e7b79b','#5a9aaf','#aaa1cb','#e5a4ca','#b4ccd3','#efd8b3'];
  let grains = '';
  for (let i = 0; i < 126; i++) {
    const col=i%12,row=Math.floor(i/12),cx=110+col*51+(hash(i*13)-.5)*34,cy=112+row*53+(hash(i*17)-.5)*30;
    const w=21+hash(i*29)*34,h=29+hash(i*31)*51,angle=(hash(i*37)-.5)*120;
    const color=palette[Math.floor(hash(i*71)*palette.length)];
    grains += `<g transform="translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${angle.toFixed(1)})"><path d="M${(-w*.45).toFixed(1)} ${(-h*.64).toFixed(1)} ${(-w*.16).toFixed(1)} ${(-h*.97).toFixed(1)} ${(+w*.48).toFixed(1)} ${(-h*.7).toFixed(1)} ${(+w*.62).toFixed(1)} ${(h*.37).toFixed(1)} ${(+w*.12).toFixed(1)} ${(h*.94).toFixed(1)} ${(-w*.55).toFixed(1)} ${(h*.48).toFixed(1)}Z" fill="${color}" stroke="#1b2b42" stroke-width="3" stroke-linejoin="round"/><path d="M${(-w*.22).toFixed(1)} ${(-h*.72).toFixed(1)} ${(-w*.05).toFixed(1)} ${(h*.7).toFixed(1)}m${(w*.24).toFixed(1)} ${(-h*1.17).toFixed(1)} ${(w*.17).toFixed(1)} ${(h*.79).toFixed(1)}" stroke="#fff4f2" stroke-opacity=".53" stroke-width="1.5"/></g>`;
  }
  const microscope = svg(`
    <circle cx="380" cy="380" r="282" fill="#101e2d" stroke="#7da1b3" stroke-opacity=".55" stroke-width="3"/>
    <circle cx="380" cy="380" r="261" stroke="#c5ddeb" stroke-opacity=".35" stroke-width="12"/>
    <circle cx="380" cy="380" r="238" fill="#23364c" stroke="#d4e5f0" stroke-width="2"/>
    <g clip-path="url(#lensClip)">${grains}
      <g clip-path="url(#microPhotoClip)">
        <image class="photo-cycle-a" x="240" y="242" width="390" height="330" href="assets/thin-section-local-boy-detail.jpg" xlink:href="assets/thin-section-local-boy-detail.jpg" preserveAspectRatio="xMidYMid slice"/>
        <image class="photo-cycle-b" x="240" y="242" width="390" height="330" href="assets/thin-section-mesaba-detail.jpg" xlink:href="assets/thin-section-mesaba-detail.jpg" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <path d="M263 286 350 240 437 258 535 240 602 302 603 427 543 519 444 554 325 522 255 433Z" stroke="#e9f8fa" stroke-opacity=".9" stroke-width="2.5"/>
      <path d="m263 286 87-46 87 18m166 169-60 92-99 35" stroke="#ffb9e5" stroke-opacity=".7" stroke-width="6"/>
      <rect x="100" y="100" width="560" height="560" fill="url(#lensShade)"/>
    </g>
    <circle cx="380" cy="380" r="238" stroke="#d7f5f5" stroke-opacity=".72" stroke-width="3"/>
    <circle cx="380" cy="380" r="41" stroke="#effaff" stroke-opacity=".65" stroke-dasharray="4 8"/>
    <path d="M380 96v38m0 492v38M96 380h38m492 0h38M380 332v96m-48-48h96" stroke="#d3f5f5" stroke-opacity=".7" stroke-width="2"/>
    <path d="M132 595h90m-90 0v-12m30 12v-8m30 8v-8m30 8v-12" stroke="#e7f4f6" stroke-width="3"/>
    <text x="137" y="577" fill="#e7f4f6" font-family="monospace" font-size="11" letter-spacing="2">CROSS POLARIZED</text>
    <text x="556" y="173" fill="#e7f4f6" font-family="monospace" font-size="11">XPL / 02</text>
  `, `<clipPath id="lensClip"><circle cx="380" cy="380" r="237"/></clipPath><clipPath id="microPhotoClip"><path d="M263 286 350 240 437 258 535 240 602 302 603 427 543 519 444 554 325 522 255 433Z"/></clipPath><radialGradient id="lensShade"><stop offset=".35" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#061a2b" stop-opacity=".63"/></radialGradient>`);

  const project = (x,y,z) => [380 + x*88 + z*42, 380 + y*88 - z*42];
  let bonds = '', atoms = '';
  for (let z = -1; z <= 1; z++) for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) {
    const [cx,cy] = project(x,y,z);
    if (x < 1) { const [nx,ny]=project(x+1,y,z); bonds += `<path d="M${cx} ${cy} ${nx} ${ny}"/>`; }
    if (y < 1) { const [nx,ny]=project(x,y+1,z); bonds += `<path d="M${cx} ${cy} ${nx} ${ny}"/>`; }
    if (z < 1) { const [nx,ny]=project(x,y,z+1); bonds += `<path d="M${cx} ${cy} ${nx} ${ny}"/>`; }
    const central = x===0 && y===0 && z===0, r=central?26:(x+y+z)%2===0?12:9;
    atoms += `<circle cx="${cx}" cy="${cy}" r="${r+9}" fill="${central?'#f0c1ec':'#83d2d5'}" opacity=".12" filter="url(#glow)"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${central?'url(#orb)':(x+y+z)%2===0?'#b5a5db':'#88c6d0'}" stroke="#f3f3ff" stroke-opacity=".72"/><circle cx="${cx-r*.34}" cy="${cy-r*.32}" r="${r*.22}" fill="#fff" opacity=".75"/>`;
  }
  const atom = svg(`
    <circle cx="380" cy="380" r="282" stroke="#abc9e8" stroke-opacity=".18" stroke-dasharray="3 14"/>
    <circle cx="380" cy="380" r="210" stroke="#9fadd7" stroke-opacity=".15"/>
    <g stroke="#a9c5e1" stroke-opacity=".33" stroke-width="2">${bonds}</g>
    <g>${atoms}</g>
    <ellipse class="orbit-a" cx="380" cy="380" rx="243" ry="81" transform="rotate(-29 380 380)" stroke="#e3d1f4" stroke-opacity=".55" stroke-width="2"/>
    <ellipse class="orbit-b" cx="380" cy="380" rx="244" ry="76" transform="rotate(62 380 380)" stroke="#9ee0e5" stroke-opacity=".5" stroke-width="2"/>
    <circle cx="176" cy="470" r="5" fill="#f6d0f2"/><circle cx="548" cy="495" r="5" fill="#a5edf1"/>
    <path d="M136 172h81m-81 0v22M545 586h74m0-22v22" stroke="#bdd3e5" stroke-opacity=".6"/>
    <text x="136" y="157" fill="#d7d5eb" font-family="monospace" font-size="11" letter-spacing="3">LATTICE / 04</text>
    <text x="548" y="609" fill="#d7d5eb" font-family="monospace" font-size="11" letter-spacing="2">Si — O</text>
  `);

  const nodes = Array.from({length: 72}, (_, i) => {
    const a = i * 2.399963, radius = Math.sqrt((i+.5)/72);
    return {x:380 + Math.cos(a)*272*radius, y:380 + Math.sin(a)*230*radius, major:i%13===0};
  });
  let links='', dots='';
  nodes.forEach((p,i) => {
    nodes.slice(i+1).forEach((q,j) => {
      const d = Math.hypot(p.x-q.x,p.y-q.y);
      if (d < 112 && (i+j)%3 !== 0) links += `<path d="M${p.x.toFixed(1)} ${p.y.toFixed(1)} ${q.x.toFixed(1)} ${q.y.toFixed(1)}" stroke="${(i+j)%4===0?'#efb8e5':'#98dce3'}" stroke-opacity="${(.12+(1-d/112)*.4).toFixed(2)}" stroke-width="${p.major||q.major?1.5:.8}"/>`;
    });
    dots += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${p.major?8:2.5}" fill="${p.major?'#f3c4e9':'#a9e3e2'}" opacity="${p.major?'.95':'.72'}"/>`;
    if(p.major) dots += `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="19" stroke="#f2bfe9" stroke-opacity=".36"/>`;
  });
  const network = svg(`
    <circle cx="380" cy="380" r="278" stroke="#b4b6e7" stroke-opacity=".16" stroke-dasharray="2 12"/>
    <path d="M102 380h556M380 103v554" stroke="#c4c2e9" stroke-opacity=".13"/>
    <g>${links}</g><g>${dots}</g>
    <circle cx="380" cy="380" r="74" stroke="#e3c5e9" stroke-opacity=".33" stroke-dasharray="3 8"/>
    <path d="M497 190h117v-27M162 542h89v31" stroke="#d0c4e6" stroke-opacity=".55"/>
    <text x="498" y="180" fill="#ddd1e9" font-family="monospace" font-size="11" letter-spacing="3">DATA FIELD / 05</text>
    <text x="162" y="598" fill="#ddd1e9" font-family="monospace" font-size="11" letter-spacing="3">RELATION →</text>
  `);

  const arts = [rock, microscope, mineral, atom, network];
  const labels = ['岩石 / ROCK', '显微镜下 / THIN SECTION', '矿物 / MINERAL', '原子 / ATOM', '抽象点线 / DATA FIELD'];
  const frame = home.querySelector('.story-art-frame');
  arts.forEach((art,i) => {
    const layer = document.createElement('div');
    layer.className='story-art';
    layer.setAttribute('aria-hidden','true');
    layer.dataset.art=i;
    layer.innerHTML=art;
    frame.append(layer);
  });

  const chapters = [...home.querySelectorAll('.story-chapter')];
  const layers = [...home.querySelectorAll('.story-art')];
  const backgrounds = [...home.querySelectorAll('.story-backdrop')];
  const buttons = [...home.querySelectorAll('.chapter-nav button')];
  const readout = home.querySelector('.story-readout strong');
  const current = home.querySelector('.story-corner span');
  let scheduled=false, active=-1, burst=0;
  const clamp = (v,lo,hi) => Math.min(hi,Math.max(lo,v));
  function update() {
    scheduled=false;
    const top=document.querySelector('.top');
    if(!home.classList.contains('active')) { top.style.setProperty('--story-bar','0%'); return; }
    const header=top.getBoundingClientRect().height;
    home.style.setProperty('--header-height',`${header}px`);
    const screen=chapters[0].getBoundingClientRect().height || 1;
    const progress=clamp((header-home.getBoundingClientRect().top)/screen,0,4);
    const nearest=Math.round(progress);
    const fraction=progress-Math.floor(progress);
    const transition=progress>=4?0:Math.max(0,1-Math.abs(fraction-.5)*3.1);
    if(nearest!==active){ active=nearest; burst=reduced?0:performance.now()+280; if(!reduced)setTimeout(queue,300); }
    const glitch=reduced?0:Math.max(transition*.9,performance.now() < burst ? .5 : 0);
    home.style.setProperty('--glitch',glitch.toFixed(2));
    home.classList.toggle('is-glitching',glitch>.3);
    top.style.setProperty('--story-bar',`${((progress/4)*100).toFixed(1)}%`);
    layers.forEach((layer,i) => {
      const opacity=clamp(1-Math.abs(progress-i),0,1);
      layer.style.opacity=opacity.toFixed(3);
      layer.style.transform=`translate3d(${((i-progress)*24).toFixed(1)}px,${((i-progress)*18).toFixed(1)}px,0) scale(${(1-Math.abs(progress-i)*.065).toFixed(3)})`;
      layer.classList.toggle('is-current',i===nearest);
      backgrounds[i].style.opacity=opacity.toFixed(3);
    });
    buttons.forEach((b,i) => { b.classList.toggle('active',i===nearest); if(i===nearest)b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current'); });
    readout.textContent=labels[nearest];
    current.textContent=`${String(nearest+1).padStart(2,'0')} / 05 · SCROLL TO DESCEND`;
  }
  const queue=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}};
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue);
  buttons.forEach((button,i)=>button.addEventListener('click',()=>chapters[i].scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'})));
  home.querySelectorAll('[data-next]').forEach(button=>button.addEventListener('click',()=>chapters[Number(button.dataset.next)].scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'})));
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(queue)));
  update();
})();
