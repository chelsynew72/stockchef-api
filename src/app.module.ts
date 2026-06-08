import { Module, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { BullModule } from '@nestjs/bull';
import { APP_GUARD, APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { appConfig, dbConfig, redisConfig, jwtConfig } from './config/app.config';
import { UserEntity } from './database/entities/user.entity';
import { CategoryEntity } from './database/entities/category.entity';
import { SupplierEntity } from './database/entities/supplier.entity';
import { ItemEntity } from './database/entities/item.entity';
import { PurchaseOrderEntity } from './database/entities/purchase-order.entity';
import { PurchaseOrderItemEntity } from './database/entities/purchase-order-item.entity';
import { StockMovementEntity } from './database/entities/stock-movement.entity';
import { SaleEntity } from './database/entities/sale.entity';
import { SaleItemEntity } from './database/entities/sale-item.entity';
import { AuthModule } from './modules/auth/auth.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { SuppliersModule } from './modules/suppliers/suppliers.module';
import { ItemsModule } from './modules/items/items.module';
import { PurchaseOrdersModule } from './modules/purchase-orders/purchase-orders.module';
import { StockMovementsModule } from './modules/stock-movements/stock-movements.module';
import { SalesModule } from './modules/sales/sales.module';
import { ReportsModule } from './modules/reports/reports.module';
import { HealthModule } from './modules/health/health.module';
import { QueueModule } from './queue/queue.module';
import { CorrelationIdMiddleware } from './common/middleware/correlation-id.middleware';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';

const ENTITIES = [UserEntity, CategoryEntity, SupplierEntity, ItemEntity, PurchaseOrderEntity, PurchaseOrderItemEntity, StockMovementEntity, SaleEntity, SaleItemEntity];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [appConfig, dbConfig, redisConfig, jwtConfig] }),
    TypeOrmModule.forRootAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ type: 'postgres', host: c.get('db.host'), port: c.get('db.port'), username: c.get('db.username'), password: c.get('db.password'), database: c.get('db.name'), entities: ENTITIES, synchronize: c.get('app.nodeEnv') !== 'production', logging: c.get('app.nodeEnv') === 'development' }) }),
    CacheModule.register({ isGlobal: true, ttl: 60, max: 500 }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
    BullModule.forRootAsync({ inject: [ConfigService], useFactory: (c: ConfigService) => ({ redis: { host: c.get('redis.host'), port: c.get('redis.port') } }) }),
    AuthModule, CategoriesModule, SuppliersModule, ItemsModule,
    PurchaseOrdersModule, StockMovementsModule, SalesModule,
    ReportsModule, HealthModule, QueueModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },
    { provide: APP_FILTER, useClass: GlobalExceptionFilter },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) { consumer.apply(CorrelationIdMiddleware).forRoutes('*'); }
}
