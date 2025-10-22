import { Exclude } from "class-transformer";
import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';

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

    
    @BeforeInsert()
        async hashearSenha(){
            const salt = 10;
            this.senha = await bcrypt.hash(this.senha, salt)
        }
}

