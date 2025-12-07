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

    // Nome ajustado para bater com a chamada no TransacaoService
    async atualizaCarteiraPorTransacao(idCarteira: string, dataTransacao?: Date) {
        this.logger.log(`>>> Iniciando cálculo para carteira: ${idCarteira}`);

        const carteira = await this.carteiraRepository.findOne({
            where: { idCarteira: idCarteira },
            relations: ['transacoes', 'transacoes.ativo'] 
        });

        if (!carteira) {
            this.logger.error(`Carteira ${idCarteira} não encontrada.`);
            return;
        }

        if (!carteira.transacoes || carteira.transacoes.length === 0) {
            this.logger.warn(`Carteira ${idCarteira} não possui transações.`);
            return;
        }

        let valorTotalInvestido = 0;
        let valorTotalAtual = 0;

        for (const transacao of carteira.transacoes) {
            // "as any" força o TS a aceitar, caso o nome seja 'valor' ou 'precoUnitario'
            const t = transacao as any; 
            
            // Tenta ler 'preco', se não tiver tenta 'valor', se não tiver assume 0
            const precoPago = Number(t.preco || t.valor || 0);
            const qtd = Number(t.quantidade);
            
            if (!t.ativo) {
                continue;
            }

            const precoAtualAtivo = Number(t.ativo.precoAtual);
            
            // Cálculos
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
            this.logger.log(`>>> Histórico salvo: Inv R$${valorTotalInvestido} | Atual R$${valorTotalAtual} | Rent ${rentabilidade.toFixed(2)}%`);
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