import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TransacaoService } from './transacao.service';
import { AuthGuard } from '@nestjs/passport';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('transacao')
export class TransacaoController {
  constructor(private readonly transacaoService: TransacaoService) { }

  @Post()
  create(@Body() createTransacaoDto: CreateTransacaoDto, @Req() req: any) {
    const usuario = req.user
    return this.transacaoService.realizarUmaTransacao(createTransacaoDto, usuario);
  }

  @Get()
  find(@Req() req: any) {
    const usuario = req.user
    return this.transacaoService.buscarTodasTransacoes(usuario);
  }

  @Get(':id')
  findOne(@Req() req: any, @Param('id') id: string) {
    const usuario = req.user
    return this.transacaoService.buscarTransacaoPeloId(usuario, id);
  }

  @Patch(':id')
  update(@Req() req: any, @Param('id') id: string, @Body() updateTransacaoDto: UpdateTransacaoDto) {
    const usuario = req.user
    return this.transacaoService.editaTransacaoPeloId(usuario, id, updateTransacaoDto)
  }

  @Delete(':id')
  delete(@Req() req: any, @Param('id') id: string) {
    const usuario = req.user
    return this.transacaoService.excluirTransacaoPeloId(usuario, id)
  }
}
