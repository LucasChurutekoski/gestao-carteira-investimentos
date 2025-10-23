import { Module } from '@nestjs/common';
import { AportesService } from './aportes.service';
import { AportesController } from './aportes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Aporte } from './entities/aporte.entity';
import { Meta } from 'src/metas/entities/meta.entity';
import { MetasModule } from 'src/metas/metas.module';

@Module({
  imports : [
    TypeOrmModule.forFeature([Aporte, Meta]),
    MetasModule
  ],
  controllers: [AportesController],
  providers: [AportesService],
})
export class AportesModule {}
