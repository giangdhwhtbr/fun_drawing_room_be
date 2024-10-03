import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { Logger } from 'nestjs-pino';
import { NotificationsModule } from './notifications.module';

async function bootstrap() {
  const app = await NestFactory.create(NotificationsModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.get('TCP_PORT'),
    },
  });
  const logger = app.get(Logger);
  app.useLogger(logger);
  await app.startAllMicroservices();
  await app.listen(configService.get('HTTP_PORT'))
  logger.log(`TCP Listening on port ${configService.get('TCP_PORT')}`);
  logger.log(`HTTP Listening on port ${configService.get('HTTP_PORT')}`);
}
bootstrap();
