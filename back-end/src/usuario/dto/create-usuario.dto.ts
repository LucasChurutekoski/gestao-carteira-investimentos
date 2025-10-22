import { IsEmail, IsNotEmpty, MinLength } from "class-validator";

export class CreateUsuarioDto {
    @IsNotEmpty({message : "Nome não pode ser vazio"})
    nome : string
    @IsEmail()
    email : string
    @MinLength(8,{message : "senha deve conter no mínimo 8 caracteres"})
    senha : string
}
