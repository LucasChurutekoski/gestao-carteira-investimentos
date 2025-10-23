import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AutenticacaoService } from '../autenticacao.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private authService : AutenticacaoService){
    super({
      usernameField : "email", passwordField : "senha"
    });
  }

  async validate(email : string, senha : string) : Promise<any> {
    const usuario = await this.authService.validarUsuario(email, senha)
    if(!usuario){
      throw new UnauthorizedException("Credenciais inválidas")
    }
    return usuario
  }
  
}