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
  const lastIndex = projects.length - 1;
  const STEP = 0.4; // viewport heights of scrolling per project
  const SMOOTHING = 0.14; // portion of the remaining gap closed per 60fps frame

  let target = 0;
  let current = 0;
  let frame = null;
  let lastTime = 0;
  let activeIndex = -1;

  projectsSection.style.setProperty('--n', projects.length);

  const stepPx = () => window.innerHeight * STEP;
  const sectionTop = () => projectsSection.getBoundingClientRect().top + window.scrollY;

  const measure = () => {
    projects.forEach((project) => {
      const inner = project.querySelector('.project-body-inner');
      project.style.setProperty('--natural', `${inner.offsetHeight}px`);
    });
  };

  const setActiveClass = (index) => {
    if (index === activeIndex) return;
    activeIndex = index;
    projects.forEach((project, i) => {
      const on = i === index;
      project.classList.toggle('is-active', on);
      project.querySelector('.project-head').setAttribute('aria-expanded', String(on));
    });
  };

  // Each project's openness is a direct function of scroll progress, so
  // fast scrolling passes through instantly and slow scrolling animates.
  const render = () => {
    projects.forEach((project, i) => {
      const open = Math.max(0, 1 - Math.abs(current - i));
      project.style.setProperty('--open', open.toFixed(3));
    });
    setActiveClass(Math.min(lastIndex, Math.max(0, Math.round(current))));
  };

  const tick = (time) => {
    const dt = Math.min(64, time - (lastTime || time));
    lastTime = time;
    const gap = target - current;
    if (Math.abs(gap) < 0.0005) {
      current = target;
      frame = null;
      lastTime = 0;
      render();
      return;
    }
    current += gap * (1 - Math.pow(1 - SMOOTHING, dt / 16.67));
    render();
    frame = requestAnimationFrame(tick);
  };

  const syncFromScroll = () => {
    if (!desktop.matches) return;
    const progress = (window.scrollY - sectionTop()) / stepPx();
    target = Math.min(lastIndex, Math.max(0, progress));
    if (!frame) frame = requestAnimationFrame(tick);
  };

  const setup = () => {
    measure();
    if (desktop.matches) {
      const progress = (window.scrollY - sectionTop()) / stepPx();
      target = current = Math.min(lastIndex, Math.max(0, progress));
      render();
    } else {
      const index = Math.max(0, activeIndex);
      activeIndex = -1;
      projects.forEach((project, i) => project.style.setProperty('--open', i === index ? '1' : '0'));
      setActiveClass(index);
    }
  };

  window.addEventListener('scroll', syncFromScroll, { passive: true });
  window.addEventListener('resize', setup);
  desktop.addEventListener('change', setup);
  setup();
  document.fonts.ready.then(setup);

  projects.forEach((project, i) => {
    project.querySelector('.project-head').addEventListener('click', () => {
      if (desktop.matches) {
        window.scrollTo({ top: sectionTop() + i * stepPx(), behavior: 'smooth' });
      } else {
        projects.forEach((p, k) => p.style.setProperty('--open', k === i ? '1' : '0'));
        setActiveClass(i);
      }
    });
  });
}
