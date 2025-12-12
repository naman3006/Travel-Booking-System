import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter<SMTPTransport.SentMessageInfo>;

  private logger = new Logger(MailService.name);

  private usingEthereal = false;

  constructor() {
    this.init().catch((err) => this.logger.error(err));
  }

  private async init() {
    // 🔹 Force Ethereal for testing
    const useEthereal = true;

    if (useEthereal) {
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: testAccount.smtp.secure,
        auth: { user: testAccount.user, pass: testAccount.pass },
      });

      this.usingEthereal = true;
      this.logger.log(`✅ Using Ethereal account: ${testAccount.user}`);
      return;
    }

    // otherwise use SMTP
    const host = process.env.SMTP_HOST;
    this.transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    } as SMTPTransport.Options);
  }

  async sendMail(to: string, subject: string, html: string, text?: string) {
    const from = process.env.EMAIL_FROM || 'Admin@gmail.com';

    const info = await this.transporter.sendMail({
      from,
      to,
      subject,
      html,
      text,
    });

    this.logger.log(`Mail sent to ${to}; messageId=${info.messageId}`);

    if (this.usingEthereal) {
      const preview = nodemailer.getTestMessageUrl(info);

      this.logger.log(`Preview URL: ${preview}`);

      // return { messageId: info.messageId, previewUrl: preview };
      return { success: true, messageId: info.messageId, previewUrl: preview };
    }

    return { success: true, messageId: info.messageId };
  }
}
