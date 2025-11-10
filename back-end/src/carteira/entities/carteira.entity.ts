
import { HistoricoRentabilidade } from "src/historico-rentabilidade/entities/historico-rentabilidade.entity";
import { Transacao } from "src/transacao/entities/transacao.entity";
import { Usuario } from "src/usuario/entities/usuario.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity('carteiras')
export class Carteira {
    @PrimaryGeneratedColumn('uuid', { name: "id_carteira" })
    idCarteira: string

    @OneToOne(() => Usuario, (usuario) => usuario.carteira, {
        onDelete: 'CASCADE'
    })
    @JoinColumn()
    usuario: Usuario

    @OneToMany(() => Transacao, (transacao) => transacao.carteira)
    transacoes: Transacao[]

    @OneToMany(() => HistoricoRentabilidade, (historicoRentabilidade) => historicoRentabilidade.carteira)
    historicoRentabilidade : HistoricoRentabilidade []

}
