import { Module } from '@nestjs/common';
import { HistoricoRentabilidadeService } from './historico-rentabilidade.service';
import { HistoricoRentabilidadeController } from './historico-rentabilidade.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carteira } from 'src/carteira/entities/carteira.entity';
import { Transacao } from 'src/transacao/entities/transacao.entity';
import { HistoricoAtivo } from 'src/historico-ativos/entities/historico-ativo.entity';
import { HistoricoRentabilidade } from './entities/historico-rentabilidade.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([
      Carteira,
      Transacao,
      HistoricoAtivo,
      HistoricoRentabilidade 
    ])
  ],
  controllers: [HistoricoRentabilidadeController],
  providers: [HistoricoRentabilidadeService],
  exports :[HistoricoRentabilidadeService]
})
export class HistoricoRentabilidadeModule {}
