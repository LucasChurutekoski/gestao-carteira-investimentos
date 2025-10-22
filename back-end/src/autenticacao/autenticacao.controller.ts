import { Controller,Post, Body, UseGuards, Req } from '@nestjs/common';
import { AutenticacaoService } from './autenticacao.service';
import { CreateAutenticacaoDto } from './dto/create-autenticacao.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Req() req : any) {
    return this.autenticacaoService.login(req.user);
  }

}
