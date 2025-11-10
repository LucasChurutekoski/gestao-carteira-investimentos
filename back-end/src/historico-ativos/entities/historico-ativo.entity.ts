import { Ativo } from "src/ativo/entities/ativo.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity("historico_ativos")
export class HistoricoAtivo {
    @PrimaryGeneratedColumn( 'uuid', {name : "id_historico"})
    id : string
    @Column({name : "preco_fechamento", type:'decimal', precision : 10, scale : 2})
    precoFechamento : number

    @Column({name : "data", type:'date'})
    data : Date
    
    @ManyToOne(() =>  Ativo, (ativo) => ativo.historico, {
        onDelete: 'CASCADE'
    })
    ativo : Ativo
}
