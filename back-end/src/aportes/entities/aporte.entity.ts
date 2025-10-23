import { Meta } from "src/metas/entities/meta.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name : "aportes"})
export class Aporte {
    @PrimaryGeneratedColumn({name : "aporte_id"})
    id : number
    @Column({name : "quantia", type : "decimal", precision : 10, scale : 2})
    quantia : number
    @Column({name : "descricao", nullable : true})
    descricao : string
    @Column({name :"local_aporte"})
    localAporte : string

    @ManyToOne(() => Meta, (meta) => meta.aportes, {onDelete : "CASCADE"})
    meta : Meta
}
