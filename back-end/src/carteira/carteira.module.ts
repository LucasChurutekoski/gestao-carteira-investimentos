import { Module, forwardRef } from '@nestjs/common';
import { CarteiraService } from './carteira.service';
import { CarteiraController } from './carteira.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Carteira } from './entities/carteira.entity';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { TransacaoModule } from 'src/transacao/transacao.module';
import { AtivoModule } from 'src/ativo/ativo.module';
import { HistoricoAtivo } from 'src/historico-ativos/entities/historico-ativo.entity';
import { HistoricoRentabilidade } from 'src/historico-rentabilidade/entities/historico-rentabilidade.entity';


@Module({
  imports: [
    TypeOrmModule.forFeature([Carteira, HistoricoAtivo, HistoricoRentabilidade]),
    forwardRef(() => UsuarioModule),
    forwardRef(() => TransacaoModule),
    forwardRef(() => AtivoModule),
  ],
  controllers: [CarteiraController],
  providers: [CarteiraService],
  exports: [
    CarteiraService,
    TypeOrmModule.forFeature([Carteira])]
})
export class CarteiraModule { }
