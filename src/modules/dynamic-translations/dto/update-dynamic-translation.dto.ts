import { PartialType } from '@nestjs/mapped-types';
import { CreateDynamicTranslationDto } from './create-dynamic-translation.dto';

export class UpdateDynamicTranslationDto extends PartialType(CreateDynamicTranslationDto) {}
