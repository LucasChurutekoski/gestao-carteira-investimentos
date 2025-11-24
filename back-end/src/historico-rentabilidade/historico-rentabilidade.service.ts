import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Carteira } from 'src/carteira/entities/carteira.entity';
import { Transacao } from 'src/transacao/entities/transacao.entity';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import moment from 'moment';
import { enumTipoTransacao } from 'src/transacao/enuns/enumTipoTransacao';
import { Ativo } from 'src/ativo/entities/ativo.entity';
import { HistoricoAtivo } from 'src/historico-ativos/entities/historico-ativo.entity';
import { HistoricoRentabilidade } from './entities/historico-rentabilidade.entity';

@Injectable()
export class HistoricoRentabilidadeService {
  private readonly logger = new Logger(HistoricoRentabilidadeService.name);

  constructor(
    @InjectRepository(Carteira) private readonly carteiraRepository: Repository<Carteira>,
    @InjectRepository(Transacao) private readonly transacaoRepository: Repository<Transacao>,
    @InjectRepository(HistoricoAtivo) private readonly historicoAtivoRepository: Repository<HistoricoAtivo>,
    @InjectRepository(HistoricoRentabilidade) private readonly historicoRentabilidadeRepository: Repository<HistoricoRentabilidade>
  ) { }

  async atualizaCarteiraPorTransacao(carteiraId: string, data: Date) {

    console.log(">>> Atualizando carteira para: ", carteiraId, data);


    const historicoExistente = await this.historicoRentabilidadeRepository.findOne({
      where: {
        carteira: { idCarteira: carteiraId },
        data: LessThanOrEqual(data),
      },
      order: { data: 'DESC' },
    });

    if (!historicoExistente) {
      return
    }
    await this.historicoRentabilidadeRepository.delete({
      carteira: { idCarteira: carteiraId },
      data: MoreThanOrEqual(data),
    })
    this.calcularRentabilidadeHistorica(carteiraId, data)

  }
  @Cron(CronExpression.EVERY_30_MINUTES)
  async calcularRentabilidadeAgendada() {
    await this.calcularRentabilidadeHistorica()
  }

  async calcularRentabilidadeHistorica(carteiraId?: string, dataRecalculo?: Date) {
    this.logger.log('WORKER DIÁRIO: Iniciando cálculo de rentabilidade...');

    let carteiras
    if (carteiraId) {
      const carteira = await this.carteiraRepository.findOne({ where: { idCarteira: carteiraId } })
      if (!carteira) {
        return
      }
      carteiras = [carteira]
    }
    else {
      carteiras = await this.carteiraRepository.find()
    }

    for (const carteiraDoLoop of carteiras) {
      this.logger.log(`Processando carteira: ${carteiraDoLoop.idCarteira}`);

      let dataInicio: moment.Moment;
      if (dataRecalculo) {
        dataInicio = moment(dataRecalculo)
      }
      const ultimoSnapshot = await this.historicoRentabilidadeRepository.findOne({
        where: { carteira: { idCarteira: carteiraDoLoop.idCarteira } },
        order: { data: 'DESC' }
      });

      if (ultimoSnapshot) {
        dataInicio = moment(ultimoSnapshot.data).add(1, 'day');
        this.logger.log(`Último cálculo em: ${ultimoSnapshot.data}. Recalculando a partir de ${dataInicio.format('YYYY-MM-DD')}`);
      } else {

        const primeiraTransacao = await this.transacaoRepository.findOne({
          where: { carteira: { idCarteira: carteiraDoLoop.idCarteira } },
          order: { dataTransacao: "ASC" }
        });

        if (!primeiraTransacao) {
          this.logger.log(`Carteira ${carteiraDoLoop.idCarteira} sem transações. Pulando.`);
          continue;
        }
        dataInicio = moment(primeiraTransacao.dataTransacao);
        this.logger.log(`Primeira vez. Calculando backfill a partir de ${dataInicio.format('YYYY-MM-DD')}`);
      }
      const dataFim = moment().subtract(1, 'day').startOf('day');
      if (dataInicio.isAfter(dataFim)) {
        this.logger.log(`Carteira ${carteiraDoLoop.idCarteira} já está atualizada. Pulando.`);
        continue;
      }

      for (let dia = dataInicio.clone(); dia.isSameOrBefore(dataFim); dia.add(1, 'day')) {
        if (dia.day() === 0 || dia.day() === 6) {
          continue
        }

        let dataSnapshot = dia.toDate();

        const transacoesAteHoje = await this.transacaoRepository.find({
          where: {
            carteira: { idCarteira: carteiraDoLoop.idCarteira },
            dataTransacao: LessThanOrEqual(dataSnapshot)
          }, relations: ["ativo"]
        });

        const mapaPosicoes = new Map<string, {
          totalQtd: number,
          totalCusto: number,
          totalQtdComprada: number,
          ativo: Ativo
        }>();

        for (const t of transacoesAteHoje) {
          const ativoId = t.ativo.idAtivo;
          let pos = mapaPosicoes.get(ativoId);
          if (!pos) {
            pos = { totalQtd: 0, totalCusto: 0, totalQtdComprada: 0, ativo: t.ativo };
            mapaPosicoes.set(ativoId, pos);
          }
          const qtd = Number(t.quantidade);
          const preco = Number(t.precoUnitario);

          if (t.tipoTransacao === enumTipoTransacao.compra) {
            pos.totalQtd += qtd;
            pos.totalQtdComprada += qtd;
            pos.totalCusto += qtd * preco;
          } else {
            const qtdRemoverDaCompra = Math.min(qtd, pos.totalQtdComprada)
            const custoMedioAntes = pos.totalQtdComprada > 0 ? (pos.totalCusto / pos.totalQtdComprada) : 0
            pos.totalQtd -= qtd,
              pos.totalQtdComprada -= qtdRemoverDaCompra
            pos.totalCusto -= qtdRemoverDaCompra * custoMedioAntes
          }
        }

        let totalCarteiraInvestido = 0.0;
        let totalCarteiraAtual = 0.0;

        for (const [AtivoId, pos] of mapaPosicoes.entries()) {
          if (pos.totalQtd <= 0) {
            continue;
          }

          let precoNoDia = await this.historicoAtivoRepository.findOne({
            where: {
              ativo: { idAtivo: AtivoId },
              data: dataSnapshot
            }
          });

          while (precoNoDia?.precoFechamento == 0) {
            let novaData = moment(dataSnapshot).subtract(1, 'day')
            dataSnapshot = novaData.toDate()
            precoNoDia = await this.historicoAtivoRepository.findOne({
              where: {
                ativo: { idAtivo: AtivoId },
                data: dataSnapshot
              }
            })
          }

          const precoAtualNoDia = precoNoDia ? Number(precoNoDia.precoFechamento) : 0;

          const precoMedio = (pos.totalQtdComprada > 0) ? (pos.totalCusto / pos.totalQtdComprada) : 0;
          const valorTotalInvestido = pos.totalQtd * precoMedio;
          const valorAtual = pos.totalQtd * precoAtualNoDia;

          totalCarteiraInvestido += valorTotalInvestido;
          totalCarteiraAtual += valorAtual;
        }

        const rentabilidadeDia = (totalCarteiraInvestido > 0) ? ((totalCarteiraAtual / totalCarteiraInvestido) - 1) * 100 : 0;

        if (totalCarteiraAtual <= 0) {
          continue
        }

        const snapshot = this.historicoRentabilidadeRepository.create({
          carteira: carteiraDoLoop,
          data: dataSnapshot,
          valorTotalInvestido: totalCarteiraInvestido,
          valorTotalAtual: totalCarteiraAtual,
          rentabilidadeAcumulada: rentabilidadeDia
        });
        await this.historicoRentabilidadeRepository.save(snapshot);
      }
    }
    this.logger.log("WORKER DIÁRIO: Termino de calcular carteira");
  }
}