import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { UsuarioPayload } from './autenticacao.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AutenticacaoGuard implements CanActivate {
  constructor(private jwtService : JwtService){}
  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const requisicao = contexto.switchToHttp().getRequest();  
    const token = this.extrairToken(requisicao)
    if(!token){
      throw new UnauthorizedException("Erro de autenticação")
    }
    try {
      const payload : UsuarioPayload = await this.jwtService.verifyAsync(token)
      requisicao.usuario = payload 
    } catch (error) {
      console.error(error)
      throw new UnauthorizedException("Token de acesso inválido(jwt)")
    }
    return true;
  }
  private extrairToken(requisicao : Request) : string | undefined{
    const [tipo, token] = requisicao.headers.authorization?.split(' ') ?? []
    return tipo === "Bearer" ? token : undefined 
  }
}


