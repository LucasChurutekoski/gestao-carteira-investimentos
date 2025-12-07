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
import { ScheduleModule } from '@nestjs/schedule';
import { HistoricoAtivosModule } from './historico-ativos/historico-ativos.module';
import { HistoricoRentabilidadeModule } from './historico-rentabilidade/historico-rentabilidade.module';


@Module({
  imports: [
    ScheduleModule.forRoot(),
    HttpModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env'
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        type: "sqlite",
        database : "database.sqlite",
        autoLoadEntities : true,
        synchronize: true
      })
    }),
    UsuarioModule,
    AutenticacaoModule,
    CarteiraModule,
    AtivoModule,
    TransacaoModule,
    HistoricoAtivosModule,
    HistoricoRentabilidadeModule,
  ],
  controllers: [AppController],
  providers: [AppService],
  exports: [UsuarioModule]
})
export class AppModule { }
