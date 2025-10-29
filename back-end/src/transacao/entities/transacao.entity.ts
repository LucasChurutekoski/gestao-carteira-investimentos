import { Ativo } from "src/ativo/entities/ativo.entity";
import { Carteira } from "src/carteira/entities/carteira.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { enumTipoTransacao } from "../enuns/enumTipoTransacao";

@Entity('transacoes')
export class Transacao {
    @PrimaryGeneratedColumn('uuid', { name: "id_transacao" })
    idTransacao: string
    @Column({ name: 'tipo_transacao', enum: enumTipoTransacao })
    tipoTransacao: enumTipoTransacao
    @Column({ name: "quantidade", type: "decimal", precision : 30, scale : 18 })
    quantidade: number
    @Column({ name: "preco_unitario", type: "decimal", precision: 10, scale : 2 })
    precoUnitario: number
    @Column({ name: "data_compra", type: 'timestamp' })
    dataCompra: Date

    @ManyToOne(() => Carteira, (carteira) => carteira.transacoes, {
        onDelete: 'CASCADE'
    })
    carteira: Carteira

    @ManyToOne(() => Ativo, (ativo) => ativo.transacoes)
    ativo: Ativo

}
