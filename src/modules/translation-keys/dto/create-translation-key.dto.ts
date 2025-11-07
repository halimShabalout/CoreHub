import { IsDefined, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateTranslationKeyDto {
  @IsDefined({ message: 'Key is required' })
  @IsNotEmpty({ message: 'Key cannot be empty' })
  @IsString({ message: 'Key must be a string' })
  @MaxLength(150, { message: 'Key must be shorter than or equal to 150 characters' })
  key: string;

  @IsString({ message: 'Description must be a string' })
  @MaxLength(255, { message: 'Description must be shorter than or equal to 255 characters' })
  description?: string;
}
