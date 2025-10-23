import { Aporte } from "src/aportes/entities/aporte.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name : 'metas'})
export class Meta {
    @PrimaryGeneratedColumn({name : "id_meta"})
    id : number
    @Column({name : "nome"})
    nome : string
    @Column({name : "valor_alvo", type : "decimal", precision : 10, scale : 2})
    valorAlvo : number
    @Column({name : "valor_atual", type : "decimal", precision : 10, scale : 2, default : 0})
    valorAtual : number
    @Column({name : 'data_alvo', type : "date"})
    dataAlvo : Date
    
    @ManyToOne(()=> Usuario, (usuario) => usuario.metas, {
        nullable : false,
        onDelete : "CASCADE"
    })
    usuario : Usuario

    @OneToMany(() => Aporte, (aporte) => aporte.meta)
    aportes : Aporte[]

    @CreateDateColumn({name : "criado_em"})
    criadoEm : Date

    @UpdateDateColumn({name : "atualizado_em"})
    atualizadoEm : Date
}
