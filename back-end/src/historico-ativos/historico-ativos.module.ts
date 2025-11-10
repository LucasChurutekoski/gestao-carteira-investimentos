import { Module } from '@nestjs/common';
import { HistoricoAtivosService } from './historico-ativos.service';
import { HistoricoAtivosController } from './historico-ativos.controller';

@Module({
  controllers: [HistoricoAtivosController],
  providers: [HistoricoAtivosService],
  exports : [HistoricoAtivosModule]
})
export class HistoricoAtivosModule {}
