import { Module, forwardRef } from '@nestjs/common';
import { PosicaoService } from './posicao.service';
import { PosicaoController } from './posicao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posicao } from './entities/posicao.entity';
import { CarteiraModule } from 'src/carteira/carteira.module';
import { TransacaoModule } from 'src/transacao/transacao.module';
import { AtivoModule } from 'src/ativo/ativo.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Posicao]),
    forwardRef(() => CarteiraModule),
    forwardRef(() => AtivoModule),
    forwardRef(() => TransacaoModule),
  ],
  controllers: [PosicaoController],
  providers: [PosicaoService],
  exports: [
    PosicaoService,
    TypeOrmModule.forFeature([Posicao])
  ]
})
export class PosicaoModule { }
