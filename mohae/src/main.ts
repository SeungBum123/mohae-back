import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as config from 'config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const serverConfig = config.get('server');
  const port = serverConfig.port;

  const app = await NestFactory.create(AppModule);
  await app.listen(port);
  Logger.log(`Start Run ${port}`);
}
bootstrap();
