import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from './app.js';

describe('RoomFinder REST contract', () => {
  it('reports the v1 health contract', async () => {
    const response = await request(app).get('/api/v1/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ data: { status: 'ok' } });
  });

  it('protects authenticated traveler resources', async () => {
    const response = await request(app).get('/api/v1/trips');
    expect(response.status).toBe(401);
    expect(response.body.error.code).toBe('UNAUTHENTICATED');
  });

  it('keeps the versioned not-found envelope', async () => {
    const response = await request(app).get('/api/v1/does-not-exist');
    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });
});
