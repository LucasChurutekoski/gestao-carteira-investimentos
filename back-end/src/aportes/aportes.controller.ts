import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AportesService } from './aportes.service';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { UpdateAporteDto } from './dto/update-aporte.dto';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('aportes')
export class AportesController {
  constructor(private readonly aportesService: AportesService) {}

  @Post(":id")
  create(@Param("id") id : number, @Body() createAporteDto: CreateAporteDto, @Req() req : any) {
    const usuario = req.user
    console.log(id)
    return this.aportesService.realizarAporte(createAporteDto, id, usuario);
  }

  @Get()
  findAll() {
    return this.aportesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    console.log(id)
    return this.aportesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAporteDto: UpdateAporteDto) {
    return this.aportesService.update(+id, updateAporteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aportesService.remove(+id);
  }
}
