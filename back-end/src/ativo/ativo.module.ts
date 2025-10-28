import { Module } from '@nestjs/common';
import { AtivoService } from './ativo.service';
import { AtivoController } from './ativo.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports : [
    TypeOrmModule.forFeature([Ativo]),
    HttpModule
  ],
  controllers: [AtivoController],
  providers: [AtivoService],
  exports : [AtivoService]
})
export class AtivoModule {}
