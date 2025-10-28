import { Module } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { UsuarioController } from './usuario.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Usuario } from './entities/usuario.entity';
import { CarteiraModule } from 'src/carteira/carteira.module';


@Module({
  imports : [
    TypeOrmModule.forFeature([Usuario]),
    CarteiraModule
  ],
  controllers: [UsuarioController],
  providers: [UsuarioService],
  exports : [UsuarioService]
})
export class UsuarioModule {}
