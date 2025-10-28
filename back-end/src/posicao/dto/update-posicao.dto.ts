import { PartialType } from '@nestjs/mapped-types';
import { CreatePosicaoDto } from './create-posicao.dto';

export class UpdatePosicaoDto extends PartialType(CreatePosicaoDto) {}
