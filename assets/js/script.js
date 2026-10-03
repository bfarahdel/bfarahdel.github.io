(() => {
  const root = document.documentElement;
  const themeButton = document.getElementById('theme-toggle');
  let savedTheme;
  try { savedTheme = localStorage.getItem('portfolio-theme'); } catch { /* Storage is optional. */ }
  function setTheme(theme) {
    root.dataset.theme = theme;
    themeButton.textContent = theme === 'dark' ? '☀' : '☾';
    themeButton.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'day' : 'night'} mode`);
  }
  setTheme(savedTheme === 'dark' ? 'dark' : 'light');
  themeButton.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
    try { localStorage.setItem('portfolio-theme', root.dataset.theme); } catch { /* Keep working without storage. */ }
  });
  const menu = document.getElementById('nav-links');
  const menuButton = document.getElementById('mobile-menu-btn');
  function closeMenu() { menu.classList.remove('active'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu'); }
  menuButton.addEventListener('click', () => {
    const open = menu.classList.toggle('active');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
  menu.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.classList.contains('active')) { closeMenu(); menuButton.focus(); } });
  const filters = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  filters.forEach(button => button.addEventListener('click', () => {
    filters.forEach(filter => { const selected = filter === button; filter.classList.toggle('active', selected); filter.setAttribute('aria-pressed', String(selected)); });
    let count = 0;
    cards.forEach(card => { card.hidden = button.dataset.filter !== 'all' && !card.dataset.category.split(' ').includes(button.dataset.filter); if (!card.hidden) count++; });
    document.getElementById('project-count').textContent = `${count} ${count === 1 ? 'project' : 'projects'} in the quest log`;
  }));
  const motion = document.getElementById('motion-toggle');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  function setMotion(paused) {
    root.classList.toggle('motion-paused', paused);
    motion.setAttribute('aria-pressed', String(paused));
    motion.textContent = reducedMotion.matches ? 'Reduced motion on' : paused ? 'Play animation ▶' : 'Pause animation Ⅱ';
    motion.disabled = reducedMotion.matches;
  }
  setMotion(reducedMotion.matches);
  reducedMotion.addEventListener('change', () => setMotion(reducedMotion.matches));
  motion.addEventListener('click', () => setMotion(!root.classList.contains('motion-paused')));
  const messages = [
    'SpideyCam: web-slinging, but make it AR.',
    'RattleLens puts Snake in the real world.',
    'I gave a robot a beating heart. ♥',
    'Kitty Kat: dino onesie, flying fish.',
    'Three perfect deflects. Kitty goes ultimate!',
    'micro:bit + a little heart = my robot.'
  ];
  let message = 0;
  const companion = document.getElementById('companion-button');
  const bubble = document.getElementById('companion-message');
  const world = companion.closest('.pixel-world');
  let position = 0;
  let direction = 1;
  let lastTime = null;
  let worldWidth = 0;
  let characterWidth = 0;
  let bubbleWidth = 0;
  let maxPosition = 0;
  let animationFrame = null;

  function placeCompanion() {
    companion.style.transform = 'translateX(' + position + 'px)';
    companion.classList.toggle('facing-left', direction < 0);
    const center = position + characterWidth / 2;
    const bubbleLeft = Math.max(12, Math.min(center - bubbleWidth / 2, worldWidth - bubbleWidth - 12));
    bubble.style.left = bubbleLeft + 'px';
    bubble.style.setProperty('--tail-x', Math.max(12, Math.min(center - bubbleLeft - 5, bubbleWidth - 22)) + 'px');
  }

  function measureWorld() {
    worldWidth = world.clientWidth;
    characterWidth = companion.offsetWidth;
    bubbleWidth = bubble.offsetWidth;
    maxPosition = Math.max(0, worldWidth - characterWidth);
    position = Math.max(0, Math.min(position, maxPosition));
    placeCompanion();
  }

  // Time-based travel keeps the same walking speed on every screen refresh rate.
  // Keep walking after clicks and pointer movement, just like the original companion.
  function tick(time) {
    const elapsed = lastTime === null ? 0 : Math.min((time - lastTime) / 1000, 0.05);
    lastTime = time;
    if (!root.classList.contains('motion-paused') && !reducedMotion.matches) {
      position += direction * 72 * elapsed;
      if (position >= maxPosition) { position = maxPosition; direction = -1; }
      if (position <= 0) { position = 0; direction = 1; }
      placeCompanion();
    }
    animationFrame = requestAnimationFrame(tick);
  }

  companion.addEventListener('click', () => {
    message = (message + 1) % messages.length;
    bubble.textContent = messages[message];
    measureWorld();
  });
  new ResizeObserver(measureWorld).observe(world);
  new ResizeObserver(measureWorld).observe(bubble);
  measureWorld();
  position = maxPosition / 2;
  placeCompanion();
  animationFrame = requestAnimationFrame(tick);
  document.addEventListener('visibilitychange', () => {
    if (animationFrame !== null) cancelAnimationFrame(animationFrame);
    animationFrame = null;
    lastTime = null;
    if (!document.hidden) animationFrame = requestAnimationFrame(tick);
  });
})();


