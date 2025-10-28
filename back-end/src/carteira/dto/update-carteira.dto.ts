import { PartialType } from '@nestjs/mapped-types';
import { CreateCarteiraDto } from './create-carteira.dto';

export class UpdateCarteiraDto extends PartialType(CreateCarteiraDto) {}
