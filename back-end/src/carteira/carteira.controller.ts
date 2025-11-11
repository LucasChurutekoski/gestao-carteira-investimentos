import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { CarteiraService } from './carteira.service';
import { AuthGuard } from '@nestjs/passport';


@UseGuards(AuthGuard('jwt'))
@Controller('carteira')
export class CarteiraController {
  constructor(
    private readonly carteiraService: CarteiraService
  ) { }

  @Get()
  find(@Req()  req : any) {
    const usuario = req.user
    return this.carteiraService.buscarCarteira(usuario);
  }

  @Get('/rentabilidade')
  findHistorico(@Req() req : any){
    const usuario = req.user
    return this.carteiraService.buscarHistoricoRentabilidade(usuario)
  }
}
