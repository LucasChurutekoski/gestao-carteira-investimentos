import { Controller, Post, UseGuards, Req } from '@nestjs/common';
import { AutenticacaoService } from './autenticacao.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) { }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req : any){
    return this.autenticacaoService.login(req.user)
  }

}
