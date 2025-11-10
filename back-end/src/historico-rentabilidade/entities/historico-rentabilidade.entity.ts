import { Carteira } from "src/carteira/entities/carteira.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('historico_rentabilidade')
export class HistoricoRentabilidade {

    @PrimaryGeneratedColumn('uuid', {name : 'id_rentabilidade'})
    id : string

    @Column({ type : 'date', name : 'data'})
    data : Date

    @Column({name : 'valor_total_investido', type : 'decimal', precision : 10, scale : 2})
    valorTotalInvestido : number

    @Column({name : 'valor_total_atual', type : 'decimal', precision : 10, scale : 2})
    valorTotal : number

    @Column({name : "rentabilidade_atual", type :'decimal', precision : 10, scale : 2})
    rentabilidadeAcumulada : number

    @ManyToOne(() => Carteira, (carteira) => carteira.historicoRentabilidade)
    carteira : Carteira
}
