import gsap from 'gsap';

const root = document.documentElement;
const choices = document.querySelectorAll('[data-theme-choice]');

function setTheme(name) {
  root.dataset.theme = name;
  choices.forEach((btn) => btn.classList.toggle('is-active', btn.dataset.themeChoice === name));
  try {
    localStorage.setItem('theme', name);
  } catch {}
}

let saved = 'brown';
try {
  saved = localStorage.getItem('theme') || saved;
} catch {}
setTheme(saved);
choices.forEach((btn) => btn.addEventListener('click', () => setTheme(btn.dataset.themeChoice)));

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!reduceMotion) {
  gsap
    .timeline({ defaults: { ease: 'power3.out' } })
    .from('.nav > *', { opacity: 0, y: -16, duration: 0.7, stagger: 0.1 })
    .from('[data-reveal]', { opacity: 0, y: 28, duration: 0.9, stagger: 0.12 }, '-=0.4');

  document.querySelectorAll('[data-count]').forEach((el) => {
    const target = Number(el.dataset.count);
    const counter = { value: 0 };
    el.textContent = '0';
    gsap.to(counter, {
      value: target,
      duration: 1.6,
      delay: 1,
      ease: 'power2.out',
      onUpdate: () => {
        el.textContent = Math.round(counter.value);
      },
    });
  });
}
