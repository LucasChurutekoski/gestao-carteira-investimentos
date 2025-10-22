import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';

export interface UsuarioPayload {
  sub : number,
  nomeUsuario : string
}

@Injectable()
export class AutenticacaoService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService
  ) { }
  async login(email: string, senha: string) {
    const usuario = await this.usuarioService.buscaUsuarioPorEmail(email)
    console.log(senha, usuario.senha)
    const usuarioAutenticado = await bcrypt.compare(senha, usuario.senha)
    if (!usuarioAutenticado) {
      throw new UnauthorizedException("Credenciais inválidas")
    }
    const payload : UsuarioPayload = {
      sub: usuario.id,
      nomeUsuario: usuario.nome,
    }
    return {
      token_acesso: await this.jwtService.signAsync(payload), 
    };
  }

}
