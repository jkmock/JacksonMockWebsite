import gsap from 'gsap';

document.querySelectorAll('.marquee-track').forEach((track) => {
  track.innerHTML += track.innerHTML;
});

document.querySelectorAll('[data-repeat]').forEach((el) => {
  el.textContent = `${el.dataset.repeat} `.repeat(120);
});

const PHRASES = [
  'North Carolina State University',
  'Computer Science',
  'Jackson Mock',
  'Raleigh, NC',
  'NC State',
  'Go Pack',
  'Portfolio 2026',
  'Software Engineering',
  'Systems',
  'Web',
  '3D',
];

function randomLine() {
  let line = '';
  while (line.length < 340) {
    line += `${PHRASES[Math.floor(Math.random() * PHRASES.length)]} ✦ `;
  }
  return line.slice(Math.floor(Math.random() * 40));
}

function buildRandomRows(el) {
  const rowHeight = parseFloat(getComputedStyle(el).lineHeight);
  const count = Math.ceil(el.clientHeight / rowHeight);
  if (count === el.children.length) return;
  el.textContent = '';
  for (let i = 0; i < count; i += 1) {
    const row = document.createElement('div');
    row.className = 'h-bg-row';
    row.textContent = randomLine();
    el.append(row);
  }
}

const randomFields = document.querySelectorAll('[data-random]');
randomFields.forEach(buildRandomRows);
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => randomFields.forEach(buildRandomRows), 150);
});

const clocks = document.querySelectorAll('[data-clock]');

function tick() {
  const time = new Date().toLocaleTimeString('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  clocks.forEach((el) => {
    el.textContent = time;
  });
}

tick();
setInterval(tick, 20000);

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  gsap.from('[data-in]:not([data-rot])', {
    opacity: 0,
    y: 28,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.07,
    delay: 0.1,
  });
  gsap.from('[data-rot]', {
    opacity: 0,
    duration: 1.2,
    ease: 'power2.out',
    stagger: 0.07,
    delay: 0.3,
  });
}

const navBar = document.querySelector('.home-quiet .h-top');
const lightSection = document.querySelector('.light');

if (navBar && lightSection) {
  const updateNavTheme = () => {
    const navBox = navBar.getBoundingClientRect();
    const navMid = navBox.top + navBox.height / 2;
    const lightBox = lightSection.getBoundingClientRect();
    document.body.classList.toggle(
      'nav-on-light',
      lightBox.top <= navMid && lightBox.bottom > navMid,
    );
  };
  window.addEventListener('scroll', updateNavTheme, { passive: true });
  window.addEventListener('resize', updateNavTheme);
  updateNavTheme();
}

const projectsSection = document.querySelector('.light');

if (projectsSection) {
  const projects = [...projectsSection.querySelectorAll('.project')];
  const desktop = window.matchMedia('(min-width: 861px)');
  let active = -1;
  let lockedUntil = 0;

  projectsSection.style.setProperty('--n', projects.length);

  const stepPx = () => window.innerHeight * 0.55;
  const sectionTop = () => projectsSection.getBoundingClientRect().top + window.scrollY;

  const setActive = (index) => {
    if (index === active) return;
    active = index;
    projects.forEach((project, i) => {
      const on = i === index;
      project.classList.toggle('is-active', on);
      project.querySelector('.project-head').setAttribute('aria-expanded', String(on));
    });
  };

  // Pinned panel: which project is open is driven by scroll position.
  const syncFromScroll = () => {
    if (!desktop.matches || performance.now() < lockedUntil) return;
    const progress = Math.max(0, window.scrollY - sectionTop());
    setActive(Math.min(projects.length - 1, Math.round(progress / stepPx())));
  };

  window.addEventListener('scroll', syncFromScroll, { passive: true });
  window.addEventListener('resize', syncFromScroll);
  setActive(0);

  projects.forEach((project, i) => {
    project.querySelector('.project-head').addEventListener('click', () => {
      setActive(i);
      if (!desktop.matches) return;
      lockedUntil = performance.now() + 1500;
      window.scrollTo({ top: sectionTop() + i * stepPx(), behavior: 'smooth' });
      setTimeout(syncFromScroll, 1550);
    });
  });
}
