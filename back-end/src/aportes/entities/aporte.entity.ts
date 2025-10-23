import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({name : "aportes"})
export class Aporte {
    @PrimaryGeneratedColumn({name : "aporte_id"})
    id : number
    @Column({name : "quantia", type : "decimal", precision : 10, scale : 2})
    quantia : number
    
}
