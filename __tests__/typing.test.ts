import { formatTypingIndicator } from '@/utils/typing';
describe('formatTypingIndicator', () => {
  it('ninguém digitando', () => expect(formatTypingIndicator([])).toBe(''));
  it('uma pessoa', () => expect(formatTypingIndicator(['Ana'])).toBe('Ana está digitando...'));
  it('duas pessoas', () => expect(formatTypingIndicator(['Ana', 'Bruno'])).toBe('Ana e Bruno estão digitando...'));
  it('três ou mais', () => expect(formatTypingIndicator(['Ana', 'Bruno', 'Carlos'])).toBe('Várias pessoas estão digitando...'));
});
