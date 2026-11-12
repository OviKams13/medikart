import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import type { ApiError, ErrorCode } from './index';

const schema = readFileSync(new URL('./generated/schema.ts', import.meta.url), 'utf8');

describe('generated API types (4.15)', () => {
  it('ErrorCode is a union holding the catalog codes', () => {
    const code: ErrorCode = 'SLOT_TAKEN';
    // @ts-expect-error a code outside the catalog must not compile
    const invalid: ErrorCode = 'NOT_A_CODE';
    expect([code, invalid]).toHaveLength(2);
    for (const name of [
      'UNAUTHENTICATED',
      'VALIDATION_ERROR',
      'MALFORMED_REQUEST',
      'METHOD_NOT_ALLOWED',
    ]) {
      expect(schema).toContain(`"${name}"`);
    }
  });

  it('ApiError has the four fields, all required', () => {
    const error: ApiError = {
      code: 'VALIDATION_ERROR',
      message: 'x',
      details: [{ field: 'date', message: 'expected yyyy-MM-dd' }],
      traceId: 'a'.repeat(32),
    };
    // @ts-expect-error traceId is required
    const missing: ApiError = { code: 'FORBIDDEN', message: 'x', details: [] };
    expect([error, missing]).toHaveLength(2);
  });
});
