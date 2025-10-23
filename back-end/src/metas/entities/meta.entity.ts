import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity({name : 'metas'})
export class Meta {
    @PrimaryGeneratedColumn({name : "id_meta"})
    id : number
    @Column({name : "nome"})
    nome : string
    @Column({name : "valor_alvo", type : "decimal", precision : 10, scale : 2})
    valorAlvo : number
    @Column({name : 'data_alvo', type : "date"})
    dataAlvo : Date
    
    @ManyToOne(()=> Usuario, (usuario) => usuario.metas, {
        nullable : false,
        onDelete : "CASCADE"
    })
    usuario : Usuario

    @CreateDateColumn({name : "criado_em"})
    criadoEm : Date

    @UpdateDateColumn({name : "atualizado_em"})
    atualizadoEm : Date
}
