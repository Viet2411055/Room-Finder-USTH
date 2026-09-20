import { google } from 'googleapis';
import { env } from '../config/env.js';
import type { RenderedEmail } from './mail-template.js';

export interface MailProvider {
  send(to: string, message: RenderedEmail): Promise<void>;
}

const encodeHeader = (value: string) => `=?UTF-8?B?${Buffer.from(value).toString('base64')}?=`;

function multipartMessage(to: string, message: RenderedEmail) {
  const boundary = `roomfinder-${crypto.randomUUID()}`;
  return [
    `From: RoomFinder <${env.GMAIL_SENDER}>`,
    `To: ${to}`,
    `Subject: ${encodeHeader(message.subject)}`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(message.text).toString('base64'),
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(message.html).toString('base64'),
    `--${boundary}--`,
  ].join('\r\n');
}

export class GmailMailProvider implements MailProvider {
  async send(to: string, message: RenderedEmail) {
    if (!env.GMAIL_CLIENT_ID || !env.GMAIL_CLIENT_SECRET || !env.GMAIL_REFRESH_TOKEN || !env.GMAIL_SENDER) {
      throw new Error('Gmail OAuth2 is not configured');
    }
    const auth = new google.auth.OAuth2(env.GMAIL_CLIENT_ID, env.GMAIL_CLIENT_SECRET);
    auth.setCredentials({ refresh_token: env.GMAIL_REFRESH_TOKEN });
    const gmail = google.gmail({ version: 'v1', auth });
    const raw = Buffer.from(multipartMessage(to, message)).toString('base64url');
    await gmail.users.messages.send({ userId: 'me', requestBody: { raw } });
  }
}

export const gmailMailProvider = new GmailMailProvider();
