import gsap from 'gsap';

const PHRASES = [
  'North Carolina State University',
  'Computer Science',
  'Jackson Mock',
  'Raleigh, NC',
  'NC State',
  'Go Pack',
  'Portfolio 2026',
  'Software Engineering'
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

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  let intro = [...document.querySelectorAll('[data-in]')];
  // Mobile reorders the hero (photo first), so animate in on-screen order there.
  if (window.matchMedia('(max-width: 860px)').matches) {
    intro = intro
      .filter((el) => el.getClientRects().length)
      .sort((a, b) => a.getBoundingClientRect().top - b.getBoundingClientRect().top);
  }
  gsap.from(intro, {
    opacity: 0,
    y: 28,
    duration: 1,
    ease: 'power3.out',
    stagger: 0.07,
    delay: 0.1,
  });
}

const navBar = document.querySelector('.home-quiet .h-top');
const lightSections = [...document.querySelectorAll('.light, .edu, .contact')];
const contactSection = document.querySelector('.contact');

if (navBar && lightSections.length) {
  const updateNavTheme = () => {
    const navBox = navBar.getBoundingClientRect();
    const navMid = navBox.top + navBox.height / 2;
    const under = (section) => {
      const box = section.getBoundingClientRect();
      return box.top <= navMid && box.bottom > navMid;
    };
    document.body.classList.toggle('nav-on-light', lightSections.some(under));
    document.body.classList.toggle('nav-on-contact', !!contactSection && under(contactSection));
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
      // Mobile shows every project open as a plain list.
      activeIndex = -1;
      projects.forEach((project) => {
        project.style.setProperty('--open', '1');
        project.classList.remove('is-active');
        project.querySelector('.project-head').setAttribute('aria-expanded', 'true');
      });
    }
  };

  // Re-measure whenever a project's content changes size (fonts, resize, styles).
  const sizeObserver = new ResizeObserver(measure);
  projects.forEach((project) => sizeObserver.observe(project.querySelector('.project-body-inner')));

  window.addEventListener('scroll', syncFromScroll, { passive: true });
  window.addEventListener('resize', setup);
  desktop.addEventListener('change', setup);
  setup();
  document.fonts.ready.then(setup);

  projects.forEach((project, i) => {
    project.querySelector('.project-head').addEventListener('click', () => {
      if (desktop.matches) {
        window.scrollTo({ top: sectionTop() + i * stepPx(), behavior: 'smooth' });
      }
    });
  });

  // Mobile: fade each project up the first time it scrolls into view.
  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    projectsSection.classList.add('is-revealing');
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.15 },
    );
    projects.forEach((project) => revealObserver.observe(project));
  }
}

const navToggle = document.querySelector('.nav-toggle');

if (navToggle && navBar) {
  const setMenu = (open) => {
    navBar.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
  };
  navToggle.addEventListener('click', () => setMenu(!navBar.classList.contains('is-open')));
  navBar.querySelectorAll('nav a').forEach((link) => {
    link.addEventListener('click', () => setMenu(false));
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenu(false);
  });
}

// iOS Safari only applies :active styles (the press flash on buttons) once the
// page listens for touches.
document.addEventListener('touchstart', () => {}, { passive: true });
