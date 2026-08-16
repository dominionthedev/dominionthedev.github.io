// Two reveal primitives, distinct on purpose:
// - scrambleType: for text. Each character cycles through glyph noise
//   before settling, left to right — a decode, not a typewriter.
// - digitRoll: for numbers. Rapid digit flicker settling all at once —
//   deliberately NOT the same motion as scrambleType, per spec.

const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&@~01";

export function scrambleType(
  el: HTMLElement,
  text: string,
  opts: { speed?: number; cyclesPerChar?: number } = {},
): Promise<void> {
  const speed = opts.speed ?? 28;
  const cyclesPerChar = opts.cyclesPerChar ?? 5;

  return new Promise((resolve) => {
    let revealed = 0;
    let frame = 0;

    function tick() {
      let display = "";
      for (let i = 0; i < text.length; i++) {
        if (i < revealed) {
          display += text[i];
        } else if (i === revealed) {
          display += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
      }
      el.textContent = display;

      if (revealed >= text.length) {
        el.textContent = text;
        resolve();
        return;
      }

      frame++;
      if (frame % cyclesPerChar === 0) revealed++;
      setTimeout(tick, speed);
    }
    tick();
  });
}

export function digitRoll(
  el: HTMLElement,
  finalDigits: string,
  duration = 480,
): void {
  const start = performance.now();

  function frame(now: number) {
    const t = Math.min(1, (now - start) / duration);
    if (t < 1) {
      let display = "";
      for (let i = 0; i < finalDigits.length; i++) {
        display += Math.floor(Math.random() * 10).toString();
      }
      el.textContent = display;
      requestAnimationFrame(frame);
    } else {
      el.textContent = finalDigits;
    }
  }
  requestAnimationFrame(frame);
}
