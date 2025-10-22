import { Injectable } from '@nestjs/common';
import { UsuarioService } from 'src/usuario/usuario.service';
import * as bcrypt from "bcrypt"
import { JwtService } from '@nestjs/jwt';
import { Usuario } from 'src/usuario/entities/usuario.entity';

export interface UsuarioPayload {
  sub: number,
  nomeUsuario: string
}

@Injectable()
export class AutenticacaoService {
  constructor(
    private usuarioService: UsuarioService,
    private jwtService: JwtService
  ) { }
  async login(usuario: Usuario) {
    const payload: UsuarioPayload = {
      sub: usuario.id,
      nomeUsuario: usuario.nome,
    };
    return {
      token_acesso: await this.jwtService.signAsync(payload),
    };
  }
  async validarUsuario(email: string, senha: string): Promise<any> {
    const usuario = await this.usuarioService.buscaUsuarioPorEmail(email);
    if (!usuario) {
      return null;
    }
    const senhasCombinam = await bcrypt.compare(senha, usuario.senha);
    if (senhasCombinam) {
      const { senha: _, ...resultado } = usuario;
      return resultado;
    }
    return null;
  }
}
