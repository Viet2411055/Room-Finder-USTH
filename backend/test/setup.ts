process.env.NODE_ENV = 'test';
process.env.DATABASE_URL ??= 'mysql://roomfinder:roomfinder@127.0.0.1:3306/roomfinder_test';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-at-least-32-characters';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-at-least-32-characters';
process.env.FRONTEND_ORIGIN ??= 'http://localhost:5173';
process.env.COOKIE_SECURE ??= 'false';
process.env.EMAIL_WORKER_ENABLED ??= 'false';
