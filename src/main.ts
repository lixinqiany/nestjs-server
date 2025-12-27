import './warm-up';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { SERVER_PORT } from './constant';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(WINSTON_MODULE_NEST_PROVIDER));
  const logger = app.get(Logger);
  await app.listen(SERVER_PORT, () => {
    logger.log(`Server is running on port ${SERVER_PORT}`);
  });
}
void bootstrap();
