// One-shot actions, played with the Web Animations API on the `.dp-actor`
// wrapper. They compose with the looping idle animation on the parent.
//
// `particles` is one of the built-in particle shapes ('heart', 'sparkle',
// 'star', 'sweat', 'z'), or any other text/emoji glyph.

const squashStretch = (y, sx, sy) => `translateY(${y}%) scale(${sx}, ${sy})`;
const shiver = (x, y, sx, sy) => `translateX(${x}%) translateY(${y}%) scale(${sx}, ${sy})`;

export const actions = {
  jump: {
    duration: 700,
    keyframes: [
      { transform: squashStretch(0, 1, 1) },
      { transform: squashStretch(0, 1.1, 0.88), offset: 0.15, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: squashStretch(-22, 0.93, 1.1), offset: 0.45, easing: 'cubic-bezier(.6,0,.8,.4)' },
      { transform: squashStretch(0, 1.12, 0.86), offset: 0.75 },
      { transform: squashStretch(0, 0.97, 1.03), offset: 0.88 },
      { transform: squashStretch(0, 1, 1) },
    ],
  },
  squish: {
    duration: 500,
    keyframes: [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.12, .86)', offset: 0.3 },
      { transform: 'scale(.95, 1.05)', offset: 0.6 },
      { transform: 'scale(1.02, .98)', offset: 0.8 },
      { transform: 'scale(1, 1)' },
    ],
  },
  wiggle: {
    duration: 700,
    keyframes: [
      { transform: 'skewX(0)' },
      { transform: 'skewX(-9deg)', offset: 0.15 },
      { transform: 'skewX(8deg)', offset: 0.35 },
      { transform: 'skewX(-5deg)', offset: 0.55 },
      { transform: 'skewX(3deg)', offset: 0.75 },
      { transform: 'skewX(0)' },
    ],
  },
  shake: {
    duration: 550,
    keyframes: [
      { transform: 'rotate(0)' },
      { transform: 'rotate(-8deg)', offset: 0.2 },
      { transform: 'rotate(7deg)', offset: 0.4 },
      { transform: 'rotate(-5deg)', offset: 0.6 },
      { transform: 'rotate(3deg)', offset: 0.8 },
      { transform: 'rotate(0)' },
    ],
  },
  nod: {
    duration: 600,
    keyframes: [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.04, .92)', offset: 0.25 },
      { transform: 'scale(1, 1)', offset: 0.5 },
      { transform: 'scale(1.04, .92)', offset: 0.75 },
      { transform: 'scale(1, 1)' },
    ],
  },
  spin: {
    duration: 800,
    easing: 'cubic-bezier(.5,0,.3,1)',
    keyframes: [{ transform: 'rotateY(0)' }, { transform: 'rotateY(360deg)' }],
  },
  love: {
    duration: 600,
    particles: 'heart',
    keyframes: [
      { transform: 'scale(1)' },
      { transform: 'scale(1.1)', offset: 0.2 },
      { transform: 'scale(.97)', offset: 0.45 },
      { transform: 'scale(1.05)', offset: 0.65 },
      { transform: 'scale(1)' },
    ],
  },
  // A quick rise that lands a little low and springs back ("hey, over here").
  hop: {
    duration: 560,
    easing: 'linear',
    keyframes: [
      { transform: squashStretch(0, 1, 1), easing: 'cubic-bezier(.3,.6,.5,1)' },
      { transform: squashStretch(0, 1.08, 0.92), offset: 0.14, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: squashStretch(-13, 0.95, 1.06), offset: 0.42, easing: 'cubic-bezier(.6,0,.9,.5)' },
      { transform: squashStretch(2.5, 1.09, 0.9), offset: 0.66, easing: 'cubic-bezier(.3,.7,.4,1)' },
      { transform: squashStretch(-1.5, 0.98, 1.02), offset: 0.84, easing: 'ease-in-out' },
      { transform: squashStretch(0, 1, 1) },
    ],
  },
  // A fast side-to-side shudder that dies down: reads as "something went wrong".
  jitter: {
    duration: 520,
    easing: 'linear',
    keyframes: [
      { transform: 'translateX(0)' },
      { transform: 'translateX(-6%)', offset: 0.08 },
      { transform: 'translateX(6%)', offset: 0.2 },
      { transform: 'translateX(-5%)', offset: 0.32 },
      { transform: 'translateX(4%)', offset: 0.44 },
      { transform: 'translateX(-2.5%)', offset: 0.58 },
      { transform: 'translateX(1.5%)', offset: 0.72 },
      { transform: 'translateX(-.6%)', offset: 0.86 },
      { transform: 'translateX(0)' },
    ],
  },
  // Pop up from below the ledge, settle with a squash, then one little hop.
  hello: {
    duration: 1500,
    easing: 'linear',
    keyframes: [
      { transform: 'translateY(80%) scale(.9, 1.08)', easing: 'cubic-bezier(.15,.75,.3,1)' },
      { transform: 'translateY(-6%) scale(.96, 1.05)', offset: 0.3, easing: 'cubic-bezier(.5,0,.6,1)' },
      { transform: 'translateY(0) scale(1.09, .9)', offset: 0.42, easing: 'cubic-bezier(.3,.7,.4,1)' },
      { transform: 'translateY(0) scale(1, 1)', offset: 0.54 },
      { transform: 'translateY(0) scale(1.06, .94)', offset: 0.62, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: 'translateY(-11%) scale(.96, 1.05)', offset: 0.75, easing: 'cubic-bezier(.6,0,.8,.4)' },
      { transform: 'translateY(0) scale(1.07, .93)', offset: 0.87, easing: 'ease-out' },
      { transform: 'translateY(0) scale(1, 1)' },
    ],
  },
  // Two fast turns that run out of steam.
  dizzy: {
    duration: 1150,
    easing: 'linear',
    keyframes: [
      { transform: 'rotateY(0) scale(1, 1)', easing: 'cubic-bezier(.4,0,.6,1)' },
      { transform: 'rotateY(380deg) scale(.95, 1.05)', offset: 0.45, easing: 'cubic-bezier(.2,.6,.3,1)' },
      { transform: 'rotateY(720deg) scale(1.06, .95)', offset: 0.85, easing: 'ease-in-out' },
      { transform: 'rotateY(720deg) scale(1, 1)' },
    ],
  },
  // Bounces like a dropped rubber ball: one real hop, then two smaller bounces, each
  // lower and quicker, squashing less on every landing. Ease-out going up, ease-in
  // coming down, so it hangs at the top. `.dp-actor` scales from its bottom edge, so
  // the squash presses into the floor. Played now and then by `playful` pals.
  'playful-hop': {
    duration: 1700,
    easing: 'linear',
    keyframes: [
      { transform: squashStretch(0, 1, 1), easing: 'cubic-bezier(.3,.6,.5,1)' },
      // crouch, then spring up stretched
      { transform: squashStretch(0, 1.12, 0.88), offset: 0.065, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: squashStretch(-3, 0.9, 1.12), offset: 0.088, easing: 'cubic-bezier(.2,.7,.4,1)' },
      // bounce 1: peak -20%
      { transform: squashStretch(-20, 0.97, 1.04), offset: 0.265, easing: 'cubic-bezier(.6,0,.8,.3)' },
      { transform: squashStretch(-2, 0.92, 1.1), offset: 0.418, easing: 'linear' },
      { transform: squashStretch(0, 1.16, 0.84), offset: 0.441, easing: 'cubic-bezier(.3,.7,.4,1)' },
      // bounce 2: peak -9%
      { transform: squashStretch(-1.5, 0.94, 1.07), offset: 0.465, easing: 'cubic-bezier(.2,.7,.4,1)' },
      { transform: squashStretch(-9, 0.98, 1.02), offset: 0.582, easing: 'cubic-bezier(.6,0,.8,.3)' },
      { transform: squashStretch(-1, 0.95, 1.06), offset: 0.688, easing: 'linear' },
      { transform: squashStretch(0, 1.1, 0.9), offset: 0.706, easing: 'cubic-bezier(.3,.7,.4,1)' },
      // bounce 3: peak -3.5%
      { transform: squashStretch(-1, 0.97, 1.04), offset: 0.726, easing: 'cubic-bezier(.2,.7,.4,1)' },
      { transform: squashStretch(-3.5, 0.99, 1.01), offset: 0.8, easing: 'cubic-bezier(.6,0,.8,.3)' },
      { transform: squashStretch(0, 1.05, 0.95), offset: 0.871, easing: 'ease-out' },
      // settle wobble
      { transform: squashStretch(0, 0.98, 1.02), offset: 0.918, easing: 'ease-in-out' },
      { transform: squashStretch(0, 1.01, 0.99), offset: 0.959, easing: 'ease-in-out' },
      { transform: squashStretch(0, 1, 1) },
    ],
  },
  // A small excited hop, then a quick "chomp" (squash and spring back) with a happy face.
  feed: {
    duration: 1000,
    easing: 'linear',
    keyframes: [
      { transform: squashStretch(0, 1, 1), easing: 'cubic-bezier(.3,.6,.5,1)' },
      { transform: squashStretch(0, 1.07, 0.93), offset: 0.1, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: squashStretch(-12, 0.95, 1.07), offset: 0.26, easing: 'cubic-bezier(.6,0,.9,.5)' },
      { transform: squashStretch(0, 1.08, 0.9), offset: 0.42, easing: 'cubic-bezier(.3,.7,.4,1)' },
      // the chomp: a quick squash toward the ground and a spring back
      { transform: 'scale(1.04, .88)', offset: 0.58 },
      { transform: 'scale(.94, 1.06)', offset: 0.72 },
      { transform: 'scale(1.03, .97)', offset: 0.84 },
      { transform: squashStretch(0, 1, 1) },
    ],
  },
  // The body's part of a wave (pal.wave()): a gentle rock while the hand waves.
  wave: {
    duration: 1200,
    easing: 'ease-in-out',
    keyframes: [
      { transform: 'rotate(0deg)' },
      { transform: 'rotate(-2.5deg)', offset: 0.25 },
      { transform: 'rotate(2deg)', offset: 0.5 },
      { transform: 'rotate(-1.5deg)', offset: 0.75 },
      { transform: 'rotate(0deg)' },
    ],
  },
  // "Oh, you're back!" (pal.startle()): a small, quick surprised jump.
  startle: {
    duration: 700,
    easing: 'linear',
    keyframes: [
      { transform: squashStretch(0, 1, 1), easing: 'cubic-bezier(.3,.6,.5,1)' },
      { transform: squashStretch(0, 1.06, 0.94), offset: 0.1, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: squashStretch(-9, 0.92, 1.1), offset: 0.34, easing: 'cubic-bezier(.6,0,.8,.4)' },
      { transform: squashStretch(0, 1.08, 0.92), offset: 0.6, easing: 'cubic-bezier(.3,.7,.4,1)' },
      { transform: squashStretch(0, 0.98, 1.02), offset: 0.8, easing: 'ease-in-out' },
      { transform: squashStretch(0, 1, 1) },
    ],
  },
  // A slow, soft squish while it's being petted (playful pals).
  pet: {
    duration: 900,
    easing: 'ease-in-out',
    keyframes: [
      { transform: 'scale(1, 1)' },
      { transform: 'scale(1.05, .95)', offset: 0.35 },
      { transform: 'scale(.98, 1.02)', offset: 0.7 },
      { transform: 'scale(1, 1)' },
    ],
  },
  // High five without hands (pal.highFive()): lean and hop toward that side.
  'high-five-left': towardSide(-1),
  'high-five-right': towardSide(1),
  // A big yawn (pal.yawn()): a slow stretch up, then a little slump back.
  yawn: {
    duration: 1400,
    easing: 'ease-in-out',
    keyframes: [
      { transform: squashStretch(0, 1, 1) },
      { transform: squashStretch(0, 0.96, 1.07), offset: 0.3 },
      { transform: squashStretch(0, 0.97, 1.06), offset: 0.6 },
      { transform: squashStretch(0, 1.03, 0.97), offset: 0.82 },
      { transform: squashStretch(0, 1, 1) },
    ],
  },
  // A hungry tummy rumbles (<dot-pal hungry>): a tiny wobble.
  grumble: {
    duration: 650,
    easing: 'ease-in-out',
    keyframes: [
      { transform: 'rotate(0deg) scale(1, 1)' },
      { transform: 'rotate(-2deg) scale(1.02, .98)', offset: 0.18 },
      { transform: 'rotate(2deg) scale(1.02, .98)', offset: 0.36 },
      { transform: 'rotate(-1.4deg) scale(1.01, .99)', offset: 0.54 },
      { transform: 'rotate(1deg) scale(1, 1)', offset: 0.72 },
      { transform: 'rotate(-.4deg) scale(1, 1)', offset: 0.86 },
      { transform: 'rotate(0deg) scale(1, 1)' },
    ],
  },
  // Hooray (pal.celebrate()): a big happy jump and a little second bounce.
  celebrate: {
    duration: 1100,
    easing: 'linear',
    keyframes: [
      { transform: squashStretch(0, 1, 1), easing: 'cubic-bezier(.3,.6,.5,1)' },
      { transform: squashStretch(0, 1.14, 0.86), offset: 0.12, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: squashStretch(-4, 0.88, 1.14), offset: 0.17, easing: 'cubic-bezier(.2,.7,.4,1)' },
      { transform: squashStretch(-26, 0.96, 1.05), offset: 0.4, easing: 'cubic-bezier(.6,0,.8,.3)' },
      { transform: squashStretch(-2, 0.92, 1.1), offset: 0.6, easing: 'linear' },
      { transform: squashStretch(0, 1.14, 0.86), offset: 0.64, easing: 'cubic-bezier(.3,.7,.4,1)' },
      { transform: squashStretch(-6, 0.97, 1.04), offset: 0.78, easing: 'cubic-bezier(.6,0,.8,.3)' },
      { transform: squashStretch(0, 1.05, 0.95), offset: 0.9, easing: 'ease-out' },
      { transform: squashStretch(0, 1, 1) },
    ],
  },
  // Nervous (pal.worry()): a small side-to-side shiver.
  worry: {
    duration: 700,
    easing: 'ease-in-out',
    keyframes: [
      { transform: shiver(0, 0, 1, 1) },
      { transform: shiver(-2, 0, 1.01, 0.99), offset: 0.12 },
      { transform: shiver(2, 0, 1.01, 0.99), offset: 0.25 },
      { transform: shiver(-2, 0, 1.01, 0.99), offset: 0.38 },
      { transform: shiver(1.6, 0, 1, 1), offset: 0.5 },
      { transform: shiver(-1.4, 0, 1, 1), offset: 0.62 },
      { transform: shiver(1, 0, 1, 1), offset: 0.75 },
      { transform: shiver(-0.5, 0, 1, 1), offset: 0.88 },
      { transform: shiver(0, 0, 1, 1) },
    ],
  },
  // Uh-oh (pal.alarm()): a startled jump, then a fast tremble (~0.75 s) that dies down.
  alarm: {
    duration: 1300,
    easing: 'linear',
    keyframes: [
      { transform: shiver(0, 0, 1, 1), easing: 'cubic-bezier(.3,.6,.5,1)' },
      { transform: shiver(0, 0, 1.08, 0.92), offset: 0.06, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: shiver(0, -10, 0.92, 1.1), offset: 0.2, easing: 'cubic-bezier(.6,0,.8,.4)' },
      { transform: shiver(0, 0, 1.1, 0.9), offset: 0.34, easing: 'cubic-bezier(.3,.7,.4,1)' },
      { transform: shiver(-3, 0, 1.02, 0.98), offset: 0.42 },
      { transform: shiver(3, 0, 1.02, 0.98), offset: 0.48 },
      { transform: shiver(-3, 0, 1.01, 0.99), offset: 0.54 },
      { transform: shiver(3, 0, 1.01, 0.99), offset: 0.6 },
      { transform: shiver(-2.5, 0, 1, 1), offset: 0.66 },
      { transform: shiver(2.5, 0, 1, 1), offset: 0.72 },
      { transform: shiver(-2, 0, 1, 1), offset: 0.78 },
      { transform: shiver(2, 0, 1, 1), offset: 0.84 },
      { transform: shiver(-1, 0, 1, 1), offset: 0.9 },
      { transform: shiver(0.5, 0, 1, 1), offset: 0.95 },
      { transform: shiver(0, 0, 1, 1) },
    ],
  },
};

// The playful hop for energy="sleepy" (lower, a touch slower) and energy="hyper"
// (higher, a touch quicker): the same bounce with its heights scaled.
for (const [name, height, time] of [['playful-hop-sleepy', 0.6, 1.1], ['playful-hop-hyper', 1.25, 0.92]]) {
  const base = actions['playful-hop'];
  actions[name] = {
    ...base,
    duration: Math.round(base.duration * time),
    keyframes: base.keyframes.map((f) => ({
      ...f,
      transform: f.transform.replace(/translateY\((-?[\d.]+)%\)/, (m, y) => `translateY(${+(y * height).toFixed(2)}%)`),
    })),
  };
}

/** Lean and hop toward a side (-1 left, 1 right), the "slap" at ~41 % (450 ms), then back. */
function towardSide(s) {
  const t = (x, y, deg, sx = 1, sy = 1) => `translateX(${x * s}%) translateY(${y}%) rotate(${deg * s}deg) scale(${sx}, ${sy})`;
  return {
    duration: 1100,
    easing: 'linear',
    keyframes: [
      { transform: t(0, 0, 0), easing: 'ease-out' },
      { transform: t(-2, 0, -2, 1.05, 0.95), offset: 0.15, easing: 'cubic-bezier(.2,.8,.3,1)' },
      { transform: t(6, -8, 6, 0.96, 1.05), offset: 0.41, easing: 'cubic-bezier(.6,0,.8,.4)' },
      { transform: t(4, 0, 3, 1.06, 0.94), offset: 0.6, easing: 'cubic-bezier(.3,.7,.4,1)' },
      { transform: t(1, 0, 1), offset: 0.85, easing: 'ease-in-out' },
      { transform: t(0, 0, 0) },
    ],
  };
}

/** Add (or replace) an action usable with `pal.play(name)`. */
export function registerAction(name, { keyframes, duration = 600, easing = 'ease-out', particles } = {}) {
  if (!name || !Array.isArray(keyframes)) {
    throw new TypeError('registerAction(name, { keyframes }) requires a keyframes array');
  }
  actions[name] = { keyframes, duration, easing, particles };
}
