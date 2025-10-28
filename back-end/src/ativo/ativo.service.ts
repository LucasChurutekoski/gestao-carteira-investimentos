import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';


@Injectable()
export class AtivoService {
  constructor(
    @InjectRepository(Ativo) private readonly ativoRepository: Repository<Ativo>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) { }

  async buscarOuCriarAtivo(ticker: string): Promise<Ativo> {
    const tickerUpper = ticker.toUpperCase();
    let ativo = await this.ativoRepository.findOne({ where: { ticker: tickerUpper } })
    if (ativo) {
      return ativo
    }
    const token = this.configService.get<string>('TOKEN_BRAPI');
    const url = `https://brapi.dev/api/quote/${tickerUpper}?token=${token}`
    const response = await firstValueFrom(this.httpService.get(url))
    const dadosApi = response.data.results[0];

    const novoAtivo = this.ativoRepository.create({
      ticker: dadosApi.symbol,
      nomeAtivo: dadosApi.longName,
      precoAtual: dadosApi.regularMarketPrice,
    })
    await this.ativoRepository.save(novoAtivo)
    return novoAtivo
  }
}
