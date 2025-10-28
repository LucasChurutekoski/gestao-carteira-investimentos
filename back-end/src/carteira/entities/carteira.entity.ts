import { Posicao } from "src/posicao/entities/posicao.entity";
import { Transacao } from "src/transacao/entities/transacao.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('carteiras')
export class Carteira {
    @PrimaryGeneratedColumn('uuid', {name : "id_carteira"})
    idCarteira : string
    @Column({name : "valor_total_investido", type : "decimal", precision : 10, scale : 2, nullable : true})
    valorTotalInvestido : number
    @Column({name  : "valor_atual", type : "decimal", precision : 10, scale : 2, nullable : true})
    valor_atual : number

    @OneToOne(()=> Usuario, (usuario) =>  usuario.carteira)
    @JoinColumn()
    usuario : Usuario

    @OneToMany(() => Transacao, (transacao) => transacao.carteira)
    transacoes : Transacao[]

    @OneToMany(() => (Posicao), posicao => posicao.carteira)
    posicoes : Posicao[]
    
}
