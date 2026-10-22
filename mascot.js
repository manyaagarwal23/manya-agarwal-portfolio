/* Cursor-following mascot. Needs the HTML in snippet.html + mascot.css. */
(function initMascot(){
  function setup() {
    const stage = document.getElementById('mascot');
    if(!stage) return false;
    let base = stage.dataset.base || 'mascot/';
    if (!base.endsWith('/')) base += '/';

    const tilt = stage.querySelector('.mascot-tilt');
    const shadow = stage.querySelector('.mascot-shadow');
    if (!tilt || !shadow) return false;

    // Clear any previous children in tilt
    tilt.innerHTML = '';

    const poses = ['smile','left','right','thinking','happy','surprised','waving'];
    const imgs = {};
    poses.forEach((p,i)=>{
      const im = document.createElement('img');
      im.src = base + p + '.png';
      im.alt = i ? '' : 'Manya mascot';
      if(!i) im.className = 'active';
      tilt.appendChild(im);
      imgs[p] = im;
    });

    let pose='smile', dx=0, dy=0, cx=0, cy=0;
    let hovering=false, locked=false, idle=false, away=false, idleTimer;
    const clamp = v => Math.max(-1, Math.min(1, v));

    function setPose(p){
      if(p===pose || !imgs[p] || !imgs[pose]) return;
      imgs[pose].classList.remove('active');
      imgs[p].classList.add('active');
      pose=p;
    }

    function resolve(){
      if(locked) return;
      if(hovering) return setPose('waving');
      if(away) return setPose('surprised');
      if(idle) return setPose('thinking');
      setPose(dx < -0.3 ? 'left' : dx > 0.3 ? 'right' : 'smile');
    }

    // Expose external reaction hooks for hobbies & skills hover
    window.setMascotPose = function(p) {
      if (poses.includes(p)) setPose(p);
    };
    window.resetMascotPose = function() {
      resolve();
    };

    addEventListener('pointermove', e=>{
      const r = stage.getBoundingClientRect();
      dx = clamp((e.clientX-(r.left+r.width/2))/(innerWidth/2));
      dy = clamp((e.clientY-(r.top+r.height/2))/(innerHeight/2));
      idle=false;
      away=false;
      clearTimeout(idleTimer);
      idleTimer = setTimeout(()=>{ idle=true; resolve(); }, 4000);
      resolve();
    });

    stage.addEventListener('mouseenter', ()=>{ hovering=true; resolve(); });
    stage.addEventListener('mouseleave', ()=>{ hovering=false; resolve(); });
    document.documentElement.addEventListener('mouseleave', ()=>{ away=true; resolve(); });
    document.documentElement.addEventListener('mouseenter', ()=>{ away=false; resolve(); });
    
    stage.addEventListener('pointerdown', (e)=>{
      e.stopPropagation();
      locked=true;
      setPose('happy');
      setTimeout(()=>{ locked=false; resolve(); }, 900);
    });

    (function loop(){
      cx += (dx-cx)*0.08;
      cy += (dy-cy)*0.08;
      tilt.style.transform =
        `rotateY(${cx*16}deg) rotateX(${-cy*10}deg) translate(${cx*10}px,${cy*6}px)`;
      stage.style.setProperty('--sx', (-cx*16)+'px');
      stage.style.setProperty('--sy', (18 - cy*8)+'px');
      shadow.style.transform = `translateX(${-cx*14}px) scaleX(${1-Math.abs(cx)*.15})`;
      requestAnimationFrame(loop);
    })();

    return true;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();
