import gsap from 'gsap';

document.querySelectorAll('.marquee-track').forEach((track) => {
  track.innerHTML += track.innerHTML;
});

document.querySelectorAll('[data-repeat]').forEach((el) => {
  el.textContent = `${el.dataset.repeat} `.repeat(120);
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
