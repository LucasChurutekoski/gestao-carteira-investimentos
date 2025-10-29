import { Module, forwardRef } from '@nestjs/common';
import { CarteiraService } from './carteira.service';
import { CarteiraController } from './carteira.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carteira } from './entities/carteira.entity';
import { PosicaoModule } from 'src/posicao/posicao.module';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { TransacaoModule } from 'src/transacao/transacao.module';


@Module({
  imports: [
    TypeOrmModule.forFeature([Carteira]),
    forwardRef(() => PosicaoModule),
    forwardRef(() => UsuarioModule),
    forwardRef(() => TransacaoModule),
  ],
  controllers: [CarteiraController],
  providers: [CarteiraService],
  exports: [
    CarteiraService,
    TypeOrmModule.forFeature([Carteira])]
})
export class CarteiraModule { }
