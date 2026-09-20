import { AppError } from '../errors/app-error.js';
import { gmailMailProvider, type MailProvider } from './mail-provider.js';
import { renderTransactionalEmail, type TransactionalEmailInput } from './mail-template.js';

export async function sendTransactionalEmail(to: string, input: TransactionalEmailInput, provider: MailProvider = gmailMailProvider) {
  try {
    await provider.send(to, renderTransactionalEmail(input));
  } catch {
    console.error('[mail] Transactional email delivery failed');
    throw new AppError(503, 'EMAIL_DELIVERY_FAILED', 'Không thể gửi email lúc này. Vui lòng thử lại sau');
  }
}
