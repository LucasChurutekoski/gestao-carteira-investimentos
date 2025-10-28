import { Controller, Get, Query } from '@nestjs/common';
import { AtivoService } from './ativo.service';


@Controller('ativo')
export class AtivoController {
  constructor(private readonly ativoService: AtivoService) {}

  @Get('buscar')
  buscar(@Query('ticker') ticker : string) {
    return this.ativoService.buscarOuCriarAtivo(ticker);
  }

}
