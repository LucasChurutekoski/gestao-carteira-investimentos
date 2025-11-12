import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Carteira } from './entities/carteira.entity';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Transacao } from 'src/transacao/entities/transacao.entity';
import { Ativo } from 'src/ativo/entities/ativo.entity';
import { enumTipoTransacao } from 'src/transacao/enuns/enumTipoTransacao';
import { PosicaoCalculada } from './dto/retorno-carteira.dto';
import { HistoricoRentabilidade } from 'src/historico-rentabilidade/entities/historico-rentabilidade.entity';

@Injectable()
export class CarteiraService {
  constructor(
    @InjectRepository(Carteira) private readonly carteiraRepository: Repository<Carteira>,
    @InjectRepository(Transacao) private readonly transacaoRepository: Repository<Transacao>,
    @InjectRepository(HistoricoRentabilidade) private readonly historicoRentabilidadeRepository : Repository<HistoricoRentabilidade>

  ) { }

  async buscarCarteira(usuario: Usuario) {
    const transacoes = await this.transacaoRepository.find({
      where: { carteira: { idCarteira: usuario.carteira.idCarteira } },
      relations: ['ativo']
    })
    const mapaPosicoes = new Map<string, {
      totalQtd: number,
      totalCusto: number,
      totalQtdComprada: number,
      ativo: Ativo
    }>();

    for (const t of transacoes) {
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
    const posicoesFinais: PosicaoCalculada[] = []

    for (const [ativoId, pos] of mapaPosicoes.entries()) {
      if (pos.totalQtd <= 0) continue;
      const ativo = pos.ativo
      const precoAtual = Number(ativo.precoAtual)

      const precoMedio = (pos.totalQtdComprada > 0) ? (pos.totalCusto / pos.totalQtdComprada) : 0;
      const valorTotalInvestido = pos.totalQtd * precoMedio
      const valorAtual = pos.totalQtd * precoAtual
      const rentabilidade = (valorTotalInvestido > 0) ? (valorAtual / valorTotalInvestido) - 1 : 0

      totalCarteiraInvestido += valorTotalInvestido
      totalCarteiraAtual += valorAtual

      posicoesFinais.push({
        ativo: ativo,
        quantidade: pos.totalQtd,
        precoMedio: precoMedio,
        valorTotalInvestido: valorTotalInvestido,
        valorAtual: valorAtual,
        rentabilidade: rentabilidade,
      });
    }
    const rentabilidadeGeral = (totalCarteiraInvestido > 0) ? (totalCarteiraAtual / totalCarteiraInvestido) - 1 : 0;
    return {
      idCarteira: usuario.carteira.idCarteira,
      valorTotalInvestido: totalCarteiraInvestido,
      valorAtual: totalCarteiraAtual,
      rentabilidadeGeral: rentabilidadeGeral,
      posicoes: posicoesFinais,
    };
  }

  async buscarHistoricoRentabilidade(usuario){
    const historico = await this.historicoRentabilidadeRepository.find({
      where : { carteira : {idCarteira : usuario.carteira.idCarteira}},
      order : {data : "ASC"}
    })

    return historico.map(ponto => ({
      data : ponto.data,
      valorAtual : ponto.valorTotalAtual,
      rentabilidade : ponto.rentabilidadeAcumulada
    }))
  }

}
