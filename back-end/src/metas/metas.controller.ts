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
  findAll(@Req() req : any) {
    const usuario = req.user
    return this.metasService.buscarTodasAsMetas(usuario);
  }

  @Get(':id')
  findOne(@Param('id') id: number, @Req() req : any) {
    const usuario = req.user
    return this.metasService.buscarMetaPorId(+id, usuario);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateMetaDto: UpdateMetaDto, @Req() req : any) {
    const usuario = req.user
    return this.metasService.atualizarMetaPeloId(+id, updateMetaDto, usuario);
  }

  @Delete(':id')
  remove(@Param('id') id: number, @Req() req : any) {
    const usuario = req.user
    return this.metasService.removermetaPeloId(+id, usuario);
  }
}
