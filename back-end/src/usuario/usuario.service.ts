import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { Usuario } from './entities/usuario.entity';
import { Carteira } from 'src/carteira/entities/carteira.entity';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)private readonly usuarioRepository: Repository<Usuario>,
    @InjectRepository(Carteira) private readonly carteiraRepository : Repository<Carteira>
) {
  }

  async criaUsuario(createUsuarioDto: CreateUsuarioDto) {
    const { email } = createUsuarioDto
    const usuarioExiste = await this.usuarioRepository.findOneBy({email})
    if(usuarioExiste){
      throw new ConflictException("Email já cadastrado")
    }
    const novaCarteira = this.carteiraRepository.create() 
    const novoUsuario = this.usuarioRepository.create({
      ...createUsuarioDto, carteira : novaCarteira
    })
    return await this.usuarioRepository.save(novoUsuario);
  }

  async buscaUsuarioPorId(id : number) {
    const usuarioExiste = await this.usuarioRepository.findOneBy({id})
    if(!usuarioExiste){
      throw new NotFoundException("Usuário não encontrado")
    }
    return usuarioExiste
  }

  async buscaUsuarioPorEmail(email : string) {
    if(!email){
      throw new NotFoundException("email não informado")
    }
    const usuarioExiste = await this.usuarioRepository.findOneBy({email})

    if(!usuarioExiste){
      throw new NotFoundException("Usuário não encontrado")
    }
    return usuarioExiste; 
  }

  async atualizaUsuario(id: number, updateUsuarioDto: UpdateUsuarioDto) {
    const usuarioExiste = await this.usuarioRepository.findOneBy({id})
    if(!usuarioExiste){
      throw new NotFoundException("Usuário não encontrado")
    }
    if(updateUsuarioDto.email){
      const emailExiste = await this.usuarioRepository.findOne({
        where : {
          email : updateUsuarioDto.email,
          id : Not(id)
        }
      })
      if(emailExiste){
        throw new ConflictException("email já cadastrado no sistema")
      }
    }
    delete updateUsuarioDto.senha
    Object.assign(usuarioExiste, updateUsuarioDto)
    return await this.usuarioRepository.save(usuarioExiste)
  }

  async removeConta(id: number) {
    const usuarioExiste = await this.usuarioRepository.findOneBy({id})
    if(!usuarioExiste){
      throw new NotFoundException("Usuário não encontrado")
    }
    await this.usuarioRepository.delete({id})
    return `Usuário removido com sucesso ${id}`;
  }
}
