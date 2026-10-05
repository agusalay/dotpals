import { test, mock } from 'node:test';
import assert from 'node:assert/strict';
import { DotPal, WEARS, headAnchor, hatSVG, shadesSVG, browsSVG, wantsYawns, wantsGrumbles, ARM_MOVES } from '../src/element.js';
import { characters } from '../src/characters.js';
import { actions } from '../src/actions.js';
import { buildCharacter, CUSTOM_OPTIONS } from '../src/custom.js';

const clean = (svg, what) => assert.ok(!/NaN|undefined|Infinity/.test(svg), `${what}: ${svg}`);
/** Every tag that opens also closes, in order. */
function balanced(svg) {
  const open = [];
  for (const [, close, tag, self] of svg.matchAll(/<(\/?)([a-zA-Z]+)[^>]*?(\/?)>/g)) {
    if (self) continue;
    if (!close) open.push(tag);
    else if (open.pop() !== tag) return false;
  }
  return open.length === 0;
}

test('new reactions and energy hops ascend and end on their first keyframe', () => {
  for (const name of ['yawn', 'grumble', 'celebrate', 'worry', 'alarm', 'playful-hop-sleepy', 'playful-hop-hyper']) {
    const a = actions[name];
    assert.ok(a && a.keyframes.length > 2 && a.duration > 0, name);
    const offsets = a.keyframes.map((k) => k.offset).filter((o) => o != null);
    for (let i = 1; i < offsets.length; i++) assert.ok(offsets[i] > offsets[i - 1], name);
    assert.ok(offsets.every((o) => o > 0 && o < 1), `${name}: offsets inside (0, 1)`);
    assert.equal(a.keyframes.at(-1).transform, a.keyframes[0].transform, `${name} settles`);
  }
  // Sleepy hops lower, hyper higher, both from the same ball bounce.
  const peak = (n) => Math.min(...actions[n].keyframes.map((k) => +/translateY\((-?[\d.]+)%\)/.exec(k.transform)[1]));
  assert.ok(peak('playful-hop-sleepy') > peak('playful-hop') && peak('playful-hop') > peak('playful-hop-hyper'));
  assert.equal(actions['playful-hop-sleepy'].keyframes.length, actions['playful-hop'].keyframes.length);
  assert.equal(ARM_MOVES.cheer.at(-1).transform, ARM_MOVES.cheer[0].transform, 'the cheer comes back down');
});

test('every character and custom shape says where its head is, and hats, sunglasses and brows draw cleanly', () => {
  const defs = [
    ...Object.entries(characters),
    ...Object.keys(CUSTOM_OPTIONS.shape).map((s) => [`custom ${s}`, buildCharacter({ shape: s })]),
  ];
  for (const [name, def] of defs) {
    assert.ok(def.head, `${name} has a head anchor`);
    const [x, y, w] = headAnchor(def);
    assert.ok(x > 40 && x < 160 && y > 20 && y < 120 && w > 40 && w < 160, `${name}: ${def.head}`);
    for (const kind of WEARS) {
      const svg = kind === 'sunglasses' ? shadesSVG(def.eyes) : hatSVG(kind, def);
      assert.ok(svg, `${name} wears ${kind}`);
      clean(svg, `${name} ${kind}`);
      assert.ok(balanced(svg), `${name} ${kind}: tags close`);
    }
    const brows = browsSVG(def.eyes);
    clean(brows, `${name} brows`);
    assert.ok(balanced(brows), `${name} brows: tags close`);
  }
  // Anything else draws nothing.
  for (const kind of ['', 'nonsense', 'toString', 'sunglasses', undefined]) assert.equal(hatSVG(kind, characters.blu), '', String(kind));
  assert.equal(shadesSVG(null), '');
  assert.deepEqual(headAnchor({}), [100, 72, 110]);
  assert.deepEqual(headAnchor({ head: [1, NaN, 3] }), [100, 72, 110]);
});

// No DOM: a stand-in shadow root (a bubble that keeps its text and classes) and
// attributes, enough to construct a DotPal and drive say() and its idle timers.
function fakePal() {
  // The bubble has no animate(), so a new line swaps in at once (as with reduced
  // motion) instead of after its pop-out animation; everything else can animate.
  const node = (sel) => {
    const classes = new Set();
    return {
      addEventListener() {}, textContent: '', childElementCount: 0, hidden: true,
      // Like a real element: new HTML replaces the old text.
      _html: '', get innerHTML() { return this._html; }, set innerHTML(v) { this._html = v; this.textContent = ''; },
      ...(sel === '.dp-bubble' ? {} : { animate: () => ({ finished: Promise.resolve(), cancel() {} }) }),
      style: { setProperty() {} },
      classList: { add: (c) => classes.add(c), remove: (c) => classes.delete(c), contains: (c) => classes.has(c), toggle() {} },
    };
  };
  const parts = new Map();
  class Fake extends DotPal {
    attrs = new Map();
    get isConnected() { return true; }
    attachShadow() { return { set innerHTML(v) {}, querySelector: (sel) => parts.get(sel) ?? parts.set(sel, node(sel)).get(sel) }; }
    addEventListener() {}
    dispatchEvent() { return true; }
    hasAttribute(n) { return this.attrs.has(n); }
    getAttribute(n) { return this.attrs.get(n) ?? null; }
    setAttribute(n, v) { const old = this.getAttribute(n); this.attrs.set(n, String(v)); this.attributeChangedCallback(n, old, String(v)); }
    removeAttribute(n) { const old = this.getAttribute(n); this.attrs.delete(n); this.attributeChangedCallback(n, old, null); }
    toggleAttribute(n, on) { on ? this.setAttribute(n, '') : this.removeAttribute(n); }
    get bubbleText() { const b = parts.get('.dp-bubble'); return b.classList.contains('dp-show') ? b.textContent : ''; }
  }
  return new Fake();
}

test('say priority: a priority line is not replaced by a plain one, which shows right after it', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
  globalThis.requestAnimationFrame ??= () => 0; // the bubble's edge fitting, not under test
  const pal = fakePal();

  // Without priority, nothing changed: each line replaces the last at once.
  pal.say('one', { duration: 1000 });
  pal.say('two', { duration: 1000 });
  assert.equal(pal.bubbleText, 'two');
  t.mock.timers.tick(1000);
  assert.equal(pal.bubbleText, '');

  // A priority line holds; plain lines meanwhile wait, and the last one wins.
  pal.say('Welcome back!', { duration: 2000, priority: true });
  pal.say('Reading files', { duration: 1500 });
  pal.say('Editing app.js', { duration: 1500 });
  assert.equal(pal.bubbleText, 'Welcome back!');
  t.mock.timers.tick(1999);
  assert.equal(pal.bubbleText, 'Welcome back!');
  t.mock.timers.tick(1);
  assert.equal(pal.bubbleText, 'Editing app.js');
  // The hold is over: plain lines replace each other again.
  pal.say('Running tests', { duration: 1500 });
  assert.equal(pal.bubbleText, 'Running tests');
  t.mock.timers.tick(1500);
  assert.equal(pal.bubbleText, '');

  // say('') clears the hold and what was waiting.
  pal.say('Hi!', { duration: 2000, priority: true });
  pal.say('waiting line', { duration: 1000 });
  pal.say('');
  assert.equal(pal.bubbleText, '');
  pal.say('next', { duration: 1000 });
  assert.equal(pal.bubbleText, 'next', 'no hold left');
  t.mock.timers.tick(5000);
  assert.equal(pal.bubbleText, '', 'and nothing held came back');
});

test('say priority: a state change with no text waits too, instead of clearing the line', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval', 'Date'] }); // working starts the sweat interval
  globalThis.requestAnimationFrame ??= () => 0;
  globalThis.getComputedStyle ??= () => ({ transform: 'none' }); // the mood blend, not under test
  const pal = fakePal();
  pal.say('Careful: rm -rf src!', { duration: 2000, priority: true });
  pal.setState('working'); // no text: it would have cleared the bubble
  assert.equal(pal.bubbleText, 'Careful: rm -rf src!');
  t.mock.timers.tick(1999);
  assert.equal(pal.bubbleText, 'Careful: rm -rf src!');
  t.mock.timers.tick(1);
  assert.equal(pal.bubbleText, '', 'the state applies once the line ends: the working bar, no text');
});

test('energy, hungry and wear are opt-in: no yawn or rumble timers on a plain pal, none while static', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const pal = fakePal();
  assert.equal(pal.energy, 'normal');
  assert.equal(pal.hungry, false);
  assert.equal(pal.wear, '');
  assert.deepEqual(pal._extrasScheduled, { yawn: false, grumble: false }, 'a plain pal has none');

  pal.energy = 'sleepy';
  assert.equal(pal.energy, 'sleepy');
  assert.equal(pal._extrasScheduled.yawn, true, 'sleepy yawns now and then');
  assert.equal(pal._hopScheduled, false, 'and still no hop without playful');
  pal.hungry = true;
  assert.equal(pal._extrasScheduled.grumble, true, 'hungry rumbles now and then');

  pal.static = true;
  assert.deepEqual(pal._extrasScheduled, { yawn: false, grumble: false }, 'static stops both');
  pal.static = false;
  assert.deepEqual(pal._extrasScheduled, { yawn: true, grumble: true }, 'and lets them go again');

  pal.energy = 'normal';
  assert.equal(pal.getAttribute('energy'), null, "'normal' removes the attribute");
  assert.equal(pal._extrasScheduled.yawn, false);
  pal.hungry = false;
  assert.equal(pal._extrasScheduled.grumble, false);

  const quiet = fakePal();
  quiet.static = true;
  quiet.energy = 'sleepy';
  quiet.hungry = true;
  assert.deepEqual(quiet._extrasScheduled, { yawn: false, grumble: false }, 'a static pal never yawns or rumbles');
  assert.equal(wantsYawns(quiet), false);
  assert.equal(wantsGrumbles(quiet), false);
  assert.equal(wantsYawns(null), false);

  // Unknown values read as the defaults.
  quiet.setAttribute('energy', 'loud');
  assert.equal(quiet.energy, 'normal');
  quiet.setAttribute('wear', 'cape');
  assert.equal(quiet.wear, '');
  quiet.wear = 'crown';
  assert.equal(quiet.wear, 'crown');
  quiet.wear = '';
  assert.equal(quiet.getAttribute('wear'), null);
});

test('feed() clears hungry and tells the page', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  globalThis.requestAnimationFrame ??= () => 0;
  const pal = fakePal();
  const events = [];
  pal.dispatchEvent = (e) => { events.push(e.type); return true; };
  pal.hungry = true;
  pal.feed();
  assert.equal(pal.hungry, false);
  assert.ok(events.includes('dotpal-fed'));
});
