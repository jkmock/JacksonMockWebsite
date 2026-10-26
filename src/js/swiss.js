import gsap from 'gsap';

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
