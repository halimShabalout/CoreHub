import { PartialType } from '@nestjs/mapped-types';
import { CreateTranslationKeyDto } from './create-translation-key.dto';

export class UpdateTranslationKeyDto extends PartialType(CreateTranslationKeyDto) {}
