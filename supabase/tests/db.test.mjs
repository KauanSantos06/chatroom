import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { after, before, describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { PGlite } from '@electric-sql/pglite';

const SUPABASE = fileURLToPath(new URL('../', import.meta.url));
const ALICE = '11111111-1111-1111-1111-111111111111';
const BOB = '22222222-2222-2222-2222-222222222222';
const CARL = '33333333-3333-3333-3333-333333333333';

const SUPABASE_STUBS = `
create schema auth;
create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb not null default '{}'::jsonb);
create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
create role anon nologin;
create role authenticated nologin;
grant usage on schema public, auth to anon, authenticated;
`;

let db;
before(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_STUBS);
  const schema = readFileSync(`${SUPABASE}/schema.sql`, 'utf8').replace('alter publication supabase_realtime add table public.messages;', '');
  await db.exec(schema);
  await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'ana@x.com', '{"full_name": "Ana Souza"}')`, [ALICE]);
  await db.query(`insert into auth.users (id, email, raw_user_meta_data) values ($1, 'bob@x.com', '{"full_name": "Bob"}')`, [BOB]);
  await db.query(`insert into auth.users (id, email) values ($1, 'carl@x.com')`, [CARL]);
});
after(async () => { await db.close(); });

async function as(uid, fn) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub', '${uid ?? ''}', false);`);
  try { return await fn(); } finally { await db.exec(`reset role; select set_config('request.jwt.claim.sub', '', false);`); }
}
const one = async (sql, params = []) => (await db.query(sql, params)).rows[0];
const rows = async (sql, params = []) => (await db.query(sql, params)).rows;

async function createRoom(uid, name = 'Sala geral') {
  return as(uid, async () => {
    const row = await one('insert into rooms (name, created_by) values ($1, $2) returning id', [name, uid]);
    await db.query('insert into room_members (room_id, user_id) values ($1, $2)', [row.id, uid]);
    return row.id;
  });
}
const join = (uid, roomId) => as(uid, () => db.query('insert into room_members (room_id, user_id) values ($1, $2)', [roomId, uid]));
const send = (uid, roomId, body) => as(uid, async () => (await one('insert into messages (room_id, user_id, body) values ($1, $2, $3) returning id', [roomId, uid, body])).id);

describe('perfis', () => {
  it('cria um perfil para cada usuário cadastrado', async () => {
    assert.equal((await one('select username from profiles where id = $1', [ALICE])).username, 'Ana Souza');
    assert.equal((await one('select username from profiles where id = $1', [CARL])).username, 'carl');
  });
  it('qualquer usuário logado lê os perfis, mas só atualiza o próprio', async () => {
    assert.equal((await as(BOB, () => rows('select id from profiles'))).length, 3);
    await as(ALICE, () => db.query("update profiles set username = 'Ana A.' where id = $1", [ALICE]));
    await as(BOB, () => db.query("update profiles set username = 'hack' where id = $1", [ALICE]));
    assert.equal((await one('select username from profiles where id = $1', [ALICE])).username, 'Ana A.');
  });
});
describe('salas', () => {
  it('qualquer usuário cria e já entra', async () => {
    const roomId = await createRoom(ALICE, 'Fãs de React');
    assert.equal((await one('select name from rooms where id = $1', [roomId])).name, 'Fãs de React');
    assert.equal(Number((await one('select count(*) c from room_members where room_id = $1', [roomId])).c), 1);
  });
});
describe('mensagens', () => {
  it('só um membro envia e lê', async () => {
    const roomId = await createRoom(ALICE);
    await send(ALICE, roomId, 'Olá!');
    await assert.rejects(send(BOB, roomId, 'Posso?'), /row-level security/);
    await join(BOB, roomId);
    await send(BOB, roomId, 'Agora sim!');
    assert.equal(Number((await one('select count(*) c from messages where room_id = $1', [roomId])).c), 2);
  });
});
