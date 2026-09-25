// Six scenes are blended by scroll position; two contain small photographic apertures.
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

  // Each orbit rotates around the star while its textured planet turns separately.
  let starSeed = 41;
  const starRandom = () => ((starSeed = (starSeed * 1664525 + 1013904223) >>> 0) / 4294967296);
  let stars = '';
  for (let i = 0; i < 78; i++) {
    const x = 40 + starRandom() * 680;
    const y = 40 + starRandom() * 680;
    const radius = i % 11 === 0 ? 2.2 : i % 3 === 0 ? 1.2 : .65;
    stars += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${radius}" fill="${i % 5 === 0 ? '#f6b9ed' : '#c7eff5'}" opacity="${(.23 + starRandom() * .55).toFixed(2)}"/>`;
  }
  const orbitingPlanet = (id, distance, radius, gradient, angle, orbitTime, spinTime, markings) => `
    <g class="planet-revolution" transform="rotate(${angle} 380 380)" style="--orbit-period:${orbitTime}s;--orbit-phase:${(-angle / 360 * orbitTime).toFixed(2)}s">
      <g transform="translate(${380 + distance} 380)">
        <circle r="${radius + 8}" fill="#a6e9f7" opacity=".27" filter="url(#glow)"/>
        <g class="planet-spin" style="--spin-period:${spinTime}s">
          <circle r="${radius}" fill="url(#planet-${gradient})"/>
          <g clip-path="url(#planet-clip-${id})">${markings}</g>
        </g>
        <circle r="${radius}" stroke="#e5ecff" stroke-opacity=".7" stroke-width="1.3"/>
        <path d="M${-radius - 9} 0h-10m${radius * 2 + 38} 0h-10" stroke="#c4ecf5" stroke-opacity=".6"/>
      </g>
    </g>`;
  const planetDefs = `
    <radialGradient id="solar" cx=".32" cy=".28" r=".8"><stop stop-color="#fffdf5"/><stop offset=".24" stop-color="#ffe7ee"/><stop offset=".65" stop-color="#eea9d9"/><stop offset="1" stop-color="#755697"/></radialGradient>
    <radialGradient id="planet-teal" cx=".29" cy=".22" r=".9"><stop stop-color="#e1faf6"/><stop offset=".47" stop-color="#6ec0c7"/><stop offset="1" stop-color="#294865"/></radialGradient>
    <radialGradient id="planet-rose" cx=".29" cy=".22" r=".9"><stop stop-color="#ffe5e0"/><stop offset=".48" stop-color="#d797ad"/><stop offset="1" stop-color="#684465"/></radialGradient>
    <radialGradient id="planet-blue" cx=".29" cy=".22" r=".9"><stop stop-color="#e8faff"/><stop offset=".52" stop-color="#8daace"/><stop offset="1" stop-color="#405183"/></radialGradient>
    <radialGradient id="planet-amber" cx=".29" cy=".22" r=".9"><stop stop-color="#fff4db"/><stop offset=".52" stop-color="#ddb892"/><stop offset="1" stop-color="#8d6381"/></radialGradient>
    <clipPath id="planet-clip-1"><circle r="22"/></clipPath><clipPath id="planet-clip-2"><circle r="29"/></clipPath>
    <clipPath id="planet-clip-3"><circle r="25"/></clipPath><clipPath id="planet-clip-4"><circle r="18"/></clipPath>`;
  const planet = svg(`
    <circle cx="380" cy="380" r="326" stroke="#d9bcef" stroke-opacity=".18" stroke-dasharray="2 13"/>
    <g>${stars}</g>
    <path d="M380 45v47m0 578v45M45 380h46m579 0h45" stroke="#d2d7f2" stroke-opacity=".28"/>
    <circle cx="380" cy="380" r="310" stroke="#b8c6e8" stroke-opacity=".34" stroke-width="1.5" stroke-dasharray="3 8"/>
    <circle cx="380" cy="380" r="247" stroke="#cfaedf" stroke-opacity=".38" stroke-width="1.5"/>
    <circle cx="380" cy="380" r="182" stroke="#9ed7e4" stroke-opacity=".43" stroke-width="1.5" stroke-dasharray="5 10"/>
    <circle cx="380" cy="380" r="118" stroke="#e7badc" stroke-opacity=".52" stroke-width="1.5"/>
    <circle cx="380" cy="380" r="87" stroke="#eecdec" stroke-opacity=".22" stroke-dasharray="2 7"/>
    <circle class="solar-halo" cx="380" cy="380" r="64" fill="#f5bbec" opacity=".42" filter="url(#glow)"/>
    <circle cx="380" cy="380" r="57" fill="url(#solar)" stroke="#fff0f7" stroke-width="2"/>
    <circle cx="380" cy="380" r="70" stroke="#f8d4ef" stroke-opacity=".48" stroke-width="1.5"/>
    <path d="M380 289v15m0 152v15M289 380h15m152 0h15" stroke="#fff3f8" stroke-opacity=".76"/>
    ${orbitingPlanet(1,118,22,'teal',-68,18,5,`<path d="M-30-9Q-7-20 27-7M-31 5Q-10-3 31 4M-27 18Q0 10 25 18" stroke="#e0fff3" stroke-opacity=".64" stroke-width="5"/><path d="M-2-23Q12-4 1 24" stroke="#245780" stroke-opacity=".6" stroke-width="6"/>`)}
    ${orbitingPlanet(2,182,29,'rose',136,27,7,`<path d="M-34-16Q-1-27 31-16M-37-4Q-1-11 33-2M-35 10Q-5 3 32 12M-30 23Q5 11 30 24" stroke="#ffded1" stroke-opacity=".62" stroke-width="6"/><circle cx="-15" cy="-5" r="6" stroke="#663c64" stroke-opacity=".65"/>`)}
    ${orbitingPlanet(3,247,25,'blue',-160,35,6,`<path d="M-29-16Q-4-8 29-19M-28-2Q5 7 31-3M-29 13Q-6 4 31 14" stroke="#c2eaf5" stroke-opacity=".58" stroke-width="6"/><path d="M-11-27Q-4-4 7 27" stroke="#58658b" stroke-opacity=".68" stroke-width="7"/>`)}
    ${orbitingPlanet(4,310,18,'amber',48,43,4,`<path d="M-22-8Q-3-14 22-7M-20 3Q1-3 21 6M-22 14Q1 9 20 15" stroke="#fff2ce" stroke-opacity=".63" stroke-width="4"/><circle cx="6" cy="-8" r="4" fill="#a2768a" opacity=".72"/>`)}
    <path d="M141 166h82l24 24m266 402 28 62h83" stroke="#e2c2ee" stroke-opacity=".58"/>
    <circle cx="141" cy="166" r="3" fill="#f4d2f5"/><circle cx="624" cy="654" r="3" fill="#b9eff4"/>
    <text x="142" y="151" fill="#e8d0ed" font-family="monospace" font-size="10" letter-spacing="3">ORBITAL / 01</text>
    <text x="526" y="679" fill="#bde6ed" font-family="monospace" font-size="10" letter-spacing="2">ROTATION ACTIVE</text>
  `, planetDefs);

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
        <image class="photo-cycle-a" x="330" y="159" width="315" height="395" href="assets/rock-pyroxenite-detail.jpg" xlink:href="assets/rock-pyroxenite-detail.jpg" preserveAspectRatio="xMidYMid slice"/>
        <image class="photo-cycle-b" x="330" y="159" width="315" height="395" href="assets/rock-basalt-detail.jpg" xlink:href="assets/rock-basalt-detail.jpg" preserveAspectRatio="xMidYMid slice"/>
      </g>
      <path d="M348 389 399 307 463 179 582 249 626 374 571 522 471 470 411 428Z" fill="none" stroke="#fff1f7" stroke-opacity=".9" stroke-width="2.5"/>
      <path d="m348 389 51-82 64-128m108 343-100-52-60-42" fill="none" stroke="#ffbce7" stroke-opacity=".7" stroke-width="5"/>
    </g>
    <path d="M190 430 235 286 338 214 463 179 582 249 626 374 571 522 433 594 285 563 209 501Z" stroke="#fff0f8" stroke-opacity=".72" stroke-width="2"/>
    <g class="photo-scan photo-scan-a" fill="none">
      <path d="M587 263 654 202H726" stroke="#8de8ec" stroke-width="1.5"/><circle cx="587" cy="263" r="3" fill="#b7f8f6"/>
      <text x="726" y="153" text-anchor="end" fill="#e9fcff" font-family="monospace" font-size="12" letter-spacing="2"></text>
      <text x="726" y="173" text-anchor="end" fill="#aee0eb" font-family="monospace" font-size="10" letter-spacing=".6"></text>
      <text x="726" y="191" text-anchor="end" fill="#aee0eb" font-family="monospace" font-size="10" letter-spacing=".6"></text>
    </g>
    <g class="photo-scan photo-scan-b" fill="none">
      <path d="M587 263 654 202H726" stroke="#ffc1e8" stroke-width="1.5"/><circle cx="587" cy="263" r="3" fill="#ffe5f2"/>
      <text x="726" y="153" text-anchor="end" fill="#fff0f9" font-family="monospace" font-size="12" letter-spacing="2"></text>
      <text x="726" y="173" text-anchor="end" fill="#ecc6e6" font-family="monospace" font-size="10" letter-spacing=".6"></text>
      <text x="726" y="191" text-anchor="end" fill="#ecc6e6" font-family="monospace" font-size="10" letter-spacing=".6"></text>
    </g>
    <path d="m220 228-27 19 9 35 22-13Zm411 272 20 14-13 22-30-7Zm-333 96-22 13 9 27 38-9Z" fill="#c1a2ba" stroke="#f4d9e8" stroke-opacity=".6"/>
    <g stroke="#f3d5ea" stroke-opacity=".5"><path d="M103 355h55m-27-27v54M612 210h46m-23-23v46M611 577h56m-28-28v56"/></g>
    <text x="116" y="187" fill="#cdb4cb" font-family="monospace" font-size="11" letter-spacing="4">ROCK / 01</text>
    <text x="548" y="635" fill="#cdb4cb" font-family="monospace" font-size="11" letter-spacing="3">CORE →</text>
  `, `<clipPath id="rockClip"><path d="M190 430 235 286 338 214 463 179 582 249 626 374 571 522 433 594 285 563 209 501Z"/></clipPath><clipPath id="rockPhotoClip"><path d="M348 389 399 307 463 179 582 249 626 374 571 522 471 470 411 428Z"/></clipPath>`);

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
  const microNumbers = [1,2,3,4,5,6,8,9,10,11,12];
  const microImages = microNumbers.map((number,index) => {
    const source = `assets/micro-${String(number).padStart(2,'0')}.jpg`;
    return `<image class="micro-photo${index === 0 ? ' is-visible' : ''}" data-photo-number="${number}" x="130" y="140" width="270" height="315" href="${source}" xlink:href="${source}" preserveAspectRatio="xMidYMid slice"/>`;
  }).join('');
  const microscope = svg(`
    <circle cx="380" cy="380" r="282" fill="#101e2d" stroke="#7da1b3" stroke-opacity=".55" stroke-width="3"/>
    <circle cx="380" cy="380" r="261" stroke="#c5ddeb" stroke-opacity=".35" stroke-width="12"/>
    <circle cx="380" cy="380" r="238" fill="#23364c" stroke="#d4e5f0" stroke-width="2"/>
    <g clip-path="url(#lensClip)">${grains}
      <g clip-path="url(#microPhotoClip)">
        ${microImages}
      </g>
      <path d="M391 377 349 286 315 167 273 169 222 200 179 249 151 310 143 380 163 433 272 419 333 394Z" stroke="#e9f8fa" stroke-opacity=".9" stroke-width="2.5"/>
      <path d="M391 377 349 286 315 167M163 433 272 419 333 394" stroke="#ffb9e5" stroke-opacity=".7" stroke-width="5"/>
      <rect x="100" y="100" width="560" height="560" fill="url(#lensShade)"/>
    </g>
    <circle cx="380" cy="380" r="238" stroke="#d7f5f5" stroke-opacity=".72" stroke-width="3"/>
    <g class="photo-scan micro-scan" fill="none">
      <path d="M185 235 106 180H32" stroke="#94edeb" stroke-width="1.5"/><circle cx="185" cy="235" r="3" fill="#ddfffb"/>
      <text x="32" y="131" text-anchor="start" fill="#eaffff" font-family="monospace" font-size="11" letter-spacing="1.7"></text>
      <text x="32" y="148" text-anchor="start" fill="#b8e1ec" font-family="monospace" font-size="9" letter-spacing="1"></text>
      <text x="32" y="165" text-anchor="start" fill="#b8e1ec" font-family="monospace" font-size="9" letter-spacing="1"></text>
    </g>
    <circle cx="380" cy="380" r="41" stroke="#effaff" stroke-opacity=".65" stroke-dasharray="4 8"/>
    <path d="M380 96v38m0 492v38M96 380h38m492 0h38M380 332v96m-48-48h96" stroke="#d3f5f5" stroke-opacity=".7" stroke-width="2"/>
    <path d="M132 595h90m-90 0v-12m30 12v-8m30 8v-8m30 8v-12" stroke="#e7f4f6" stroke-width="3"/>
    <text x="137" y="577" fill="#e7f4f6" font-family="monospace" font-size="11" letter-spacing="2">CROSS POLARIZED</text>
  `, `<clipPath id="lensClip"><circle cx="380" cy="380" r="237"/></clipPath><clipPath id="microPhotoClip"><path d="M391 377 349 286 315 167 273 169 222 200 179 249 151 310 143 380 163 433 272 419 333 394Z"/></clipPath><radialGradient id="lensShade"><stop offset=".35" stop-color="#fff" stop-opacity=".04"/><stop offset="1" stop-color="#061a2b" stop-opacity=".63"/></radialGradient>`);

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
    <text x="498" y="180" fill="#ddd1e9" font-family="monospace" font-size="11" letter-spacing="3">DATA FIELD / 06</text>
    <text x="162" y="598" fill="#ddd1e9" font-family="monospace" font-size="11" letter-spacing="3">RELATION →</text>
  `);

  const arts = [planet, rock, microscope, mineral, atom, network];
  const labels = ['行星 / PLANET', '岩石 / ROCK', '显微镜下 / THIN SECTION', '矿物 / MINERAL', '原子 / ATOM', '抽象点线 / DATA FIELD'];
  const frame = home.querySelector('.story-art-frame');
  arts.forEach((art,i) => {
    const layer = document.createElement('div');
    layer.className='story-art';
    layer.setAttribute('aria-hidden','true');
    layer.dataset.art=i;
    layer.innerHTML=art;
    frame.append(layer);
  });

  // Decorative records are fictional, and each microscope caption follows its photo.
  const rockNames = [
      ['PYROXENITE', 'COARSE PYROXENITE', 'ULTRAMAFIC ROCK'],
      ['BASALT', 'VESICULAR BASALT', 'MAFIC BASALT']
  ];
  const fictionalPlaces = ['Aster Ridge', 'Lumen Rise', 'Nacre Shelf', 'Echo Seamount', 'Prism Bay', 'Violet Basin'];
  const fictionalRegions = ['Pacific Ocean', 'Azure Basin', 'Lunar Sea', 'North Rift', 'Crystal Gulf'];
  const pick = values => values[Math.floor(Math.random()*values.length)];
  function refreshRockCaption(layer, photoIndex) {
    const lat = (11 + Math.random()*19).toFixed(4);
    const lon = (138 + Math.random()*35).toFixed(4);
    const lines = [pick(rockNames[photoIndex]), `${pick(fictionalPlaces)}, Pacific Ocean`, `${lat}°N, ${lon}°E`];
    const variant = photoIndex === 0 ? 'a' : 'b';
    layer.querySelectorAll(`.photo-scan-${variant} text`).forEach((text,i) => { text.textContent = lines[i]; });
  }
  const rockLayer = frame.querySelector('.story-art[data-art="1"]');
  refreshRockCaption(rockLayer,0);
  refreshRockCaption(rockLayer,1);
  rockLayer.querySelector('.photo-cycle-b').addEventListener('animationiteration',() => {
    refreshRockCaption(rockLayer,0);
    refreshRockCaption(rockLayer,1);
  });

  const microLayer = frame.querySelector('.story-art[data-art="2"]');
  const microPhotos = [...microLayer.querySelectorAll('.micro-photo')];
  const microScan = microLayer.querySelector('.micro-scan');
  let microIndex = 0;
  function showMicroPhoto(index) {
    microPhotos.forEach((photo,i) => { photo.classList.toggle('is-visible',i === index); });
    const longitude = `${(10 + Math.random()*165).toFixed(4)}°${Math.random() < .5 ? 'E' : 'W'}`;
    const latitude = `${(4 + Math.random()*74).toFixed(4)}°${Math.random() < .5 ? 'N' : 'S'}`;
    const lines = [`#${microNumbers[index]}`, `${pick(fictionalPlaces)}, ${pick(fictionalRegions)}`, `${longitude}, ${latitude}`];
    microScan.querySelectorAll('text').forEach((label,i) => { label.textContent = lines[i]; });
    microScan.classList.remove('is-refreshing');
    void microScan.getBoundingClientRect();
    microScan.classList.add('is-refreshing');
  }
  showMicroPhoto(microIndex);
  if (!reduced) window.setInterval(() => {
    microIndex = (microIndex + 1) % microNumbers.length;
    showMicroPhoto(microIndex);
  },5600);

  const chapters = [...home.querySelectorAll('.story-chapter')];
  // The chapter articles keep the scroll distance and jump targets. Their text
  // lives in the same sticky viewport as the art, so both change together.
  const copyFrame = document.createElement('div');
  copyFrame.className = 'story-text-frame';
  const copies = chapters.map((chapter,i) => {
    const content = chapter.querySelector('.story-content');
    content.dataset.scene = i;
    content.setAttribute('aria-hidden','true');
    chapter.setAttribute('aria-hidden','true');
    copyFrame.append(content);
    return content;
  });
  home.querySelector('.home-visual').append(copyFrame);
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
    const progress=clamp((header-home.getBoundingClientRect().top)/screen,0,chapters.length-1);
    // Keep the preceding scene while its text remains in the reading area.
    // Blend during the latter half of each chapter, as the next title moves in.
    const segment=Math.min(Math.floor(progress),chapters.length-2);
    const phase=clamp((progress-segment-.5)*2,0,1);
    const visualProgress=segment+phase;
    const nearest=Math.round(visualProgress);
    const transition=4*phase*(1-phase);
    if(nearest!==active){ active=nearest; burst=reduced?0:performance.now()+280; if(!reduced)setTimeout(queue,300); }
    const glitch=reduced?0:Math.max(transition*.9,performance.now() < burst ? .5 : 0);
    home.style.setProperty('--glitch',glitch.toFixed(2));
    home.classList.toggle('is-glitching',glitch>.3);
    top.style.setProperty('--story-bar',`${((progress/(chapters.length-1))*100).toFixed(1)}%`);
    layers.forEach((layer,i) => {
      const opacity=clamp(1-Math.abs(visualProgress-i),0,1);
      layer.style.opacity=opacity.toFixed(3);
      layer.style.transform=`translate3d(${((i-visualProgress)*24).toFixed(1)}px,${((i-visualProgress)*18).toFixed(1)}px,0) scale(${(1-Math.abs(visualProgress-i)*.065).toFixed(3)})`;
      layer.classList.toggle('is-current',i===nearest);
      backgrounds[i].style.opacity=opacity.toFixed(3);
      // Only the dominant chapter's copy is readable during the visual blend.
      copies[i].style.opacity=i===nearest?'1':'0';
      copies[i].style.visibility=i===nearest?'visible':'hidden';
      copies[i].style.transform=`translate3d(0,${((i-visualProgress)*26).toFixed(1)}px,0)`;
      copies[i].classList.toggle('is-current',i===nearest);
      copies[i].setAttribute('aria-hidden',i===nearest?'false':'true');
    });
    buttons.forEach((b,i) => { b.classList.toggle('active',i===nearest); if(i===nearest)b.setAttribute('aria-current','step'); else b.removeAttribute('aria-current'); });
    readout.textContent=labels[nearest];
    current.textContent=nearest===chapters.length-1?'06 / 06 · DATA FIELD':`${String(nearest+1).padStart(2,'0')} / 06 · SCROLL TO DESCEND`;
  }
  const queue=()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update)}};
  window.addEventListener('scroll',queue,{passive:true});
  window.addEventListener('resize',queue);
  buttons.forEach((button,i)=>button.addEventListener('click',()=>chapters[i].scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'})));
  home.querySelectorAll('[data-next]').forEach(button=>button.addEventListener('click',()=>chapters[Number(button.dataset.next)].scrollIntoView({behavior:reduced?'auto':'smooth',block:'start'})));
  document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>requestAnimationFrame(queue)));
  update();
})();
