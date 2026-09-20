import { app } from './app.js';
import { env } from './shared/config/env.js';
import { prisma } from './shared/database/prisma.js';
import { startEmailOutboxWorker } from './features/bookings/email-outbox.worker.js';

const server = app.listen(env.PORT, () => console.info(`RoomFinder API listening on :${env.PORT}`));
const stopEmailWorker = env.EMAIL_WORKER_ENABLED ? startEmailOutboxWorker() : () => {};
const completePastBookings = () => prisma.booking.updateMany({ where: { status: 'UPCOMING', checkOut: { lte: new Date() } }, data: { status: 'COMPLETED' } }).catch(console.error);
completePastBookings();
const timer = setInterval(completePastBookings, 60 * 60 * 1000);
async function shutdown() { clearInterval(timer); stopEmailWorker(); server.close(); await prisma.$disconnect(); process.exit(0); }
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
