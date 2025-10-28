import { Module , forwardRef} from '@nestjs/common';
import { PosicaoService } from './posicao.service';
import { PosicaoController } from './posicao.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Posicao } from './entities/posicao.entity';
import { CarteiraModule } from 'src/carteira/carteira.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Posicao]),
    forwardRef(() => CarteiraModule)
  ],
  controllers: [PosicaoController],
  providers: [PosicaoService],
})
export class PosicaoModule {}
