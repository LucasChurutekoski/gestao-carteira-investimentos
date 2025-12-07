import { HistoricoAtivo } from "src/historico-ativos/entities/historico-ativo.entity";
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

    @Column({ name: "preco_atual", type: 'float' })
    precoAtual: number

    @Column({ name: "tipo_ativo", nullable: true })
    tipoAtivo: string

    @OneToMany(() => Transacao, (transacao) => transacao.ativo)
    transacoes: Transacao[];

    @OneToMany(() => HistoricoAtivo, (historicoAtivo) => historicoAtivo.ativo)
    historico: HistoricoAtivo[]
}