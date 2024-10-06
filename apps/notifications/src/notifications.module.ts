import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from '@app/common';
import * as Joi from 'joi';
import { BullModule } from '@nestjs/bullmq';
import { MailConsumer } from './mail.consumer';
import { ChatGateway } from './chat.gateway';

@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          connection: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        }
      },
    }),
    BullModule.registerQueue({
      name: 'mail_queue',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: process.env.RUNNING_IN_DOCKER ? undefined : './apps/notifications/.env',
      validationSchema: Joi.object({
        HTTP_PORT: Joi.number().required(),
        EMAIL_SENDER_EMAIL: Joi.string().required(),
        EMAIL_PASSWORD: Joi.string().required(),
        EMAIL_SENDER_NAME: Joi.string().required(),
        EMAIL_SMTP_HOST: Joi.string().required(),
        EMAIL_SMTP_PORT: Joi.number().required(),
        EMAIL_USER: Joi.string().required(),
        REDIS_HOST: Joi.string().required(),
        REDIS_PORT: Joi.number().required(),
      }),
    }),
    LoggerModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, MailConsumer, ChatGateway],
})
export class NotificationsModule { }
