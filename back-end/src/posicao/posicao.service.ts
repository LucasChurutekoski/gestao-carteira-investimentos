import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePosicaoDto } from './dto/create-posicao.dto';
import { UpdatePosicaoDto } from './dto/update-posicao.dto';
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

    for (const transacao of transacoes) {
      if (transacao.tipoTransacao === enumTipoTransacao.compra) {
        totalQuantidade += Number(transacao.quantidade)
        totalCusto += Number(transacao.quantidade) * Number(transacao.precoUnitario)
      }
      else if (transacao.tipoTransacao === enumTipoTransacao.venda) {
        totalQuantidade -= transacao.quantidade
      }
    }
    if (totalQuantidade < 0) {
      throw new BadRequestException(`Quantidade insuficiente do ativo : ${ativo} para realizar venda`)
    }
    const precoMedio = totalQuantidade > 0 ? totalCusto / totalQuantidade : 0
    const valorTotalInvestido = totalQuantidade * precoMedio
    const valorAtual = totalQuantidade * Number(ativo.precoAtual)

    let posicao = await this.posicaoRepository.findOne({
      where: {
        carteira: { idCarteira: carteiraId },
        ativo: { idAtivo: ativoId },
      },
      relations: ['carteira', 'ativo']
    })
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

    await manager.save(posicao)
  }


  create(createPosicaoDto: CreatePosicaoDto) {
    return 'This action adds a new posicao';
  }

  findAll() {
    return `This action returns all posicao`;
  }

  findOne(id: number) {
    return `This action returns a #${id} posicao`;
  }

  update(id: number, updatePosicaoDto: UpdatePosicaoDto) {
    return `This action updates a #${id} posicao`;
  }

  remove(id: number) {
    return `This action removes a #${id} posicao`;
  }
}
