import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bullmq';
import { SendEmailDto } from './dto/send-mail.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectQueue('mail_queue') private mailQueue: Queue,
  ) {}

  async sendEmail({ to, subject, body }: SendEmailDto) {
    this.logger.log(`Sending email to ${to}`);
    await this.mailQueue.add('send_email',{ to, subject, html: body }, { attempts: 3, backoff: 5000 });
  }
}
