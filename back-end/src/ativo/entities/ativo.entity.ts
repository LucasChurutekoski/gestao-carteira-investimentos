import { Transacao } from "src/transacao/entities/transacao.entity";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity("ativos")
export class Ativo {
    @PrimaryGeneratedColumn('uuid', { name: "id_ativo" })
    idAtivo: string
    @Column({ name: "ticker" })
    ticker: string
    @Column({ name: "nome_ativo" })
    nomeAtivo: string
    @Column({ name: "preco_atual", type: 'decimal', precision: 10, scale : 2 })
    precoAtual: number

    @OneToMany(() => Transacao, (transacao) => transacao.ativo)
    transacoes: Transacao[];

}