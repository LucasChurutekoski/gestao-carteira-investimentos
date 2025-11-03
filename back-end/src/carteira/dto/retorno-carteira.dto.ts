import { Ativo } from "src/ativo/entities/ativo.entity";

export interface PosicaoCalculada {
    ativo: Ativo;
    quantidade: number;
    precoMedio: number;
    valorTotalInvestido: number;
    valorAtual: number;
    rentabilidade: number;
}
export interface RetornoCarteiraDto {
    idCarteira: string;
    valorTotalInvestido: number;
    valorAtual: number;
    rentabilidadeGeral: number;
    posicoes: PosicaoCalculada[];
}