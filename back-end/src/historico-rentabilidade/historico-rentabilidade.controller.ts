import { Controller, Post, Req } from '@nestjs/common';
import { HistoricoRentabilidadeService } from './historico-rentabilidade.service';


@Controller('historico-rentabilidade')
export class HistoricoRentabilidadeController {
  constructor(private readonly historicoRentabilidadeService: HistoricoRentabilidadeService) { }

  // @Post()
  // create() {
  //   return this.historicoRentabilidadeService.calcularRentabilidadeHistorica()
  // }

}
