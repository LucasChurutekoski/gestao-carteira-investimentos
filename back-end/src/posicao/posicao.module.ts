import { Module } from '@nestjs/common';
import { PosicaoService } from './posicao.service';
import { PosicaoController } from './posicao.controller';

@Module({
  controllers: [PosicaoController],
  providers: [PosicaoService],
})
export class PosicaoModule {}
