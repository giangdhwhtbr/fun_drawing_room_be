import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import * as cookieParser from 'cookie-parser';
import { Logger } from 'nestjs-pino';
import { AuthModule } from './auth.module';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create(AuthModule);
  const configService = app.get(ConfigService);
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.get('TCP_PORT'),
    },
  });
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  const logger = app.get(Logger);
  app.useLogger(logger);
  await app.startAllMicroservices();
  await app.listen(configService.get('HTTP_PORT'));
  const service = app.get(UsersService)
  await service.createAdminUser();
  logger.log(`TCP Listening on port ${configService.get('TCP_PORT')}`);
  logger.log(`HTTP Listening on port ${configService.get('HTTP_PORT')}`);
}
bootstrap();
