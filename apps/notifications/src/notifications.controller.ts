import { Controller, Logger, UsePipes, ValidationPipe } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { SendEmailDto } from './dto/send-mail.dto';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UsePipes(new ValidationPipe())
  @EventPattern('send_email')
  async notifyEmail(@Payload() data: SendEmailDto) {
    this.notificationsService.sendEmail(data);
  }
}
