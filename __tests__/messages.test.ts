import type { Message } from '@/types';
import { formatDaySeparator, formatMessageTime, groupMessagesByDay, shouldGroupWithPrevious } from '@/utils/messages';
const msg = (over: Partial<Message>): Message => ({ id: 'm', roomId: 'r', userId: 'u1', body: 'oi', createdAt: '2026-09-20T10:00:00Z', username: 'Ana', avatarColor: '#000', ...over });
describe('shouldGroupWithPrevious', () => {
  it('agrupa do mesmo autor dentro de 5 minutos', () => expect(shouldGroupWithPrevious(msg({ createdAt: '2026-09-20T10:04:00Z' }), msg({ createdAt: '2026-09-20T10:00:00Z' }))).toBe(true));
  it('não agrupa depois de 5 minutos', () => expect(shouldGroupWithPrevious(msg({ createdAt: '2026-09-20T10:06:00Z' }), msg({ createdAt: '2026-09-20T10:00:00Z' }))).toBe(false));
  it('não agrupa autores diferentes', () => expect(shouldGroupWithPrevious(msg({ userId: 'u2', createdAt: '2026-09-20T10:01:00Z' }), msg({ userId: 'u1' }))).toBe(false));
});
describe('formatDaySeparator', () => {
  const now = new Date('2026-09-20T15:00:00');
  it('reconhece hoje e ontem', () => { expect(formatDaySeparator('2026-09-20T09:00:00', now)).toBe('Hoje'); expect(formatDaySeparator('2026-09-19T09:00:00', now)).toBe('Ontem'); });
});
describe('groupMessagesByDay', () => {
  it('agrupa mantendo a ordem', () => {
    const now = new Date('2026-09-20T15:00:00');
    const sections = groupMessagesByDay([msg({ createdAt: '2026-09-19T09:00:00' }), msg({ createdAt: '2026-09-20T09:00:00' })], now);
    expect(sections.map((s) => s.label)).toEqual(['Ontem', 'Hoje']);
  });
});
