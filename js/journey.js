(function() {

  const GSAP_URL = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js';
  const ST_URL   = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js';
  let gsapLoaded = false;

  function loadScript(src, cb) {
    const s = document.createElement('script');
    s.src = src;
    s.onload = cb;
    document.head.appendChild(s);
  }

  function loadAll(cb) {
    if (gsapLoaded) { cb(); return; }
    loadScript(GSAP_URL, () => {
      loadScript(ST_URL, () => {
        gsap.registerPlugin(ScrollTrigger);
        gsapLoaded = true;
        cb();
      });
    });
  }

  // ── OPEN ──
  window.openJourneyMode = function() {
    const page = document.getElementById('page-journey');
    if (!page) return;
    page.classList.add('journey-active');
    document.body.style.overflow = 'hidden';
    loadAll(initJourney);

    document.getElementById('j-close').onclick = function() {
      ScrollTrigger.getAll().forEach(t => t.kill());
      page.classList.remove('journey-active');
      document.body.style.overflow = '';
      page.scrollTop = 0;
    };
  };

  // ── INIT ──
  function initJourney() {
    const page = document.getElementById('page-journey');

    // Use page as scroller
    ScrollTrigger.defaults({ scroller: page });

    initHero(page);
  }

  // ── HERO ──
  function initHero(page) {
    const bg = document.getElementById('j-bg');
    const fg = document.getElementById('j-fg');

    // ── Background breathe ──
    gsap.to(bg, {
      scale: 1.08,
      x: 12,
      y: 8,
      duration: 12,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });

    // ── Foreground float ──
    gsap.to(fg, {
      y: -12,
      duration: 4,
      ease: 'sine.inOut',
      repeat: -1,
      yoyo: true
    });

    // ── Mouse parallax ──
    document.getElementById('j-hero').addEventListener('mousemove', function(e) {
      const r = this.getBoundingClientRect();
      const dx = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      const dy = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      gsap.to(fg, { x: dx * 14, y: -12 + dy * -6, duration: 0.8, ease: 'power2.out', overwrite: 'auto' });
      gsap.to(bg, { x: dx * -18, y: dy * -10, duration: 1.2, ease: 'power2.out', overwrite: 'auto' });
    });

    // ── Eyebrow entrance ──
    gsap.to('#j-eyebrow', { opacity: 1, duration: 0.7, ease: 'power2.out', delay: 0.3 });
    gsap.to('#j-hint',    { opacity: 1, duration: 0.6, ease: 'power2.out', delay: 0.8 });

    // ── Build typewriter chars ──
    const sentence = "Answer 5 questions and\nreceive your personalized\ntraining plan.";
    const title = document.getElementById('j-title');
    title.innerHTML = '';
    const chars = [];

    sentence.split('').forEach(ch => {
      if (ch === '\n') {
        const br = document.createElement('br');
        title.appendChild(br);
        return;
      }
      const span = document.createElement('span');
      span.className = 'j-char';
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      title.appendChild(span);
      chars.push(span);
    });

    // Set all chars invisible to start
    gsap.set(chars, { opacity: 0, filter: 'blur(6px)', y: 14 });

    // ── Scroll-driven reveal ──
    // The hero section is tall (300vh) so scrolling through it reveals the text
    // scrub: true ties every pixel of scroll to char opacity
    const tl = gsap.timeline({
      scrollTrigger: {
  trigger: '#j-hero-wrap',
  start: 'top top',
  end: 'bottom bottom',
  scrub: 0.8,
  pin: false
}
    });

    chars.forEach((char, i) => {
      tl.to(char, {
        opacity: 1,
        filter: 'blur(0px)',
        y: 0,
        duration: 0.4,
        ease: 'power1.out'
      }, i * 0.05);
    });
  }

})();