// ===========================
//  GALAXIA DE AMAIRANI
//  script.js
// ===========================

(function () {
  'use strict';

  function rand(min, max) { return Math.random() * (max - min) + min; }
  function hexToRgba(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${a})`;
  }

  /* ─── 1. CANVAS DE ESTRELLAS ─────────────────────────── */
  const starCanvas = document.getElementById('starsCanvas');
  const sCtx = starCanvas.getContext('2d');
  let W, H, stars = [], shootingStars = [];

  function resize() {
    W = starCanvas.width  = window.innerWidth;
    H = starCanvas.height = window.innerHeight;
    const fc = document.getElementById('flowersCanvas');
    if (fc) { fc.width = W; fc.height = H; }
  }
  resize();
  window.addEventListener('resize', () => { resize(); initStars(); initFloatingFlowers(); });

  function initStars() {
    stars = [];
    const count = Math.floor((W * H) / 1200);
    for (let i = 0; i < count; i++) {
      stars.push({
        x:rand(0,W), y:rand(0,H), r:rand(0.2,1.8), alpha:rand(0.3,1),
        speed:rand(0.003,0.012), color:pickStarColor(), twinkle:rand(0,Math.PI*2),
      });
    }
  }

  function pickStarColor() {
    const p = ['#ffffff','#ffe8a0','#ffd700','#c8d8ff','#ffcce0','#d0f0ff','#fff8c0'];
    return p[Math.floor(Math.random()*p.length)];
  }

  function drawStars(t) {
    sCtx.clearRect(0,0,W,H);
    stars.forEach(s => {
      const tw = 0.4 + 0.6*Math.abs(Math.sin(t*s.speed+s.twinkle));
      sCtx.beginPath();
      sCtx.arc(s.x,s.y,s.r,0,Math.PI*2);
      sCtx.fillStyle = s.color;
      sCtx.globalAlpha = s.alpha*tw;
      sCtx.fill();
      sCtx.globalAlpha = 1;
    });
  }

  /* ─── 2. ESTRELLAS FUGACES ───────────────────────────── */
  function spawnShootingStar() {
    shootingStars.push({
      x:rand(0,W*0.7), y:rand(0,H*0.4), len:rand(80,200),
      speed:rand(8,18), angle:rand(20,45)*(Math.PI/180),
      alpha:1, color:Math.random()>0.5?'#f5c518':'#ffffff',
    });
  }

  function drawShootingStars() {
    shootingStars = shootingStars.filter(s=>s.alpha>0.02);
    shootingStars.forEach(s=>{
      sCtx.save();
      sCtx.strokeStyle = hexToRgba(s.color,s.alpha);
      sCtx.lineWidth = 2;
      sCtx.globalAlpha = s.alpha;
      sCtx.translate(s.x,s.y);
      sCtx.rotate(s.angle);
      sCtx.beginPath(); sCtx.moveTo(0,0); sCtx.lineTo(s.len,0); sCtx.stroke();
      sCtx.globalAlpha = 1;
      sCtx.restore();
      s.x += Math.cos(s.angle)*s.speed;
      s.y += Math.sin(s.angle)*s.speed;
      s.alpha -= 0.018;
    });
  }

  setInterval(()=>{ if(Math.random()>0.4) spawnShootingStar(); },2800);

  /* ─── 3. DIBUJAR FLOR AMARILLA EN CANVAS ────────────── */
  function drawYellowFlower(ctx, x, y, size, rotation, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.rotate(rotation);

    const petalCount = 8;
    const pLen = size;

    // Pétalos
    for (let i = 0; i < petalCount; i++) {
      ctx.save();
      ctx.rotate((i / petalCount) * Math.PI * 2);
      ctx.beginPath();
      ctx.ellipse(0, -pLen*0.55, pLen*0.22, pLen*0.55, 0, 0, Math.PI*2);
      const pg = ctx.createRadialGradient(0, -pLen*0.25, 0, 0, -pLen*0.5, pLen*0.6);
      pg.addColorStop(0,   '#fff9c4');
      pg.addColorStop(0.4, '#fdd835');
      pg.addColorStop(1,   '#f57f17');
      ctx.fillStyle = pg;
      ctx.shadowColor = 'rgba(255,230,0,0.7)';
      ctx.shadowBlur  = 10;
      ctx.fill();
      ctx.restore();
    }

    // Centro
    const cg = ctx.createRadialGradient(0,0,0, 0,0,pLen*0.3);
    cg.addColorStop(0,   '#ff8f00');
    cg.addColorStop(0.6, '#e65100');
    cg.addColorStop(1,   '#bf360c');
    ctx.beginPath();
    ctx.arc(0,0,pLen*0.3,0,Math.PI*2);
    ctx.fillStyle = cg;
    ctx.shadowColor = 'rgba(255,80,0,0.6)';
    ctx.shadowBlur  = 8;
    ctx.fill();

    // Brillo centro
    ctx.beginPath();
    ctx.arc(-pLen*0.08,-pLen*0.08,pLen*0.1,0,Math.PI*2);
    ctx.fillStyle = 'rgba(255,255,200,0.4)';
    ctx.shadowBlur = 0;
    ctx.fill();

    ctx.restore();
  }

  /* ─── 4. FLORES FLOTANTES EN CANVAS ─────────────────── */
  const flowerCanvas = document.getElementById('flowersCanvas');
  const fCtx = flowerCanvas.getContext('2d');
  let floatingFlowers = [];

  function initFloatingFlowers() {
    floatingFlowers = [];
    for (let i = 0; i < 14; i++) {
      floatingFlowers.push({
        x: rand(0,W), y: rand(0,H),
        size: rand(12,28),
        rot: rand(0,Math.PI*2),
        rotSpeed: rand(-0.008,0.008),
        vx: rand(-0.3,0.3),
        vy: rand(-0.5,-0.1),
        alpha: rand(0.5,1),
        alphaDir: rand(0.003,0.008) * (Math.random()>0.5?1:-1),
      });
    }
  }

  function drawFloatingFlowers() {
    fCtx.clearRect(0,0,W,H);
    floatingFlowers.forEach(f => {
      drawYellowFlower(fCtx, f.x, f.y, f.size, f.rot, f.alpha);
      f.x   += f.vx;
      f.y   += f.vy;
      f.rot += f.rotSpeed;
      f.alpha += f.alphaDir;
      if (f.alpha > 1)   { f.alpha=1;   f.alphaDir*=-1; }
      if (f.alpha < 0.3) { f.alpha=0.3; f.alphaDir*=-1; }
      if (f.y < -50)  { f.y=H+50; f.x=rand(0,W); }
      if (f.x < -50)  { f.x=W+50; }
      if (f.x > W+50) { f.x=-50;  }
    });
  }

  /* ─── 5. FLORES SVG EN ÓRBITA ────────────────────────── */
  function buildOrbitFlowers() {
    document.querySelectorAll('.flower-orbit').forEach(el => {
      const sz = 36;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${sz}" height="${sz}" viewBox="${-sz/2} ${-sz/2} ${sz} ${sz}">
        <defs>
          <radialGradient id="pg" cx="50%" cy="30%" r="70%">
            <stop offset="0%"   stop-color="#fff9c4"/>
            <stop offset="50%"  stop-color="#fdd835"/>
            <stop offset="100%" stop-color="#f57f17"/>
          </radialGradient>
          <radialGradient id="cg" cx="35%" cy="35%" r="65%">
            <stop offset="0%"   stop-color="#ff8f00"/>
            <stop offset="100%" stop-color="#bf360c"/>
          </radialGradient>
        </defs>
        ${Array.from({length:8}).map((_,i)=>`
          <ellipse cx="0" cy="${-sz*0.28}" rx="${sz*0.11}" ry="${sz*0.28}"
            transform="rotate(${i*45})" fill="url(#pg)" opacity="0.95"/>
        `).join('')}
        <circle cx="0" cy="0" r="${sz*0.18}" fill="url(#cg)"/>
        <circle cx="${-sz*0.06}" cy="${-sz*0.06}" r="${sz*0.06}" fill="rgba(255,255,200,0.4)"/>
      </svg>`;
      el.innerHTML = svg;
    });
  }

  /* ─── 6. POLVO ESTELAR ───────────────────────────────── */
  const stardust = document.getElementById('stardust');

  function createDustParticle() {
    const p = document.createElement('div');
    p.className = 'dust-particle';
    const size = rand(1,4);
    Object.assign(p.style, {
      width:`${size}px`, height:`${size}px`,
      left:`${rand(0,100)}%`,
      animationDuration:`${rand(6,14)}s`,
      animationDelay:`${rand(0,6)}s`,
    });
    stardust.appendChild(p);
    setTimeout(()=>p.remove(),20000);
  }
  setInterval(createDustParticle,600);
  for (let i=0;i<12;i++) createDustParticle();

  /* ─── 7. MODAL BELUM ─────────────────────────────────── */
  const modal     = document.getElementById('belumModal');
  const closeBtn  = document.getElementById('belumClose');
  const rowTop    = document.getElementById('belumFlowersRow');
  const rowBottom = document.getElementById('belumFlowersRow2');

  function buildModalFlowers(container, count, sz) {
    container.innerHTML = '';
    for (let i=0;i<count;i++) {
      const cv = document.createElement('canvas');
      cv.width = sz; cv.height = sz;
      const c = cv.getContext('2d');
      drawYellowFlower(c, sz/2, sz/2, sz*0.4, rand(0,Math.PI*2), 1);
      cv.style.filter = 'drop-shadow(0 0 6px rgba(255,220,50,0.9))';
      container.appendChild(cv);
    }
  }

  function openModal() {
    buildModalFlowers(rowTop,    5, 46);
    buildModalFlowers(rowBottom, 5, 46);
    modal.classList.remove('hidden');
    for (let i=0;i<12;i++) setTimeout(()=>spawnBurstFlower(), i*80);
  }

  closeBtn.addEventListener('click', ()=>modal.classList.add('hidden'));
  modal.addEventListener('click', e=>{ if(e.target===modal) modal.classList.add('hidden'); });

  /* ─── 8. INTERACTIVIDAD JÚPITER ─────────────────────── */
  const jupiter = document.getElementById('jupiter');
  jupiter.addEventListener('click', handleJupiter);
  jupiter.addEventListener('touchstart', e=>{ e.preventDefault(); handleJupiter(); }, {passive:false});

  function handleJupiter() {
    jupiter.style.transition = 'transform 0.15s ease';
    jupiter.style.transform  = 'scale(1.22)';
    setTimeout(()=>{ jupiter.style.transform='scale(1)'; },300);

    const rect = jupiter.getBoundingClientRect();
    const cx = rect.left + rect.width/2;
    const cy = rect.top  + rect.height/2;
    for (let i=0;i<18;i++) spawnBurstParticle(cx,cy);
    setTimeout(openModal, 350);
    spawnShootingStar();
  }

  function spawnBurstParticle(cx, cy) {
    const el  = document.createElement('div');
    const ang = rand(0,Math.PI*2);
    const spd = rand(60,160);
    const clr = ['#f5c518','#ffe566','#ffffff','#ff9933','#ffcc00'][Math.floor(rand(0,5))];
    Object.assign(el.style, {
      position:'fixed', width:`${rand(3,8)}px`, height:`${rand(3,8)}px`,
      borderRadius:'50%', background:clr, left:`${cx}px`, top:`${cy}px`,
      pointerEvents:'none', zIndex:999, boxShadow:`0 0 6px ${clr}`,
      transition:`transform ${rand(0.6,1.2)}s ease-out, opacity ${rand(0.6,1.2)}s ease-out`,
      opacity:1,
    });
    document.body.appendChild(el);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      el.style.transform = `translate(${Math.cos(ang)*spd}px,${Math.sin(ang)*spd}px) scale(0)`;
      el.style.opacity = 0;
    }));
    setTimeout(()=>el.remove(),1400);
  }

  function spawnBurstFlower() {
    const cv = document.createElement('canvas');
    const sz = rand(20,38);
    cv.width = sz*2; cv.height = sz*2;
    drawYellowFlower(cv.getContext('2d'), sz, sz, sz*0.85, rand(0,Math.PI*2), 1);
    const ang = rand(0,Math.PI*2);
    const spd = rand(80,260);
    Object.assign(cv.style, {
      position:'fixed', left:`${W/2-sz}px`, top:`${H/2-sz}px`,
      pointerEvents:'none', zIndex:9998,
      transition:`transform ${rand(0.8,1.5)}s ease-out, opacity ${rand(0.8,1.5)}s ease-out`,
      opacity:1, filter:'drop-shadow(0 0 8px rgba(255,220,50,0.9))',
    });
    document.body.appendChild(cv);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      cv.style.transform = `translate(${Math.cos(ang)*spd}px,${Math.sin(ang)*spd}px) rotate(${rand(-180,180)}deg) scale(0)`;
      cv.style.opacity = 0;
    }));
    setTimeout(()=>cv.remove(),1800);
  }

  /* ─── 9. CURSOR MÁGICO ───────────────────────────────── */
  document.addEventListener('mousemove', e=>{
    if(Math.random()>0.75) spawnCursorSpark(e.clientX,e.clientY);
  });

  function spawnCursorSpark(x,y) {
    const el  = document.createElement('div');
    const clr = ['#f5c518','#ffe566','#fff','#ffaa00'][Math.floor(rand(0,4))];
    const sz  = rand(2,5);
    Object.assign(el.style,{
      position:'fixed', left:`${x}px`, top:`${y}px`,
      width:`${sz}px`, height:`${sz}px`, borderRadius:'50%',
      background:clr, pointerEvents:'none', zIndex:1000,
      transform:'translate(-50%,-50%) scale(1)',
      transition:'transform 0.5s ease, opacity 0.5s ease', opacity:0.9,
    });
    document.body.appendChild(el);
    requestAnimationFrame(()=>requestAnimationFrame(()=>{
      el.style.transform = `translate(${rand(-20,20)-sz/2}px,${rand(-20,20)-sz/2}px) scale(0)`;
      el.style.opacity = 0;
    }));
    setTimeout(()=>el.remove(),600);
  }

  /* ─── 10. LOOP PRINCIPAL ─────────────────────────────── */
  initStars();
  initFloatingFlowers();
  buildOrbitFlowers();

  let t = 0;
  function loop() {
    t += 0.016;
    drawStars(t);
    drawShootingStars();
    drawFloatingFlowers();
    requestAnimationFrame(loop);
  }
  loop();

  console.log('%c✨ Galaxia de Amairani ✨','color:#f5c518;font-size:18px;font-weight:bold;');
  console.log('%cHecha con amor por BELUM 🌼','color:#ffe566;font-size:14px;');

})();