import { Module } from '@nestjs/common';
import { MetasService } from './metas.service';
import { MetasController } from './metas.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Meta } from './entities/meta.entity';

@Module({
  imports : [
    TypeOrmModule.forFeature([Meta])
  ],
  controllers: [MetasController],
  providers: [MetasService],
})
export class MetasModule {}
