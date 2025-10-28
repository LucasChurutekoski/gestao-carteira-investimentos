import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PosicaoService } from './posicao.service';
import { CreatePosicaoDto } from './dto/create-posicao.dto';
import { UpdatePosicaoDto } from './dto/update-posicao.dto';

@Controller('posicao')
export class PosicaoController {
  constructor(private readonly posicaoService: PosicaoService) {}

  @Post()
  create(@Body() createPosicaoDto: CreatePosicaoDto) {
    return this.posicaoService.create(createPosicaoDto);
  }

  @Get()
  findAll() {
    return this.posicaoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.posicaoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePosicaoDto: UpdatePosicaoDto) {
    return this.posicaoService.update(+id, updatePosicaoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.posicaoService.remove(+id);
  }
}
