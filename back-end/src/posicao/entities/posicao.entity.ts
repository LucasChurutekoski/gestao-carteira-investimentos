import { Ativo } from "src/ativo/entities/ativo.entity";
import { Carteira } from "src/carteira/entities/carteira.entity";
import { Column, Entity, ManyToOne, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('posicoes')
export class Posicao {
    @PrimaryGeneratedColumn('uuid', {name : "id_posicao"})
    idPosicao : string
    @Column({name : "quantidade", type : "integer"})
    quantidade :  number
    @Column({name : "preco_medio", type : "decimal", precision : 10, scale : 2})
    precoMedio : number
    @Column({name : "valor_total_investido", type : "decimal", precision : 10, scale : 2})
    valorTotalInvestido : number
    @Column({name : "valor_atual", type : "decimal", precision : 10, scale : 2})
    valorAtual : number

    @ManyToOne(() => Carteira, (carteira) => carteira.posicoes)
    carteira : Carteira

    @ManyToOne(() => Ativo, (ativo) => ativo.posicoes)
    ativo : Ativo
}
