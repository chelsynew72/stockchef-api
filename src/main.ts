import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);
  const port = config.get<number>('app.port') ?? 3000;
  const env  = config.get<string>('app.nodeEnv');

  app.use(helmet());
  app.use(compression());
  app.enableCors({ origin: env === 'production' ? process.env.FRONTEND_URL : '*' });
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true, transformOptions: { enableImplicitConversion: true } }));
  app.enableShutdownHooks();

  if (env !== 'production') {
    const doc = new DocumentBuilder()
      .setTitle('StockChef API').setDescription('Restaurant Inventory Management — NestJS + PostgreSQL + Redis + BullMQ').setVersion('1.0')
      .addBearerAuth().addTag('Auth').addTag('Categories').addTag('Suppliers').addTag('Items').addTag('Purchase Orders').addTag('Stock Movements').addTag('Sales').addTag('Reports').addTag('Health').build();
    SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, doc), { swaggerOptions: { persistAuthorization: true } });
    logger.log(`Swagger: http://localhost:${port}/docs`);
  }

  await app.listen(port);
  logger.log(`🍽️  StockChef API running on http://localhost:${port}/api/v1 [${env}]`);
}
bootstrap();
