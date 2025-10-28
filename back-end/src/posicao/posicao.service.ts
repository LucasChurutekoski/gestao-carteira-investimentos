import { Injectable } from '@nestjs/common';
import { CreatePosicaoDto } from './dto/create-posicao.dto';
import { UpdatePosicaoDto } from './dto/update-posicao.dto';
import { Posicao } from './entities/posicao.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transacao } from 'src/transacao/entities/transacao.entity';
import { Ativo } from 'src/ativo/entities/ativo.entity';

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

  async recalcularPosicao(carteiraId: string, ativoId: string) {
    const transacoes = await this.transacaoRepository.find({
      where: {
        carteira: { idCarteira: carteiraId },
        ativo: { idAtivo: ativoId },
      },
    });
    const ativo = await this.ativoRepository.findOneBy({ idAtivo: ativoId });
    if (!ativo) return;

    let totalQuantidade = 0
    let totalCusto = 0

    for(const transacao of transacoes) {
      if(transacao.tipo === 'compra'){
        totalQuantidade += transacao.quantidade
        totalCusto += transacao.quantidade  * Number(transacao.precoUnitario)
      }
      else{
        totalQuantidade -= transacao.quantidade
      }
    }

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
