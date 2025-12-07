import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Carteira } from 'src/carteira/entities/carteira.entity';
import { HistoricoRentabilidade } from './entities/historico-rentabilidade.entity';

@Injectable()
export class HistoricoRentabilidadeService {
    private readonly logger = new Logger(HistoricoRentabilidadeService.name);

    constructor(
        @InjectRepository(Carteira)
        private readonly carteiraRepository: Repository<Carteira>,
        
        @InjectRepository(HistoricoRentabilidade)
        private readonly historicoRentabilidadeRepository: Repository<HistoricoRentabilidade>,
    ) {}

    async atualizaCarteiraPorTransacao(idCarteira: string, dataTransacao?: Date) {
        const carteira = await this.carteiraRepository.findOne({
            where: { idCarteira: idCarteira },
            relations: ['transacoes', 'transacoes.ativo'] 
        });

        if (!carteira || !carteira.transacoes || carteira.transacoes.length === 0) {
            return;
        }

        let valorTotalInvestido = 0;
        let valorTotalAtual = 0;

        for (const transacao of carteira.transacoes) {
            // Cast para any para garantir acesso ao campo, já que o Entity pode estar desatualizado
            const t = transacao as any; 

            // Filtra apenas compras para o cálculo de investimento (se houver vendas, a lógica muda)
            if (t.tipoTransacao && t.tipoTransacao !== 'compra') {
                continue; 
            }
            
            if (!t.ativo) continue;

            const qtd = Number(t.quantidade);
            const precoPago = Number(t.precoUnitario); // Campo corrigido baseado no seu log
            const precoAtualAtivo = Number(t.ativo.precoAtual);
            
            valorTotalInvestido += qtd * precoPago;
            valorTotalAtual += qtd * precoAtualAtivo;
        }

        let rentabilidade = 0;
        if (valorTotalInvestido > 0) {
            rentabilidade = ((valorTotalAtual - valorTotalInvestido) / valorTotalInvestido) * 100;
        }

        try {
            const novoHistorico = this.historicoRentabilidadeRepository.create({
                data: new Date(),
                valorTotalInvestido: parseFloat(valorTotalInvestido.toFixed(2)),
                valorTotalAtual: parseFloat(valorTotalAtual.toFixed(2)),
                rentabilidadeAcumulada: parseFloat(rentabilidade.toFixed(2)),
                carteira: carteira
            });

            await this.historicoRentabilidadeRepository.save(novoHistorico);
            
            this.logger.log(`Rentabilidade atualizada: Inv R$${valorTotalInvestido.toFixed(2)} | Atual R$${valorTotalAtual.toFixed(2)} | Rent ${rentabilidade.toFixed(2)}%`);
        } catch (error) {
            this.logger.error(`Erro ao salvar histórico: ${error.message}`);
        }
    }
    
    async findAll(idCarteira: string) {
        return this.historicoRentabilidadeRepository.find({
            where: { carteira: { idCarteira } },
            order: { data: 'ASC' }
        });
    }
}