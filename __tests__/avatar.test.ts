import { colorForId, initials } from '@/utils/avatar';
describe('colorForId', () => {
  it('é determinística', () => expect(colorForId('abc')).toBe(colorForId('abc')));
});
describe('initials', () => {
  it('extrai as iniciais', () => { expect(initials('Ana Souza')).toBe('AS'); expect(initials('ana')).toBe('A'); expect(initials('')).toBe('?'); });
});
