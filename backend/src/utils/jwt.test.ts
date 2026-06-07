import { describe, it, expect } from 'vitest';
import { sign, verify, base64UrlEncode } from './jwt';
import { Env } from '../types';

const mockEnv: Env = {
  DB: {} as any,
  JWT_SECRET: 'test-secret',
};

describe('JWT', () => {
  it('signs and verifies a valid token', async () => {
    const token = await sign({ sub: 1, role: 'user' }, mockEnv);
    const payload = await verify(token, mockEnv);
    expect(payload).not.toBeNull();
    expect(payload!.sub).toBe(1);
    expect(payload!.role).toBe('user');
  });

  it('rejects token with wrong secret', async () => {
    const token = await sign({ sub: 1, role: 'user' }, mockEnv);
    const wrongEnv: Env = { ...mockEnv, JWT_SECRET: 'wrong-secret' };
    const payload = await verify(token, wrongEnv);
    expect(payload).toBeNull();
  });

  it('rejects tampered token', async () => {
    const token = await sign({ sub: 1, role: 'user' }, mockEnv);
    const parts = token.split('.');
    const tampered = [parts[0], parts[1], 'invalidsig'].join('.');
    const payload = await verify(tampered, mockEnv);
    expect(payload).toBeNull();
  });

  it('base64UrlEncode handles various inputs', () => {
    const enc = base64UrlEncode(new TextEncoder().encode('hello'));
    expect(enc).toBe('aGVsbG8');
  });
});
