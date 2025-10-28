import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { TransacaoService } from './transacao.service';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('transacao')
export class TransacaoController {
  constructor(private readonly transacaoService: TransacaoService) {}

  @Post()
  create(@Body() createTransacaoDto: CreateTransacaoDto, @Req()  req : any) {
    const usuario = req.user
    return this.transacaoService.realizarUmaTransacao(createTransacaoDto, usuario);
  }

  @Get()
  findAll() {
    return this.transacaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.transacaoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTransacaoDto: UpdateTransacaoDto) {
    return this.transacaoService.update(+id, updateTransacaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.transacaoService.remove(+id);
  }
}
