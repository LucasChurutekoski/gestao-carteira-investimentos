import { Controller,Post, Body } from '@nestjs/common';
import { AutenticacaoService } from './autenticacao.service';
import { CreateAutenticacaoDto } from './dto/create-autenticacao.dto';

@Controller('autenticacao')
export class AutenticacaoController {
  constructor(private readonly autenticacaoService: AutenticacaoService) {}

  @Post('login')
  login(@Body() { email, senha }: CreateAutenticacaoDto) {
    return this.autenticacaoService.login(email, senha);
  }

}
