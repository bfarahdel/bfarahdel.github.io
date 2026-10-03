(() => {
  const world = document.querySelector('.pixel-world');
  const bubble = document.getElementById('companion-message');
  const label = world.querySelector('.world-label');
  const canvas = document.createElement('canvas');
  canvas.className = 'rattle-snake';
  canvas.setAttribute('aria-hidden', 'true');
  world.append(canvas);
  const ctx = canvas.getContext('2d');
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const size = 8;
  let route = [], snake = [], cursor = 0, food = null, dead = 0;
  let previous = null, elapsed = 0;

  function respawn() {
    cursor = 4;
    snake = route.slice(0, 5).reverse();
    dead = 0;
    spawnFood();
  }

  function spawnFood() {
    const empty = route.filter(cell => !snake.some(segment => segment.x === cell.x && segment.y === cell.y));
    food = empty.length ? empty[Math.floor(Math.random() * empty.length)] : null;
  }

  function measure() {
    // Use the actual bubble and label bounds so the game never covers either.
    const top = Math.ceil(label.offsetTop + label.offsetHeight + 6);
    const height = Math.max(0, bubble.offsetTop - top - 8);
    const cols = Math.min(34, Math.floor((world.clientWidth - 32) / size));
    const rows = Math.min(5, Math.floor(height / size));
    canvas.hidden = cols < 8 || rows < 2;
    if (canvas.hidden) return;
    const width = cols * size;
    canvas.style.top = top + 'px';
    if (canvas.width === width && canvas.height === rows * size && route.length) return;
    canvas.width = width;
    canvas.height = rows * size;
    route = [];
    for (let x = 0; x < cols; x++) route.push({ x, y: 0 });
    for (let y = 1; y < rows; y++) route.push({ x: cols - 1, y });
    for (let x = cols - 2; x >= 0; x--) route.push({ x, y: rows - 1 });
    for (let y = rows - 2; y > 0; y--) route.push({ x: 0, y });
    respawn();
    draw();
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (!snake.length) return;
    if (!dead && food) {
      ctx.fillStyle = '#ff758f';
      ctx.fillRect(food.x * size + 2, food.y * size + 2, 5, 5);
      ctx.fillStyle = '#b4f18b';
      ctx.fillRect(food.x * size + 4, food.y * size, 2, 2);
    }
    snake.forEach((segment, index) => {
      const x = segment.x * size, y = segment.y * size;
      ctx.fillStyle = dead ? '#e59498' : `hsl(${(110 + snake.length * 12 + index * 6) % 360} 85% 65%)`;
      ctx.fillRect(x, y, size - 1, size - 1);
      ctx.fillStyle = dead ? '#f9c7c9' : '#ffffff80';
      ctx.fillRect(x + 1, y + 1, size - 3, 1);
    });
    const head = snake[0];
    ctx.fillStyle = '#172234';
    ctx.fillRect(head.x * size + 2, head.y * size + 2, 2, 2);
    ctx.fillRect(head.x * size + 5, head.y * size + 2, 1, 2);
    if (dead) {
      ctx.strokeStyle = '#fff3cf';
      ctx.lineWidth = 2;
      const x = head.x * size + 4, y = head.y * size + 4;
      ctx.beginPath();
      ctx.moveTo(x - 6, y - 6); ctx.lineTo(x + 6, y + 6);
      ctx.moveTo(x + 6, y - 6); ctx.lineTo(x - 6, y + 6);
      ctx.stroke();
    }
  }

  function step() {
    if (dead) {
      if (++dead > 10) respawn();
      draw();
      return;
    }
    const next = route[(cursor + 1) % route.length];
    const grow = food !== null && next.x === food.x && next.y === food.y;
    const body = grow || food === null ? snake : snake.slice(0, -1);
    // Growth eventually fills the circuit: the head actually hits its body.
    if (body.some(segment => segment.x === next.x && segment.y === next.y)) {
      dead = 1;
    } else {
      cursor = (cursor + 1) % route.length;
      snake.unshift(next);
      if (!grow) snake.pop();
      if (grow) spawnFood();
    }
    draw();
  }

  function tick(time) {
    const delta = previous === null ? 0 : Math.min(time - previous, 100);
    previous = time;
    if (!document.hidden && !canvas.hidden && !reduced.matches && !root.classList.contains('motion-paused')) {
      elapsed += delta;
      if (elapsed >= 115) { elapsed %= 115; step(); }
    }
    requestAnimationFrame(tick);
  }
  new ResizeObserver(measure).observe(world);
  new ResizeObserver(measure).observe(bubble);
  new ResizeObserver(measure).observe(label);
  document.addEventListener('visibilitychange', () => { previous = null; });
  measure();
  requestAnimationFrame(tick);
})();
