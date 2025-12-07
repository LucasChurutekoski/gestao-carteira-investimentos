import { Carteira } from "src/carteira/entities/carteira.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('historico_rentabilidade')
export class HistoricoRentabilidade {

    @PrimaryGeneratedColumn('uuid', { name: 'id_rentabilidade' })
    id: string

    @Column({ type: 'date', name: 'data' })
    data: Date

    @Column({ name: 'valor_total_investido', type: 'float' })
    valorTotalInvestido: number

    @Column({ name: 'valor_total_atual', type: 'float' })
    valorTotalAtual: number

    @Column({ name: 'rentabilidade_atual', type: 'float' })
    rentabilidadeAcumulada: number

    @ManyToOne(() => Carteira, (carteira) => carteira.historicoRentabilidade, {
        onDelete: "CASCADE"
    })
    carteira: Carteira
}