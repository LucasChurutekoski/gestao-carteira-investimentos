import { Injectable } from '@nestjs/common';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';
import { CarteiraService } from 'src/carteira/carteira.service';

@Injectable()
export class TransacaoService {
  constructor(private readonly carteiraService : CarteiraService) {}

  async realizarUmaTransacao(createTransacaoDto: CreateTransacaoDto, usuario) {
    const carteira = await this.carteiraService.buscarCarteira(usuario)
    //pegar a carteira, verificar se o ativo existe, e por fim realizar uma compra
    return 'This action adds a new transacao';
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
