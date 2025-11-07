import { IsDefined, IsNotEmpty, IsString, IsInt, Min } from 'class-validator';

export class CreateTranslationDto {
  @IsDefined({ message: 'Translation key ID is required' })
  @IsInt({ message: 'Translation key ID must be an integer' })
  @Min(1, { message: 'Translation key ID must be a positive number' })
  translationKeyId: number;

  @IsDefined({ message: 'Language ID is required' })
  @IsInt({ message: 'Language ID must be an integer' })
  @Min(1, { message: 'Language ID must be a positive number' })
  languageId: number;

  @IsDefined({ message: 'Value is required' })
  @IsNotEmpty({ message: 'Value cannot be empty' })
  @IsString({ message: 'Value must be a string' })
  value: string;
}
