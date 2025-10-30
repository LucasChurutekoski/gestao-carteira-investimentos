import { BadRequestException, Injectable } from '@nestjs/common';

import { Posicao } from './entities/posicao.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Transacao } from 'src/transacao/entities/transacao.entity';
import { Ativo } from 'src/ativo/entities/ativo.entity';
import { enumTipoTransacao } from 'src/transacao/enuns/enumTipoTransacao';

@Injectable()
export class PosicaoService {
  constructor(
    @InjectRepository(Posicao)
    private readonly posicaoRepository: Repository<Posicao>,
    @InjectRepository(Transacao)
    private readonly transacaoRepository: Repository<Transacao>,
    @InjectRepository(Ativo)
    private readonly ativoRepository: Repository<Ativo>,
  ) { }

  async recalcularPosicao(manager: EntityManager, carteiraId: string, ativoId: string) {
    const transacoes = await manager.find(Transacao, {
      where: {
        carteira: { idCarteira: carteiraId },
        ativo: { idAtivo: ativoId },
      },
    });
    const ativo = await manager.findOneBy(Ativo, { idAtivo: ativoId });
    if (!ativo) return;

    let totalQuantidade = 0.0
    let totalCusto = 0.0
    let totalQuantidadeComprada = 0.0

    for (const transacao of transacoes) {
      const quantidadeNumerica = Number(transacao.quantidade);
      const precoUnitarioNumerico = Number(transacao.precoUnitario);

      if (transacao.tipoTransacao === enumTipoTransacao.compra) {
        totalQuantidade += quantidadeNumerica
        totalCusto += quantidadeNumerica * precoUnitarioNumerico
        totalQuantidadeComprada += quantidadeNumerica
      }
      else if (transacao.tipoTransacao === enumTipoTransacao.venda) {
        totalQuantidade -= quantidadeNumerica
      }
    }
    if (totalQuantidade < 0) {
      throw new BadRequestException(`Quantidade insuficiente do ativo : ${ativo.ticker} para realizar venda`)
    }

    let posicao = await manager.findOne(Posicao, {
      where: {
        carteira: { idCarteira: carteiraId },
        ativo: { idAtivo: ativoId },
      }
    })
    if (totalQuantidade <= 0) {
      if (posicao) {
        await manager.remove(posicao)
      }
    }
    else {
      const precoMedio = (totalQuantidadeComprada > 0) ? (totalCusto / totalQuantidadeComprada) : 0
      const valorTotalInvestido = totalQuantidade * precoMedio
      const valorAtual = totalQuantidade * Number(ativo.precoAtual)
      if (!posicao) {
        posicao = this.posicaoRepository.create({
          carteira: { idCarteira: carteiraId },
          ativo: { idAtivo: ativoId }
        })
      }
      posicao.quantidade = totalQuantidade
      posicao.precoMedio = precoMedio,
        posicao.valorTotalInvestido = valorTotalInvestido
      posicao.valorAtual = valorAtual
    }

    await manager.save(posicao)
  }

}
