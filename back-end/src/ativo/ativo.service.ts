import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Ativo } from './entities/ativo.entity';
import { Repository } from 'typeorm';
import { HttpService } from '@nestjs/axios';
import { delay, firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import yahooFinance from 'yahoo-finance2';
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
        const tickerUpper = ticker.toUpperCase().trim();
        const tickerB3 = tickerUpper.endsWith('.SA') ? tickerUpper : `${tickerUpper}.SA`;

        let ativo = await this.ativoRepository.findOne({
            where: [
                { ticker: tickerUpper },
                { ticker: tickerB3 }
            ],
        });

        if (ativo) {
            return ativo;
        }

        try {
            let resultado: any;
            try {
                const yf =  new yahooFinance()
                resultado = await yf.quote(tickerB3);
            } catch (e) {
                try {
                     const yf =  new yahooFinance()
                resultado = await yf.quote(tickerUpper);
                } catch (e2) {
                    resultado = null;
                }
            }

            if (resultado) {
                const novoAtivo = this.ativoRepository.create({
                    ticker: resultado.symbol,
                    nomeAtivo: resultado.shortName || resultado.longName || tickerUpper,
                    precoAtual: resultado.regularMarketPrice,
                    tipoAtivo: 'acao'
                });

                await this.ativoRepository.save(novoAtivo);
                this.buscarHistoricoAtivos().catch(() => {});
                return novoAtivo;
            }
        } catch (error) {}

        try {
            const urlCripto = `https://api.coingecko.com/api/v3/simple/price?ids=${tickerUpper.toLowerCase()}&vs_currencies=brl`;
            const responseCripto = await firstValueFrom(this.httpService.get(urlCripto));
            const dadosApi = responseCripto.data[tickerUpper.toLowerCase()];

            if (!dadosApi || !dadosApi.brl) {
                throw new NotFoundException();
            }

            const novoAtivo = this.ativoRepository.create({
                ticker: tickerUpper,
                nomeAtivo: tickerUpper,
                precoAtual: dadosApi.brl,
                tipoAtivo: "cripto"
            });

            await this.ativoRepository.save(novoAtivo);
            this.buscarHistoricoAtivos().catch(() => {});
            return novoAtivo;

        } catch (error) {
            throw new NotFoundException(`Ativo "${tickerUpper}" não encontrado.`);
        }
    }

    @Cron(CronExpression.EVERY_30_MINUTES_BETWEEN_10AM_AND_7PM)
    async atualizarPrecosWorker() {
        const todosAtivos = await this.ativoRepository.find();
        if (todosAtivos.length === 0) return;

        const acoes = todosAtivos.filter(a => a.tipoAtivo === 'acao');
        const criptos = todosAtivos.filter(c => c.tipoAtivo === 'cripto');

        if (acoes.length > 0) await this.atualizarAcoes(acoes);
        if (criptos.length > 0) await this.atualizarCriptos(criptos);
    }

    private async atualizarAcoes(acoes: Ativo[]) {
        for (const acao of acoes) {
            try {
                const yf = new yahooFinance()
                const resultado: any = await yf.quote(acao.ticker);
                if (resultado && resultado.regularMarketPrice) {
                    await this.ativoRepository.update(
                        { idAtivo: acao.idAtivo },
                        { precoAtual: resultado.regularMarketPrice }
                    );
                }
                await delay(2000);
            } catch (error) {
                this.logger.error(`Erro ao atualizar preço de ${acao.ticker}`);
            }
        }
    }

    private async atualizarCriptos(criptos: Ativo[]) {
        try {
            const ids = criptos.map(c => c.ticker.toLowerCase()).join(',');
            const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=brl`;
            const response = await firstValueFrom(this.httpService.get(url));
            const data = response.data;

            for (const idCripto in data) {
                if (data[idCripto] && data[idCripto].brl) {
                    const ativoCorrespondente = criptos.find(c => c.ticker.toLowerCase() === idCripto);
                    if (ativoCorrespondente) {
                        await this.ativoRepository.update(
                            { idAtivo: ativoCorrespondente.idAtivo },
                            { precoAtual: data[idCripto].brl }
                        );
                    }
                }
            }
        } catch (error) {
            this.logger.error("Erro ao atualizar criptoativos em lote");
        }
    }

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async buscarHistoricoAtivosProgramado() {
        await this.buscarHistoricoAtivos();
    }

    async buscarHistoricoAtivos() {
        const todosAtivos = await this.ativoRepository.find();
        for (const ativo of todosAtivos) {
            try {
                await this.processarHistoricoAtivo(ativo);
                await delay(1000);
            } catch (error) {
                this.logger.error(`Falha ao processar histórico de ${ativo.ticker}`);
            }
        }
    }

    private async processarHistoricoAtivo(ativo: Ativo) {
        let tickerApi = ativo.ticker;
        if (ativo.tipoAtivo === 'cripto') {
            const mapCripto = { 'BITCOIN': 'BTC-BRL', 'ETHEREUM': 'ETH-BRL', 'SOLANA': 'SOL-BRL' };
            tickerApi = mapCripto[ativo.ticker.toUpperCase()] || `${ativo.ticker}-BRL`;
        }

        const ultimoHistorico = await this.historicoRepository.findOne({
            where: { ativo: { idAtivo: ativo.idAtivo } },
            order: { data: "DESC" }
        });

        let dataInicio = '2023-01-01';
        if (ultimoHistorico) {
            dataInicio = moment(ultimoHistorico.data).add(1, 'days').format('YYYY-MM-DD');
        }

        const dataFim = moment().format('YYYY-MM-DD');

        if (moment(dataInicio).isSameOrAfter(dataFim)) {
            return;
        }

        try {
            const yf = new yahooFinance()
            const resultado: any = await yf.chart(tickerApi, {
                period1: dataInicio,
                period2: dataFim,
                interval: '1d'
            });

            if (!resultado || !resultado.quotes || resultado.quotes.length === 0) return;

            const batchSalvar: HistoricoAtivo[] = [];

            for (const dia of resultado.quotes) {
                if (!dia.date || !dia.close) continue;

                const novoHistorico = this.historicoRepository.create({
                    ativo: ativo,
                    data: dia.date,
                    precoFechamento: dia.close
                });
                batchSalvar.push(novoHistorico);
            }

            if (batchSalvar.length > 0) {
                await this.historicoRepository.save(batchSalvar);
            }
        } catch (error) { }
    }
}