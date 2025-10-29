import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';
import { CarteiraService } from 'src/carteira/carteira.service';
import { AtivoService } from 'src/ativo/ativo.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transacao } from './entities/transacao.entity';
import { PosicaoService } from 'src/posicao/posicao.service';


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

  findAll() {
    return `This action returns all transacao`;
  }

  findOne(id: number) {
    return `This action returns a #${id} transacao`;
  }

  update(id: number, updateTransacaoDto: UpdateTransacaoDto) {
    return `This action updates a #${id} transacao`;
  }

  remove(id: number) {
    return `This action removes a #${id} transacao`;
  }
}
