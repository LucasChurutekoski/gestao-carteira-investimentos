import { Exclude } from "class-transformer";
import { BeforeInsert, Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Meta } from "src/metas/entities/meta.entity";

@Entity({name : 'usuarios'})
export class Usuario {
    @Exclude()
    @PrimaryGeneratedColumn({name : 'usuario_id'})
    id : number
    @Column({name : "nome"})
    nome : string
    @Column({name : "email", unique : true})
    email :string
    @Exclude()
    @Column({name : "senha"})
    senha: string

    @OneToMany(()=> Meta, (meta) => meta.usuario)
    metas : Meta[]

    
    @BeforeInsert()
        async hashearSenha(){
            const salt = 10;
            this.senha = await bcrypt.hash(this.senha, salt)
        }
}

