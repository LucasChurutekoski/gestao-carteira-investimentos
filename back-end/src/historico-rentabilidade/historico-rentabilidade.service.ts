import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Carteira } from 'src/carteira/entities/carteira.entity';
import { Transacao } from 'src/transacao/entities/transacao.entity';
import { LessThanOrEqual, Repository } from 'typeorm';
import moment from 'moment';
import { enumTipoTransacao } from 'src/transacao/enuns/enumTipoTransacao';
import { Ativo } from 'src/ativo/entities/ativo.entity';
import { HistoricoAtivo } from 'src/historico-ativos/entities/historico-ativo.entity';
import { HistoricoRentabilidade } from './entities/historico-rentabilidade.entity';

@Injectable()
export class HistoricoRentabilidadeService {
  constructor(
    @InjectRepository(Carteira) private readonly carteiraRepository: Repository<Carteira>,
    @InjectRepository(Transacao) private readonly transacaoRepository: Repository<Transacao>,
    @InjectRepository(HistoricoAtivo) private readonly historicoAtivoRepository: Repository<HistoricoAtivo>,
    @InjectRepository(HistoricoRentabilidade) private readonly historicoRentabilidadeRepository : Repository<HistoricoRentabilidade>
  ) { }


  @Cron(CronExpression.EVERY_MINUTE)
  async calcularRentabilidadeHistorica() {
    const carteiras = await this.carteiraRepository.find()
    for (const carteiraDoLoop of carteiras) {
      console.log("WORKER: CALCULANDO RENTABILIDADE DA CARTEIRA")

      const primeiraTransacao = await this.transacaoRepository.findOne({
        where: {
          carteira: { idCarteira: carteiraDoLoop.idCarteira }
        },
        order: { dataTransacao: "ASC" }
      })
      if (!primeiraTransacao) {
        continue
      }
      const dataInicio = moment(primeiraTransacao.dataTransacao)
      const dataFim = moment().subtract(1, 'day')

      for (let dia = dataInicio.clone(); dia.isSameOrBefore(dataFim); dia.add(1, 'day')) {

        const dataSnapshot = dia.toDate()

        const transacoesAteHoje = await this.transacaoRepository.find({
          where: {
            carteira: { idCarteira: carteiraDoLoop.idCarteira },
            dataTransacao: LessThanOrEqual(dataSnapshot)
          }, relations: ["ativo"]
        })
        const mapaPosicoes = new Map<string, {
          totalQtd: number,
          totalCusto: number,
          totalQtdComprada: number,
          ativo: Ativo
        }>();

        for (const t of transacoesAteHoje) {
          const ativoId = t.ativo.idAtivo;
          let pos = mapaPosicoes.get(ativoId)
          if (!pos) {
            pos = { totalQtd: 0, totalCusto: 0, totalQtdComprada: 0, ativo: t.ativo };
            mapaPosicoes.set(ativoId, pos);
          }
          if (!mapaPosicoes.has(ativoId)) {
            mapaPosicoes.set(ativoId, { totalQtd: 0, totalCusto: 0, totalQtdComprada: 0, ativo: t.ativo })
          }
          const qtd = Number(t.quantidade)
          const preco = Number(t.precoUnitario)

          if (t.tipoTransacao === enumTipoTransacao.compra) {
            pos.totalQtd += qtd;
            pos.totalQtdComprada += qtd;
            pos.totalCusto += qtd * preco;
          } else {
            pos.totalQtd -= qtd
          }
        }
        let totalCarteiraInvestido = 0.0
        let totalCarteiraAtual = 0.0

        for (const [AtivoId, pos] of mapaPosicoes.entries()) {
          if (pos.totalQtd <= 0) {
            continue
          }
          const precoNoDia = await this.historicoAtivoRepository.findOne({
            where: {
              ativo: { idAtivo: AtivoId },
              data: dataSnapshot
            }
          })

          const precoAtualNoDia = precoNoDia ? Number(precoNoDia.precoFechamento) : 0

          const precoMedio = pos.totalCusto / pos.totalQtdComprada
          const valorTotalInvestido = pos.totalQtd * precoMedio
          const valorAtual = pos.totalQtd * precoAtualNoDia

          totalCarteiraInvestido += valorTotalInvestido
          totalCarteiraAtual +=valorAtual
        }

        const rentabilidadeDia = (totalCarteiraInvestido > 0) ? (totalCarteiraAtual / totalCarteiraInvestido) - 1 : 0

        const snapshot = await this.historicoRentabilidadeRepository.create({
          carteira : carteiraDoLoop,
          data : dataSnapshot,
          valorTotalInvestido : totalCarteiraInvestido,
          valorTotal : totalCarteiraAtual,
          rentabilidadeAcumulada : rentabilidadeDia
        })
        await this.historicoRentabilidadeRepository.save(snapshot)
      }
    }
    console.log("WORKER : Termino de calcular carteira")

  }
}
