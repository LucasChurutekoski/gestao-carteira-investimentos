import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuarioModule } from './usuario/usuario.module';
import { AutenticacaoModule } from './autenticacao/autenticacao.module';
import { CarteiraModule } from './carteira/carteira.module';
import { AtivoModule } from './ativo/ativo.module';
import { HttpModule } from '@nestjs/axios';
import { TransacaoModule } from './transacao/transacao.module';
import { PosicaoModule } from './posicao/posicao.module';

@Module({
  imports: [
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        autoLoadEntities : true,
        synchronize : true  
      })
    }),
    UsuarioModule,
    AutenticacaoModule,
    CarteiraModule,
    AtivoModule,
    TransacaoModule,
    PosicaoModule
  ],
  controllers: [AppController],
  providers: [AppService],
  exports : [UsuarioModule]
})
export class AppModule { }
