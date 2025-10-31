import { Module } from '@nestjs/common';
import { PaymentClientService } from './payment-client.service';
import { PaymentClientController } from './payment-client.controller';

@Module({
  controllers: [PaymentClientController],
  providers: [PaymentClientService],
  exports: [PaymentClientService],
})
export class PaymentClientModule {}
