import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Carteira } from 'src/carteira/entities/carteira.entity';
import { HistoricoRentabilidade } from './entities/historico-rentabilidade.entity';
import { HistoricoAtivo } from 'src/historico-ativos/entities/historico-ativo.entity';
import moment from 'moment';

@Injectable()
export class HistoricoRentabilidadeService {
    private readonly logger = new Logger(HistoricoRentabilidadeService.name);

    constructor(
        @InjectRepository(Carteira)
        private readonly carteiraRepository: Repository<Carteira>,
        @InjectRepository(HistoricoRentabilidade)
        private readonly historicoRentabilidadeRepository: Repository<HistoricoRentabilidade>,
        @InjectRepository(HistoricoAtivo)
        private readonly historicoAtivoRepository: Repository<HistoricoAtivo>,
    ) {}

    // Adicionado parâmetro opcional '_dataTransacao' para compatibilidade com o TransacaoService
    async atualizaCarteiraPorTransacao(idCarteira: string, _dataTransacao?: Date) {
        const carteira = await this.carteiraRepository.findOne({
            where: { idCarteira: idCarteira },
            relations: ['transacoes', 'transacoes.ativo']
        });

        if (!carteira || !carteira.transacoes || carteira.transacoes.length === 0) {
            return;
        }

        const idsAtivos = [...new Set(carteira.transacoes.map(t => t.ativo?.idAtivo).filter(id => !!id))];

        const historicosPrecos = await this.historicoAtivoRepository.find({
            where: { ativo: { idAtivo: In(idsAtivos) } },
            relations: ['ativo'],
            order: { data: 'ASC' }
        });

        const mapaPrecos = new Map<string, Map<string, number>>();

        for (const h of historicosPrecos) {
            if (!mapaPrecos.has(h.ativo.idAtivo)) {
                mapaPrecos.set(h.ativo.idAtivo, new Map<string, number>());
            }
            
            const dataStr = moment(h.data).format('YYYY-MM-DD');
            const mapaDoAtivo = mapaPrecos.get(h.ativo.idAtivo);
            
            if (mapaDoAtivo) {
                mapaDoAtivo.set(dataStr, Number(h.precoFechamento));
            }
        }

        await this.historicoRentabilidadeRepository.delete({ carteira: { idCarteira } });

        const transacoesOrdenadas = carteira.transacoes.sort((a, b) => 
            new Date(a.dataTransacao).getTime() - new Date(b.dataTransacao).getTime()
        );

        const dataInicio = moment(transacoesOrdenadas[0].dataTransacao).startOf('day');
        const dataFim = moment().startOf('day');

        const batchSalvar: HistoricoRentabilidade[] = [];
        let diaAtual = dataInicio.clone();

        while (diaAtual.isSameOrBefore(dataFim)) {
            const transacoesAteMomento = transacoesOrdenadas.filter(t => 
                moment(t.dataTransacao).isSameOrBefore(diaAtual)
            );

            if (transacoesAteMomento.length === 0) {
                diaAtual.add(1, 'days');
                continue;
            }

            let valorInvestidoDia = 0;
            let valorPatrimonioDia = 0;
            const saldoAtivos = new Map<string, number>();

            for (const t of transacoesAteMomento) {
                const tr = t as any;
                if (!tr.ativo) continue;

                const qtd = Number(tr.quantidade);
                const precoPago = Number(tr.precoUnitario || 0);
                const tipo = tr.tipoTransacao || 'compra';

                const saldoAtual = saldoAtivos.get(tr.ativo.idAtivo) || 0;
                
                if (tipo === 'compra') {
                    saldoAtivos.set(tr.ativo.idAtivo, saldoAtual + qtd);
                    valorInvestidoDia += (qtd * precoPago);
                } else if (tipo === 'venda') {
                    saldoAtivos.set(tr.ativo.idAtivo, saldoAtual - qtd);
                }
            }

            for (const [idAtivo, quantidade] of saldoAtivos.entries()) {
                if (quantidade <= 0) continue;
                const precoNoDia = this.obterPrecoNaData(mapaPrecos, idAtivo, diaAtual);
                valorPatrimonioDia += quantidade * precoNoDia;
            }

            let rentabilidadeDia = 0;
            if (valorInvestidoDia > 0) {
                rentabilidadeDia = ((valorPatrimonioDia - valorInvestidoDia) / valorInvestidoDia) * 100;
            }

            const historico = this.historicoRentabilidadeRepository.create({
                data: diaAtual.toDate(),
                valorTotalInvestido: parseFloat(valorInvestidoDia.toFixed(2)),
                valorTotalAtual: parseFloat(valorPatrimonioDia.toFixed(2)),
                rentabilidadeAcumulada: parseFloat(rentabilidadeDia.toFixed(2)),
                carteira: carteira
            });

            batchSalvar.push(historico);
            diaAtual.add(1, 'days');
        }

        if (batchSalvar.length > 0) {
            const chunkSize = 500;
            for (let i = 0; i < batchSalvar.length; i += chunkSize) {
                await this.historicoRentabilidadeRepository.save(batchSalvar.slice(i, i + chunkSize));
            }
        }
    }

    private obterPrecoNaData(mapa: Map<string, Map<string, number>>, idAtivo: string, dataAlvo: moment.Moment): number {
        const precosAtivo = mapa.get(idAtivo);
        if (!precosAtivo) return 0;

        let tentativaData = dataAlvo.clone();
        let contador = 0;

        while (contador < 7) {
            const dataStr = tentativaData.format('YYYY-MM-DD');
            const preco = precosAtivo.get(dataStr);
            
            if (preco !== undefined) {
                return preco;
            }
            tentativaData.subtract(1, 'days');
            contador++;
        }
        return 0; 
    }
    
    async findAll(idCarteira: string) {
        return this.historicoRentabilidadeRepository.find({
            where: { carteira: { idCarteira } },
            order: { data: 'ASC' }
        });
    }
}