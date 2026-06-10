import { Processor, Process, OnQueueFailed, OnQueueCompleted } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
interface LowStockJob { itemId: string; itemName: string; quantity: number; minQuantity: number; unit: string }
@Processor('alerts')
export class AlertsProcessor {
  private readonly logger = new Logger(AlertsProcessor.name);
  @Process('low-stock')
  async handleLowStock(job: Job<LowStockJob>) {
    const { itemName, quantity, minQuantity, unit } = job.data;
    this.logger.warn(` LOW STOCK ALERT: "${itemName}" — ${quantity}${unit} remaining (reorder at ${minQuantity}${unit})`);
    // In production: send email/SMS/Slack notification here
    return { alerted: true };
  }
  @OnQueueCompleted() onCompleted(job: Job) { this.logger.debug(`Alert job #${job.id} done`); }
  @OnQueueFailed() onFailed(job: Job, err: Error) { this.logger.error(`Alert job #${job.id} failed: ${err.message}`); }
}
