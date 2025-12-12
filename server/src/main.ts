/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import rawbody from 'raw-body';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: false }),
  );

  app.use('/payments/webhook', async (req, next) => {
    if (req.originalUrl.startsWith('/payments/webhook')) {
      req['rawBody'] = await rawbody(req);
    }
    next();
  });

  app.enableCors({
    origin: 'http://localhost:3000', // your React port
    credentials: true,
  });

  await app.listen(5000);
  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
