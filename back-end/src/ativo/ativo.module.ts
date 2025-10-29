import { forwardRef, Module } from '@nestjs/common';
import { AtivoService } from './ativo.service';
import { AtivoController } from './ativo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { HttpModule } from '@nestjs/axios';
import { PosicaoModule } from 'src/posicao/posicao.module';
import { TransacaoModule } from 'src/transacao/transacao.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Ativo]),
    HttpModule,
    forwardRef(() => PosicaoModule),
    forwardRef(() => TransacaoModule),
  ],
  controllers: [AtivoController],
  providers: [AtivoService],
  exports: [AtivoService, TypeOrmModule.forFeature([Ativo])],
})
export class AtivoModule { }
