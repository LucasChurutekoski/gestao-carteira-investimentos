import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Carteira } from 'src/carteira/entities/carteira.entity';
import { Repository } from 'typeorm';

@Injectable()
export class HistoricoRentabilidadeService {
  constructor(@InjectRepository(Carteira) private readonly carteiraRepository : Repository<Carteira>){}

  
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async calcularRentabilidade(){
    const carteiras = await this.carteiraRepository.find()

    
  }
}
