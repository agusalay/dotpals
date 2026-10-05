import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createActivityLog } from '../bridge/activity.js';
import opencode, { applyOpenCode, describeTool, PLUGIN } from '../bridge/adapters/opencode.js';

test('describeTool: OpenCode tools', () => {
  const edit = describeTool('edit', { filePath: '/work/proj/a.js', oldString: 'x', newString: 'y' }, '/work/proj');
  assert.equal(edit.kind, 'edit');
  assert.equal(edit.title, 'a.js');
  assert.equal(describeTool('bash', { command: 'npm test' }).kind, 'run');
  const patch = describeTool('apply_patch', { patchText: '*** Begin Patch\n*** Add File: b.js\n+x\n*** End Patch' }, '/work/proj');
  assert.equal(patch.kind, 'write');
  assert.equal(patch.title, 'b.js');
  assert.equal(describeTool('todowrite', { todos: [{ content: 'a', status: 'completed', id: '1' }] }).plan[0].status, 'completed');
});

test('applyOpenCode: what the plugin sends, turned into a turn', () => {
  const log = createActivityLog();
  const cwd = '/work/proj';
  const p = applyOpenCode({ type: 'prompt', sessionID: 'ses_1', text: 'rename foo', cwd, at: 1000 }, log);
  assert.equal(p.session, 'opencode:ses_1');
  assert.equal(p.label, 'proj');
  assert.equal(p.entries[0].kind, 'prompt');

  applyOpenCode({ type: 'tool.before', sessionID: 'ses_1', callID: 'call_1', tool: 'bash', args: { command: 'npm test' }, cwd, at: 2000 }, log);
  const run = applyOpenCode({ type: 'tool.after', sessionID: 'ses_1', callID: 'call_1', tool: 'bash', title: 'npm test', output: 'ok', cwd, at: 3500 }, log).entries[0];
  assert.equal(run.status, 'ok');
  assert.equal(run.ms, 1500);

  applyOpenCode({ type: 'tool.before', sessionID: 'ses_1', callID: 'call_2', tool: 'edit', args: { filePath: '/work/proj/a.js', oldString: 'a', newString: 'b' }, cwd, at: 4000 }, log);
  applyOpenCode({ type: 'tool.error', sessionID: 'ses_1', callID: 'call_2', tool: 'edit', error: 'oldString not found', cwd, at: 4100 }, log);
  assert.equal(log.get('opencode:ses_1:call_2').status, 'failed');

  const idle = applyOpenCode({ type: 'event', event: { type: 'session.idle', properties: { sessionID: 'ses_1' } }, reply: 'Renamed it.', cwd, at: 5000 }, log);
  const done = idle.entries.find((e) => e.kind === 'done');
  assert.equal(done.summary, 'Renamed it.');
  assert.equal(done.ms, 4000);
  assert.equal(idle.state.state, 'done');

  // Idle again with nothing new: no second "Finished".
  const again = applyOpenCode({ type: 'event', event: { type: 'session.idle', properties: { sessionID: 'ses_1' } }, cwd, at: 6000 }, log);
  assert.equal(again.entries.length, 0);
});

test('the plugin posts what it sees, and never throws', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dotpals-oc-plugin-'));
  const file = join(dir, 'dotpals.mjs');
  await writeFile(file, PLUGIN);
  const sent = [];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => { sent.push({ url, body: JSON.parse(init.body) }); return new Response('{}'); };
  try {
    const mod = await import(`file:///${file.replace(/\\/g, '/')}`);
    assert.deepEqual(Object.keys(mod), ['DotpalsPlugin'], 'OpenCode loads every export as a plugin');
    const hooks = await mod.DotpalsPlugin({ directory: '/work/proj', worktree: '/work/proj' }, { url: 'http://127.0.0.1:1/hook' });
    await hooks['chat.message']({ sessionID: 's' }, { message: {}, parts: [{ type: 'text', text: 'hi' }, { type: 'text', text: 'ctx', synthetic: true }] });
    await hooks['tool.execute.before']({ tool: 'bash', sessionID: 's', callID: 'c' }, { args: { command: 'ls' } });
    await hooks.event({ event: { type: 'message.part.updated', properties: { sessionID: 's', part: { type: 'text', text: 'All done.' } } } });
    await hooks.event({ event: { type: 'session.idle', properties: { sessionID: 's' } } });
    await hooks.event({ event: { type: 'lsp.updated', properties: {} } });
    await hooks['tool.execute.after'](null, null); // bad input is swallowed
    assert.equal(sent.length, 3);
    assert.equal(sent[0].url, 'http://127.0.0.1:1/hook?agent=opencode');
    assert.deepEqual([sent[0].body.type, sent[0].body.text, sent[0].body.cwd], ['prompt', 'hi', '/work/proj']);
    assert.deepEqual(sent[1].body.args, { command: 'ls' });
    assert.equal(sent[2].body.reply, 'All done.');
  } finally {
    globalThis.fetch = realFetch;
    await rm(dir, { recursive: true, force: true });
  }
});

test('the plugin reports permission requests and applies an answer from the pal', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'dotpals-oc-plugin-'));
  const file = join(dir, 'dotpals.mjs');
  await writeFile(file, PLUGIN);
  const sent = [];
  const polls = [];
  const replies = [];
  let answer = null; // what /api/oc-answers hands out on the next poll
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, init) => {
    const body = JSON.parse(init.body);
    if (String(url).endsWith('/api/oc-answers')) {
      polls.push({ url: String(url), headers: init.headers, body });
      const out = answer ?? {};
      answer = null;
      return new Response(JSON.stringify({ answers: out }));
    }
    sent.push(body);
    return new Response('{}');
  };
  const client = { permission: { reply: async (args) => { replies.push(args); return { data: true }; } } };
  try {
    const mod = await import(`file:///${file.replace(/\\/g, '/')}`);
    const hooks = await mod.DotpalsPlugin({ directory: '/work/proj', worktree: '/work/proj', client, serverUrl: new URL('http://127.0.0.1:4096') }, { url: 'http://127.0.0.1:1/hook' });
    await hooks.event({ event: { type: 'permission.asked', properties: { id: 'per_1', sessionID: 's', permission: 'bash', patterns: ['npm test'], always: ['npm *'] } } });
    const ask = sent.find((b) => b.type === 'ask');
    assert.deepEqual([ask.kind, ask.id, ask.sessionID, ask.permission, ask.canAlways], ['permission', 'per_1', 's', 'bash', true]);
    assert.deepEqual(ask.patterns, ['npm test']);
    assert.ok(sent.some((b) => b.type === 'event' && b.event.type === 'permission.asked'), 'still reported as activity too');

    answer = { per_1: { kind: 'permission', reply: 'once' } };
    for (let i = 0; i < 30 && !replies.length; i++) await new Promise((r) => setTimeout(r, 100));
    assert.equal(polls[0].url, 'http://127.0.0.1:1/api/oc-answers');
    assert.equal(polls[0].headers['x-dotpals'], '1');
    assert.deepEqual(polls[0].body, { ids: ['per_1'] });
    assert.deepEqual(replies, [{ requestID: 'per_1', reply: 'once', directory: '/work/proj' }]);

    await hooks.event({ event: { type: 'question.replied', properties: { sessionID: 's', requestID: 'que_1' } } });
    assert.deepEqual(sent.at(-1), { type: 'ask.done', id: 'que_1', sessionID: 's', cwd: '/work/proj', at: sent.at(-1).at });
    const count = polls.length;
    await new Promise((r) => setTimeout(r, 1300));
    assert.ok(polls.length <= count + 1, 'stops polling once nothing is pending');
  } finally {
    globalThis.fetch = realFetch;
    await rm(dir, { recursive: true, force: true });
  }
});

test('OpenCode connect writes the plugin and disconnect puts back what was there', async (t) => {
  const dir = await mkdtemp(join(tmpdir(), 'dotpals-oc-'));
  process.env.DOTPALS_OPENCODE_DIR = dir;
  t.after(async () => { delete process.env.DOTPALS_OPENCODE_DIR; await rm(dir, { recursive: true, force: true }); });
  const file = join(dir, 'plugins', 'dotpals.js');
  assert.equal(opencode.connected(), false);
  opencode.connect();
  assert.equal(opencode.connected(), true);
  assert.equal(await readFile(file, 'utf8'), PLUGIN);
  opencode.disconnect();
  assert.equal(existsSync(file), false);

  // Someone else's file with the same name is backed up, then restored.
  await mkdir(join(dir, 'plugins'), { recursive: true });
  await writeFile(file, 'export const Other = async () => ({})\n');
  opencode.connect();
  assert.equal(opencode.connected(), true);
  opencode.disconnect();
  assert.equal(await readFile(file, 'utf8'), 'export const Other = async () => ({})\n');
});
