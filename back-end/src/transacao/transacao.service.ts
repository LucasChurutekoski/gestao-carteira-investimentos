import { BadRequestException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { CreateTransacaoDto } from './dto/create-transacao.dto';
import { AtivoService } from 'src/ativo/ativo.service';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Transacao } from './entities/transacao.entity';
import { UpdateTransacaoDto } from './dto/update-transacao.dto';
import { enumTipoTransacao } from './enuns/enumTipoTransacao';
import { HistoricoRentabilidadeService } from 'src/historico-rentabilidade/historico-rentabilidade.service';
import { Usuario } from 'src/usuario/entities/usuario.entity';
import { Carteira } from 'src/carteira/entities/carteira.entity';


@Injectable()
export class TransacaoService {

  private readonly logger = new Logger(TransacaoService.name);

  constructor(
        @InjectRepository(Transacao)
        private readonly transacaoRepository: Repository<Transacao>,
        @InjectRepository(Carteira)
        private readonly carteiraRepository: Repository<Carteira>,
        private readonly ativoService: AtivoService,
        private readonly historicoRentabilidadeService: HistoricoRentabilidadeService,
        private readonly dataSource: DataSource,
    ) {}

// Dentro do seu TransacaoService
async realizarUmaTransacao(createTransacaoDto: CreateTransacaoDto, usuario: Usuario) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // 3. Busca a carteira baseada no Usuário logado
            // O usuario vem do Controller (req.user), precisamos achar a carteira dele
            const carteira = await this.carteiraRepository.findOne({ 
                where: { usuario: { id: usuario.id } } 
            });

            if (!carteira) {
                throw new NotFoundException(`Carteira não encontrada para o usuário ${usuario.id}.`);
            }

            // 4. Busca ou Cria o Ativo
            const ativo = await this.ativoService.buscarOuCriarAtivo(createTransacaoDto.ticker);
            if (!ativo) {
                throw new BadRequestException(`Ativo ${createTransacaoDto.ticker} inválido.`);
            }

            // 5. Cria a Transação
            const novaTransacao = queryRunner.manager.create(Transacao, {
                tipoTransacao: createTransacaoDto.tipoTransacao,
                quantidade: createTransacaoDto.quantidade,
                precoUnitario: createTransacaoDto.precoUnitario,
                dataTransacao: createTransacaoDto.dataTransacao, // Correção: Mapeia dataCompra do DTO
                ativo: ativo,
                carteira: carteira
            });

            await queryRunner.manager.save(novaTransacao);

            // 6. COMITA a transação (Salva a compra definitivamente)
            await queryRunner.commitTransaction();

            // 7. Atualiza o Histórico (APÓS o commit)
            // Se der erro aqui, não afeta a compra, apenas o gráfico fica desatualizado momentaneamente
            try {
                this.logger.log(`Atualizando histórico da carteira ${carteira.idCarteira}...`);
                await this.historicoRentabilidadeService.atualizaCarteiraPorTransacao(carteira.idCarteira);
            } catch (erroHistorico) {
                this.logger.error(`Erro ao atualizar histórico: ${erroHistorico.message}`);
                // Não damos throw aqui para não retornar erro 500 para o usuário se a compra já deu certo
            }

            return novaTransacao;

        } catch (error) {
            // 8. Correção: TransactionNotStartedError
            // Só faz rollback se a transação ainda estiver ativa (ou seja, erro aconteceu ANTES do commit)
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw error;
        } finally {
            await queryRunner.release();
        }
    }


  async buscarTodasTransacoes(usuario) {
    const transacoes = await this.transacaoRepository.find({
      where: {
        carteira: { idCarteira: usuario.carteira.idCarteira }
      },
      relations: ['ativo']
    })
    return transacoes
  }

  async buscarTransacaoPeloId(usuario, id: string) {
    const transacao = await this.transacaoRepository.findOne({
      where: {
        carteira: { idCarteira: usuario.carteira.idCarteira },
        idTransacao: id
      },
      relations: ['ativo']
    })
    return transacao
  }

  async editaTransacaoPeloId(usuario, id: string, updateTransacaoDto: UpdateTransacaoDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transacao = await queryRunner.manager.findOne(Transacao, {
        where: {
          carteira: { idCarteira: usuario.carteira.idCarteira },
          idTransacao: id
        },
        relations: ['ativo']
      })
      if (!transacao) {
        throw new NotFoundException("Transação não encontrada")
      }
      Object.assign(transacao, updateTransacaoDto)

      if (transacao.ativo.tipoAtivo == 'acao') {
        if (!Number.isInteger(transacao.quantidade)) {
          throw new BadRequestException("Quantidade inválida para este tipo de ativo (ação)");
        }
      }
      const transacoesAnteriores = await queryRunner.manager.find(Transacao, {
        where: { carteira: { idCarteira: usuario.carteira.idCarteira }, ativo: { idAtivo: transacao.ativo.idAtivo } }
      });

      let saldoBase = 0.0;
      for (const t of transacoesAnteriores) {
        if (t.idTransacao === id) continue;
        saldoBase += (t.tipoTransacao === enumTipoTransacao.compra) ? Number(t.quantidade) : -Number(t.quantidade);
      }
      let saldoFinal = saldoBase
      if (transacao.tipoTransacao === enumTipoTransacao.compra) {
        saldoFinal += Number(transacao.quantidade)
      }
      else {
        saldoFinal -= Number(transacao.quantidade)
      }
      if (saldoFinal < 0) {
        throw new BadRequestException("Exclusão inválida. Resultaria em saldo negativo.");
      }

      if (saldoFinal < 0) {
        throw new BadRequestException("Exclusão inválida. Resultaria em saldo negativo.");
      }
      await queryRunner.manager.save(transacao)

      await queryRunner.commitTransaction()
      return transacao

    } catch (error) {

      await queryRunner.rollbackTransaction();

      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException("Não foi possível editar a transação.");

    } finally {
      await queryRunner.release();
    }
  }

  async excluirTransacaoPeloId(usuario, id: string) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const transacao = await queryRunner.manager.findOne(Transacao, {
        where: {
          carteira: { idCarteira: usuario.carteira.idCarteira },
          idTransacao: id
        },
        relations: ['ativo', 'carteira']
      })
      if (!transacao) {
        throw new NotFoundException("Transação não encontrada")
      }
      const transacoesAnteriores = await queryRunner.manager.find(Transacao, {
        where: { carteira: { idCarteira: usuario.carteira.idCarteira }, ativo: { idAtivo: transacao.ativo.idAtivo } }
      });

      let saldoFinal = 0.0;

      for (const t of transacoesAnteriores) {
        if (t.idTransacao === id) continue;
        saldoFinal += (t.tipoTransacao === enumTipoTransacao.compra) ? Number(t.quantidade) : -Number(t.quantidade);
      }

      if (saldoFinal < 0) {
        throw new BadRequestException("Exclusão inválida. Resultaria em saldo negativo.");
      }
      await queryRunner.manager.remove(transacao);
      await queryRunner.commitTransaction();
      return { message: "Transação removida com sucesso." };

    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (error instanceof BadRequestException || error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException("Não foi possível remover a transação.");
    } finally {
      await queryRunner.release();
    }
  }
}