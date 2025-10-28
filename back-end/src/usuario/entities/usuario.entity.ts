import { Exclude } from "class-transformer";
import { BeforeInsert, Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Carteira } from "src/carteira/entities/carteira.entity";

@Entity({ name: 'usuarios' })
export class Usuario {
    @Exclude()
    @PrimaryGeneratedColumn({ name: 'usuario_id' })
    id: number
    @Column({ name: "nome" })
    nome: string
    @Column({ name: "email", unique: true })
    email: string
    @Exclude()
    @Column({ name: "senha" })
    senha: string

    @OneToOne(()=> (Carteira), carteira => carteira.usuario,{
        cascade : true
    })
    carteira : Carteira

    @BeforeInsert()
    async hashearSenha() {
        const salt = 10;
        this.senha = await bcrypt.hash(this.senha, salt)
    }
}

