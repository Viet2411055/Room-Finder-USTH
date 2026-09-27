import express from 'express';
import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createListingRateLimiter } from './host.rate-limit.js';

describe('createListingRateLimiter', () => {
  it('rejects an immediate repeated create request from the same host', async () => {
    const app = express();
    app.post(
      '/host/listings',
      (req, _res, next) => {
        req.auth = { userId: 'host-rate-limit-test', role: 'HOST', sessionId: 'session-1' };
        next();
      },
      createListingRateLimiter,
      (_req, res) => res.status(201).json({ data: { id: 'listing-1' } }),
    );

    const first = await request(app).post('/host/listings');
    const repeated = await request(app).post('/host/listings');

    expect(first.status).toBe(201);
    expect(repeated.status).toBe(429);
    expect(repeated.body.error.code).toBe('RATE_LIMITED');
    expect(repeated.headers['retry-after']).toBeDefined();
  });

  it('does not consume the cooldown when listing validation fails', async () => {
    const app = express();
    let attempt = 0;
    app.post(
      '/host/listings',
      (req, _res, next) => {
        req.auth = { userId: 'host-validation-test', role: 'HOST', sessionId: 'session-2' };
        next();
      },
      createListingRateLimiter,
      (_req, res) => {
        attempt += 1;
        if (attempt === 1) return res.status(400).json({ error: { code: 'VALIDATION_ERROR' } });
        return res.status(201).json({ data: { id: 'listing-2' } });
      },
    );

    expect((await request(app).post('/host/listings')).status).toBe(400);
    expect((await request(app).post('/host/listings')).status).toBe(201);
  });
});
