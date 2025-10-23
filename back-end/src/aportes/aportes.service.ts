import { Inject, Injectable } from '@nestjs/common';
import { CreateAporteDto } from './dto/create-aporte.dto';
import { UpdateAporteDto } from './dto/update-aporte.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Aporte } from './entities/aporte.entity';
import { Repository } from 'typeorm';
import { Meta } from 'src/metas/entities/meta.entity';
import { MetasService } from 'src/metas/metas.service';

@Injectable()
export class AportesService {
  constructor(
    @InjectRepository(Aporte) private readonly aporteRepository: Repository<Aporte>,
    @InjectRepository(Meta) private readonly metaRepository: Repository<Meta>,
    private metaService : MetasService 
  ) { }

  async realizarAporte(createAporteDto: CreateAporteDto, idMeta : number, usuario) {
    console.log(idMeta)
    const aporte = await this.aporteRepository.create(createAporteDto)
    const metaExiste = await this.metaService.buscarMetaPorId(idMeta, usuario)
    metaExiste.valorAtual += aporte.quantia
    await this.metaRepository.save(metaExiste)
    aporte.meta = metaExiste
    await this.aporteRepository.save(aporte)
    
    return `A quantia ${aporte.quantia} foi depositada`;
  }

  findAll() {
    return `This action returns all aportes`;
  }

  findOne(id: number) {
    return `This action returns a #${id} aporte`;
  }

  update(id: number, updateAporteDto: UpdateAporteDto) {
    return `This action updates a #${id} aporte`;
  }

  remove(id: number) {
    return `This action removes a #${id} aporte`;
  }
}
