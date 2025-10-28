import { Injectable } from '@nestjs/common';
import { CreatePosicaoDto } from './dto/create-posicao.dto';
import { UpdatePosicaoDto } from './dto/update-posicao.dto';

@Injectable()
export class PosicaoService {
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
