import { IsNotEmpty, IsOptional, IsPositive } from "class-validator";

export class CreateAporteDto {
    @IsPositive({message : "Quantia do aporte precisa ser positiva"})
    quantia : number
    @IsOptional()
    descricao : string
    @IsNotEmpty({message : "O local do aporte é obrigatório ex 'caixinha do nubank'"})
    localAporte : string
}
