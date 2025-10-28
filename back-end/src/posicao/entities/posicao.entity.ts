import { Carteira } from "src/carteira/entities/carteira.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('posicoes')
export class Posicao {
    @PrimaryGeneratedColumn('uuid', {name : "id_posicao"})
    idPosicao : string
    @Column({name : "quantidade", type : "integer"})
    quantidade :  number
    @Column({name : "preco_medio", type : "decimal", precision : 10, scale : 2})
    precoMedio : number

    @ManyToOne(() => Carteira, (carteira) => carteira.posicoes)
    carteira : Carteira
}
