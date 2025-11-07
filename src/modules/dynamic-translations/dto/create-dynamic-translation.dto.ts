import { IsDefined, IsNotEmpty, IsString, MaxLength, IsInt, Min } from 'class-validator';

export class CreateDynamicTranslationDto {
  @IsDefined({ message: 'Table name is required' })
  @IsNotEmpty({ message: 'Table name cannot be empty' })
  @IsString({ message: 'Table name must be a string' })
  @MaxLength(100, { message: 'Table name must be shorter than or equal to 100 characters' })
  tableName: string;

  @IsDefined({ message: 'Row ID is required' })
  @IsInt({ message: 'Row ID must be an integer' })
  @Min(1, { message: 'Row ID must be a positive number' })
  rowId: number;

  @IsDefined({ message: 'Field is required' })
  @IsNotEmpty({ message: 'Field cannot be empty' })
  @IsString({ message: 'Field must be a string' })
  @MaxLength(100, { message: 'Field must be shorter than or equal to 100 characters' })
  field: string;

  @IsDefined({ message: 'Language ID is required' })
  @IsInt({ message: 'Language ID must be an integer' })
  @Min(1, { message: 'Language ID must be a positive number' })
  languageId: number;

  @IsDefined({ message: 'Content is required' })
  @IsNotEmpty({ message: 'Content cannot be empty' })
  @IsString({ message: 'Content must be a string' })
  content: string;
}
