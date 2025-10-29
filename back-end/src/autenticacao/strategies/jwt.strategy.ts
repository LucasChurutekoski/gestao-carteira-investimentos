import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsuarioPayload } from '../autenticacao.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Repository } from 'typeorm';

interface JwtPayload {
    sub: string
    nomeUsuario: string
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        @InjectRepository(Usuario) private readonly usuarioRepository: Repository<Usuario>,
        private configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: configService.get<string>('SECRET_JWT')!,
        });
    }

    async validate(payload: UsuarioPayload): Promise<Usuario> {
        const usuario = await this.usuarioRepository.findOne({
            where: { id: payload.sub },
            relations: ['carteira']
        })
        if (!usuario) {
            throw new UnauthorizedException('Usuário não encontrado ou token inválido.');
        }
        return usuario
    }
}