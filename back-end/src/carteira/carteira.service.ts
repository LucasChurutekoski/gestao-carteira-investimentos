import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Carteira } from './entities/carteira.entity';
import { Posicao } from 'src/posicao/entities/posicao.entity';

@Injectable()
export class CarteiraService {
  constructor(  
    @InjectRepository(Carteira) private readonly carteiraRepository : Repository<Carteira>,
    @InjectRepository(Posicao) private readonly posicaoRepository : Repository<Posicao>
  
  ) {}
  
  async buscarCarteira(usuario) {
    const carteira = await this.carteiraRepository.findOne({where : { usuario : usuario.sub}, relations : ['posicoes', 'posicoes.ativo']})
    this.recalcularTotaisCarteira(manager, usuario.carteira.idCarteira)
    return carteira;
  }

  async recalcularTotaisCarteira(manager : EntityManager, carteiraId : string){
    const posicoes = await manager.find(Posicao, {
      where : { carteira : { idCarteira : carteiraId}}
    }) 

    let somaValorTotalInvestido = 0
    let somaValorAtual = 0

    for(const posicao of posicoes) {
      somaValorTotalInvestido += Number(posicao.valorTotalInvestido)
      somaValorAtual += Number(posicao.valorAtual)
    }

    await manager.update(Carteira, { idCarteira : carteiraId},
      { 
        valorTotalInvestido : somaValorTotalInvestido,
        valorAtual : somaValorAtual
      }
    )
  }

}
