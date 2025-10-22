// src/autenticacao/autenticacao.module.ts
import { Module } from '@nestjs/common';
import { AutenticacaoService } from './autenticacao.service';
import { AutenticacaoController } from './autenticacao.controller';
import { UsuarioModule } from 'src/usuario/usuario.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    UsuarioModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => {
        return {
          secret: configService.get<string>('SECRET_JWT'),
          signOptions: { expiresIn: '72h' },
        };
      },
      inject: [ConfigService],
      global: true,
    }),
  ],
  controllers: [AutenticacaoController],
  providers: [
    AutenticacaoService,
    LocalStrategy,
    JwtStrategy,
  ],
})
export class AutenticacaoModule { }