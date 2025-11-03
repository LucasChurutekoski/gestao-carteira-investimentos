import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { AtivoService } from 'src/ativo/ativo.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transacao } from './entities/transacao.entity';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';
import { enumTipoTransacao } from './enuns/enumTipoTransacao';


@Injectable()
export class TransacaoService {
  constructor(
    private readonly ativoService: AtivoService,
    @InjectRepository(Transacao) private transacaoRepository: Repository<Transacao>,
    @InjectDataSource() private readonly dataSource: DataSource
  ) { }

  async realizarUmaTransacao(createTransacaoDto: CreateTransacaoDto, usuario) {

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const carteira = usuario.carteira
      const ativo = await this.ativoService.buscarOuCriarAtivo(createTransacaoDto.ticker)

      if (ativo.tipoAtivo == 'acao' && !Number.isInteger(createTransacaoDto.quantidade)) {
        throw new BadRequestException("quantidade inválida para este tipo de ativo")
      }

      const transacoesAnteriores = await queryRunner.manager.find(Transacao, {
        where: { carteira: { idCarteira: carteira.idCarteira }, ativo: { idAtivo: ativo.idAtivo } }
      })
      let totalQuantidade = 0.0

      for (const t of transacoesAnteriores) {
        totalQuantidade += (t.tipoTransacao === enumTipoTransacao.compra) ? Number(t.quantidade) : -t.quantidade
      }
      if (createTransacaoDto.tipoTransacao === enumTipoTransacao.venda) {
        totalQuantidade -= Number(createTransacaoDto.quantidade);
      } else {
        totalQuantidade += Number(createTransacaoDto.quantidade);
      }

      if (totalQuantidade < 0) {
        throw new BadRequestException(`Saldo insuficiente para esta venda.`);
      }

      const novaTransacao = this.transacaoRepository.create({
        quantidade: createTransacaoDto.quantidade,
        precoUnitario: createTransacaoDto.precoUnitario,
        dataCompra: createTransacaoDto.dataCompra,
        tipoTransacao: createTransacaoDto.tipoTransacao,
        ativo: ativo,
        carteira: carteira
      });
      await queryRunner.manager.save(novaTransacao);

      await queryRunner.commitTransaction();
      return novaTransacao;

    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException) throw error;
      throw new InternalServerErrorException("Não foi possível realizar a transação.");
    } finally {
      await queryRunner.release();
    }
  }

  async buscarTodasTransacoes(usuario) {
    const transacoes = await this.transacaoRepository.find({
      where: {
        carteira: { idCarteira: usuario.carteira.idCarteira }
      },
      relations: ['ativo']
    })
    return transacoes
  }

  async buscarTransacaoPeloId(usuario, id: string) {
    const transacao = await this.transacaoRepository.findOne({
      where: {
        carteira: { idCarteira: usuario.carteira.idCarteira },
        idTransacao: id
      },
      relations: ['ativo']
    })
    return transacao
  }

  async editaTransacaoPeloId(usuario, id: string, updateTransacaoDto: UpdateTransacaoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transacao = await queryRunner.manager.findOne(Transacao, {
        where: {
          carteira: { idCarteira: usuario.carteira.idCarteira },
          idTransacao: id
        },
        relations: ['ativo']
      })
      if (!transacao) {
        throw new NotFoundException("Transação não encontrada")
      }
      Object.assign(transacao, updateTransacaoDto)

      if (transacao.ativo.tipoAtivo == 'acao') {
        if (!Number.isInteger(transacao.quantidade)) {
          throw new BadRequestException("Quantidade inválida para este tipo de ativo (ação)");
        }
      }
      const transacoesAnteriores = await queryRunner.manager.find(Transacao, {
        where: { carteira: { idCarteira: usuario.carteira.idCarteira }, ativo: { idAtivo: transacao.ativo.idAtivo } }
      });

      let saldoBase = 0.0;
      for (const t of transacoesAnteriores) {
        if (t.idTransacao === id) continue;
        saldoBase += (t.tipoTransacao === enumTipoTransacao.compra) ? Number(t.quantidade) : -Number(t.quantidade);
      }
      let saldoFinal = saldoBase
      if (transacao.tipoTransacao === enumTipoTransacao.compra) {
        saldoFinal += Number(transacao.quantidade)
      }
      else {
        saldoFinal -= Number(transacao.quantidade)
      }
      if (saldoFinal < 0) {
        throw new BadRequestException("Exclusão inválida. Resultaria em saldo negativo.");
      }

      if (saldoFinal < 0) {
        throw new BadRequestException("Exclusão inválida. Resultaria em saldo negativo.");
      }
      await queryRunner.manager.save(transacao)

      await queryRunner.commitTransaction()
      return transacao

    } catch (error) {

      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException("Não foi possível editar a transação.");

    } finally {
      await queryRunner.release();
    }
  }

  async excluirTransacaoPeloId(usuario, id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transacao = await queryRunner.manager.findOne(Transacao, {
        where: {
          carteira: { idCarteira: usuario.carteira.idCarteira },
          idTransacao: id
        },
        relations: ['ativo', 'carteira']
      })
      if (!transacao) {
        throw new NotFoundException("Transação não encontrada")
      }
      const transacoesAnteriores = await queryRunner.manager.find(Transacao, {
        where: { carteira: { idCarteira: usuario.carteira.idCarteira }, ativo: { idAtivo: transacao.ativo.idAtivo } }
      });

      let saldoFinal = 0.0;

      for (const t of transacoesAnteriores) {
        if (t.idTransacao === id) continue;
        saldoFinal += (t.tipoTransacao === enumTipoTransacao.compra) ? Number(t.quantidade) : -Number(t.quantidade);
      }

      if (saldoFinal < 0) {
        throw new BadRequestException("Exclusão inválida. Resultaria em saldo negativo.");
      }
      await queryRunner.manager.remove(transacao);
      await queryRunner.commitTransaction();
      return { message: "Transação removida com sucesso." };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Não foi possível remover a transação.");
    } finally {
      await queryRunner.release();
    }
  }
}