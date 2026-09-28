import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

function initLenis() {
  const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function initPreloader(lenis, onComplete) {
  lenis.stop();
  const el = document.getElementById('preloader');
  const numberEl = document.getElementById('preloader-number');
  const counter = { value: 0 };

  gsap.to(counter, {
    value: 100,
    duration: 1.3,
    ease: 'power2.inOut',
    onUpdate: () => {
      numberEl.textContent = Math.round(counter.value);
    },
    onComplete: () => {
      gsap.to(el, {
        yPercent: -100,
        duration: 0.9,
        ease: 'power4.inOut',
        delay: 0.15,
        onComplete: () => {
          el.remove();
          lenis.start();
          onComplete();
        },
      });
    },
  });
}

function initHeroReveal() {
  const tl = gsap.timeline({ delay: 0.1 });
  tl.to('.split-line-inner', {
    y: '0%',
    duration: 1.1,
    stagger: 0.08,
    ease: 'power4.out',
  }).to(
    '.s-hero .reveal-line',
    {
      y: '0%',
      opacity: 1,
      duration: 0.9,
      stagger: 0.08,
      ease: 'power3.out',
    },
    '-=0.7'
  );
}

function initScrollReveals() {
  document.querySelectorAll('.s-section, .s-contact').forEach((section) => {
    const wipe = section.querySelector('.s-wipe');
    const items = section.querySelectorAll('.reveal-up');

    ScrollTrigger.create({
      trigger: section,
      start: 'top 75%',
      once: true,
      onEnter: () => {
        const tl = gsap.timeline();
        if (wipe) {
          tl.to(wipe, { scaleY: 0, duration: 0.9, ease: 'power4.inOut' });
        }
        if (items.length) {
          tl.to(
            items,
            { opacity: 1, y: 0, duration: 0.9, stagger: 0.12, ease: 'power3.out' },
            wipe ? '-=0.35' : 0
          );
        }
      },
    });
  });
}

function initHeroParallax() {
  document.querySelectorAll('.s-shape[data-speed]').forEach((shape) => {
    const speed = parseFloat(shape.dataset.speed);
    gsap.to(shape, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger: '.s-hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
      },
    });
  });
}

function initCounters() {
  document.querySelectorAll('.s-stat-number').forEach((el) => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    ScrollTrigger.create({
      trigger: el,
      start: 'top 90%',
      once: true,
      onEnter: () => {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.6,
          ease: 'power2.out',
          onUpdate: () => {
            el.textContent = Math.round(obj.val) + suffix;
          },
        });
      },
    });
  });
}

function initCursor() {
  if (!window.matchMedia('(pointer: fine)').matches) return;
  document.documentElement.classList.add('has-cursor');
  const dot = document.getElementById('cursor-dot');

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let x = mouseX;
  let y = mouseY;
  let scale = 1;
  let scaleTarget = 1;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  document.querySelectorAll('[data-hover]').forEach((el) => {
    el.addEventListener('mouseenter', () => {
      scaleTarget = 2.75;
    });
    el.addEventListener('mouseleave', () => {
      scaleTarget = 1;
    });
  });

  gsap.ticker.add(() => {
    x += (mouseX - x) * 0.2;
    y += (mouseY - y) * 0.2;
    scale += (scaleTarget - scale) * 0.2;
    dot.style.transform = `translate(${x - 8}px, ${y - 8}px) scale(${scale})`;
  });
}

function initMagnetic() {
  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const rect = el.getBoundingClientRect();
      const relX = e.clientX - rect.left - rect.width / 2;
      const relY = e.clientY - rect.top - rect.height / 2;
      gsap.to(el, { x: relX * 0.35, y: relY * 0.35, duration: 0.6, ease: 'power3.out' });
    });
    el.addEventListener('mouseleave', () => {
      gsap.to(el, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.4)' });
    });
  });
}

function initWorkThumb() {
  const rows = document.querySelectorAll('.s-work-row');
  if (!rows.length || !window.matchMedia('(pointer: fine)').matches) return;

  const thumb = document.createElement('div');
  thumb.className = 's-work-thumb';
  document.body.appendChild(thumb);

  const xTo = gsap.quickTo(thumb, 'x', { duration: 0.5, ease: 'power3' });
  const yTo = gsap.quickTo(thumb, 'y', { duration: 0.5, ease: 'power3' });

  // Recomputed from the real cursor position on every move (rather than
  // paired mouseenter/mouseleave per row) so the thumbnail can never get
  // stuck visible if a leave event is missed — e.g. very fast mouse
  // movement, or touch/trackpad hover emulation that skips it.
  let activeRow = null;

  window.addEventListener('mousemove', (e) => {
    xTo(e.clientX - 110);
    yTo(e.clientY - 75);

    const row = e.target.closest('.s-work-row');
    if (row && row !== activeRow) {
      activeRow = row;
      thumb.style.background = `linear-gradient(135deg, ${row.dataset.color}, #111111)`;
      gsap.to(thumb, { opacity: 1, scale: 1, duration: 0.4, ease: 'power3.out' });
    } else if (!row && activeRow) {
      activeRow = null;
      gsap.to(thumb, { opacity: 0, scale: 0.85, duration: 0.3, ease: 'power2.out' });
    }
  });

  window.addEventListener('mouseleave', () => {
    if (activeRow) {
      activeRow = null;
      gsap.to(thumb, { opacity: 0, scale: 0.85, duration: 0.3, ease: 'power2.out' });
    }
  });
}

function initClock() {
  const el = document.getElementById('clock');
  if (!el) return;
  function tick() {
    el.textContent = new Date().toLocaleTimeString('en-US', { hour12: false });
  }
  tick();
  setInterval(tick, 1000);
}

function initSmoothAnchors() {
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

const lenis = initLenis();
initCursor();
initClock();
initSmoothAnchors();
initWorkThumb();
initMagnetic();

initHeroParallax();

initPreloader(lenis, () => {
  initHeroReveal();
  initScrollReveals();
  initCounters();
  document.fonts.ready.then(() => ScrollTrigger.refresh());
});
