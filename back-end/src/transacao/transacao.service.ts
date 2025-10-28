import { Injectable } from '@nestjs/common';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';
import { CarteiraService } from 'src/carteira/carteira.service';
import { AtivoService } from 'src/ativo/ativo.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transacao } from './entities/transacao.entity';
import { PosicaoService } from 'src/posicao/posicao.service';

@Injectable()
export class TransacaoService {
  constructor(
    private readonly carteiraService : CarteiraService,
    private readonly ativoService : AtivoService,
    private readonly posicaoService : PosicaoService,
    @InjectRepository(Transacao) private transacaoRepository : Repository<Transacao>
  ) {}

  async realizarUmaTransacao(createTransacaoDto: CreateTransacaoDto, usuario) {
    const carteira = await this.carteiraService.buscarCarteira(usuario)
    const ativo = await this.ativoService.buscarOuCriarAtivo(createTransacaoDto.ticker)
    const novaTransacao = this.transacaoRepository.create({
      quantidade : createTransacaoDto.quantidade,
      precoUnitario : createTransacaoDto.precoUnitario,
      dataCompra : createTransacaoDto.dataCompra,
      tipo : createTransacaoDto.tipo,
      ativo : ativo,
      carteira : usuario.carteira
    })
    await this.transacaoRepository.save(novaTransacao)

    await this.posicaoService.recalcularPosicao(usuario.carteira.idCarteira, ativo.idAtivo)

   // await this.carteiraService.recalcularTotaisCarteira(carteira.idCarteira)


    return novaTransacao;
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
