import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq'
import { Inject, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config'
import { Job } from 'bullmq'
import * as nodemailer from 'nodemailer';

@Processor('mail_queue')
export class MailConsumer extends WorkerHost {
  protected readonly logger = new Logger(MailConsumer.name);

  constructor(
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {
    super();
  }

  private transporter = nodemailer.createTransport({
    host: this.configService.get('EMAIL_SMTP_HOST'),
    port: this.configService.get('EMAIL_SMTP_PORT'),
    secure: this.configService.get('EMAIL_SMTP_PORT') === '465',
    auth: {
      user: this.configService.get('EMAIL_USER'),
      pass: this.configService.get('EMAIL_PASSWORD'),
    },
  });

  async process(
    job: Job<{
      to: string
      subject: string
      html: string
      attachments?: any[]
    }>,
  ) {
    this.logger.debug(`Processing job ${job.id}`)
    try {
      const info = await this.transporter.sendMail({
        from: `"${this.configService.get('EMAIL_SENDER_NAME')}" <${this.configService.get('EMAIL_SENDER_EMAIL')}>`, // sender address
        ...job.data,
      })
      this.logger.log(`Message sent ${job.data.to} message ID ${info.messageId}`)
    } catch (error) {
      this.logger.error(error)
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed!`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job, err: Error) {
    this.logger.error(`Job ${job.id} failed:`, err);
  }
}
