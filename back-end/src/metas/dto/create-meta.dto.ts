import { IsDate, IsDateString, IsNotEmpty, IsPositive } from "class-validator";

export class CreateMetaDto {
    @IsNotEmpty({message : "Nome da meta é obrigatório"})
    nome : string
    @IsPositive({message : "Valor alvo deve ser positivo"})
    valorAlvo : number
    @IsDateString()
    dataAlvo : Date
}
