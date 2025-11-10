import { Module } from '@nestjs/common';
import { HistoricoRentabilidadeService } from './historico-rentabilidade.service';
import { HistoricoRentabilidadeController } from './historico-rentabilidade.controller';

@Module({
  controllers: [HistoricoRentabilidadeController],
  providers: [HistoricoRentabilidadeService],
})
export class HistoricoRentabilidadeModule {}
