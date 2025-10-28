import { IsInt, IsNotEmpty, IsNumber } from "class-validator";

export class CreateTransacaoDto {
    @IsNotEmpty({message : "Tipo da transação, compra ou venda é obrigatório"})
    tipo : string
    @IsInt({message : "quantidade do ativo deve ser um número"})
    quantidade : number
    @IsNumber()
    precoUnitario : number
    @IsNotEmpty({message : "Data da compra é obrigatória"})
    dataCompra : Date
    @IsNotEmpty({message : "ticker do ativo é obrigatório"})
    ticker : string
}
