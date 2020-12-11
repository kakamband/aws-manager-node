import { NestFactory } from '@nestjs/core';
// import { NestFastifyApplication, FastifyAdapter } from '@nestjs/platform-fastify';
import { join } from 'path';

import { AppModule } from './app.module';

async function bootstrap() {

  /* 
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.useStaticAssets({
    root: join(__dirname, '..', 'public'),
    prefix: '/public/',
  });
  app.setViewEngine({
    engine: {
      handlebars: require('handlebars'),
    },
    templates: join(__dirname, '..', 'views'),
  });
  */

  const app = await NestFactory.create(AppModule, {
    logger: console,
    abortOnError: false,
    cors: true,
    bodyParser: true
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
