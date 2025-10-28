import { Module} from '@nestjs/common';
import { CarteiraService } from './carteira.service';
import { CarteiraController } from './carteira.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carteira } from './entities/carteira.entity';


@Module({
  imports : [
    TypeOrmModule.forFeature([Carteira])
  ],
  controllers: [CarteiraController],
  providers: [CarteiraService],
  exports: [
    TypeOrmModule.forFeature([Carteira]),
    CarteiraService
  ]
})
export class CarteiraModule {}
