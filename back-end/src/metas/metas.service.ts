import { Injectable, NotFoundException } from '@nestjs/common';
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

  async buscarTodasAsMetas(usuario) {
    const metas = await this.metaRepository.find({
      where: { usuario: { id: usuario.userId } }
    })
    if (!metas) {
      throw new NotFoundException("Usuário não tem nenhuma meta")
    }
    return metas;
  }

  async buscarMetaPorId(id: number, usuario) {
    const meta = await this.metaRepository.findOne({
      where: { usuario: { id: usuario.userId }, id: id }
    })
    if (!meta) {
      throw new NotFoundException("meta não encontrada")
    }
    return meta;
  }

  async atualizarMetaPeloId(id: number, updateMetaDto: UpdateMetaDto, usuario) {
    const metaExiste = await this.metaRepository.findOne({
      where: { usuario: { id: usuario.userId }, id: id }
    })
    if (!metaExiste) {
      throw new NotFoundException("meta não encontrada")
    }
    Object.assign(metaExiste, updateMetaDto)
    const metaSalva = await this.metaRepository.save(metaExiste)
    return metaSalva;
  }

  async removermetaPeloId(id: number, usuario) {
    const metaExiste = await this.metaRepository.findOne({
      where: { usuario: { id: usuario.userId }, id: id }
    })
    if (!metaExiste) {
      throw new NotFoundException("meta não encontrada")
    }
    const metaExlcuida = await this.metaRepository.delete(metaExiste.id)
    return `Meta do id ${id} removida com sucesso`;
  }
}
