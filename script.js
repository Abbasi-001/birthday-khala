/* ============================================================
   MAMO JAHANGIR — LUXURY BIRTHDAY EXPERIENCE
   script.js — cinematic interactions
============================================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     0. LENIS SMOOTH SCROLL
  ============================================================= */
  let lenis;
  if (window.Lenis) {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    function raf(time){ lenis.raf(time); requestAnimationFrame(raf); }
    requestAnimationFrame(raf);
    if (window.gsap && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ============================================================
     1. AOS INIT
  ============================================================= */
  if (window.AOS) {
    AOS.init({ duration: 900, easing: 'ease-out-cubic', once: true, offset: 80 });
  }

  /* ============================================================
     2. GOLDEN DUST PARTICLE CANVAS (curtain)
  ============================================================= */
  const dustCanvas = document.getElementById('dust-canvas');
  if (dustCanvas) {
    const ctx = dustCanvas.getContext('2d');
    let particles = [];
    function resizeDust(){
      dustCanvas.width = window.innerWidth;
      dustCanvas.height = window.innerHeight;
    }
    resizeDust();
    window.addEventListener('resize', resizeDust);

    function makeParticle(){
      return {
        x: Math.random() * dustCanvas.width,
        y: Math.random() * dustCanvas.height,
        r: Math.random() * 1.8 + 0.4,
        vy: -(Math.random() * 0.4 + 0.1),
        vx: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.6 + 0.1
      };
    }
    for (let i = 0; i < 90; i++) particles.push(makeParticle());

    let dustRunning = true;
    function animateDust(){
      if (!dustRunning) return;
      ctx.clearRect(0, 0, dustCanvas.width, dustCanvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.y < -10) { p.y = dustCanvas.height + 10; p.x = Math.random() * dustCanvas.width; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(212,175,55,${p.alpha})`;
        ctx.shadowBlur = 6;
        ctx.shadowColor = 'rgba(212,175,55,0.8)';
        ctx.fill();
      });
      requestAnimationFrame(animateDust);
    }
    animateDust();

    // stop rendering once curtain is gone (perf)
    window.__stopDust = () => { dustRunning = false; };
  }

  /* ============================================================
     3. CURTAIN / ENTER EXPERIENCE
  ============================================================= */
  const curtain = document.getElementById('curtain');
  const enterBtn = document.getElementById('enter-btn');
  const site = document.getElementById('site');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');

  function openSite(){
    curtain.classList.add('hide');
    site.classList.add('reveal');
    document.body.style.overflow = 'auto';
    if (window.__stopDust) setTimeout(window.__stopDust, 1500);

    // attempt music autoplay softly muted-off (user gesture present via click)
    if (bgMusic) {
      bgMusic.volume = 0.35;
      bgMusic.play().then(() => {
        musicToggle.classList.add('playing');
      }).catch(() => { /* autoplay blocked, user can press toggle */ });
    }

    // hero entrance timeline
    if (window.gsap) {
      gsap.from('.hero-heading span', {
        yPercent: 110, opacity: 0, duration: 1.1, stagger: 0.12, ease: 'power4.out', delay: 0.2
      });
    }
  }

  document.body.style.overflow = 'hidden';
  if (enterBtn) enterBtn.addEventListener('click', openSite);

  // Safety: auto-open after 9s in case user doesn't click (accessibility)
  setTimeout(() => {
    if (!site.classList.contains('reveal')) { /* leave as is, wait for click */ }
  }, 9000);

  /* ============================================================
     4. MUSIC TOGGLE BUTTON
  ============================================================= */
  if (musicToggle && bgMusic) {
    musicToggle.addEventListener('click', () => {
      if (bgMusic.paused) {
        bgMusic.play().then(() => musicToggle.classList.add('playing')).catch(()=>{});
      } else {
        bgMusic.pause();
        musicToggle.classList.remove('playing');
      }
    });
  }

  /* ============================================================
     5. SCROLL PROGRESS RAIL
  ============================================================= */
  const scrollFill = document.getElementById('scroll-fill');
  function updateScrollRail(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (scrollFill) scrollFill.style.width = pct + '%';
  }
  window.addEventListener('scroll', updateScrollRail);

  /* ============================================================
     6. MOUSE PARALLAX TILT (gallery cards, portrait frame)
  ============================================================= */
  const tiltEls = document.querySelectorAll('[data-tilt]');
  tiltEls.forEach(el => {
    const inner = el.querySelector('.gal-card-inner, .portrait-frame') || el;
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      inner.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
    });
    el.addEventListener('mouseleave', () => {
      inner.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg)';
    });
  });

  /* ============================================================
     7. HERO GENTLE PARALLAX ON SCROLL (Ken Burns continues)
  ============================================================= */
  const heroImg = document.getElementById('hero-img');
  if (heroImg && window.gsap && window.ScrollTrigger) {
    gsap.to(heroImg, {
      scale: 1.25, yPercent: 8,
      scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
    });
  }

  /* ============================================================
     8. SCROLL REVEAL FOR GALLERY / TIMELINE (fallback GSAP fade)
  ============================================================= */
  if (window.gsap && window.ScrollTrigger) {
    gsap.utils.toArray('.gal-card').forEach((card, i) => {
      gsap.from(card, {
        opacity: 0, y: 60, duration: 1,
        scrollTrigger: { trigger: card, start: 'top 88%' },
        delay: i * 0.05
      });
    });
  }

  /* ============================================================
     9. ANIMATED COUNTERS
  ============================================================= */
  const counters = document.querySelectorAll('.stat-number');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        let current = 0;
        const duration = 1800;
        const start = performance.now();
        function tick(now){
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          current = Math.floor(eased * target);
          el.textContent = current.toLocaleString();
          if (progress < 1) requestAnimationFrame(tick);
          else el.textContent = target.toLocaleString();
        }
        requestAnimationFrame(tick);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObserver.observe(c));

  /* ============================================================
     10. LIGHTBOX
  ============================================================= */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', () => {
      const src = el.getAttribute('data-lightbox');
      lightboxImg.setAttribute('src', src);
      lightbox.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox(){
    lightbox.classList.remove('show');
    document.body.style.overflow = 'auto';
  }
  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightbox) lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeLightbox(); });

  /* ============================================================
     11. GIFT BOX SURPRISE
  ============================================================= */
  const giftBox = document.getElementById('gift-box');
  const openGiftBtn = document.getElementById('open-gift-btn');
  const giftReveal = document.getElementById('gift-reveal');
  const confettiCanvas = document.getElementById('confetti-canvas');

  function launchConfetti(){
    if (!confettiCanvas) return;
    const ctx = confettiCanvas.getContext('2d');
    const stage = confettiCanvas.parentElement;
    confettiCanvas.width = stage.clientWidth;
    confettiCanvas.height = stage.clientHeight;

    const colors = ['#D4AF37', '#E8CE84', '#8C6239', '#F6F1E8'];
    const pieces = [];
    for (let i = 0; i < 140; i++) {
      pieces.push({
        x: confettiCanvas.width / 2,
        y: confettiCanvas.height / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 1.4) * 12,
        size: Math.random() * 6 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * 360,
        vr: (Math.random() - 0.5) * 12,
        gravity: 0.25 + Math.random() * 0.15,
        life: 0
      });
    }

    let frame = 0;
    function animateConfetti(){
      frame++;
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      pieces.forEach(p => {
        p.vy += p.gravity * 0.05;
        p.x += p.vx; p.y += p.vy; p.rot += p.vr; p.life++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.globalAlpha = Math.max(0, 1 - p.life / 140);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.5);
        ctx.restore();
      });
      if (frame < 150) requestAnimationFrame(animateConfetti);
      else ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
    animateConfetti();
  }

  if (openGiftBtn && giftBox) {
    openGiftBtn.addEventListener('click', () => {
      giftBox.classList.add('open');
      giftReveal.classList.add('show');
      launchConfetti();
      openGiftBtn.disabled = true;
      openGiftBtn.textContent = 'Gift Opened ✦';
    });
  }

  /* ============================================================
     12. RESPONSIVE CANVAS RESIZE FOR GIFT CONFETTI
  ============================================================= */
  window.addEventListener('resize', () => {
    if (confettiCanvas) {
      const stage = confettiCanvas.parentElement;
      confettiCanvas.width = stage.clientWidth;
      confettiCanvas.height = stage.clientHeight;
    }
  });

});
