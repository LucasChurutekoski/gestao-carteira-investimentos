import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { CarteiraService } from 'src/carteira/carteira.service';
import { AtivoService } from 'src/ativo/ativo.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transacao } from './entities/transacao.entity';
import { PosicaoService } from 'src/posicao/posicao.service';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';


@Injectable()
export class TransacaoService {
  constructor(
    private readonly carteiraService: CarteiraService,
    private readonly ativoService: AtivoService,
    private readonly posicaoService: PosicaoService,
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
      const quantidade = createTransacaoDto.quantidade

      if (ativo.tipoAtivo == 'acao') {
        if (!Number.isInteger(createTransacaoDto.quantidade)) {
          throw new BadRequestException("quantidade inválida para este tipo de ativo")
        }
      }
      const novaTransacao = this.transacaoRepository.create({
        quantidade: createTransacaoDto.quantidade,
        precoUnitario: createTransacaoDto.precoUnitario,
        dataCompra: createTransacaoDto.dataCompra,
        tipoTransacao: createTransacaoDto.tipoTransacao,
        ativo: ativo,
        carteira: carteira
      })

      await queryRunner.manager.save(novaTransacao)

      await this.posicaoService.recalcularPosicao(queryRunner.manager, carteira.idCarteira, ativo.idAtivo)
      await this.carteiraService.recalcularTotaisCarteira(queryRunner.manager, carteira.idCarteira)
      await queryRunner.commitTransaction();
      return novaTransacao;
    }
    catch (error) {
      await queryRunner.rollbackTransaction()
      console.error(error)
      throw new InternalServerErrorException("não foi possível realizar a transação")
    }
    finally {
      await queryRunner.release()
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
        relations: ['ativo', 'carteira']
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
      await queryRunner.manager.save(transacao)

      const carteiraId = usuario.carteira.idCarteira
      const ativoId = transacao.ativo.idAtivo

      await this.posicaoService.recalcularPosicao(queryRunner.manager, carteiraId, ativoId)

      await this.carteiraService.recalcularTotaisCarteira(queryRunner.manager, carteiraId)

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
      await queryRunner.manager.remove(transacao)

      const carteiraId = usuario.carteira.idCarteira
      const ativoId =  transacao.ativo.idAtivo

      await this.posicaoService.recalcularPosicao(queryRunner.manager, carteiraId, ativoId)
      await this.carteiraService.recalcularTotaisCarteira(queryRunner.manager, carteiraId)

      await queryRunner.commitTransaction()
    } catch (error) {
      await queryRunner.rollbackTransaction()
      console.error(error)
      throw error
    }
    finally {
      await queryRunner.release();
    }
  }
}