import { Module, forwardRef } from '@nestjs/common';
import { CarteiraService } from './carteira.service';
import { CarteiraController } from './carteira.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carteira } from './entities/carteira.entity';
import { PosicaoModule } from 'src/posicao/posicao.module';


@Module({
  imports : [
    TypeOrmModule.forFeature([Carteira]),
    forwardRef(() => PosicaoModule)
  ],
  controllers: [CarteiraController],
  providers: [CarteiraService],
  exports: [CarteiraService,
  TypeOrmModule.forFeature([Carteira])]
})
export class CarteiraModule {}
