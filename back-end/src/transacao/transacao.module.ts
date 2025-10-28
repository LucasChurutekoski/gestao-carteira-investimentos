import { Module } from '@nestjs/common';
import { TransacaoService } from './transacao.service';
import { TransacaoController } from './transacao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transacao } from './entities/transacao.entity';
import { CarteiraModule } from 'src/carteira/carteira.module';
import { AtivoModule } from 'src/ativo/ativo.module';


@Module({
  imports : [
    TypeOrmModule.forFeature([Transacao]),
    CarteiraModule, AtivoModule
  ],
  controllers: [TransacaoController],
  providers: [TransacaoService],
})
export class TransacaoModule {}
