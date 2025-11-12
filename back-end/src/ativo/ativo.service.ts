import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { delay, firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import yahooFinance from 'yahoo-finance2'
import YahooFinance from 'yahoo-finance2';
import { HistoricoAtivo } from 'src/historico-ativos/entities/historico-ativo.entity';
import moment from 'moment';


@Injectable()
export class AtivoService {
  private readonly logger = new Logger(AtivoService.name)

  constructor(
    @InjectRepository(Ativo) private readonly ativoRepository: Repository<Ativo>,
    @InjectRepository(HistoricoAtivo) private readonly historicoRepository: Repository<HistoricoAtivo>,
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

  @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM)
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
    this.logger.log("WORKER : inicio atualização de ações")
    const token = this.configService.get<string>('TOKEN_BRAPI')
    for (const acao of acoes) {

      try {
        const urlAcao = `https://brapi.dev/api/quote/${acao.ticker}?token=${token}`

        const response = await firstValueFrom(this.httpService.get(urlAcao))
        const dados = response.data.results[0]

        if (dados && dados.regularMarketPrice) {
          await this.ativoRepository.update(
            { ticker: acao.ticker },
            { precoAtual: dados.regularMarketPrice }
          );
          this.logger.log(`WORKER: Ação ${acao.ticker} atualizada.`);
        }

        await delay(5000);
      } catch (error) {
        this.logger.log("WORKER: erro ao atualizar ações", error.message)
      }
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

  @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM)
  async buscarHistoricoAtivos() {
    this.logger.log("Worker : Iniciando a atualização de preços históricos")

    const todosAtivos = await this.ativoRepository.find()
    if (todosAtivos.length === 0) return

    const acoes = todosAtivos.filter(a => a.tipoAtivo === 'acao')
    const criptos = todosAtivos.filter(c => c.tipoAtivo === 'cripto')

    if (acoes.length > 0) {
      for (const acao of acoes) {
        const ticker = `${acao.ticker}.SA`
        const dataInicioFixa = '2023-11-10';
        const dataFim = new Date();

        const ultimoPrecoSalvo = await this.historicoRepository.findOne({
          where: { ativo: { idAtivo: acao.idAtivo } },
          order: { data: "DESC" }
        })

        let dataInicio: string

        if (ultimoPrecoSalvo) {
          dataInicio = moment(ultimoPrecoSalvo.data).add(1, 'day').format('YYYY-MM-DD')
        }
        else {
          dataInicio = dataInicioFixa
        }

        const queryOptions = {
          period1: dataInicio,
          period2: dataFim,
          interval: '1d',
        } as const;

        const yf = new YahooFinance()
        const resultados = await yf.chart(ticker, queryOptions)
        const dadosHistoricos = resultados.quotes

        const batchSalvar: HistoricoAtivo[] = dadosHistoricos
          .filter(dia => dia.adjclose != null)
          .map(dia => {
            return this.historicoRepository.create({
              ativo: acao,
              data: dia.date,
              precoFechamento: dia.adjclose as number
            })
          })
        await this.historicoRepository.save(batchSalvar)
      }
    }

    if (criptos.length > 0) {
      for (const cripto of criptos) {
        const mapaCriptoParaTicker = {
          'Bitcoin': 'BTC',
          'Ethereum': 'ETH',
          'Cardano': 'ADA',
        };
        const ticker = mapaCriptoParaTicker[cripto.ticker]
        if (!ticker) {
          continue
        }
        const tickerFormatado = `${ticker}-BRL`
        const dataInicioFixa = '2023-11-10'
        const dataFim = new Date()

        const ultimoPrecoSalvo = await this.historicoRepository.findOne({
          where: {
            ativo: { idAtivo: cripto.idAtivo }
          },
          order: { data: "DESC" }
        })

        let dataInicio: string

        if (ultimoPrecoSalvo) {
          dataInicio = moment(ultimoPrecoSalvo.data).add(1, 'day').format("YYYY-MM-DD")
        }
        else {
          dataInicio = dataInicioFixa
        }

        const queryOptions = {
          period1: dataInicio,
          period2: dataFim,
          interval: '1d'
        } as const

        const yf = new yahooFinance()

        const resposta = await yf.chart(tickerFormatado, queryOptions)
        const dadosHistoricos = resposta.quotes

        const batchSalvar: HistoricoAtivo[] = dadosHistoricos
          .filter(dia => dia.adjclose != null)
          .map(dia => {
            return this.historicoRepository.create({
              ativo: cripto,
              data: dia.date,
              precoFechamento: dia.adjclose as number
            })
          })
        await this.historicoRepository.save(batchSalvar)
      }
    }
  }
}
