import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transaction } from '../../domain/entities/transaction.entity';
import { User } from '../../domain/entities/user.entity';
import { TransactionService } from '../../domain/services/transaction.service';
import { CreateTransactionUseCase } from '../../use-cases/transaction/create-transaction.use-case';
import { GetTransactionHistoryUseCase } from '../../use-cases/transaction/get-transaction-history.use-case';
import { TransactionController } from '../../presentation/controllers/transaction.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, User])],
  controllers: [TransactionController],
  providers: [
    TransactionService,
    CreateTransactionUseCase,
    GetTransactionHistoryUseCase,
  ],
  exports: [
    TransactionService,
    CreateTransactionUseCase,
    GetTransactionHistoryUseCase,
  ],
})
export class TransactionModule {}
