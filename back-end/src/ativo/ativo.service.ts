import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';


@Injectable()
export class AtivoService {
  private readonly logger = new Logger(AtivoService.name)

  constructor(
    @InjectRepository(Ativo) private readonly ativoRepository: Repository<Ativo>,
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
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

  @Cron(CronExpression.EVERY_MINUTE)
  async atualizarPrecosWorker() {
    this.logger.log("Worker : Iniciando a atualização de preços")

    const todosAtivos = await this.ativoRepository.find()
    if (todosAtivos.length === 0) return

    const acoes = todosAtivos.filter(a => a.tipoAtivo === 'acao')
    const criptos = todosAtivos.filter(c => c.tipoAtivo === 'cripto')

    if (acoes.length > 0) {
      await this.atualizarAcoes(acoes)
    }

    if (criptos.length > 0) {
      await this.atualizarCriptos(criptos)
    }
  }

  private async atualizarAcoes(acoes: Ativo[]) {
    try {
      const tickers = acoes.map(a => a.ticker).join(',')
      const token = this.configService.get<string>('TOKEN_BRAPI')
      const urlAcao = `https://brapi.dev/api/quote/${tickers}?token=${token}`

      const response = await firstValueFrom(this.httpService.get(urlAcao))
      const results = response.data.results

      for (const dados of results) {
        await this.ativoRepository.update(
          { ticker: dados.symbol.toLowerCase() },
          { precoAtual: dados.regularMarketPrice }
        )
        this.logger.log(`O total de ${results.length} ativos foram atualizados`)
      }
    } catch (error) {
      this.logger.log("WORKER: erro ao atualizar ações", error.message)
    }
  }

  private async atualizarCriptos(criptos: Ativo[]) {
    try {
      const tickers = criptos.map(c => c.ticker).join(',')
      const urlCripto = `https://api.coingecko.com/api/v3/simple/price?ids=${tickers}&vs_currencies=brl`

      const response = await firstValueFrom(this.httpService.get(urlCripto))
      const data = response.data

      for (const idCripto in data) {
        if (data[idCripto] && data[idCripto].brl) {
          await this.ativoRepository.update(
            { ticker: idCripto },
            { precoAtual: data[idCripto].brl }
          )
        }
      }
      this.logger.log(`WORKER: criptoativos atualizados`)
    } catch (error) {
      this.logger.log("WORKER: Erro ao atualizar criptoativos", error.message)
    }
  }
}
