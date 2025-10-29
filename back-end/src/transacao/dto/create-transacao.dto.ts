import { IsEnum, IsInt, IsNotEmpty, IsNumber } from "class-validator";
import { enumTipoTransacao } from "../enuns/enumTipoTransacao";

export class CreateTransacaoDto {
    @IsEnum(enumTipoTransacao)
    @IsNotEmpty({message : "tipoTransacao deve ser 'compra' ou 'venda'"})
    tipoTransacao : enumTipoTransacao
    @IsNumber()
    quantidade : number
    @IsNumber()
    precoUnitario : number
    @IsNotEmpty({message : "Data da compra é obrigatória"})
    dataCompra : Date
    @IsNotEmpty({message : "ticker do ativo é obrigatório"})
    ticker : string
}
