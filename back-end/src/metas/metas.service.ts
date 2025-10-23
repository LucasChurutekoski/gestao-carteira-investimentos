import { Injectable } from '@nestjs/common';
import { CreateMetaDto } from './dto/create-meta.dto';
import { UpdateMetaDto } from './dto/update-meta.dto';
import { UsuarioPayload } from 'src/autenticacao/autenticacao.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Meta } from './entities/meta.entity';
import { Repository } from 'typeorm';
import { Usuario } from 'src/usuario/entities/usuario.entity';

@Injectable()
export class MetasService {

  constructor(@InjectRepository(Meta) private readonly metaRepository: Repository<Meta>) { }

  async criarMeta(createMetaDto: CreateMetaDto, usuario) {
    const novaMeta = new Meta()
    Object.assign(novaMeta, createMetaDto);
    novaMeta.usuario = { id: usuario.userId } as Usuario
    const metaCriada = await this.metaRepository.save(novaMeta)
    return metaCriada;
  }

  bsucarTodasAsMetas() {
    
    return `This action returns all metas`;
  }

  findOne(id: number) {
    return `This action returns a #${id} meta`;
  }

  update(id: number, updateMetaDto: UpdateMetaDto) {
    return `This action updates a #${id} meta`;
  }

  remove(id: number) {
    return `This action removes a #${id} meta`;
  }
}
