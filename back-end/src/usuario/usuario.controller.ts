import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { UsuarioService } from './usuario.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';

@Controller('usuarios')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuarioService.criaUsuario(createUsuarioDto);
  }

  @Get(":id")
  findOneById(@Param('id') id : number) {
    return this.usuarioService.buscaUsuarioPorId(+id);
  }

  @Post("/busca")
  findOne(@Body("email") email: string) {
    return this.usuarioService.buscaUsuarioPorEmail(email);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateUsuarioDto: UpdateUsuarioDto) {
    return this.usuarioService.atualizaUsuario(+id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuarioService.removeConta(+id);
  }
}
