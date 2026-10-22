// Naskh site: scroll reveals, soft page exits, and the pointer aura.
// No cookies, no storage, no network requests.
(() => {
  const root = document.documentElement;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  // Reveal blocks below the fold as they scroll into view. Anything already
  // scrolled past (a jump, a restored scroll position) is revealed too.
  let hidden = [];
  for (const el of document.querySelectorAll('.doc > *, body > footer')) {
    if (el.getBoundingClientRect().top > innerHeight) {
      el.classList.add('rv');
      hidden.push(el);
    }
  }
  let check = 0;
  const reveal = () => {
    check = 0;
    hidden = hidden.filter((el) => {
      if (el.getBoundingClientRect().top > innerHeight * 0.94) return true;
      el.classList.add('in');
      return false;
    });
    if (!hidden.length) removeEventListener('scroll', onScroll);
  };
  const onScroll = () => { if (!check) check = requestAnimationFrame(reveal); };
  if (hidden.length) {
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
  }

  // Let the page lift away before following a link to another page of the site.
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a[href]');
    if (!link || event.defaultPrevented || event.button !== 0) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if ((link.target && link.target !== '_self') || link.hasAttribute('download')) return;
    const url = new URL(link.href, location.href);
    if (url.origin !== location.origin) return;
    if (url.pathname === location.pathname && url.search === location.search) return;
    event.preventDefault();
    root.classList.add('leaving');
    setTimeout(() => { location.href = url.href; }, 300);
  });
  addEventListener('pageshow', (event) => {
    if (event.persisted) root.classList.remove('leaving');
  });

  // Pointer aura: a warm glow and paper dots that trail the mouse or a finger.
  const aura = document.createElement('div');
  aura.className = 'aura';
  aura.setAttribute('aria-hidden', 'true');
  aura.innerHTML = '<div class="aura-dots"></div><div class="aura-glow"></div>';
  document.body.prepend(aura);
  const dots = aura.firstChild;
  const glow = aura.lastChild;
  const logo = document.querySelector('.home .lockup svg');

  // Rest on the logo (or near the top) until the pointer moves.
  let tx = innerWidth / 2;
  let ty = innerHeight * 0.3;
  if (logo) {
    const r = logo.getBoundingClientRect();
    tx = r.left + r.width / 2;
    ty = r.top + r.height / 2;
  }
  let x = tx;
  let y = ty;
  let frame = 0;

  const render = () => {
    x += (tx - x) * 0.12;
    y += (ty - y) * 0.12;
    glow.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`;
    dots.style.setProperty('--mx', `${x.toFixed(1)}px`);
    dots.style.setProperty('--my', `${y.toFixed(1)}px`);
    if (logo) {
      const dx = (x / innerWidth - 0.5) * -12;
      const dy = (y / innerHeight - 0.5) * -8;
      logo.style.transform = `translate3d(${dx.toFixed(2)}px, ${dy.toFixed(2)}px, 0)`;
    }
    frame = Math.abs(tx - x) + Math.abs(ty - y) > 0.2 ? requestAnimationFrame(render) : 0;
  };
  const follow = (px, py) => {
    tx = px;
    ty = py;
    aura.classList.add('live');
    if (!frame) frame = requestAnimationFrame(render);
  };
  const rest = () => aura.classList.remove('live');

  // Mouse and pen through pointer events; fingers through touch events,
  // which keep arriving while the page scrolls.
  addEventListener('pointermove', (event) => {
    if (event.pointerType !== 'touch') follow(event.clientX, event.clientY);
  }, { passive: true });
  const touch = (event) => {
    const t = event.touches[0];
    if (t) follow(t.clientX, t.clientY);
  };
  addEventListener('touchstart', touch, { passive: true });
  addEventListener('touchmove', touch, { passive: true });
  addEventListener('touchend', (event) => { if (!event.touches.length) rest(); }, { passive: true });
  addEventListener('touchcancel', rest, { passive: true });
  document.addEventListener('mouseleave', rest);

  render();
  requestAnimationFrame(() => aura.classList.add('on'));
})();
