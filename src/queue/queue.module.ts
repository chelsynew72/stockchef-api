import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { AlertsProcessor } from './alerts.processor';
@Module({ imports: [BullModule.registerQueue({ name: 'alerts' })], providers: [AlertsProcessor] })
export class QueueModule {}
