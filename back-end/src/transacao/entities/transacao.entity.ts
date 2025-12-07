import { Ativo } from "src/ativo/entities/ativo.entity";
import { Carteira } from "src/carteira/entities/carteira.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { enumTipoTransacao } from "../enuns/enumTipoTransacao";

@Entity('transacoes')
export class Transacao {

    @PrimaryGeneratedColumn('uuid', { name: "id_transacao" })
    idTransacao: string;

    @Column({ 
        name: 'tipo_transacao', 
        type: 'varchar', 
        enum: enumTipoTransacao 
    })
    tipoTransacao: enumTipoTransacao;

    @Column({ name: "quantidade", type: "float" }) 
    quantidade: number;

    @Column({ name: "preco_unitario", type: "float" })
    precoUnitario: number;

    @Column({ name: "data_compra", type: 'datetime' })
    dataTransacao: Date;

    @ManyToOne(() => Carteira, (carteira) => carteira.transacoes, {
        onDelete: 'CASCADE'
    })
    carteira: Carteira;

    @ManyToOne(() => Ativo, (ativo) => ativo.transacoes)
    ativo: Ativo;
}