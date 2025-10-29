import { Injectable, NotFoundException } from '@nestjs/common';
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
    const tickerlower = ticker.toLowerCase();
    let ativo = await this.ativoRepository.findOne({ where: { ticker: tickerlower } })
    if (ativo) {
      return ativo
    }
    const token = this.configService.get<string>('TOKEN_BRAPI');
    try {
      const urlAcao = `https://brapi.dev/api/quote/${tickerlower}?token=${token}`
      const responseAcao = await firstValueFrom(this.httpService.get(urlAcao))
      if (responseAcao.data.results && responseAcao.data.results.length > 0) {

        const dadosApi = responseAcao.data.results[0];
        const novoAtivo = this.ativoRepository.create({
          ticker: dadosApi.symbol.toLowerCase(),
          nomeAtivo: dadosApi.longName,
          precoAtual: dadosApi.regularMarketPrice,
          tipoAtivo: 'acao'
        })
        await this.ativoRepository.save(novoAtivo)
        return novoAtivo
      }
    }
    catch (error) {
      console.error(error)
    }
    try {
      const urlCripto = `https://api.coingecko.com/api/v3/simple/price?ids=${tickerlower}&vs_currencies=brl`;
      const responseCripto = await firstValueFrom(this.httpService.get(urlCripto))

      const dadosApi = responseCripto.data[tickerlower]
      if (!dadosApi || !dadosApi.brl) {
        throw new NotFoundException();
      }
      const novoAtivo = this.ativoRepository.create({
        ticker: tickerlower,
        nomeAtivo: tickerlower,
        precoAtual: dadosApi.brl,
        tipoAtivo: "cripto"
      })
      await this.ativoRepository.save(novoAtivo)
      return novoAtivo

    } catch (error) {
      throw new NotFoundException(`Ativo "${tickerlower}" não encontrado (B3 ou Cripto).`);
    }
  }
}
