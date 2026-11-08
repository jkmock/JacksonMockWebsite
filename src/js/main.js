import gsap from 'gsap';

// "Portfolio 2026", "© 2026" etc. always show the current year.
const YEAR = new Date().getFullYear();
document.querySelectorAll('[data-year]').forEach((el) => {
  el.textContent = YEAR;
});

// A CSS color as [r, g, b] in 0–1.
function toRgb(color) {
  const ctx = document.createElement('canvas').getContext('2d');
  ctx.fillStyle = color.trim();
  const hex = ctx.fillStyle.slice(1);
  return [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
}

const rootStyle = getComputedStyle(document.documentElement);

// Keep Safari's status bar color in step with --bg-dark-seen (--bg-dark
// lightened 4.2% toward white), so editing --bg-dark is enough.
const barColor = toRgb(rootStyle.getPropertyValue('--bg-dark')).map((c) =>
  Math.round((c + 0.042 * (1 - c)) * 255)
    .toString(16)
    .padStart(2, '0')
);
document.querySelector('meta[name="theme-color"]')?.setAttribute('content', `#${barColor.join('')}`);

const PHRASES = [
  'North Carolina State University',
  'Computer Science',
  'Jackson Mock',
  'Raleigh, NC',
  'NC State',
  'Go Pack',
  `Portfolio ${YEAR}`,
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
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => randomFields.forEach(buildRandomRows), 150);
});

// Wait for the web fonts and portrait (capped, so a slow network still gets a
// page) so the background text doesn't render in a fallback font and reflow.
const portrait = document.querySelector('.h-photo img');
await Promise.race([
  Promise.all([
    document.fonts.load('1em "Space Mono"'),
    document.fonts.load('600 1em "Inter Tight"'),
    portrait?.decode().catch(() => {}),
  ]).then(() => document.fonts.ready),
  new Promise((resolve) => setTimeout(resolve, 2500)),
]);
randomFields.forEach(buildRandomRows);

function reveal() {
  requestAnimationFrame(() => document.documentElement.classList.remove('is-loading'));
}

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  reveal();
} else {
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
  reveal();
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
}

// Mobile: below the hero, each block (a section title, a project, a job...)
// fades its items up one at a time, in on-screen order, the same way the hero
// does, as soon as the block's first item scrolls into view.
const REVEAL_GROUPS = [
  ['.projects-title', ':scope'],
  ['.project', '.project-index, .project-title, .project-stack, .project-year, .project-summary > *, .project-photo'],
  ['.job', '.job-index, .job-title, .job-org, .job-points li, .job-meta p'],
  ['.personal-body', '.personal-lede, .carousel'],
  ['.contact-body', '.contact-lede, .contact-tile'],
  ['.contact-foot', ':scope > span'],
];

const inScreenOrder = (els) =>
  els
    .filter((el) => el.getClientRects().length)
    .map((el) => ({ el, box: el.getBoundingClientRect() }))
    .sort((a, b) => (Math.abs(a.box.top - b.box.top) > 12 ? a.box.top - b.box.top : a.box.left - b.box.left))
    .map(({ el }) => el);

const mobile = window.matchMedia('(max-width: 860px)');

if (mobile.matches && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const groups = new Map(); // first item -> all items, in on-screen order
  REVEAL_GROUPS.forEach(([groupSelector, itemSelector]) => {
    document.querySelectorAll(groupSelector).forEach((group) => {
      const items = inScreenOrder([...group.querySelectorAll(itemSelector)]);
      if (items.length) groups.set(items[0], items);
    });
  });

  gsap.set([...groups.values()].flat(), { opacity: 0, y: 28 });

  const revealObserver = new IntersectionObserver(
    (entries) => {
      // Blocks that arrive together play back to back, top one first.
      const items = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        .flatMap((entry) => {
          revealObserver.unobserve(entry.target);
          const group = groups.get(entry.target);
          groups.delete(entry.target);
          return group;
        });
      if (!items.length) return;
      gsap.to(items, {
        opacity: 1,
        y: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.07,
        clearProps: 'opacity,transform',
      });
    },
    { rootMargin: '0px 0px -8% 0px' },
  );
  groups.forEach((_, first) => revealObserver.observe(first));

  // Turned wide enough for the desktop layout: show whatever hasn't appeared.
  mobile.addEventListener('change', () => {
    if (mobile.matches) return;
    revealObserver.disconnect();
    gsap.set([...groups.values()].flat(), { clearProps: 'opacity,transform' });
    groups.clear();
  });
}

// Personal carousel. Prev/next and the arrow keys step one slide (fast clicks
// stack), swiping works too, and the counter follows the scroll position.
// Videos show a still frame and only one plays at a time: the one under the
// mouse, otherwise the first video fully in view, and only while the carousel
// is on screen. With reduced motion, videos play only on hover.
document.querySelectorAll('[data-carousel]').forEach((carousel) => {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...track.children];
  const prev = carousel.querySelector('[data-prev]');
  const next = carousel.querySelector('[data-next]');
  const current = carousel.querySelector('[data-current]');
  const pad = (n) => String(n).padStart(2, '0');
  const videoSlides = slides.filter((slide) => slide.querySelector('video'));
  const autoplay = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  carousel.querySelector('[data-total]').textContent = pad(slides.length);

  let index = 0;
  let target = null; // where a button/key scroll is heading, so fast clicks stack
  let onScreen = false;
  let hovered = null;
  let playingSlide = null;
  let frame = null;

  const slideStep = () => (slides.length < 2 ? track.clientWidth : slides[1].offsetLeft - slides[0].offsetLeft);
  const maxScroll = () => track.scrollWidth - track.clientWidth;
  const maxIndex = () => Math.max(0, Math.ceil(maxScroll() / slideStep() - 0.01));

  const fullyVisible = (slide) => {
    const left = slide.offsetLeft - track.offsetLeft - track.scrollLeft;
    return left >= -2 && left + slide.offsetWidth <= track.clientWidth + 2;
  };

  const syncVideos = () => {
    let playing = hovered;
    if (!playing && autoplay && onScreen) playing = videoSlides.find(fullyVisible) ?? null;
    // A video that takes over starts from the beginning; one that keeps
    // playing (say, hovered and then left while still the automatic pick)
    // carries on where it is.
    const takingOver = playing !== playingSlide;
    playingSlide = playing;
    videoSlides.forEach((slide) => {
      const video = slide.querySelector('video');
      if (slide === playing) {
        if (takingOver) video.currentTime = 0;
        video.play().catch(() => {});
      } else if (!video.paused) video.pause();
    });
  };

  const update = () => {
    frame = null;
    const step = slideStep();
    if (target !== null && Math.abs(track.scrollLeft - Math.min(maxScroll(), target * step)) < 2) target = null;
    index = track.scrollLeft >= maxScroll() - 2 ? maxIndex() : Math.round(track.scrollLeft / step);
    // the counter shows the last slide once the end is reached
    current.textContent = pad(track.scrollLeft >= maxScroll() - 2 ? slides.length : index + 1);
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= maxScroll() - 2;
    syncVideos();
  };
  const scheduleUpdate = () => {
    if (!frame) frame = requestAnimationFrame(update);
  };

  const goTo = (i) => {
    target = Math.min(maxIndex(), Math.max(0, i));
    track.scrollTo({ left: target * slideStep() });
  };
  const step = (dir) => goTo((target ?? index) + dir);

  prev.addEventListener('click', () => step(-1));
  next.addEventListener('click', () => step(1));
  track.addEventListener('keydown', (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    step(event.key === 'ArrowLeft' ? -1 : 1);
  });
  // a swipe or wheel scroll takes over from any button scroll in progress
  ['pointerdown', 'wheel', 'touchstart'].forEach((type) =>
    track.addEventListener(type, () => (target = null), { passive: true }),
  );
  track.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);

  videoSlides.forEach((slide) => {
    const video = slide.querySelector('video');
    video.addEventListener('play', () => slide.classList.add('is-playing'));
    video.addEventListener('pause', () => slide.classList.remove('is-playing'));
    // hover (real pointers only) plays that video instead of the automatic one
    slide.addEventListener('pointerenter', (event) => {
      if (event.pointerType !== 'mouse') return;
      hovered = slide;
      syncVideos();
    });
    slide.addEventListener('pointerleave', (event) => {
      if (event.pointerType !== 'mouse' || hovered !== slide) return;
      hovered = null;
      syncVideos();
    });
  });

  new IntersectionObserver(
    ([entry]) => {
      onScreen = entry.isIntersecting;
      syncVideos();
    },
    { threshold: 0.4 },
  ).observe(track);

  update();
});

const navToggle = document.querySelector('.nav-toggle');

if (navToggle && navBar) {
  let openedAt = 0;
  const setMenu = (open) => {
    if (open) openedAt = window.scrollY;
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
  // A tap anywhere outside the bar or menu, or scrolling, closes it. Scrolling
  // means a real move, not the few pixels Safari's toolbar can nudge the page.
  document.addEventListener('click', (event) => {
    if (!navBar.contains(event.target)) setMenu(false);
  });
  window.addEventListener(
    'scroll',
    () => {
      if (navBar.classList.contains('is-open') && Math.abs(window.scrollY - openedAt) > 8) setMenu(false);
    },
    { passive: true },
  );
}

// iOS Safari only applies :active styles (the press flash on buttons) once the
// page listens for touches.
document.addEventListener('touchstart', () => {}, { passive: true });
