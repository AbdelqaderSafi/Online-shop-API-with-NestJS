import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggingInterceptor } from './interceptor/logging.interceptor';
import { ResponseInterceptor } from './interceptor/response.interceptor';
import {
  HttpExceptionFilter,
  PrismaExceptionFilter,
  UncaughtExceptionFilter,
  ZodExceptionFilter,
} from './exceptions/exception';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

BigInt.prototype.toJSON = function () {
  return this.toString();
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalInterceptors(
    new LoggingInterceptor(),
    new ResponseInterceptor(),
  );

  app.useGlobalFilters(
    new UncaughtExceptionFilter(), // global uncaught exception filter, should be last
    new HttpExceptionFilter(),
    new PrismaExceptionFilter(),
    new ZodExceptionFilter(),
    // الترتيب مهم
  );
  const config = new DocumentBuilder()
    .setTitle('Online Shop')
    .setDescription('The Online Shop API description')
    .setVersion('1.0')
    .addTag('online-shop')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  console.log('Environment:', process.env.NODE_ENV);
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
