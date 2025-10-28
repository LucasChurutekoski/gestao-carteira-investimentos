import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCarteiraDto } from './dto/create-carteira.dto';
import { UpdateCarteiraDto } from './dto/update-carteira.dto';
import { UsuarioService } from 'src/usuario/usuario.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carteira } from './entities/carteira.entity';

@Injectable()
export class CarteiraService {
  constructor(  
    @InjectRepository(Carteira) private readonly carteiraRepository : Repository<Carteira>
  
  ) {}
  
  async buscarCarteira(usuario) {
    const carteira = await this.carteiraRepository.findOne({where : { usuario : usuario.sub}})
    return carteira;
  }

}
