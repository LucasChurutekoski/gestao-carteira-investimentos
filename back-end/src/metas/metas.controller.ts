import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { MetasService } from './metas.service';
import { CreateMetaDto } from './dto/create-meta.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('metas')
export class MetasController {
  constructor(private readonly metasService: MetasService) {}

  @Post()
  create(@Body() createMetaDto: CreateMetaDto, @Req() req: any) {
    const usuario = req.user
    return this.metasService.criarMeta(createMetaDto, usuario);
  }

  @Get()
  findAll() {
    return this.metasService.bsucarTodasAsMetas();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.metasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMetaDto: UpdateMetaDto) {
    return this.metasService.update(+id, updateMetaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.metasService.remove(+id);
  }
}
