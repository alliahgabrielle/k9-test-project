
document.getElementById('intro-overlay').style.display = 'none';
showCrossroads();

// ── Theme toggle ──
const root = document.documentElement;
const toggleBtn = document.getElementById('theme-toggle');
const iconMoon = document.getElementById('icon-moon');
const iconSun = document.getElementById('icon-sun');
const heroBg = document.querySelector('#hero .hero-bg');
const heroEl = document.getElementById('hero');

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem('ik9-theme', theme);
  const g = theme === 'light' ?
    {
      cls: 'grad-mist',
      light: true
    } :
    {
      cls: 'grad-cedar',
      light: false
    };
  ['grad-cedar', 'grad-bark', 'grad-seaglass', 'grad-mist', 'grad-drift']
  .forEach(c => heroBg.classList.remove(c));
  heroBg.classList.add(g.cls);
  heroEl.classList.toggle('hero-light', g.light);
  iconMoon.style.display = theme === 'dark' ? 'none' : 'block';
  iconSun.style.display = theme === 'light' ? 'none' : 'block';
  toggleBtn.style.color = theme === 'light' ? 'var(--deep-cedar)' : 'var(--mist-white)';
  toggleBtn.style.borderColor = theme === 'light' ? 'rgba(45,58,46,0.35)' : 'rgba(184,212,206,0.5)';
}

toggleBtn.addEventListener('click', () => {
  applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
});

applyTheme(localStorage.getItem('ik9-theme') || 'light');

// ── Page navigation ──
function navigateTo(pageId) {
  // hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  // show target
  const target = document.getElementById('page-' + pageId);
  if (target) target.classList.add('active');

  // update nav active state
  document.querySelectorAll('.nav-links a').forEach(a => {
    a.classList.toggle('active', a.dataset.page === pageId);
  });

  // update sliding underline
  const activeLink = document.querySelector(`.nav-links a[data-page="${pageId}"]`);
  if (activeLink) moveIndicator(activeLink);

  // if going to hero, re-trigger animations if not done yet
  if (pageId === 'hero') triggerHeroAnimations();
}

// wire up nav links
document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    navigateTo(link.dataset.page);
  });
});

// ── Contact form ──
function handleContact(e) {
  e.preventDefault();
  const btn = e.target.querySelector('.contact-submit');
  btn.textContent = 'Sent ✓';
  btn.style.background = '#5B6B4A';
  btn.style.color = '#F0EDE8';
  btn.disabled = true;
}

// ── Intro / transition ──
let transitionDone = false;
const introVideo = document.getElementById('intro-video');

function triggerTransition(fromWhiteout) {
  if (transitionDone) return;
  transitionDone = true;
  const burst = document.getElementById('light-burst');
  const intro = document.getElementById('intro-overlay');

  if (!fromWhiteout && introVideo && !isNaN(introVideo.duration)) {
    try {
      introVideo.currentTime = Math.max(introVideo.currentTime, 7.8);
    } catch (e) {}
  }

  intro.classList.add('whiteout');
  setTimeout(() => {
    try {
      introVideo.pause();
    } catch (e) {}
  }, 60);
  burst.classList.add('active');

  setTimeout(() => {
    intro.style.opacity = '0';
    intro.style.transition = 'opacity 0.5s ease';
  }, 850);

  setTimeout(() => {
    intro.style.display = 'none';
    burst.style.display = 'none';
    showCrossroads();
  }, 2100);
}

// ── Crossroads ──
function showCrossroads() {
  const cr = document.getElementById('crossroads');
  cr.classList.add('visible');
  setTimeout(() => {
    const eyebrow = cr.querySelector('.crossroads-eyebrow');
    const heading = cr.querySelector('.crossroads-heading');
    if (eyebrow) eyebrow.classList.add('in');
    if (heading) heading.classList.add('in');
    cr.querySelector('.crossroads-sub').classList.add('in');
    cr.querySelector('.crossroads-paths').classList.add('in');
    cr.querySelector('.crossroads-skip').classList.add('in');
  }, 60);
}

function enterClassicMode() {
  const cr = document.getElementById('crossroads');
  const main = document.getElementById('main-site');
  cr.classList.add('exiting');
  setTimeout(() => {
    cr.style.display = 'none';
    main.style.display = 'block';
    setTimeout(() => {
      main.classList.add('visible');
      triggerHeroAnimations();
    }, 60);
  }, 400);
}

function enterJourneyMode() {
  const cr = document.getElementById('crossroads');
  const cs = document.getElementById('coming-soon');
  cr.classList.add('exiting');
  setTimeout(() => {
    cr.style.display = 'none';
    cs.classList.add('visible');
  }, 400);
}

function hideCoomingSoon() {
  const cs = document.getElementById('coming-soon');
  const cr = document.getElementById('crossroads');
  cs.classList.remove('visible');
  cr.style.display = 'flex';
  cr.classList.remove('exiting');
  cr.classList.remove('visible');
  setTimeout(() => cr.classList.add('visible'), 20);
}

// ── Hero animations ──
let heroAnimated = false;

function triggerHeroAnimations() {
  if (heroAnimated) return;
  heroAnimated = true;
  setTimeout(() => document.getElementById('h-eyebrow').classList.add('revealed'), 100);
  setTimeout(() => document.getElementById('h-headline').classList.add('revealed'), 300);
  setTimeout(() => document.getElementById('h-sub').classList.add('revealed'), 600);
  setTimeout(() => document.getElementById('h-cta').classList.add('revealed'), 900);
}

// ── Video timing ──
const WHITEOUT_TIME = 7.8;
introVideo.addEventListener('timeupdate', () => {
  if (!transitionDone && introVideo.currentTime >= WHITEOUT_TIME) triggerTransition(true);
});
introVideo.addEventListener('ended', () => {
  if (!transitionDone) triggerTransition(true);
});
setTimeout(() => {
  if (!transitionDone) triggerTransition(false);
}, 9500);

// ── Nav scroll (fade on scroll within active page) ──
document.getElementById('snap-container').addEventListener('scroll', () => {
  const scrolled = document.getElementById('snap-container').scrollTop > 80;
  document.getElementById('nav').classList.toggle('scrolled', scrolled);
});

// ── Nav sliding underline ──
const navList = document.querySelector('.nav-links');

function moveIndicator(el) {
  if (!navList || !el) return;
  const listRect = navList.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  navList.style.setProperty('--ind-left', (elRect.left - listRect.left) + 'px');
  navList.style.setProperty('--ind-width', elRect.width + 'px');
  navList.classList.add('indicator-ready');
}

const firstActive = navList ? navList.querySelector('a.active') : null;
if (firstActive) requestAnimationFrame(() => moveIndicator(firstActive));

if (navList) {
  navList.querySelectorAll('a').forEach(link => {
    link.addEventListener('mouseenter', () => moveIndicator(link));
  });
  navList.addEventListener('mouseleave', () => {
    const active = navList.querySelector('a.active');
    if (active) moveIndicator(active);
    else navList.classList.remove('indicator-ready');
  });
}

// ── Consent checkbox ──
const consentRow   = document.getElementById('consent-row');
const consentBox   = document.getElementById('consent-box');
const consentCheck = document.getElementById('consent-check');

if (consentRow) {
  consentRow.addEventListener('click', () => {
    const isChecked = consentBox.classList.toggle('checked');
    consentCheck.checked = isChecked;
  });
}

// ── Scroll reveal ──
const scrollEls = document.querySelectorAll('[data-scroll]');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });

scrollEls.forEach(el => observer.observe(el));