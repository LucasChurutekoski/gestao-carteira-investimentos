import { forwardRef, Module } from '@nestjs/common';
import { TransacaoService } from './transacao.service';
import { TransacaoController } from './transacao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Transacao } from './entities/transacao.entity';
import { CarteiraModule } from 'src/carteira/carteira.module';
import { AtivoModule } from 'src/ativo/ativo.module';
import { HistoricoRentabilidadeService } from 'src/historico-rentabilidade/historico-rentabilidade.service';


@Module({
  imports: [
    TypeOrmModule.forFeature([Transacao]),
    forwardRef(() => AtivoModule),
    forwardRef(() => CarteiraModule),
    
  ],
  controllers: [TransacaoController],
  providers: [TransacaoService, HistoricoRentabilidadeService],
  exports: [TransacaoService, TypeOrmModule.forFeature([Transacao])],
})
export class TransacaoModule { }
